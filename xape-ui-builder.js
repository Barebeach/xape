




function showXapeResponse(text) {
  
  text = text.replace(/^[?✓✅❌⚠️🎯🔥💰📊]+\s*/, '')
  
  const toast = document.createElement('div')
  toast.id = 'xape-response-toast'
  toast.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) translateY(-20px) !important;
    background: rgba(0, 191, 255, 0.06) !important;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
    color: rgba(255, 255, 255, 0.85) !important;
    padding: 8px 14px !important;
    border-radius: 10px !important;
    font-size: 10px !important;
    font-weight: 500 !important;
    z-index: 200 !important;
    max-width: 400px !important;
    width: auto !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    box-shadow: 
      0 0 10px rgba(0, 191, 255, 0.15),
      inset 0 0 8px rgba(255, 255, 255, 0.03),
      0 1px 4px rgba(0, 0, 0, 0.2) !important;
    border: 0.5px solid rgba(0, 191, 255, 0.25) !important;
    opacity: 0 !important;
    transition: all 0.3s ease !important;
    pointer-events: none !important;
    letter-spacing: 0.2px !important;
    line-height: 1.5 !important;
    white-space: normal !important;
    word-wrap: break-word !important;
    text-align: center !important;
    display: inline-block !important;
  `
  toast.textContent = text
  
  
  const existing = document.getElementById('xape-response-toast')
  if (existing) existing.remove()
  
  document.body.appendChild(toast)
  
  
  setTimeout(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(-50%) translateY(0)'
  }, 10)
  
  
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(-50%) translateY(-20px)'
    setTimeout(() => toast.remove(), 300)
  }, 4000)
}


function showPushToTalkIndicator(isActive) {
  let indicator = document.getElementById('xape-ptt-indicator')
  
  if (isActive) {
    if (!indicator) {
      indicator = document.createElement('div')
      indicator.id = 'xape-ptt-indicator'
      indicator.style.cssText = `
        position: fixed !important;
        top: 10px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: rgba(0, 191, 255, 0.06) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        color: rgba(255, 255, 255, 0.85) !important;
        padding: 2px 8px !important;
        border-radius: 10px !important;
        font-size: 8px !important;
        font-weight: 500 !important;
        z-index: 100 !important;
        box-shadow: 
          0 0 10px rgba(0, 191, 255, 0.15),
          inset 0 0 8px rgba(255, 255, 255, 0.03),
          0 1px 4px rgba(0, 0, 0, 0.2) !important;
        border: 0.5px solid rgba(0, 191, 255, 0.25) !important;
        animation: xapePulse 2s ease-in-out infinite !important;
        white-space: nowrap !important;
      `
      indicator.innerHTML = `
        <div style="display: flex; align-items: center; gap: 4px;">
          <div style="width: 4px; height: 4px; background: rgba(0, 191, 255, 0.9); border-radius: 50%; box-shadow: 0 0 4px rgba(0, 191, 255, 0.5); animation: xapePulse 1s ease-in-out infinite;"></div>
          <span style="letter-spacing: 0.2px; font-size: 8px; text-transform: uppercase;">Listening</span>
        </div>
      `
      document.body.appendChild(indicator)
    }
  } else {
    if (indicator) {
      indicator.remove()
    }
  }
}


function showXapeTutorial() {
  const modal = document.createElement('div')
  modal.id = 'xape-tutorial-modal'
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  `
  
  const content = document.createElement('div')
  content.style.cssText = `
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 191, 255, 0.3);
    border-radius: 20px;
    padding: 40px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 80px rgba(0, 191, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
    font-family: system-ui, -apple-system, sans-serif;
  `
  
  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 28px;">
      <img src="${chrome.runtime.getURL('icons/brain.gif')}" style="width: 80px; height: 80px; margin-bottom: 16px; filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.6));" alt="XAPE Brain">
      <h2 style="font-size: 32px; font-weight: 700; margin: 0 0 8px 0; background: linear-gradient(135deg, #00bfff 0%, #0080ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        XAPE - AI Crypto Agent
      </h2>
      <p style="font-size: 14px; color: rgba(255, 255, 255, 0.6); margin: 0;">
        Version 1.0 - Your AI Trading Assistant
      </p>
    </div>
    
    <div style="background: rgba(255, 59, 48, 0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255, 59, 48, 0.25); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.9); font-weight: 600;">
        ⚠️ DISCLAIMER: Everything XAPE says is NOT financial advice. Always do your own research!
      </p>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 12px 0; color: rgba(0, 191, 255, 0.9);">
        🎤 How to Use XAPE
      </h3>
      <ol style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: rgba(255, 255, 255, 0.8);">
        <li>Say <strong>"initialize"</strong> to activate the extension</li>
        <li>Press <strong>Caps Lock</strong> to start/stop listening</li>
        <li>Ask XAPE about coins, holders, market cap, wallet ages, etc.</li>
        <li>Use the skillbar to execute trades quickly</li>
      </ol>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 12px 0; color: rgba(0, 191, 255, 0.9);">
        🎯 What XAPE Can Do
      </h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: rgba(255, 255, 255, 0.8);">
        <li>Analyze coin data (market cap, holders, liquidity)</li>
        <li>Detect suspicious wallet patterns (coordinated attacks, fresh wallets)</li>
        <li>Check Top 10 holder percentages and Dex Paid status</li>
        <li>Monitor your SOL/USDC balance and track P&L</li>
        <li>Execute trades with voice commands or hotkeys</li>
        <li>Provide real-time insights and red flags</li>
      </ul>
    </div>
    
    <div style="margin-bottom: 24px; background: rgba(0, 191, 255, 0.08); backdrop-filter: blur(10px); border: 1px solid rgba(0, 191, 255, 0.2); border-radius: 12px; padding: 20px;">
      <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 12px 0; color: rgba(0, 191, 255, 1);">
        🚀 Coming in v2.0
      </h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: rgba(255, 255, 255, 0.85);">
        <li><strong>Telegram Alerts:</strong> Receive instant notifications for cabal movements, price pumps, and red flags</li>
        <li><strong>24/7 Night Monitoring:</strong> XAPE wakes up automatically if significant market changes occur while you sleep</li>
        <li><strong>Smart Position Tracking:</strong> Get alerted when your positions hit profit targets or stop losses</li>
        <li><strong>Autonomous Trading:</strong> Let XAPE execute swing trades based on your strategy</li>
        <li><strong>Portfolio Management:</strong> Advanced risk analysis and portfolio rebalancing</li>
        <li><strong>Multi-Exchange Support:</strong> Trade across multiple DEXs from one interface</li>
      </ul>
      <p style="margin: 12px 0 0 0; font-size: 12px; line-height: 1.6; color: rgba(255, 255, 255, 0.6); font-style: italic;">
        Our goal: Become the "ChatGPT of crypto" - your intelligent, always-on trading companion.
      </p>
    </div>
    
    <button id="close-tutorial" style="
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #00bfff 0%, #0080ff 100%);
      border: 1px solid rgba(0, 191, 255, 0.4);
      border-radius: 12px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 191, 255, 0.3);
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 191, 255, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 191, 255, 0.3)'">
      Got it! Let's trade 🚀
    </button>
  `
  
  modal.appendChild(content)
  document.body.appendChild(modal)
  
  
  document.getElementById('close-tutorial').addEventListener('click', () => {
    modal.style.animation = 'fadeOut 0.3s ease'
    setTimeout(() => modal.remove(), 300)
  })
  
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.animation = 'fadeOut 0.3s ease'
      setTimeout(() => modal.remove(), 300)
    }
  })
}


window.showXapeResponse = showXapeResponse
window.showPushToTalkIndicator = showPushToTalkIndicator
window.showXapeTutorial = showXapeTutorial


