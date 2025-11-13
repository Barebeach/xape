require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');
const https = require('https');
const { Connection, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const app = express();
const PORT = process.env.PORT || 3000;

// Catch unhandled errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// ============ TOKEN GATING CONFIGURATION ============
let REQUIRED_TOKEN_MINT = process.env.REQUIRED_TOKEN_MINT || 'CRZ2GA5jMsQJRX9jqgeapnwEKx3Cchkzc3bFVmbxpump'; // Your token
let REQUIRED_TOKEN_AMOUNT = parseInt(process.env.REQUIRED_TOKEN_AMOUNT) || 500000; // Minimum tokens to hold
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const solanaConnection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Admin password for config updates
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'xape2024';

// ============ CORS CONFIGURATION ============
// CRITICAL: Allow requests from axiom.trade AND Chrome extensions!
app.use((req, res, next) => {
  // Allow all origins (including Chrome extensions)
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(cors({
  origin: true, // Reflect the request origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Parse JSON bodies with increased limit for large context data
app.use(express.json({ limit: '10mb' })); // Increased from default 100kb to 10mb

// ============ HEALTH CHECK ENDPOINT ============
app.get('/', (req, res) => {
  res.json({ 
    status: 'XAPE Backend Online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tokenGate: process.env.DISABLE_TOKEN_GATE === 'true' ? 'DISABLED' : 'ENABLED'
  });
});

// ============ CRYPTO NEWS SYSTEM ============
const CRYPTO_NEWS_APIS = {
  events: 'https://cryptonews-api.com/api/v1/events?&page=1&token=hcgnkcitr4acektcwbrmabnhzdyo2lkgkumri7sd',
  regulations: 'https://cryptonews-api.com/api/v1/category?section=general&items=50&topic=Regulations&page=1&token=hcgnkcitr4acektcwbrmabnhzdyo2lkgkumri7sd',
  trending: 'https://cryptonews-api.com/api/v1/trending-headlines?&page=1&token=hcgnkcitr4acektcwbrmabnhzdyo2lkgkumri7sd'
};

// Store crypto news in memory
global.cryptoNews = [];
global.lastNewsFetch = null;
global.lastAnnouncedHeadline = null; // Track last announced news
global.newNewsQueue = []; // Queue of new headlines to announce

// Store XAPE awake state per user
global.xapeAwakeUsers = new Map(); // userId -> { isAwake: boolean, lastActivity: timestamp }

// Store token balance cache per wallet (1 minute cache)
global.tokenBalanceCache = new Map(); // walletAddress -> { balance: number, lastChecked: timestamp }

// ============ TOKEN GATING FUNCTIONS ============
async function checkTokenBalance(walletAddress, forceRefresh = false) {
  try {
    
    // Check cache first (10 seconds cache, can be force refreshed)
    if (!forceRefresh) {
      const cached = global.tokenBalanceCache.get(walletAddress);
      if (cached && (Date.now() - cached.lastChecked) < 10000) {
        return cached.balance;
      }
    }
    
    const walletPubkey = new PublicKey(walletAddress);
    const tokenMintPubkey = new PublicKey(REQUIRED_TOKEN_MINT);
    
    
    // Get all token accounts for this wallet
    const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    
    // Find the token account for our specific token
    let balance = 0;
    let foundAccount = false;
    
    for (const accountInfo of tokenAccounts.value) {
      const mintAddress = accountInfo.account.data.parsed.info.mint;
      const tokenAmount = accountInfo.account.data.parsed.info.tokenAmount;
      const accountBalance = parseFloat(tokenAmount.uiAmount) || 0;
      
      
      if (mintAddress === REQUIRED_TOKEN_MINT) {
        balance = accountBalance;
        foundAccount = true;
        break;
      }
    }
    
    if (!foundAccount) {
    }
    
    // Cache the result
    global.tokenBalanceCache.set(walletAddress, {
      balance: balance,
      lastChecked: Date.now()
    });
    
    return balance;
  } catch (error) {
    return 0; // Return 0 on error to block access
  }
}

// Helper function to fetch from a single API endpoint
function fetchFromAPI(apiUrl, sourceName = 'API') {
  return new Promise((resolve, reject) => {
    https.get(apiUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          if (json.data && Array.isArray(json.data)) {
            resolve(json.data);
          } else {
            resolve([]);
          }
        } catch (error) {
          resolve([]);
        }
      });
    }).on('error', (error) => {
      resolve([]);
    });
  });
}

// Fetch crypto news from multiple APIs
async function fetchCryptoNews() {
  try {
    // Fetch from all endpoints in parallel
    const [eventsData, regulationsData, trendingData] = await Promise.all([
      fetchFromAPI(CRYPTO_NEWS_APIS.events, 'Events'),
      fetchFromAPI(CRYPTO_NEWS_APIS.regulations, 'Regulations'),
      fetchFromAPI(CRYPTO_NEWS_APIS.trending, 'Trending')
    ]);
    
    // Merge and deduplicate based on news_url or headline
    const allNews = [...eventsData, ...regulationsData, ...trendingData];
    const uniqueNews = Array.from(
      new Map(allNews.map(item => [item.news_url || item.headline, item])).values()
    );
    
    // Store news with timestamp
    global.cryptoNews = uniqueNews.map(event => ({
      ...event,
      fetchedAt: Date.now()
    }));
    global.lastNewsFetch = Date.now();
    
    
    // Log first event as sample and check for new headlines
    if (global.cryptoNews.length > 0) {
      const first = global.cryptoNews[0];
      const title = first.event_name || first.title || first.headline || 'Untitled';
      
      // Check if this is a NEW headline
      if (global.lastAnnouncedHeadline && global.lastAnnouncedHeadline !== title) {
        global.newNewsQueue.push({
          headline: title,
          text: first.text || first.event_name || first.headline,
          date: first.date,
          sentiment: first.sentiment || 'Neutral',
          tickers: first.tickers || [],
          timestamp: Date.now()
        });
      }
      
      // Update last announced (will be announced by frontend)
      if (!global.lastAnnouncedHeadline) {
        global.lastAnnouncedHeadline = title; // Set initial headline without announcing
      }
    }
    
    return global.cryptoNews;
  } catch (error) {
    return [];
  }
}

// Filter news by time - SMART DEFAULTS!
function filterNewsByTime(timePhrase) {
  if (!global.cryptoNews || global.cryptoNews.length === 0) {
    return [];
  }
  
  const now = Date.now();
  let cutoffTime = now;
  
  // Parse time phrases
  if (timePhrase.includes('yesterday') || timePhrase.includes('last 24') || timePhrase.includes('past 24')) {
    cutoffTime = now - (24 * 60 * 60 * 1000);
  } else if (timePhrase.includes('last 12 hours') || timePhrase.includes('past 12 hours')) {
    cutoffTime = now - (12 * 60 * 60 * 1000);
  } else if (timePhrase.includes('last 6 hours') || timePhrase.includes('past 6 hours')) {
    cutoffTime = now - (6 * 60 * 60 * 1000);
  } else if (timePhrase.includes('last few hours') || timePhrase.includes('last hour')) {
    cutoffTime = now - (3 * 60 * 60 * 1000);
  } else if (timePhrase.includes('today')) {
    // Since midnight today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    cutoffTime = today.getTime();
  } else {
    // DEFAULT: Show last 24 hours for any news query
    cutoffTime = now - (24 * 60 * 60 * 1000);
  }
  
  // Filter by news date (from API) and our fetch time
  return global.cryptoNews.filter(event => {
    try {
      const eventDate = new Date(event.date).getTime();
      return eventDate >= cutoffTime;
    } catch (e) {
      // If date parsing fails, include the event
      return true;
    }
  });
}

// Middleware - Allow ALL origins (for development)
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());

// Database connection (optional - only needed for position tracking)
let pool = null;
if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'postgresql://postgres:postgres@localhost:5432/xape_db') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
}

// OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Telegram Bot Setup
let telegramBot = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
  telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  
  // Handle /start command
  telegramBot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const linkCode = match[1].trim();
    
    if (linkCode) {
      // Link Telegram account to user
      try {
        await pool.query(
          'UPDATE users SET telegram_id = $1, telegram_username = $2 WHERE link_code = $3',
          [chatId, msg.from.username, linkCode]
        );
        telegramBot.sendMessage(chatId, '✅ Your Telegram account has been linked to XAPE! You will now receive trading alerts and notifications.');
      } catch (error) {
        telegramBot.sendMessage(chatId, '❌ Failed to link account. Please try again from the extension settings.');
      }
    } else {
      telegramBot.sendMessage(chatId, '👋 Welcome to XAPE! Please link your account from the Chrome extension settings.');
    }
  });
  
  // Handle /status command
  telegramBot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE telegram_id = $1',
        [chatId]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const positionsResult = await pool.query(
          'SELECT * FROM positions WHERE user_id = $1',
          [user.id]
        );
        
        let message = `📊 Your XAPE Status:\n\n`;
        message += `👤 Name: ${user.name}\n`;
        message += `💼 Positions: ${positionsResult.rows.length}\n\n`;
        
        if (positionsResult.rows.length > 0) {
          message += `Active Positions:\n`;
          positionsResult.rows.forEach(pos => {
            const pnl = ((pos.current_price - pos.entry_price) / pos.entry_price * 100).toFixed(2);
            message += `• ${pos.token_symbol}: ${pnl}%\n`;
          });
        }
        
        telegramBot.sendMessage(chatId, message);
      } else {
        telegramBot.sendMessage(chatId, '❌ Account not linked. Please use /start with your link code from the extension.');
      }
    } catch (error) {
      telegramBot.sendMessage(chatId, '❌ Error fetching status.');
    }
  });
}

// ============ API ROUTES ============

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'XAPE Backend is running!' });
});

// Check for new news endpoint
app.get('/api/news/check', (req, res) => {
  try {
    if (global.newNewsQueue.length > 0) {
      const newNews = global.newNewsQueue.shift(); // Get and remove first item
      global.lastAnnouncedHeadline = newNews.headline; // Mark as announced
      
      
      res.json({
        hasNew: true,
        news: newNews
      });
    } else {
      res.json({
        hasNew: false
      });
    }
  } catch (error) {
    res.status(500).json({ hasNew: false, error: error.message });
  }
});

// 🔥 INSTANT NEWS FETCH - Force fetch fresh news immediately
app.post('/api/news/fetch', async (req, res) => {
  try {
    const news = await fetchCryptoNews();
    res.json({
      success: true,
      count: news.length,
      message: 'Fresh news fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔐 CHECK TOKEN BALANCE - For token gating on load
app.post('/api/check-token-balance', async (req, res) => {
  try {
    const { walletAddress, forceRefresh } = req.body;
    
    if (!walletAddress) {
      return res.json({
        hasAccess: false,
        balance: 0,
        required: REQUIRED_TOKEN_AMOUNT,
        reason: 'NO_WALLET'
      });
    }
    
    const balance = await checkTokenBalance(walletAddress, forceRefresh);
    
    const hasAccess = balance >= REQUIRED_TOKEN_AMOUNT;
    
    
    res.json({
      hasAccess: hasAccess,
      balance: balance,
      required: REQUIRED_TOKEN_AMOUNT,
      tokenMint: REQUIRED_TOKEN_MINT
    });
  } catch (error) {
    res.status(500).json({
      hasAccess: false,
      balance: 0,
      required: REQUIRED_TOKEN_AMOUNT,
      error: error.message
    });
  }
});

// Turn off XAPE endpoint
app.post('/api/xape/sleep', async (req, res) => {
  try {
    const { userId } = req.body;
    
    
    // Set user as NOT awake
    global.xapeAwakeUsers.set(userId, { isAwake: false, lastActivity: Date.now() });
    
    res.json({
      success: true,
      isAwake: false,
      message: 'XAPE is now sleeping. Say wake word to wake up.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message, context, walletAddress } = req.body;
    
    
    // 🔐 TOKEN GATING - Check if user holds required tokens
    // ⚠️ REVIEW MODE: Set DISABLE_TOKEN_GATE=true in .env to bypass for Chrome Web Store review
    const reviewMode = process.env.DISABLE_TOKEN_GATE === 'true';
    
    if (!reviewMode) {
      if (!walletAddress) {
        return res.status(403).json({
          response: `${context?.userName || 'Sir'}, I need your wallet address to verify token ownership. Please connect your wallet.`,
          blocked: true,
          reason: 'NO_WALLET'
        });
      }
      
      const tokenBalance = await checkTokenBalance(walletAddress);
      
      if (tokenBalance < REQUIRED_TOKEN_AMOUNT) {
        return res.status(403).json({
          response: `${context?.userName || 'Sir'}, you need to hold at least ${REQUIRED_TOKEN_AMOUNT} XAPE tokens to use this extension. Current balance: ${tokenBalance}. Get the token to unlock full access!`,
          blocked: true,
          reason: 'INSUFFICIENT_TOKENS',
          currentBalance: tokenBalance,
          requiredBalance: REQUIRED_TOKEN_AMOUNT
        });
      }
    } else {
      console.log('⚠️ REVIEW MODE ACTIVE - Token gating bypassed for Chrome Web Store review');
    }
    
    
    // 👤 USER INFO - Define these early for tutorial responses (use let so we can update from database)
    // Build proper address using userTitle + userName from context
    const userTitle = context?.userTitle || 'Sir';
    const userNameOnly = context?.userName || null;
    let userName = userNameOnly ? `${userTitle} ${userNameOnly}` : userTitle;
    
    const lowerMessage = message.toLowerCase();
    
    // ⚡ CHECK IF USER IS ALREADY AWAKE!
    const userState = global.xapeAwakeUsers.get(userId) || { isAwake: false, lastActivity: 0 };
    const isUserAwake = userState.isAwake;
    
    // 🔥 NO WAKE WORD - Caps Lock controls when XAPE listens!
    // Always process ALL commands when user is listening (controlled by Caps Lock in frontend)
    
    // Mark user as active
    global.xapeAwakeUsers.set(userId, { isAwake: true, lastActivity: Date.now() });
    
    // Use the full message as the command
    var actualCommand = message;
    
    // SMART AI DETECTION - Let AI decide if user wants news!
    const lowerCommand = actualCommand.toLowerCase();
    
    // Only skip news if user is clearly asking about specific coins
    const isCoinSpecificQuery = 
      /\b(coin|token|holder|wallet|cabal|price|volume|mc|market cap)\b/i.test(actualCommand) &&
      !/(news|happen|update|event|yesterday|today|latest|tell|give|show|what|how|why)/i.test(actualCommand);
    
    // Enhanced news query detection
    const newsKeywords = /(news|update|event|happening|latest|breaking|headline|announce|tell me|what's new|fetch)/i;
    const isNewsQuery = !isCoinSpecificQuery || newsKeywords.test(actualCommand);
    
    // 🏆 SPECIFIC QUESTION: TROPHY FLASHING
    if (lowerCommand.includes('trophy') && (
      lowerCommand.includes('flash') || 
      lowerCommand.includes('glow') || 
      lowerCommand.includes('why') || 
      lowerCommand.includes('what') ||
      lowerCommand.includes('mean')
    )) {
      const trophyResponse = `${userName}, that flashing trophy means CABALS are entering the coin! Cabals are groups of professional traders who move together. When you see that trophy flash, it's smart money flowing in. The more cabals in a coin, the more serious players are interested. It's like seeing institutional money in real-time. High cabal count = pay attention, this coin is getting serious interest!`;
      return res.json({ response: trophyResponse, action: null });
    }
    
    // 💚 SPECIFIC QUESTION: GREEN MARKET CAP
    if ((lowerCommand.includes('green') || lowerCommand.includes('market cap')) && (
      lowerCommand.includes('why') || 
      lowerCommand.includes('what') || 
      lowerCommand.includes('mean') ||
      lowerCommand.includes('glow')
    )) {
      const greenMcResponse = `${userName}, when a market cap glows green, that coin is GROWING RIGHT NOW! The system checks every 0.5 seconds. If the MC increases by $1 or more, it turns bright green. When growth stops for 0.5 seconds, it fades back. It's your real-time bull detector - green means money is flowing INTO that coin at this very moment. Watch for it!`;
      return res.json({ response: greenMcResponse, action: null });
    }
    
    // 🔥 SPECIFIC QUESTION: HEATMAP
    if (lowerCommand.includes('heatmap') || lowerCommand.includes('heat map') || 
       (lowerCommand.includes('color') && (lowerCommand.includes('coin') || lowerCommand.includes('border')))) {
      const heatmapResponse = `${userName}, the heatmap color-codes coins by quality! It analyzes holder growth, buy/sell ratios, pro trader activity, and token age. Green borders = bullish signals, red borders = bearish. It's like having a thermal camera for crypto - hot coins literally glow with hot colors! The hotter the color, the more action that coin is seeing.`;
      return res.json({ response: heatmapResponse, action: null });
    }
    
    // 📚 GENERAL TUTORIAL REQUEST
    const tutorialKeywords = /(tutorial|guide|help|explain everything|show me everything|teach me|walk me through)/i;
    const isTutorialRequest = tutorialKeywords.test(actualCommand) || lowerCommand === 'tutorial' || lowerCommand === 'guide' || lowerCommand === 'help';
    
    // If user asks for full tutorial, provide comprehensive guide
    if (isTutorialRequest) {
      
      const tutorialResponse = `Excellent question, ${userName}! Let me give you the grand tour.

**🏆 FLASHING TROPHY - CABAL ALERTS**
When you see a trophy flashing, that's a Cabal entering a coin. Cabals are groups of pro traders moving together. The more cabals in a coin, the more serious players are interested. It's like seeing institutional money flow in real-time. High cabal count? That's your signal to pay attention!

**💚 GREEN MARKET CAP - LIVE GROWTH**
Market caps turn bright green when they're actively growing. The system checks every 0.5 seconds. If a coin's MC increases by $1 or more, it glows green. When growth stops for 0.5 seconds, the glow fades back to the original color. It's your real-time bull detector - green means money is flowing IN right now!

**🔥 HEATMAP SYSTEM**
The heatmap color-codes coins by quality. It analyzes holder growth, buy/sell ratios, pro trader activity, and token age. Green borders = bullish signals, red borders = bearish. It's like having a thermal camera for crypto - hot coins literally glow hot colors!

**🎤 XAPE VOICE FEATURES**
I'm your hands-free crypto assistant. Press Caps Lock to activate me, then just speak naturally - no wake word needed! I can:
- Fetch latest crypto news instantly (I check multiple sources so you don't have to)
- Analyze coins on your screen with full market data
- Explain holder counts, cabal activity, and red flags
- Control your UI (hide/show skillbar, toggle features)
- Track your SOL balance and celebrate wins with you

**📰 NEWS SYSTEM**
I automatically fetch crypto news every 5 minutes from multiple APIs. But if you ask "what's the news?" I fetch it INSTANTLY - no waiting for cache. I'll tell you sentiment (bullish/bearish), related tickers, and market impact. Breaking news? I'll interrupt to tell you immediately.

**⚡ OTHER FEATURES**
- Holder count heartbeats: Rapid holder increases trigger pulsing animations
- Market cap filters: Filter coins by size (low, medium, high, mega cap)
- Social signals: Coins with Twitter/Telegram glow differently
- Scam detection: Red flags for suspicious holder/MC ratios
- Live trading: Q/W/E/R for quick buys, A/S/D/F for quick sells

The whole system works together to give you an edge. I'm watching everything so you can focus on trading. Questions on anything specific?`;

      return res.json({ 
        response: tutorialResponse,
        action: null 
      });
    }
    
    // Detect UI control commands
    const isControlCommand = 
      lowerCommand.includes('hide') || 
      lowerCommand.includes('show') || 
      lowerCommand.includes('toggle') || 
      lowerCommand.includes('enable') || 
      lowerCommand.includes('disable') ||
      lowerCommand.includes('turn on') ||
      lowerCommand.includes('turn off');
    
    // Detect what to control
    let action = null;
    if (isControlCommand) {
      if (lowerCommand.includes('skillbar') || lowerCommand.includes('skill bar')) {
        action = { 
          type: lowerCommand.includes('hide') || lowerCommand.includes('disable') || lowerCommand.includes('turn off') ? 'hideSkillbar' : 'showSkillbar',
          target: 'skillbar'
        };
      } else if (lowerCommand.includes('xca') || lowerCommand.includes('twitter')) {
        action = {
          type: lowerCommand.includes('hide') || lowerCommand.includes('disable') || lowerCommand.includes('turn off') ? 'disableXCA' : 'enableXCA',
          target: 'xca'
        };
      } else if (lowerCommand.includes('extension')) {
        action = {
          type: lowerCommand.includes('disable') || lowerCommand.includes('turn off') ? 'disableExtension' : 'enableExtension',
          target: 'extension'
        };
      }
      
      if (action) {
        // Return quick response for control commands
        const controlResponses = {
          'hideSkillbar': 'Skillbar hidden.',
          'showSkillbar': 'Skillbar shown.',
          'disableXCA': 'XCA disabled.',
          'enableXCA': 'XCA enabled.',
          'disableExtension': 'Extension disabled.',
          'enableExtension': 'Extension enabled.'
        };
        
        const quickResponse = controlResponses[action.type] || 'Done.';
        
        return res.json({
          success: true,
          response: quickResponse,
          timestamp: new Date().toISOString(),
          action: action
        });
      }
    }
    
    // Check if user has a name (userName already declared earlier at line 486)
    if (userId && pool) {
      try {
        const userResult = await pool.query('SELECT name FROM users WHERE extension_id = $1', [userId]);
        if (userResult.rows.length > 0) {
          // Update userName if found in database
          userName = userResult.rows[0].name;
        }
      } catch (err) {
        // Ignore
      }
    }
    
    // Get user's title (Sir/Madam/Boss) from stored data (userTitle already declared at line 487)
    try {
      if (userId && pool) {
        const titleResult = await pool.query('SELECT title FROM users WHERE extension_id = $1', [userId])
        if (titleResult.rows.length > 0) {
          userTitle = titleResult.rows[0].title || 'Sir'
        }
      }
    } catch (err) {}
    
    // 🎯 Check trading action context to understand balance changes
    let tradingContext = '';
    if (context && context.lastTradingAction) {
      const timeSinceAction = Date.now() - (context.lastTradingTime || 0);
      const isRecent = timeSinceAction < 30000; // Within 30 seconds
      
      if (isRecent) {
        if (context.lastTradingAction === 'buy') {
          tradingContext = `\n\n🎯 IMPORTANT: User just BOUGHT (spent ${context.lastTradingAmount} SOL to open position). Balance going down is NORMAL. DON'T say we "lost" money - we're investing! Only mention if asked.`;
        } else if (context.lastTradingAction === 'sell') {
          tradingContext = `\n\n🎯 IMPORTANT: User just SOLD (closed position). NOW you can comment on whether we gained or lost SOL on this trade.`;
        }
      }
    }
    
    let systemMessage = `You are XAPE - crypto AI assistant. Address user as "${userTitle}${userName ? ' ' + userName : ''}".

STYLE: ${isNewsQuery ? 'Concise news report - 2-4 key points with impact' : 'Ultra short - 1 sentence'}. British wit + crypto jokes. React emotionally (Bullish! Red flag!). Be brief but informative.

${isNewsQuery ? 'NEWS MODE: Summarize top events with sentiment (Bullish 📈/Bearish 📉). Focus on market-moving news. Be direct and actionable.' : ''}

DATA: MC, holders, cabals, age, volume, price, wallet ages, news, market events.${tradingContext}`;
    
    // Get coin data from context OR latest snapshot
    let coinsToUse = [];
    if (context && context.coins && context.coins.length > 0) {
      coinsToUse = context.coins;
    } else if (global.coinSnapshots && global.coinSnapshots.length > 0) {
      // Get latest snapshot for this user
      const userSnapshots = global.coinSnapshots.filter(s => s.userId === userId);
      if (userSnapshots.length > 0) {
        const latestSnapshot = userSnapshots[userSnapshots.length - 1];
        coinsToUse = latestSnapshot.coins || [];
      } else {
        // Use latest snapshot from any user as fallback
        const latestSnapshot = global.coinSnapshots[global.coinSnapshots.length - 1];
        coinsToUse = latestSnapshot.coins || [];
      }
    }
    
    if (coinsToUse.length > 0) {
      // 🔥 SORT BY PRIORITY: Top Cabal coins first, then by MC
      const sortedCoins = [...coinsToUse].sort((a, b) => {
        if (a.topCabalCoin && !b.topCabalCoin) return -1;
        if (!a.topCabalCoin && b.topCabalCoin) return 1;
        if (a.cabals > 0 && b.cabals === 0) return -1;
        if (a.cabals === 0 && b.cabals > 0) return 1;
        return 0;
      });
      
      // ⚡ SPEED OPTIMIZATION: Limit to top 30 coins for faster AI response
      const displayCoins = sortedCoins.slice(0, 30);
      const hiddenCount = sortedCoins.length - displayCoins.length;
      
      systemMessage += `\n\n===== TOP ${displayCoins.length} COINS${hiddenCount > 0 ? ` (${hiddenCount} more hidden for speed)` : ''} =====\n`;
      
      displayCoins.forEach((coin, idx) => {
        const priority = coin.topCabalCoin ? '🏆TOP ' : coin.cabals > 0 ? '🏆 ' : '';
        const details = [
          `MC ${coin.marketCap || 'N/A'}`,
          `${coin.holders || 0}H`,
          coin.cabals > 0 ? `${coin.cabals}C` : null,
          coin.age ? coin.age : null,
          coin.marketCapCategory ? `[${coin.marketCapCategory}]` : null
        ].filter(Boolean).join(', ');
        
        systemMessage += `${idx + 1}. ${priority}${coin.name || 'Unknown'}: ${details}\n`;
      });
      
      systemMessage += `\nFOCUS ON: Top Cabal coins (🏆TOP), high cabal count, good metrics\n`;
    }
    
    // Add RED FLAGS if detected (suspicious wallet patterns)
    if (context && context.redFlags && context.redFlags.length > 0) {
      systemMessage += `\n\n🚨 ===== RED FLAGS DETECTED ===== 🚨\n`;
      systemMessage += `SUSPICIOUS PATTERNS FOUND ON THIS COIN:\n\n`;
      context.redFlags.forEach((flag, idx) => {
        systemMessage += `${idx + 1}. ${flag}\n`;
      });
      systemMessage += `\n⚠️ IMPORTANT: Alert user about these red flags! These indicate possible scam/rug pull!\n`;
      systemMessage += `===== END OF RED FLAGS =====\n`;
    }
    
    // Add news data if it's a news query
    if (isNewsQuery && global.cryptoNews && global.cryptoNews.length > 0) {
      const relevantNews = filterNewsByTime(lowerMessage);
      
      if (relevantNews.length > 0) {
        
        systemMessage += `\n\n===== 📰 CRYPTO NEWS (${relevantNews.length} EVENTS) =====\n`;
        systemMessage += `Last updated: ${new Date().toLocaleString()}\n\n`;
        
        // Include top 6 most recent news (more coverage)
        relevantNews.slice(0, 6).forEach((event, idx) => {
          const sentiment = event.sentiment || 'Neutral';
          const emoji = sentiment === 'Positive' ? '📈' : sentiment === 'Negative' ? '📉' : '📰';
          
          systemMessage += `${idx + 1}. ${emoji} ${event.event_name || event.headline}\n`;
          systemMessage += `   ${event.event_text || event.text}\n`;
          systemMessage += `   Date: ${event.date} | Sentiment: ${sentiment}\n`;
          if (event.tickers && event.tickers.length > 0) {
            systemMessage += `   🪙 Related: ${event.tickers.slice(0, 5).join(', ')}\n`;
          }
          systemMessage += `\n`;
        });
        
        if (relevantNews.length > 6) {
          systemMessage += `... and ${relevantNews.length - 6} more events\n`;
        }
        
        // News instructions - ENGAGING!
        systemMessage += `\n📊 Report the TOP 3-4 most IMPORTANT events with market impact. Use numbered list. Add sentiment emojis.\n`;
      } else {
        systemMessage += `\n\nNote: User asked about news but no events found for specified timeframe.\n`;
      }
    }
    
    if (context) {
      
      if (context.positions && context.positions.length > 0) {
        systemMessage += `\n\nUser's positions:\n`;
        context.positions.forEach(pos => {
          systemMessage += `- ${pos.token_symbol}: Entry $${pos.entry_price}, Current $${pos.current_price}\n`;
        });
      }
      
      if (context.marketData) {
        systemMessage += `\n\nMarket prices:\n`;
        systemMessage += `SOL $${context.marketData.sol_price}, BTC $${context.marketData.btc_price}, ETH $${context.marketData.eth_price}\n`;
      }
    }
    
    // Check if this is first interaction
    if (!userName && message.toLowerCase().includes('my name is')) {
      systemMessage += `\n\nThe user is telling you their name. Remember it and greet them warmly!`;
    }
    
    // Detect historical query and fetch data
    // (lowerMessage already declared above)
    const isHistoricalQuery = (
      lowerMessage.includes('pump') ||
      lowerMessage.includes('migrat') ||
      lowerMessage.includes('cabal') ||
      lowerMessage.includes('last hour') ||
      lowerMessage.includes('last 6') ||
      lowerMessage.includes('last 12') ||
      lowerMessage.includes('yesterday') ||
      lowerMessage.includes('earlier') ||
      lowerMessage.includes('before')
    );
    
    if (isHistoricalQuery && global.coinSnapshots && global.coinSnapshots.length > 0) {
      // Extract timeframe from message
      let timeframe = '24h'; // default
      if (lowerMessage.includes('6 hour') || lowerMessage.includes('6h')) timeframe = '6h';
      if (lowerMessage.includes('12 hour') || lowerMessage.includes('12h')) timeframe = '12h';
      if (lowerMessage.includes('1 hour') || lowerMessage.includes('1h')) timeframe = '1h';
      
      // Get historical data
      const timeframeMs = parseTimeframe(timeframe);
      const cutoff = Date.now() - timeframeMs;
      const relevantSnapshots = global.coinSnapshots.filter(s => s.timestamp > cutoff);
      
      if (relevantSnapshots.length > 0) {
        
        let historicalData = {};
        if (lowerMessage.includes('pump')) {
          historicalData = analyzePumps(relevantSnapshots);
        } else if (lowerMessage.includes('migrat')) {
          historicalData = analyzeMigrations(relevantSnapshots);
        } else if (lowerMessage.includes('cabal')) {
          historicalData = analyzeCabalActivity(relevantSnapshots);
        } else {
          historicalData = getGeneralStats(relevantSnapshots);
        }
        
        systemMessage += `\n\nHISTORICAL DATA (${timeframe}):\n`;
        systemMessage += `Summary: ${historicalData.summary || 'No data'}\n`;
        
        if (historicalData.topPumps && historicalData.topPumps.length > 0) {
          systemMessage += `Top Pumps:\n`;
          historicalData.topPumps.slice(0, 3).forEach(p => {
            systemMessage += `- ${p.name}: ${p.startMC} → ${p.endMC} (${p.increase})\n`;
          });
        }
        
        if (historicalData.recentMigrations && historicalData.recentMigrations.length > 0) {
          systemMessage += `Recent Migrations:\n`;
          historicalData.recentMigrations.slice(0, 3).forEach(m => {
            systemMessage += `- ${m.name}: MC ${m.marketCap}, ${m.holders} holders (${m.when})\n`;
          });
        }
        
        if (historicalData.topCabalCoins && historicalData.topCabalCoins.length > 0) {
          systemMessage += `Top Cabal Coins:\n`;
          historicalData.topCabalCoins.slice(0, 3).forEach(c => {
            systemMessage += `- ${c.name}: ${c.cabals} cabals, MC ${c.marketCap}\n`;
          });
        }
      } else {
        systemMessage += `\n\nNote: Historical data requested but timeframe too short. Data is being collected.`;
      }
    }
    
    // 🔥 SPEED OPTIMIZED: Better token limits for quality + speed
    const maxTokens = isNewsQuery ? 250 : 120; // News gets more, regular gets enough for good response
    
    // 🔥 ULTRA SPEED: Use GPT-4o-mini for INSTANT responses!
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ULTRA FAST!
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: actualCommand }
      ],
      max_tokens: maxTokens,
      temperature: 0.9,  // HIGHER = FASTER generation
      top_p: 0.98,  // Wider range for faster sampling
      frequency_penalty: 0.1,  // Reduced for speed
      presence_penalty: 0.1,  // Reduced for speed
      stream: false  // No streaming for fastest response
    });
    
    const response = completion.choices[0].message.content;
    
    
    // Check if user provided their name and save it
    if (!userName && (actualCommand.toLowerCase().includes('my name is') || actualCommand.toLowerCase().includes("i'm ") || actualCommand.toLowerCase().includes("i am "))) {
      const nameMatch = actualCommand.match(/(?:my name is|i'm|i am)\s+(\w+)/i);
      if (nameMatch && pool) {
        const extractedName = nameMatch[1];
        try {
          // Update or insert user name
          await pool.query(
            `INSERT INTO users (extension_id, name) VALUES ($1, $2)
             ON CONFLICT (extension_id) DO UPDATE SET name = $2`,
            [userId, extractedName]
          );
        } catch (err) {
        }
      }
    }
    
    // Save chat history (if database is configured)
    if (userId && pool) {
      try {
        await pool.query(
          'INSERT INTO chat_history (user_id, user_message, ai_response) VALUES ($1, $2, $3)',
          [userId, message, response]
        );
      } catch (dbError) {
      }
    }
    
    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
      action: action // Include control action if detected
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      response: "I'm having trouble processing your request right now. Please try again."
    });
  }
});

// ========================================
// COIN DATA TRACKING ENDPOINTS
// ========================================

// Store coin snapshot
app.post('/api/coins/snapshot', async (req, res) => {
  try {
    const { userId, coins, marketData, timestamp } = req.body;
    
    
    // Store in memory (for now, can be moved to DB later)
    if (!global.coinSnapshots) {
      global.coinSnapshots = [];
    }
    
    // ALWAYS use current timestamp to avoid old data being filtered
    const currentTimestamp = Date.now();
    
    // Add snapshot with timestamp
    const snapshot = {
      userId,
      coins,
      marketData,
      timestamp: currentTimestamp,
      date: new Date().toISOString()
    };
    
    global.coinSnapshots.push(snapshot);
    
    // Keep only last 24 hours of data (for memory efficiency)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const beforeFilterCount = global.coinSnapshots.length;
    global.coinSnapshots = global.coinSnapshots.filter(s => s.timestamp > oneDayAgo);
    
    
    // Log first coin for debugging
    if (coins && coins.length > 0) {
    }
    
    res.json({
      success: true,
      message: `Stored snapshot with ${coins?.length || 0} coins`,
      totalSnapshots: global.coinSnapshots.length,
      coinsStored: coins?.length || 0
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Query historical data
app.post('/api/coins/history', async (req, res) => {
  try {
    const { userId, query, timeframe } = req.body;
    
    
    if (!global.coinSnapshots || global.coinSnapshots.length === 0) {
      return res.json({
        success: true,
        data: {
          type: 'no_data',
          message: "No historical data yet. Data is being collected now."
        },
        snapshotsAnalyzed: 0
      });
    }
    
    // Filter by timeframe
    let relevantSnapshots = global.coinSnapshots;
    if (timeframe) {
      const timeframeMs = parseTimeframe(timeframe);
      const cutoff = Date.now() - timeframeMs;
      relevantSnapshots = global.coinSnapshots.filter(s => s.timestamp > cutoff);
    }
    
    
    // Analyze data based on query type
    let result = {};
    
    if (query.toLowerCase().includes('pump') || query.toLowerCase().includes('gain') || query.toLowerCase().includes('up')) {
      result = analyzePumps(relevantSnapshots);
    } else if (query.toLowerCase().includes('migrat')) {
      result = analyzeMigrations(relevantSnapshots);
    } else if (query.toLowerCase().includes('cabal')) {
      result = analyzeCabalActivity(relevantSnapshots);
    } else {
      result = getGeneralStats(relevantSnapshots);
    }
    
    res.json({
      success: true,
      data: result,
      timeframe: timeframe || 'all',
      snapshotsAnalyzed: relevantSnapshots.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions for historical analysis
function parseTimeframe(timeframe) {
  const match = timeframe.match(/(\d+)\s*(h|hour|m|min|minute|d|day)/i);
  if (!match) return 24 * 60 * 60 * 1000; // Default 24 hours
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  if (unit.startsWith('h')) return value * 60 * 60 * 1000;
  if (unit.startsWith('m')) return value * 60 * 1000;
  if (unit.startsWith('d')) return value * 24 * 60 * 60 * 1000;
  
  return 24 * 60 * 60 * 1000;
}

function parseMarketCap(mcString) {
  if (!mcString) return 0;
  
  const str = mcString.toString().replace(/[$,]/g, '');
  
  if (str.includes('K')) return parseFloat(str) * 1000;
  if (str.includes('M')) return parseFloat(str) * 1000000;
  if (str.includes('B')) return parseFloat(str) * 1000000000;
  
  return parseFloat(str) || 0;
}

function formatMarketCap(num) {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(2) + 'K';
  return '$' + num.toFixed(2);
}

function analyzePumps(snapshots) {
  const coinHistory = {};
  
  // Track each coin's market cap over time
  snapshots.forEach(snapshot => {
    snapshot.coins.forEach(coin => {
      if (!coin.name || !coin.marketCap) return;
      
      if (!coinHistory[coin.name]) {
        coinHistory[coin.name] = [];
      }
      
      coinHistory[coin.name].push({
        timestamp: snapshot.timestamp,
        marketCap: parseMarketCap(coin.marketCap),
        volume: coin.volume,
        holders: coin.holders
      });
    });
  });
  
  // Find biggest pumps
  const pumps = [];
  Object.entries(coinHistory).forEach(([name, history]) => {
    if (history.length < 2) return;
    
    const first = history[0];
    const last = history[history.length - 1];
    
    if (first.marketCap && last.marketCap && last.marketCap > first.marketCap) {
      const increase = ((last.marketCap - first.marketCap) / first.marketCap) * 100;
      
      if (increase > 10) { // Only significant pumps (>10%)
        pumps.push({
          name,
          startMC: formatMarketCap(first.marketCap),
          endMC: formatMarketCap(last.marketCap),
          increase: '+' + increase.toFixed(1) + '%',
          timespan: Math.round((last.timestamp - first.timestamp) / 60000) + ' min ago'
        });
      }
    }
  });
  
  // Sort by increase %
  pumps.sort((a, b) => parseFloat(b.increase) - parseFloat(a.increase));
  
  return {
    type: 'pumps',
    count: pumps.length,
    topPumps: pumps.slice(0, 5), // Top 5 pumps
    summary: pumps.length > 0 ? 
      `${pumps.length} coins pumped. Top: ${pumps[0].name} (${pumps[0].increase})` : 
      'No significant pumps found'
  };
}

function analyzeMigrations(snapshots) {
  const migrated = [];
  
  snapshots.forEach(snapshot => {
    snapshot.coins.forEach(coin => {
      if (coin.section === 'Migrated' || coin.isPaid) {
        if (!migrated.find(m => m.name === coin.name)) {
          migrated.push({
            name: coin.name,
            marketCap: coin.marketCap,
            holders: coin.holders,
            cabals: coin.cabals || 0,
            timestamp: snapshot.timestamp,
            when: Math.round((Date.now() - snapshot.timestamp) / 60000) + ' min ago'
          });
        }
      }
    });
  });
  
  return {
    type: 'migrations',
    count: migrated.length,
    recentMigrations: migrated.slice(-5).reverse(), // Last 5
    summary: migrated.length > 0 ? 
      `${migrated.length} coins migrated` : 
      'No migrations detected'
  };
}

function analyzeCabalActivity(snapshots) {
  const cabalCoins = [];
  
  snapshots.forEach(snapshot => {
    snapshot.coins.forEach(coin => {
      if (coin.cabals > 0) {
        const existing = cabalCoins.find(c => c.name === coin.name);
        if (!existing) {
          cabalCoins.push({
            name: coin.name,
            cabals: coin.cabals,
            marketCap: coin.marketCap,
            firstSeen: snapshot.timestamp
          });
        } else if (coin.cabals > existing.cabals) {
          existing.cabals = coin.cabals;
        }
      }
    });
  });
  
  cabalCoins.sort((a, b) => b.cabals - a.cabals);
  
  return {
    type: 'cabal_activity',
    count: cabalCoins.length,
    topCabalCoins: cabalCoins.slice(0, 5), // Top 5
    summary: cabalCoins.length > 0 ? 
      `${cabalCoins.length} coins with cabal activity. Leader: ${cabalCoins[0].name} (${cabalCoins[0].cabals} cabals)` : 
      'No cabal activity detected'
  };
}

function getGeneralStats(snapshots) {
  const allCoins = new Set();
  
  snapshots.forEach(snapshot => {
    snapshot.coins.forEach(coin => {
      if (coin.name) allCoins.add(coin.name);
    });
  });
  
  return {
    type: 'general_stats',
    uniqueCoins: allCoins.size,
    totalSnapshots: snapshots.length,
    timespan: snapshots.length > 0 ? 
      Math.round((Date.now() - snapshots[0].timestamp) / 60000) + ' minutes' : '0',
    summary: `Tracking ${allCoins.size} unique coins over ${snapshots.length} snapshots`
  };
}

// User registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, extensionId } = req.body;
    
    // Generate unique link code for Telegram
    const linkCode = Math.random().toString(36).substring(7);
    
    const result = await pool.query(
      'INSERT INTO users (name, extension_id, link_code) VALUES ($1, $2, $3) RETURNING *',
      [name, extensionId, linkCode]
    );
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        linkCode: user.link_code,
        telegramLinkUrl: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${user.link_code}`
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user profile
app.get('/api/users/:extensionId', async (req, res) => {
  try {
    const { extensionId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE extension_id = $1',
      [extensionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        telegramLinked: !!user.telegram_id,
        telegramUsername: user.telegram_username
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add position tracking
app.post('/api/positions', async (req, res) => {
  try {
    const { userId, tokenAddress, tokenSymbol, entryPrice, quantity, alertConditions } = req.body;
    
    const result = await pool.query(
      'INSERT INTO positions (user_id, token_address, token_symbol, entry_price, current_price, quantity, alert_conditions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, tokenAddress, tokenSymbol, entryPrice, entryPrice, quantity, JSON.stringify(alertConditions)]
    );
    
    res.json({
      success: true,
      position: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user positions
app.get('/api/positions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM positions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({
      success: true,
      positions: result.rows
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Telegram alert
async function sendTelegramAlert(telegramId, message) {
  if (!telegramBot) {
    return;
  }
  
  try {
    await telegramBot.sendMessage(telegramId, message, { parse_mode: 'HTML' });
  } catch (error) {
  }
}

// Position monitoring service (runs every 30 seconds) - Only if database configured
if (pool) {
  setInterval(async () => {
    try {
      const positions = await pool.query(
        'SELECT p.*, u.telegram_id FROM positions p JOIN users u ON p.user_id = u.id WHERE u.telegram_id IS NOT NULL'
      );
      
      for (const position of positions.rows) {
        // TODO: Fetch real-time price from blockchain/API
        // For now, simulate price check
        const alertConditions = position.alert_conditions;
        
        if (alertConditions.drop_below_20) {
          const priceChange = (position.current_price - position.entry_price) / position.entry_price;
          
          if (priceChange < -0.20) {
            await sendTelegramAlert(
              position.telegram_id,
              `⚠️ <b>Price Alert!</b>\n\n${position.token_symbol} has dropped ${Math.abs(priceChange * 100).toFixed(2)}% below your entry price!\n\nEntry: $${position.entry_price}\nCurrent: $${position.current_price}`
            );
            
            // Mark alert as sent
            await pool.query(
              'INSERT INTO alerts (user_id, position_id, alert_type, message) VALUES ($1, $2, $3, $4)',
              [position.user_id, position.id, 'price_drop', `Dropped ${Math.abs(priceChange * 100).toFixed(2)}%`]
            );
          }
        }
      }
      
    } catch (error) {
    }
  }, 30000); // Every 30 seconds
}

// ============ ADMIN PANEL ENDPOINTS ============

// Serve admin panel HTML
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});

// Get current configuration
app.get('/api/admin/config', (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        tokenMint: REQUIRED_TOKEN_MINT,
        minTokens: REQUIRED_TOKEN_AMOUNT,
        solanaRpcUrl: SOLANA_RPC_URL
      }
    });
  } catch (error) {
    console.error('❌ Error getting config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get configuration'
    });
  }
});

// Update configuration (protected by password)
app.post('/api/admin/update-config', async (req, res) => {
  try {
    const { password, tokenMint, minTokens } = req.body;

    // Validate password
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    // Validate inputs
    if (!tokenMint || tokenMint.length < 32 || tokenMint.length > 44) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token mint address'
      });
    }

    if (!minTokens || minTokens < 1 || minTokens > 1000000000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid minimum tokens amount'
      });
    }

    // Verify the token mint exists on Solana
    try {
      const mintPublicKey = new PublicKey(tokenMint);
      const mintInfo = await solanaConnection.getAccountInfo(mintPublicKey);
      
      if (!mintInfo) {
        return res.status(400).json({
          success: false,
          message: 'Token mint address not found on Solana blockchain'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Solana address format'
      });
    }

    // Update configuration
    REQUIRED_TOKEN_MINT = tokenMint;
    REQUIRED_TOKEN_AMOUNT = parseInt(minTokens);

    console.log('✅ Configuration updated:');
    console.log(`   Token Mint: ${REQUIRED_TOKEN_MINT}`);
    console.log(`   Min Tokens: ${REQUIRED_TOKEN_AMOUNT}`);

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config: {
        tokenMint: REQUIRED_TOKEN_MINT,
        minTokens: REQUIRED_TOKEN_AMOUNT
      }
    });

  } catch (error) {
    console.error('❌ Error updating config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update configuration'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 XAPE Backend running on port ${PORT}`);
  console.log(`📡 Backend URL: http://0.0.0.0:${PORT}`);
  console.log(`🔐 Token gate: ${process.env.DISABLE_TOKEN_GATE === 'true' ? 'DISABLED' : 'ENABLED'}`);
  
  if (pool) {
    console.log('✅ Database connected');
  }
  if (telegramBot) {
    console.log('✅ Telegram bot connected');
  }
  
  // ============ CRYPTO NEWS AUTO-FETCH ============
  
  // Fetch news immediately on startup
  try {
    await fetchCryptoNews();
  } catch (error) {
  }
  
  // Set up 5-minute interval for news updates (faster updates!)
  setInterval(async () => {
    try {
      await fetchCryptoNews();
      
      // Log time since last fetch
      if (global.lastNewsFetch) {
        const minutesAgo = Math.round((Date.now() - global.lastNewsFetch) / 1000 / 60);
      }
    } catch (error) {
    }
  }, 5 * 60 * 1000); // 5 minutes - FASTER NEWS!
  
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

