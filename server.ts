import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Create Express container
const app = express();
const PORT = 3000;

// Ensure passports_saved directory exists on bootstrap
const PASSPORTS_DIR = path.join(process.cwd(), 'passports_saved');
if (!fs.existsSync(PASSPORTS_DIR)) {
  fs.mkdirSync(PASSPORTS_DIR, { recursive: true });
}

// Access body variables with increased payload limits so base64 canvas exports upload successfully
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// ── API Endpoint: Save Dynamic Passport Image ──
app.post('/api/passport/save', async (req, res) => {
  try {
    const { username, image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Capture base64 png data
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const id = crypto.randomBytes(8).toString('hex');
    const filename = `${id}.png`;
    const filepath = path.join(PASSPORTS_DIR, filename);

    fs.writeFileSync(filepath, base64Data, 'base64');
    
    console.log(`Saved dynamic reputation passport for @${username} under id: ${id}`);
    res.json({ id });
  } catch (error: any) {
    console.error('Error saving passport:', error);
    res.status(500).json({ error: 'Failed to write passport to disk' });
  }
});

// ── GET Endpoint: Retrieve Direct Image PNG ──
app.get('/passport/img/:id.png', (req, res) => {
  try {
    const { id } = req.params;
    const filepath = path.join(PASSPORTS_DIR, `${id}.png`);
    
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31200000'); // Cache for durable delivery
      return res.sendFile(filepath);
    }
    
    // Fallback to primary marketing fallback asset if not specifically found
    const staticFallback = path.join(process.cwd(), 'src', 'assets', 'images', 'karma_share_card_1780957350199.png');
    if (fs.existsSync(staticFallback)) {
      res.setHeader('Content-Type', 'image/png');
      return res.sendFile(staticFallback);
    }
    
    res.status(404).send('Passport image placeholder not found');
  } catch (err) {
    res.status(500).send('Internal server error retrieving passport');
  }
});

// ── GET Endpoint: Serve dynamic static images directly for absolute domain compatibility ──
app.get('/src/assets/images/:filename', (req, res) => {
  try {
    const filepath = path.join(process.cwd(), 'src', 'assets', 'images', req.params.filename);
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Type', 'image/png');
      return res.sendFile(filepath);
    }
    res.status(404).send('Local static asset not found');
  } catch (e) {
    res.status(500).send('Server static file error');
  }
});

// ── GET Endpoint: Elegant HTML Social Share OG page for crawler ──
app.get('/share/passport/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filepath = path.join(PASSPORTS_DIR, `${id}.png`);
    if (!fs.existsSync(filepath)) {
      return res.redirect('/');
    }

    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] === 'https' || req.secure ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    const imageUrl = `${baseUrl}/passport/img/${id}.png`;

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Sovereign Credit Reputation Passport</title>
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@KarmaAIScore">
  <meta name="twitter:creator" content="@KarmaAIScore">
  <meta name="twitter:title" content="Web3 Credit Reputation Passport">
  <meta name="twitter:description" content="View my sovereign credit intelligence ledger score and verified dynamic wallet standing on Karma AI index.">
  <meta name="twitter:image" content="${imageUrl}">
  
  <meta property="og:type" content="website">
  <meta property="og:title" content="Verified Sovereign Reputation Passport">
  <meta property="og:description" content="View my dynamic on-chain holding patterns, patience score, and eligibility for custom DeFi credit lines.">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${baseUrl}/share/passport/${id}">
  
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      background-color: #020106;
      color: #94a3b8;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .card {
      background-color: #0c0a18;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 32px;
      max-width: 450px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid rgba(255,255,255,0.05);
    }
    h1 {
      color: #ffffff;
      font-size: 20px;
      margin-top: 0;
      font-weight: 800;
    }
    p {
      font-size: 13px;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #a78bfa, #3b1c6e);
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 13px;
      margin-top: 15px;
      transition: opacity 0.2s;
    }
    .btn:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>KARMA REPUTATION PASSPORT</h1>
    <p>Loading decentralized sovereign credential. Redirecting shortly to the live analytics panel.</p>
    <img src="/passport/img/${id}.png" alt="Karma Passport">
    <br>
    <a href="/" class="btn">Enter Karma Applet</a>
  </div>
  <script>
    setTimeout(function() {
      window.location.href = '/';
    }, 2500);
  </script>
</body>
</html>`);
  } catch (err) {
    res.redirect('/');
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
