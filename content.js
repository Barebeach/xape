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

waitForDependencies().then(() => {
  
  const sessionInitialized = sessionStorage.getItem('xape_session_initialized')
  
  if (sessionInitialized === 'true') {
    
    
    window.isAutoLoad = true
    window.isFirstInitialization = false
    
    
    document.body.classList.remove('extension-dormant')
    
    
    window.marketCapSystemEnabled = true
    marketCapSystemEnabled = true
    
    
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
      } else {
    
    
    window.isAutoLoad = false
    window.isFirstInitialization = false
    
    document.body.classList.add('extension-dormant')
    
    
    window.marketCapSystemEnabled = false
    marketCapSystemEnabled = false
    
    
    cleanupAllExtensionStyling()
    
    
    // 🔐 Create skillbar instance silently (no UI yet)
    // UI will be created when user says "initialize"
    console.log('🎯 Creating skillbar instance (dormant mode - no UI)')
    skillbarInstance = new AxiomSkillBar()
    window.skillbarInstance = skillbarInstance
    console.log('✅ Skillbar instance created - waiting for "initialize" command')
  }
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


