// XAPE Extension Configuration

const XAPE_CONFIG = {
  // Backend API Configuration
  BACKEND_URL: 'https://postgres-production-958e.up.railway.app',
  
  // Token Gating Configuration
  REQUIRED_TOKEN_MINT: 'CRZ2GA5jMsQJRX9jqgeapnwEKx3Cchkzc3bFVmbxpump',
  REQUIRED_TOKEN_AMOUNT: 100,
  
  // Feature Flags
  ENABLE_TOKEN_GATING: true,
  ENABLE_VOICE_COMMANDS: true,
  ENABLE_NEWS_UPDATES: true,
  
  // API Endpoints
  ENDPOINTS: {
    CHAT: '/api/chat',
    CHECK_TOKEN: '/api/check-token-balance',
    NEWS_CHECK: '/api/news/check',
    NEWS_FETCH: '/api/news/fetch',
    COINS_SNAPSHOT: '/api/coins/snapshot',
    XAPE_SLEEP: '/api/xape/sleep'
  }
}

// Make config globally available
window.XAPE_CONFIG = XAPE_CONFIG

console.log('✅ XAPE Configuration loaded')
console.log('🌐 Backend URL:', XAPE_CONFIG.BACKEND_URL)

