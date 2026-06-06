import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Create Express container
const app = express();
const PORT = 3000;

// Access body variables
app.use(express.json());

// Lazy-initialise or guard clean Gemini SDK initialization to prevent startup crashes
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY environment variable is not defined. Falling back to simulated answers client-side.');
      throw new Error('GEMINI_API_KEY is required for server production AI readings.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// ── API Endpoint: Real AI Reputation Reading ──
app.post('/api/gemini/reading', async (req, res) => {
  try {
    const { username, address, score, streak, personality, wallet, activities, categories } = req.body;

    const rawUsername = username || 'anonymous_explorer';
    const rawAddress = address || '0x0000...0000';
    const rawScore = score || 85;
    const rawStreak = streak || 4;
    const rawPersonality = personality || 'Visionary';
    const rawWallet = wallet || 'Web3 Wallet';
    const rawActivities = activities || [];
    const rawCategories = categories || [];

    const activitiesStr = rawActivities.map((a: any) =>
      `- [${a.type}] ${a.amount} ${a.asset} (${a.txHash}) — Impact: +${a.patienceImpact || 0} patience, +${a.loyaltyImpact || 0} loyalty, +${a.wisdomImpact || 0} wisdom · ${a.timestamp}`
    ).join('\n');

    const categoriesStr = rawCategories.map((c: any) =>
      `- ${c.label}: ${c.value}/100 (${c.icon})`
    ).join('\n');

    const ai = getGeminiClient();

    const systemPrompt = `You are KARMA AI, an oracle reputation index representing Web3 wallet behavior.
Integrate user stats AND their real-time on-chain transaction history to write a poetic, deeply insightful daily behavior reading addressing them directly.

Stats profile:
- Handle: @${rawUsername}
- Wallet Address: ${rawAddress}
- Connected via: ${rawWallet}
- Reputation Rating: ${rawScore}/100
- Archetype: ${rawPersonality}
- Conviction Streak: ${rawStreak} days Holding without Exits

Evaluation Categories:
${categoriesStr || '- No metrics defined.'}

Transaction History & On-Chain Ledger Actions:
${activitiesStr || '- No recent on-chain actions detected.'}

Strict rules:
1. Speak as a wise, ancient, yet technologically hyper-advanced digital system model.
2. Address the user directly as @${rawUsername}.
3. You MUST analyze and refer to specific actions inside their Transaction History (e.g., mention the specific assets, transaction types like Trade, Stake, Vote, or Mint, and exact amounts). Discuss how these events shifted their Reputation, Patience, Loyalty, or Wisdom scores. Refer specifically to their connected wallet client, ${rawWallet}.
4. DO NOT give financial advice, pricing forecasts, token recommendations, or investment plans. Focus purely on psychological holding patterns, patience, consistency, and ecosystem value.
5. Generate exactly 3 short paragraphs explaining their unique aura rating and behavioral footprint based on their ledger.
6. Provide a single poetic "Key Takeaway" and an actionable "Today's Focus".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Generate my reputation reading based on my on-chain profile metrics and transaction logs.',
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { 
              type: Type.STRING,
              description: 'A brief, poetic and majestic title of the reading (e.g. "The Unyielding Conviction of the Deep Tracker").'
            },
            paragraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 3 paragraphs of deep reputation wisdom, explaining their metrics, patience, and areas for potential ecosystem growth.'
            },
            insight: { 
              type: Type.STRING,
              description: 'A one-line philosophical key takeaway quote representing their current state.'
            },
            focus: { 
              type: Type.STRING,
              description: 'One actionable, non-financial on-chain focus recommendation for today.'
            }
          },
          required: ['title', 'paragraphs', 'insight', 'focus'],
        },
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error('Gemini API returned an empty output stream');
    }

    res.json(JSON.parse(bodyText.trim()));
  } catch (error: any) {
    console.error('Server AI reading generation error:', error);
    res.status(500).json({ error: error.message || 'Server failed to calculate AI reputation parameters.' });
  }
});

// Configure client asset routing & middleware based on dev/prod environments
async function bootstrapServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mounting Vite development middleware for instant client HMR mapping
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite routing middleware loaded successfully in developer mode.');
  } else {
    // Serving built production static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Built assets serving mounted from static project distribution path.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KARMA AI Server running on http://localhost:${PORT}`);
  });
}

bootstrapServer();
