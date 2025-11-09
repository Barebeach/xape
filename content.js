let skillbarInstance = null
let globalExtensionEnabled = true


window.marketCapSystemEnabled = false
let marketCapSystemEnabled = false

const SESSION_STORAGE_KEY = "axiom_skillbar_session_v4"
const PERSISTENT_STORAGE_KEY = "axiom_skillbar_persistent_v4"


function isExtensionContextValid() {
  try {
    if (!chrome || !chrome.runtime) return false
    
    const id = chrome.runtime.id
    return !!id
  } catch (error) {
    return false
  }
}


async function safeChromeStorageGet(keys, defaultValues = {}) {
  if (!isExtensionContextValid()) {
    return defaultValues
  }
  
  try {
    return await chrome.storage.local.get(keys)
  } catch (error) {
    if (error.message?.includes('Extension context invalidated')) {
    }
    return defaultValues
  }
}


async function safeChromeStorageSet(items) {
  if (!isExtensionContextValid()) {
    showExtensionReloadNotification()
    return false
  }
  
  try {
    await chrome.storage.local.set(items)
    return true
  } catch (error) {
    if (error.message?.includes('Extension context invalidated')) {
      showExtensionReloadNotification()
    }
    return false
  }
}


let reloadNotificationShown = false
function showExtensionReloadNotification() {
  
  if (reloadNotificationShown) return
  reloadNotificationShown = true
  
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 100;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 350px;
    cursor: pointer;
    animation: slideIn 0.3s ease-out;
  `
  
  notification.innerHTML = `
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">
      ?? Extension Reloaded
    </div>
    <div style="font-size: 14px; line-height: 1.5; margin-bottom: 12px;">
      The extension was updated. Please refresh this page for everything to work properly.
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="location.reload()" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        flex: 1;
      ">
        Refresh Now
      </button>
      <button onclick="this.closest('div[style*=fixed]').remove()" style="
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
      ">
        Dismiss
      </button>
    </div>
  `
  
  
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)
  
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse'
      setTimeout(() => notification.remove(), 300)
    }
  }, 10000)
  
  document.body.appendChild(notification)
}

function getSessionData() {
  try {
    let data = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    data = localStorage.getItem(PERSISTENT_STORAGE_KEY)
    if (data) {
      const parsedData = JSON.parse(data)
      sessionStorage.setItem(SESSION_STORAGE_KEY, data)
      return parsedData
    }
    return null
  } catch (e) {
    return null
  }
}

function setSessionData(data) {
  try {
    const dataString = JSON.stringify(data)
    sessionStorage.setItem(SESSION_STORAGE_KEY, dataString)
    localStorage.setItem(PERSISTENT_STORAGE_KEY, dataString)
  } catch (e) {
    
  }
}

function clearSessionData() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem(PERSISTENT_STORAGE_KEY)
  } catch (e) {
    
  }
}



async function initializeExtension() {
  console.log('🚀 initializeExtension called')
  
  try {
    if (!isValidAxiomPage()) {
      forceCleanupAll()
      return
    }

    let settings = {
      extensionEnabled: true,
      skillbarEnabled: true,
      xcaEnabled: true,
      autoRefresh: true,
      notifications: true,
    }

    try {
      if (chrome && chrome.storage) {
        const result = await chrome.storage.local.get(settings)
        settings = result
      }
    } catch (error) {
    }

    globalExtensionEnabled = settings.extensionEnabled

    if (settings.extensionEnabled) {
      if (settings.skillbarEnabled) {
        initializeSkillbar()
      } else {
      }
    } else {
      forceCleanupAll()
    }
  } catch (error) {
    if (isValidAxiomPage()) {
      initializeSkillbar()
    }
  }
  
  console.log('✅ initializeExtension complete')
}

function isValidAxiomPage() {
  const url = window.location.href

  
  if (url.includes("axiom.trade")) {
    return true
  }

  return false
}

function isPulsePage() {
  const url = window.location.href
  
  
  return url.includes("/pulse") || (!url.includes("/meme/") && !url.includes("/token/") && !url.includes("/trade/"))
}

function initializeSkillbar() {
  console.log('🎯 initializeSkillbar called')
  
  skillbarInstance = new AxiomSkillBar()
  window.skillbarInstance = skillbarInstance 
}

function forceCleanupAll() {
  console.log('🧹 Force cleanup ALL extension elements...')
  
  if (skillbarInstance) {
    skillbarInstance.destroyAllComponents()
    skillbarInstance = null
  }

  // 1️⃣ REMOVE BLUE BORDERS (around page edges)
  const borderOverlays = document.querySelectorAll('.xape-border-overlay, [class*="xape-border-"]')
  borderOverlays.forEach((element) => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
      console.log("🗑️ Removed blue border")
    }
  })
  
  // Also remove from window reference
  if (window.persistentBorderOverlay) {
    if (window.persistentBorderOverlay.parentNode) {
      window.persistentBorderOverlay.parentNode.removeChild(window.persistentBorderOverlay)
    }
    window.persistentBorderOverlay = null
    console.log("🗑️ Removed persistent border overlay")
  }

  // 2️⃣ REMOVE XAPE LOGO (after "Rewards" text)
  const xapeLogoElements = document.querySelectorAll('.xape-rewards-logo, [data-xape-logo-added]')
  xapeLogoElements.forEach((element) => {
    element.classList.remove('xape-rewards-logo')
    element.removeAttribute('data-xape-logo-added')
    console.log("🗑️ Removed XAPE logo class")
  })

  // 3️⃣ REMOVE HEATMAP COLORS (market-cap classes and styles)
  const allContainers = document.querySelectorAll('[class*="market-cap"], [data-market-cap-processed]')
  allContainers.forEach((container) => {
    // Remove all market-cap classes
    container.classList.remove('market-cap-low', 'market-cap-medium', 'market-cap-high', 'market-cap-very-high', 'market-cap-mega', 'market-cap-unknown')
    
    // Remove data attributes
    container.removeAttribute('data-market-cap-processed')
    container.removeAttribute('data-market-cap-value')
    container.removeAttribute('data-market-cap-category')
    container.removeAttribute('data-holders-count')
    container.removeAttribute('data-cabal-count')
    
    // Reset inline styles
    container.style.borderColor = ''
    container.style.borderWidth = ''
    container.style.backgroundColor = ''
    container.style.background = ''
    container.style.boxShadow = ''
    container.style.filter = ''
  })

  // 4️⃣ REMOVE EXTENSION UI ELEMENTS
  const elementsToRemove = [
    "#axiom-skill-bar",
    "#xca-button-main",
    "#xca-tweets-panel",
    ".xca-button-main",
    ".xca-tweets-panel",
    "[id*='axiom-skill']",
    "[class*='axiom-skill']",
  ]

  elementsToRemove.forEach((selector) => {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element) => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element)
        console.log("🗑️ Removed:", selector)
      }
    })
  })
  
  // 5️⃣ STOP ALL TIMERS
  for (let i = 1; i < 99999; i++) {
    window.clearInterval(i)
    window.clearTimeout(i)
  }
  
  console.log('✅ Force cleanup complete - Blue borders removed, XAPE logo removed, heatmap colors cleared')
}

if (chrome && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case "extensionToggled":
        handleGlobalExtensionToggle(message.data.enabled)
        break
      case "skillbarToggled":
        handleSkillbarToggle(message.data.enabled)
        break
      case "xcaToggled":
        handleXCAToggle(message.data.enabled)
        break
      case "autoRefreshToggled":
        handleAutoRefreshToggle(message.data.enabled)
        break
      case "notificationsToggled":
        handleNotificationsToggle(message.data.enabled)
        break
    }
    sendResponse({ success: true })
  })
}

function handleGlobalExtensionToggle(enabled) {
  globalExtensionEnabled = enabled
  if (enabled) {
    initializeExtension()
  } else {
    forceCleanupAll()
  }
}

function handleSkillbarToggle(enabled) {
  if (!globalExtensionEnabled) {
    return
  }
  if (enabled) {
    if (!skillbarInstance) {
      initializeSkillbar()
    }
  } else {
    if (skillbarInstance) {
      skillbarInstance.destroyAllComponents()
      skillbarInstance = null
    }
  }
}

function handleXCAToggle(enabled) {
  if (skillbarInstance) {
    skillbarInstance.handleGlobalXCAToggle(enabled)
  }
}

function handleAutoRefreshToggle(enabled) {
  const activeScanner = skillbarInstance?.twitterScanner
  if (activeScanner && activeScanner.startRefreshInterval) {
    if (enabled) {
      activeScanner.startRefreshInterval()
    } else {
      activeScanner.stopRefreshInterval()
    }
  }
}

function handleNotificationsToggle(enabled) {
  const activeScanner = skillbarInstance?.twitterScanner
  if (activeScanner) {
    activeScanner.notificationsEnabled = enabled
  }
}

function waitForDependencies() {
  return new Promise((resolve) => {
    const checkDependencies = () => {
      if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(() => {
          resolve()
        }, 100)
      } else {
        setTimeout(checkDependencies, 100)
      }
    }
    checkDependencies()
  })
}

// 🔐 TOKEN GATE VERIFICATION - Check BEFORE loading extension
async function performTokenGateCheck() {
  console.log('🔐 Checking token balance before loading extension...')
  
  try {
    // Get wallet address from Phantom
    const walletAddress = await getWalletAddress()
    
    if (!walletAddress) {
      console.log('⚠️ No wallet detected - blocking extension load')
      showTokenGateMessage('NO_WALLET', 0, 0)
      return false
    }
    
    console.log('👛 Wallet detected:', walletAddress)
    
    // Check balance with backend
    const backendUrl = localStorage.getItem('xape_backend_url') || 'https://postgres-production-958e.up.railway.app'
    
    const response = await fetch(`${backendUrl}/api/check-token-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, forceRefresh: true })
    })
    
    if (!response.ok) {
      console.error('❌ Backend error:', response.status)
      showTokenGateMessage('BACKEND_ERROR', 0, 0)
      return false
    }
    
    const data = await response.json()
    
    if (data.hasAccess) {
      console.log(`✅ TOKEN GATE PASSED! Balance: ${data.balance} tokens`)
      return true
    } else {
      console.log(`🚫 TOKEN GATE FAILED! Balance: ${data.balance}, Required: ${data.required}`)
      showTokenGateMessage('INSUFFICIENT_TOKENS', data.balance, data.required)
      return false
    }
  } catch (error) {
    console.error('❌ Token gate check error:', error)
    showTokenGateMessage('ERROR', 0, 0)
    return false
  }
}

// Get wallet address from Axiom page (NOT Phantom!)
async function getWalletAddress() {
  try {
    // First check if we already have it cached
    const cachedWallet = localStorage.getItem('xape_wallet_address')
    if (cachedWallet) {
      console.log('👛 Using cached wallet:', cachedWallet)
      return cachedWallet
    }
    
    // Try to get wallet from Solana wallet extension (if connected)
    if (window.solana && window.solana.publicKey) {
      const address = window.solana.publicKey.toString()
      console.log('👛 Found wallet from window.solana:', address)
      localStorage.setItem('xape_wallet_address', address)
      return address
    }
    
    // Extract wallet from Axiom's UI by clicking deposit button
    console.log('👛 Extracting wallet from Axiom UI...')
    const address = await autoDetectWalletFromUI()
    
    if (address) {
      console.log('✅ Extracted wallet from Axiom:', address)
      localStorage.setItem('xape_wallet_address', address)
      return address
    }
    
    console.warn('⚠️ No wallet address found on Axiom page')
    return null
  } catch (error) {
    console.error('❌ Error getting wallet address:', error)
    return null
  }
}

// Auto-detect wallet from Axiom UI
async function autoDetectWalletFromUI() {
  try {
    console.log('🔍 Looking for SOL balance button...')
    
    // Wait a bit for page to load
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Look for SOL balance button (contains "SOL" text)
    const solButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
      const text = btn.textContent.trim()
      return text.includes('SOL') && !text.includes('USOL')
    })
    
    if (solButtons.length === 0) {
      console.log('❌ No SOL balance button found')
      return null
    }
    
    console.log(`✅ Found ${solButtons.length} SOL button(s), clicking first one...`)
    solButtons[0].click()
    
    // Wait for dropdown/modal to appear
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Look for "Deposit" button
    console.log('🔍 Looking for Deposit button...')
    const depositButtons = Array.from(document.querySelectorAll('button, div[role="button"]')).filter(el => {
      const text = el.textContent.trim()
      return text === 'Deposit' || text.toLowerCase().includes('deposit')
    })
    
    if (depositButtons.length === 0) {
      console.log('❌ No Deposit button found')
      return null
    }
    
    console.log('✅ Found Deposit button, clicking...')
    depositButtons[0].click()
    
    // Wait for wallet address to appear
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Look for wallet address (long string with break-all class)
    console.log('🔍 Looking for wallet address...')
    const addressSpan = Array.from(document.querySelectorAll('span')).find(span => {
      const text = span.textContent.trim()
      const hasBreakAll = span.className.includes('break-all')
      const looksLikeAddress = text.length >= 32 && text.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(text)
      return hasBreakAll && looksLikeAddress
    })
    
    if (!addressSpan) {
      // Fallback: look for ANY address-like text
      console.log('🔍 Looking for ANY address-like text...')
      const anyAddress = Array.from(document.querySelectorAll('span')).find(span => {
        const text = span.textContent.trim()
        return text.length >= 32 && text.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(text)
      })
      
      if (anyAddress) {
        const address = anyAddress.textContent.trim()
        console.log(`✅ Found address: ${address}`)
        
        // Close modal
        await new Promise(resolve => setTimeout(resolve, 200))
        const closeButtons = document.querySelectorAll('[class*="close"], button[aria-label="Close"]')
        closeButtons.forEach(btn => btn.click())
        
        return address
      }
      
      console.log('❌ No wallet address found')
      return null
    }
    
    const walletAddress = addressSpan.textContent.trim()
    console.log('✅ Wallet address extracted:', walletAddress)
    
    // Close modal
    await new Promise(resolve => setTimeout(resolve, 200))
    const closeButtons = document.querySelectorAll('[class*="close"], button[aria-label="Close"]')
    closeButtons.forEach(btn => btn.click())
    
    return walletAddress
  } catch (error) {
    console.error('❌ Error in auto-detection:', error)
    return null
  }
}

// Show token gate message to user
function showTokenGateMessage(reason, currentBalance, requiredBalance) {
  const overlay = document.createElement('div')
  overlay.id = 'xape-token-gate-overlay'
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: rgba(0, 0, 0, 0.85) !important;
    backdrop-filter: blur(10px) !important;
    z-index: 999999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  `
  
  let message = ''
  let emoji = '🚫'
  
  switch (reason) {
    case 'NO_WALLET':
      emoji = '👛'
      message = `
        <h2 style="margin: 0 0 20px 0; font-size: 32px;">👛 Wallet Not Detected</h2>
        <p style="font-size: 18px; margin-bottom: 30px; opacity: 0.9;">
          Make sure you're logged into Axiom.trade with your wallet
        </p>
        <button id="xape-retry-check" style="
          background: linear-gradient(135deg, #00bfff 0%, #0080ff 100%);
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">Retry Detection</button>
      `
      break
      
    case 'INSUFFICIENT_TOKENS':
      emoji = '🔒'
      // 🎤 ANNOUNCE TOKEN REQUIREMENT VIA VOICE
      const tokensNeeded = requiredBalance - currentBalance
      if (typeof speakResponse === 'function') {
        speakResponse(`You need ${requiredBalance} XAPE tokens to use this extension. You currently have ${currentBalance} tokens. Please acquire ${tokensNeeded} more XAPE tokens to unlock full access.`)
      }
      message = `
        <h2 style="margin: 0 0 20px 0; font-size: 32px;">🔒 XAPE Token Required</h2>
        <p style="font-size: 18px; margin-bottom: 15px; opacity: 0.9;">
          You need <strong>${requiredBalance} XAPE</strong> tokens to use this extension
        </p>
        <p style="font-size: 16px; margin-bottom: 30px; opacity: 0.7;">
          Current balance: <strong>${currentBalance} XAPE</strong>
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
          <a href="https://jup.ag/swap/SOL-XAPE" target="_blank" style="
            background: linear-gradient(135deg, #00bfff 0%, #0080ff 100%);
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
          ">Get XAPE Tokens</a>
          <button id="xape-retry-check" style="
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            padding: 15px 40px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          ">Retry Check</button>
        </div>
      `
      break
      
    case 'BACKEND_ERROR':
    case 'ERROR':
      emoji = '❌'
      message = `
        <h2 style="margin: 0 0 20px 0; font-size: 32px;">❌ Connection Error</h2>
        <p style="font-size: 18px; margin-bottom: 30px; opacity: 0.9;">
          Unable to verify token balance. Please try again.
        </p>
        <button id="xape-retry-check" style="
          background: linear-gradient(135deg, #00bfff 0%, #0080ff 100%);
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">Retry</button>
      `
      break
  }
  
  overlay.innerHTML = `
    <div style="
      background: rgba(20, 20, 40, 0.95);
      border: 2px solid rgba(0, 191, 255, 0.3);
      border-radius: 24px;
      padding: 60px;
      max-width: 600px;
      text-align: center;
      color: white;
      box-shadow: 0 20px 60px rgba(0, 191, 255, 0.3);
    ">
      ${message}
    </div>
  `
  
  document.body.appendChild(overlay)
  
  // Add event listeners for retry button
  const retryBtn = document.getElementById('xape-retry-check')
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      overlay.remove()
      location.reload()
    })
  }
}

waitForDependencies().then(async () => {
  console.log('🚀 Page loaded - checking token gate before initialization...')
  
  // 🔐 PERFORM TOKEN GATE CHECK FIRST
  const hasAccess = await performTokenGateCheck()
  
  if (!hasAccess) {
    console.log('🚫 Token gate failed - extension will NOT load')
    return // ❌ STOP HERE - Don't load extension
  }
  
  // ✅ TOKEN GATE PASSED - Load extension
  console.log('✅ Token gate passed - initializing XAPE extension')
  
  window.isAutoLoad = true
  window.isFirstInitialization = false
  
  document.body.classList.remove('extension-dormant')
  
  window.marketCapSystemEnabled = true
  marketCapSystemEnabled = true
  
  // Set session flag for future checks
  sessionStorage.setItem('xape_session_initialized', 'true')
  
  initializeExtension()
    
    
      setTimeout(() => {
      if (window.createPersistentBordersWithoutAnimation) {
        window.createPersistentBordersWithoutAnimation()
      }
        }, 500)
    
    
        setTimeout(() => {
      if (window.skillbarInstance) {
        window.skillbarInstance.initializeMarketCapFiltering()
        window.skillbarInstance.startAggressiveMonitoring()
        
        
        const skillbar = document.getElementById('axiom-skill-bar')
            if (skillbar) {
          skillbar.style.cssText = `
      position: fixed !important;
            bottom: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
      z-index: 100 !important;
      display: flex !important;
            flex-direction: row !important;
      align-items: center !important;
      justify-content: center !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            width: auto !important;
            max-width: 90vw !important;
          `
        }
      }
    }, 1000)
})


function cleanupAllExtensionStyling() {
  
  
  const allContainers = document.querySelectorAll('[class*="market-cap"]')
  
  allContainers.forEach(container => {
    
    container.classList.remove('market-cap-low', 'market-cap-medium', 'market-cap-high', 'market-cap-very-high', 'market-cap-mega', 'market-cap-unknown')
    
    
    container.removeAttribute('data-market-cap-processed')
    container.removeAttribute('data-market-cap-value')
    container.removeAttribute('data-market-cap-category')
    container.removeAttribute('data-holders-count')
    container.removeAttribute('data-cabal-count')
    
    
      container.style.borderColor = ''
      container.style.borderWidth = ''
      container.style.backgroundColor = ''
    container.style.background = ''
      container.style.boxShadow = ''
    container.style.filter = ''
  })
}



let currentUrl = window.location.href
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    
    const oldUrl = currentUrl
    const newUrl = window.location.href
    currentUrl = newUrl
    
    
    const wasMemePage = oldUrl.includes('axiom.trade/meme/')
    const isMemePage = newUrl.includes('axiom.trade/meme/')
    
    if (wasMemePage && !isMemePage && skillbarInstance && skillbarInstance.timeGrouping) {
      skillbarInstance.timeGrouping.destroy()
      skillbarInstance.timeGrouping = null
    } else if (!wasMemePage && isMemePage && skillbarInstance) {
      skillbarInstance.initializeTimeGrouping()
    }
    
    if (globalExtensionEnabled && skillbarInstance) {
      
      
    setTimeout(() => {
        if (skillbarInstance && skillbarInstance.refreshAllVisuals) {
          skillbarInstance.refreshAllVisuals()
        }
      }, 300)
      
      
      setTimeout(() => {
        if (skillbarInstance && skillbarInstance.refreshAllVisuals) {
          skillbarInstance.refreshAllVisuals()
        }
      }, 800)
      
      
        setTimeout(() => {
        if (skillbarInstance && skillbarInstance.refreshAllVisuals) {
          skillbarInstance.refreshAllVisuals()
        }
      }, 1500)
      
      
    setTimeout(() => {
        if (skillbarInstance && skillbarInstance.refreshAllVisuals) {
          skillbarInstance.refreshAllVisuals()
      }
    }, 3000)
    }
  }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
})

window.addEventListener("beforeunload", () => {
  if (skillbarInstance?.twitterScanner && skillbarInstance.twitterScanner.destroy) {
    skillbarInstance.twitterScanner.destroy()
  }
  observer.disconnect()
})


