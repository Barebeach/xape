# Chrome Web Store Review - Test Instructions

## 🎯 **Quick Start for Reviewers**

### **No Credentials Required**
- Username: N/A
- Password: N/A
- The extension works without login/authentication

---

## 📋 **Test Instructions**

### **Step 1: Install & Setup**
1. Load the extension in Chrome
2. Navigate to: **https://axiom.trade**
3. Accept microphone permissions when prompted (for voice features)
4. Wait 2-3 seconds for XAPE to initialize

### **Step 2: Voice Activation**
1. XAPE will greet you and ask for your name
2. Say your name (e.g., "John")
3. XAPE will ask how to address you - say "Sir", "Madam", or "Boss"
4. XAPE will ask you to say "initialize" to activate features

### **Step 3: Core Features to Test**

**A) Heatmap & Visual Enhancements**
- Coins on axiom.trade will be color-coded by market cap:
  - Red: Low market cap
  - Yellow/Orange: Medium
  - Green: Growing
  - Blue: High value
  - Purple: Premium
- Look for the visual indicators on token listings

**B) Voice Commands**
- Press **Caps Lock** to activate voice listening (orb turns blue)
- Say: "What's the latest news?"
- Say: "Tell me about this coin" (on any token page)
- Say: "Stop" to interrupt XAPE mid-speech
- Press **Caps Lock OFF** to stop listening

**C) Breaking News**
- XAPE will announce cryptocurrency news automatically
- To disable: Say "Stop breaking news"
- To enable again: Say "Enable breaking news"

**D) Market Monitoring**
- Navigate through different tokens on axiom.trade
- Watch for green glows on coins with increasing market caps
- Look for blue glow on coins when cabals (professional traders) enter

**E) Click Orb for Help**
- Click the floating XAPE orb (brain icon) at any time
- It shows a full "How to Use" guide

---

## ⚠️ **Important Notes for Reviewers**

### **Token Gating (Temporarily Disabled for Review)**
- **Production Mode**: Normally requires 100 XAPE tokens (Solana blockchain)
- **Review Mode**: Token gating is **DISABLED** for Chrome review
- This allows full testing of all features without blockchain setup
- **Post-Approval**: We will re-enable token gating in a minor update

### **Why Token Gating Exists**
- Prevents spam/abuse of AI features (OpenAI API costs)
- Creates exclusive access for token holders
- Standard practice in crypto extensions

### **Backend Access**
- Extension connects to: `https://postgres-production-958e.up.railway.app`
- This is our secure backend for:
  - AI chat processing (OpenAI)
  - Crypto news aggregation
  - Token balance verification (Solana RPC)
- All communication is HTTPS encrypted

---

## 🔍 **What You Should See**

### **Visual Indicators:**
- Colored borders on token listings (heatmap)
- Green glow on coins with rising market caps
- Blue glow when professional traders enter
- Floating brain orb (XAPE assistant)

### **Voice Features:**
- Natural conversation with XAPE
- Real-time crypto news announcements
- Market analysis on demand
- Hands-free operation

### **Console Logs (for debugging):**
- Open DevTools Console (F12)
- You'll see initialization logs
- All features are console-logged for transparency

---

## 🎬 **Quick Test Scenario (2 minutes)**

1. Go to **axiom.trade**
2. Accept microphone permission
3. Wait for XAPE greeting
4. Say your name when asked
5. Say "Sir" when asked for title
6. Say "initialize"
7. Press **Caps Lock** and ask: "What's the latest crypto news?"
8. Watch XAPE respond
9. Click different tokens - watch color changes
10. Click the brain orb to see full feature list

**That's it!** All core features are now testable.

---

## 📞 **Support**

If you encounter any issues during review:
- Email: support@xape.io
- Expected behavior: Smooth voice interaction, visual enhancements, no errors

---

## ✅ **Post-Approval Plan**

After Chrome approval, we will:
1. Re-enable token gating (100 XAPE requirement)
2. Submit update with version 1.0.1
3. Token holders get exclusive access
4. Extension continues to work exactly the same for approved users

This is a standard practice for blockchain-based extensions to prevent abuse while allowing thorough review.

---

**Thank you for reviewing XAPE!** 🚀

