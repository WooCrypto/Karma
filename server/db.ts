import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

// Load Firebase configuration
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) {
  console.error('[DB] Failed to load firebase-applet-config.json:', err);
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('[DB] Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfile {
  address: string;
  username: string;
  hideWallet: boolean;
  wallet: {
    id: string;
    name: string;
    icon: string;
    color: string;
    desc: string;
  };
  streak: number;
  connectedAt: string;
  karmaScore: number;
  personality: string;
  auraPoints: number;
  lastClaimedAt: string;
  referralPoints?: number;
  referralsCount?: number;
  referredBy?: string;
  referredUsers?: { username: string; address: string; earned: number; registeredAt: string }[];
  activities: any[];
  categories: { label: string; value: number; color: string; icon: string }[];
  scores: {
    walletAge: number;
    holdingBehavior: number;
    txQuality: number;
    staking: number;
    governance: number;
    community: number;
    protocolRep: number;
  };
  metrics: {
    firstTxDate: string;
    walletAgeDays: number;
    totalTransactions: number;
    activeDays: number;
    tokenBalancesUSD: number;
    nftCount: number;
    stakedAmountUSD: number;
    stakedDurationDays: number;
    daoVotes: number;
    earlyMintsCount: number;
    riskInteractionsCount: number;
  };
  history: { time: string; reputation: number; activityVolume: number; gasSaved: number }[];
}

export interface AuthChallenge {
  address: string;
  challenge: string;
  createdAt: number;
}

// In-Memory redis-style cache for high throughput optimization
const cacheMap = new Map<string, { record: UserProfile; cachedAt: number }>();

export function getCachedScore(address: string): UserProfile | null {
  const cached = cacheMap.get(address.toLowerCase());
  if (!cached) return null;
  // Cache expiration: 10 minutes for fast reactive alignment
  if (Date.now() - cached.cachedAt > 10 * 60 * 1000) {
    cacheMap.delete(address.toLowerCase());
    return null;
  }
  return cached.record;
}

export function setCachedScore(address: string, profile: UserProfile): void {
  cacheMap.set(address.toLowerCase(), {
    record: profile,
    cachedAt: Date.now()
  });
}

export function clearCache(address: string): void {
  cacheMap.delete(address.toLowerCase());
}

// --- Local File System Persistent Backups / Fallbacks ---
const LOCAL_DIR = path.join(process.cwd(), 'passports_saved');
if (!fs.existsSync(LOCAL_DIR)) {
  try {
    fs.mkdirSync(LOCAL_DIR, { recursive: true });
  } catch (err) {
    console.error('[DB] Failed to create passports_saved directory:', err);
  }
}

function saveProfileLocal(address: string, profile: UserProfile): void {
  try {
    const filePath = path.join(LOCAL_DIR, `profiles_${address.toLowerCase()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[DB] Failed to save profile locally for ${address}:`, err);
  }
}

function getProfileLocal(address: string): UserProfile | null {
  try {
    const filePath = path.join(LOCAL_DIR, `profiles_${address.toLowerCase()}.json`);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as UserProfile;
  } catch (err) {
    console.error(`[DB] Failed to read local profile for ${address}:`, err);
    return null;
  }
}

function getAllProfilesLocal(): UserProfile[] {
  try {
    const files = fs.readdirSync(LOCAL_DIR);
    const list: UserProfile[] = [];
    for (const file of files) {
      if (file.startsWith('profiles_') && file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(path.join(LOCAL_DIR, file), 'utf-8');
          list.push(JSON.parse(content));
        } catch (e) {}
      }
    }
    return list;
  } catch (err) {
    console.error('[DB] Failed to list local profiles:', err);
    return [];
  }
}

function saveChallengeLocal(address: string, data: any): void {
  try {
    const filePath = path.join(LOCAL_DIR, `challenges_${address.toLowerCase()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[DB] Failed to save challenge locally for ${address}:`, err);
  }
}

function getChallengeLocal(address: string): any | null {
  try {
    const filePath = path.join(LOCAL_DIR, `challenges_${address.toLowerCase()}.json`);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

function deleteChallengeLocal(address: string): void {
  try {
    const filePath = path.join(LOCAL_DIR, `challenges_${address.toLowerCase()}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {}
}

// Promise race helper to ensure Firestore never blocks node process
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore connection request timed out')), timeoutMs)
    )
  ]);
}

// --- Challenges Store (Web Interface Auth Handshaking) ---
export async function createChallenge(address: string): Promise<string> {
  const normalized = address.toLowerCase();
  const challenge = crypto.randomUUID();
  const record = {
    address: normalized,
    challenge,
    createdAt: Date.now()
  };

  // Immediate Local Cache Commit
  saveChallengeLocal(normalized, record);

  try {
    await withTimeout(setDoc(doc(db, 'challenges', normalized), record), 2500);
  } catch (err) {
    console.warn(`[DB] Cloud Firestore challenge write failed or timed out. Handled via local fallback. Reason:`, err instanceof Error ? err.message : err);
  }
  return challenge;
}

export async function getChallenge(address: string): Promise<string | null> {
  const normalized = address.toLowerCase();
  const localChal = getChallengeLocal(normalized);
  if (localChal) {
    if (Date.now() - localChal.createdAt > 5 * 60 * 1000) {
      deleteChallengeLocal(normalized);
      return null;
    }
  }

  try {
    const docRef = doc(db, 'challenges', normalized);
    const snap = await withTimeout(getDoc(docRef), 2500);
    if (snap.exists()) {
      const data = snap.data();
      if (Date.now() - data.createdAt > 5 * 60 * 1000) {
        await deleteDoc(docRef);
        return null;
      }
      return data.challenge;
    }
  } catch (err) {
    console.warn(`[DB] Cloud Firestore challenge read failed or timed out. Falling back to local copy. Reason:`, err instanceof Error ? err.message : err);
  }

  return localChal ? localChal.challenge : null;
}

export interface ChallengeRecord {
  address: string;
  challenge: string;
  createdAt: number;
}

export async function getChallengeRecord(address: string): Promise<ChallengeRecord | null> {
  const normalized = address.toLowerCase();
  const localChal = getChallengeLocal(normalized);
  if (localChal) {
    if (Date.now() - localChal.createdAt > 5 * 60 * 1000) {
      deleteChallengeLocal(normalized);
      return null;
    }
  }

  try {
    const docRef = doc(db, 'challenges', normalized);
    const snap = await withTimeout(getDoc(docRef), 2500);
    if (snap.exists()) {
      const data = snap.data();
      if (Date.now() - data.createdAt > 5 * 60 * 1000) {
        return null;
      }
      return {
        address: data.address,
        challenge: data.challenge,
        createdAt: data.createdAt
      };
    }
  } catch (err) {
    console.warn(`[DB] Cloud Firestore challenge record read failed or timed out. Falling back to local copy. Reason:`, err instanceof Error ? err.message : err);
  }

  return localChal ? {
    address: localChal.address,
    challenge: localChal.challenge,
    createdAt: localChal.createdAt
  } : null;
}

export async function clearChallenge(address: string): Promise<void> {
  const normalized = address.toLowerCase();
  deleteChallengeLocal(normalized);

  try {
    await withTimeout(deleteDoc(doc(db, 'challenges', normalized)), 2000);
  } catch (err) {
    console.warn(`[DB] Cloud Firestore challenge delete failed or timed out. Reason:`, err instanceof Error ? err.message : err);
  }
}

// --- Permanent Database System via Cloud Firestore ---
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const normalized = profile.address.toLowerCase();
  
  // Synced instantly in Cache and Local Disk
  setCachedScore(profile.address, profile);
  saveProfileLocal(normalized, profile);

  try {
    await withTimeout(setDoc(doc(db, 'profiles', normalized), profile), 3000);
    console.log(`[DB] Successfully synchronized profile with Cloud Firestore database: ${normalized}`);
  } catch (err) {
    console.warn(`[DB] Cloud Firestore write failed or timed out. Data safely persisted and retrieved locally. Reason:`, err instanceof Error ? err.message : err);
  }
}

export async function getUserProfile(address: string): Promise<UserProfile | null> {
  const normalized = address.toLowerCase();
  
  // Try Cache first
  const cached = getCachedScore(normalized);
  if (cached) {
    console.log(`[DB] In-Memory Cache HIT for wallet address: ${normalized}`);
    return cached;
  }
  
  // Try Local Disk second
  const localProf = getProfileLocal(normalized);
  if (localProf) {
    console.log(`[DB] Local Disk Backup HIT for wallet address: ${normalized}`);
    setCachedScore(normalized, localProf);
  }

  try {
    console.log(`[DB] Querying Cloud Firestore database record for: ${normalized}`);
    const snap = await withTimeout(getDoc(doc(db, 'profiles', normalized)), 3000);
    if (snap.exists()) {
      const dbProfile = snap.data() as UserProfile;
      saveProfileLocal(normalized, dbProfile);
      setCachedScore(normalized, dbProfile);
      return dbProfile;
    }
  } catch (err) {
    console.warn(`[DB] Cloud Firestore read failed or timed out. Falling back to local profile registry. Reason:`, err instanceof Error ? err.message : err);
  }

  return localProf;
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const localList = getAllProfilesLocal();
  const indexMap = new Map<string, UserProfile>(localList.map(p => [p.address.toLowerCase(), p]));

  try {
    const snap = await withTimeout(getDocs(collection(db, 'profiles')), 4000);
    snap.forEach((doc) => {
      const profile = doc.data() as UserProfile;
      if (!profile || !profile.address) {
        console.warn(`[DB] Skipping malformed profile doc ${doc.id}`);
        return;
      }
      const normalized = profile.address.toLowerCase();
      indexMap.set(normalized, profile);
      saveProfileLocal(normalized, profile);
      setCachedScore(normalized, profile);
    });
  } catch (err) {
    console.warn(`[DB] Cloud Firestore list profiles failed or timed out. Displaying local registry index. Reason:`, err instanceof Error ? err.message : err);
  }

  return Array.from(indexMap.values());
}

export async function triggerDailyScoreUpdates(): Promise<void> {
  console.log('[CRON] Initiating scheduled 24h updates database engine sweeping cycle via Firestore...');
  try {
    const profiles = await getAllProfiles();
    let count = 0;
    for (const profile of profiles) {
      // Tick active holding streak calendar
      profile.streak += 1;
      profile.auraPoints = (profile.auraPoints || 0) + Math.floor(Math.random() * 20) + 10;

      // Handle referral points decay over time (reduce 50 points or 5% of referralPoints, max out)
      if (profile.referralPoints && profile.referralPoints > 0) {
        const decayAmount = Math.min(profile.referralPoints, Math.max(50, Math.floor(profile.referralPoints * 0.05)));
        profile.referralPoints -= decayAmount;
        // Reduce the aura points by the decayed amount
        profile.auraPoints = Math.max(0, (profile.auraPoints || 0) - decayAmount);

        if (!profile.activities) {
          profile.activities = [];
        }
        profile.activities.unshift({
          id: `ref-decay-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          timestamp: 'Just now',
          type: 'Aura Decay',
          txHash: '0x' + crypto.randomBytes(12).toString('hex') + 'dec',
          amount: `-${decayAmount}`,
          asset: 'AURA',
          scoreDelta: 0,
          patienceImpact: -1,
          loyaltyImpact: -1,
          wisdomImpact: -1,
        });
        if (profile.activities.length > 20) {
          profile.activities.pop();
        }
      }
      
      // Simulate score shifts
      const shift = Math.floor(Math.random() * 9) - 4; // -4 to +4 rating swing
      profile.karmaScore = Math.max(0, Math.min(1000, profile.karmaScore + shift));
      
      // Save historical rating cycle records
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      profile.history.push({
        time: currentDate,
        reputation: profile.karmaScore,
        activityVolume: profile.history[profile.history.length - 1]?.activityVolume || 5,
        gasSaved: (profile.history[profile.history.length - 1]?.gasSaved || 0.1) + Number((Math.random() * 0.05).toFixed(3))
      });
      // Cap historical array size to 10 nodes
      if (profile.history.length > 10) {
        profile.history.shift();
      }
      
      await saveUserProfile(profile);
      count++;
    }
    
    if (count > 0) {
      console.log(`[CRON] Success. Synchronized and compiled holding indices for ${count} active reputation identities.`);
    }
  } catch (err) {
    console.error('[CRON] Failed to sweep database profiles during daily cron updates:', err);
  }
}

