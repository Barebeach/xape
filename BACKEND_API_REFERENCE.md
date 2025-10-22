# 🌐 XAPE Backend API Reference

**Base URL:** `https://postgres-production-958e.up.railway.app`

## 📡 API Endpoints

### 1. AI Chat
**Endpoint:** `POST /api/chat`

Talk to XAPE AI assistant with context-aware responses.

**Request Body:**
```json
{
  "message": "What is Bitcoin?",
  "context": {
    "coins": [],
    "walletAddress": "optional_wallet_address"
  }
}
```

**Response:**
```json
{
  "response": "Bitcoin is a decentralized cryptocurrency...",
  "timestamp": "2025-10-22T06:00:00.000Z"
}
```

**Example Usage:**
```javascript
const response = await fetch('https://postgres-production-958e.up.railway.app/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Analyze this wallet',
    context: { walletAddress: '...' }
  })
});
const data = await response.json();
console.log(data.response);
```

---

### 2. Check Token Balance
**Endpoint:** `POST /api/check-token-balance`

Check if a wallet holds required XAPE tokens for gating.

**Request Body:**
```json
{
  "walletAddress": "SOLANA_WALLET_ADDRESS"
}
```

**Response:**
```json
{
  "hasAccess": true,
  "balance": 150.5,
  "required": 100,
  "message": "Access granted"
}
```

**Token Details:**
- Token Mint: `CRZ2GA5jMsQJRX9jqgeapnwEKx3Cchkzc3bFVmbxpump`
- Required Amount: 100 tokens
- Cached for 60 seconds per wallet

---

### 3. Check News
**Endpoint:** `GET /api/news/check`

Check if there's new crypto news available.

**Response:**
```json
{
  "hasNew": true,
  "count": 5,
  "headline": "Bitcoin reaches new ATH",
  "lastFetch": "2025-10-22T06:00:00.000Z"
}
```

---

### 4. Fetch News
**Endpoint:** `POST /api/news/fetch`

Force fetch latest crypto news from APIs.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "news": [
    {
      "title": "Bitcoin Update",
      "description": "...",
      "source": "CryptoNews",
      "timestamp": "2025-10-22T06:00:00.000Z"
    }
  ]
}
```

---

### 5. Sync Coin Snapshot
**Endpoint:** `POST /api/coins/snapshot`

Sync current coin data from Axiom to backend.

**Request Body:**
```json
{
  "userId": "user_123",
  "coins": [
    {
      "name": "Bitcoin",
      "symbol": "BTC",
      "price": 45000,
      "marketCap": 900000000000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Snapshot saved",
  "coinCount": 5
}
```

---

### 6. XAPE Sleep
**Endpoint:** `POST /api/xape/sleep`

Put XAPE to sleep (stop voice monitoring).

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "XAPE is sleeping"
}
```

---

## 🔧 Configuration in Extension

All endpoints are configured in `config.js`:

```javascript
const XAPE_CONFIG = {
  BACKEND_URL: 'https://postgres-production-958e.up.railway.app',
  ENDPOINTS: {
    CHAT: '/api/chat',
    CHECK_TOKEN: '/api/check-token-balance',
    NEWS_CHECK: '/api/news/check',
    NEWS_FETCH: '/api/news/fetch',
    COINS_SNAPSHOT: '/api/coins/snapshot',
    XAPE_SLEEP: '/api/xape/sleep'
  }
}
```

## 🔐 CORS Configuration

The backend allows requests from:
- `*` (all origins in development)
- Specific axiom.trade domains in production

## 🌐 Testing

Open `test-backend-connection.html` in your browser to test all endpoints.

## 📝 Rate Limiting

- News fetching: Cached for 5 minutes
- Token balance: Cached for 60 seconds per wallet
- AI Chat: No limit (OpenAI API limits apply)

## 🐛 Error Handling

All endpoints return consistent error format:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## 🔄 Health Check

**Endpoint:** `GET /`

Simple health check to verify backend is running.

**Response:**
```json
{
  "status": "online",
  "message": "XAPE Backend is running"
}
```

