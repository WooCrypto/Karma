import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './server/db';

async function main() {
  try {
    console.log('Testing setDoc on "profiles/test_user_valid" with compliant schema...');
    const testDoc = doc(db, 'profiles', 'test_user_valid');
    await setDoc(testDoc, {
      address: 'test_user_valid',
      username: 'testuser',
      karmaScore: 750,
      hideWallet: false,
      wallet: {
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        color: '#f6851b',
        desc: 'Browser Wallet'
      },
      streak: 10,
      connectedAt: new Date().toISOString(),
      personality: 'Pioneer',
      auraPoints: 221,
      lastClaimedAt: '',
      activities: [],
      categories: [],
      scores: {
        walletAge: 85,
        holdingBehavior: 85,
        txQuality: 85,
        staking: 10,
        governance: 91,
        community: 76,
        protocolRep: 100
      },
      metrics: {
        firstTxDate: '2023-12-27',
        walletAgeDays: 901,
        totalTransactions: 426,
        activeDays: 191,
        tokenBalancesUSD: 15721,
        nftCount: 1,
        stakedAmountUSD: 0,
        stakedDurationDays: 0,
        daoVotes: 19,
        earlyMintsCount: 7,
        riskInteractionsCount: 0
      },
      history: []
    });
    console.log('Successfully wrote to firestore with compliant schema!');

    console.log('Testing getDoc on "profiles/test_user_valid"...');
    const snap = await getDoc(testDoc);
    console.log('Snapshot exists:', snap.exists(), 'Data:', snap.data());
  } catch (err: any) {
    console.error('FIRESTORE WRITE/READ ERROR:', err);
  }
  process.exit(0);
}

main();
