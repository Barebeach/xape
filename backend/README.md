# 🤖 XAPE Backend Server

Complete AI-powered trading assistant backend with OpenAI, Telegram, and position tracking.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Database

**Option A: Supabase (Recommended - Free tier)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Copy to `.env` file

**Option B: Railway**
1. Go to [railway.app](https://railway.app)
2. Create new PostgreSQL database
3. Copy connection string
4. Add to `.env` file

### 3. Configure Environment

```bash
# Copy example file
cp env.example .env

# Edit .env file with your credentials
nano .env
```

Required configuration:
- `DATABASE_URL` - Your PostgreSQL connection string
- `OPENAI_API_KEY` - Get from [platform.openai.com](https://platform.openai.com/api-keys)
- `TELEGRAM_BOT_TOKEN` - Create bot with @BotFather on Telegram

### 4. Initialize Database

```bash
npm run db:setup
```

This creates all tables: `users`, `positions`, `alerts`, `chat_history`

### 5. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on: http://localhost:3000

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### AI Chat
```bash
POST /api/chat
Body: {
  "userId": "uuid",
  "message": "What's happening in the market?",
  "context": {
    "positions": [...],
    "marketData": {...}
  }
}
```

### User Registration
```bash
POST /api/users/register
Body: {
  "name": "John Doe",
  "extensionId": "unique-id"
}
```

### Get User Profile
```bash
GET /api/users/:extensionId
```

### Add Position
```bash
POST /api/positions
Body: {
  "userId": "uuid",
  "tokenAddress": "...",
  "tokenSymbol": "SOL",
  "entryPrice": 100.50,
  "quantity": 10,
  "alertConditions": {
    "drop_below_20": true
  }
}
```

### Get User Positions
```bash
GET /api/positions/:userId
```

## 🤖 Telegram Bot Commands

- `/start <link_code>` - Link Telegram account
- `/status` - View current positions and PnL
- `/alerts` - View alert settings

## 🔧 Features

### 1. AI Assistant (OpenAI GPT-4)
- Natural language understanding
- Context-aware responses
- Trading advice and insights
- Chat history tracking

### 2. Position Monitoring
- Real-time price tracking
- Automatic alerts
- PnL calculations
- Custom alert conditions

### 3. Telegram Notifications
- Price drop alerts
- Position updates
- Market condition changes
- Custom notifications

### 4. Database
- PostgreSQL with full schema
- User management
- Position tracking
- Alert history
- Chat logs

## 📊 Database Schema

```sql
users
- id (UUID)
- name
- extension_id (unique)
- telegram_id
- telegram_username
- link_code
- timestamps

positions
- id (UUID)
- user_id (FK)
- token_address
- token_symbol
- entry_price
- current_price
- quantity
- alert_conditions (JSONB)
- timestamps

alerts
- id (UUID)
- user_id (FK)
- position_id (FK)
- alert_type
- message
- sent_at

chat_history
- id (UUID)
- user_id (FK)
- user_message
- ai_response
- created_at
```

## 🌐 Deployment

### Railway (Easiest)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render
1. Connect GitHub repo
2. Set environment variables
3. Deploy!

### Heroku
```bash
heroku create xape-backend
heroku addons:create heroku-postgresql
git push heroku main
```

## 💰 Cost Estimates

- **Database:** Free (Supabase) or $5/month (Railway)
- **Hosting:** Free tier or $5/month (Railway/Render)
- **OpenAI API:** ~$0.03/1K tokens (~$5-20/month for 100 users)
- **Total:** ~$10-30/month

## 🔒 Security

- CORS configured for extension only
- Database connection with SSL
- Environment variables for secrets
- JWT tokens for API auth (optional)
- SQL injection protection (parameterized queries)

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram bot token |
| `TELEGRAM_BOT_USERNAME` | Yes | Bot username (without @) |
| `JWT_SECRET` | No | Secret for JWT tokens |

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test AI chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello XAPE!"}'
```

## 🐛 Troubleshooting

### Database Connection Failed
- Check DATABASE_URL is correct
- Verify database is running
- Check SSL settings

### OpenAI API Error
- Verify API key is valid
- Check you have credits
- Review rate limits

### Telegram Bot Not Responding
- Check TELEGRAM_BOT_TOKEN
- Verify bot username
- Test with /start command

## 📚 Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)

## 🆘 Support

If you encounter issues:
1. Check logs: `npm start`
2. Verify all environment variables
3. Test database connection
4. Check API keys are valid

## 📄 License

MIT



















