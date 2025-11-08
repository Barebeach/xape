
class XapePopup {
  constructor() {
    this.settings = {
      extensionEnabled: true, 
      xapeEnabled: true, 
      autoRefresh: true, 
      notifications: true, 
    }
    this.init()
  }

  async init() {
    console.log("🚀 XAPE Popup initializing...")

    
    await this.loadState()

    
    this.setupEventListeners()

    
    this.updateUI()

    console.log("✅ XAPE Popup initialized with GLOBAL state:", this.settings)
  }

  async loadState() {
    try {
      const result = await chrome.storage.local.get([
        "extensionEnabled",
        "xapeEnabled",
        "autoRefresh",
        "notifications",
      ])
      this.settings.extensionEnabled = result.extensionEnabled !== false 
      this.settings.xapeEnabled = result.xapeEnabled !== false 
      this.settings.autoRefresh = result.autoRefresh !== false 
      this.settings.notifications = result.notifications !== false 
      console.log("📖 Loaded GLOBAL extension state:", this.settings)
    } catch (error) {
      console.error("❌ Error loading state:", error)
      
      this.settings.extensionEnabled = true
      this.settings.xapeEnabled = true
      this.settings.autoRefresh = true
      this.settings.notifications = true
    }
  }

  async saveState() {
    try {
      await chrome.storage.local.set(this.settings)
      console.log("💾 Saved GLOBAL extension state:", this.settings)
    } catch (error) {
      console.error("❌ Error saving state:", error)
    }
  }

  setupEventListeners() {
    console.log("🎯 Setting up GLOBAL event listeners...")

    
    const extensionToggle = document.getElementById("enableToggle")
    if (extensionToggle) {
      console.log("✅ Found GLOBAL extension toggle element, adding click listeners")

      extensionToggle.addEventListener("click", (e) => {
        console.log("🖱️ GLOBAL Extension toggle clicked!")
        e.preventDefault()
        e.stopPropagation()
        this.toggleFeature("extensionEnabled")
      })

      extensionToggle.addEventListener("mousedown", (e) => {
        console.log("🖱️ GLOBAL Extension toggle mousedown!")
        e.preventDefault()
      })
    } else {
      console.error("❌ GLOBAL Extension toggle element not found!")
    }

    console.log("🎯 GLOBAL Event listeners setup complete")
  }

  async toggleFeature(feature) {
    console.log(`🔄 GLOBAL Toggle ${feature} called, current state:`, this.settings[feature])

    
    this.settings[feature] = !this.settings[feature]

    console.log(`🔄 GLOBAL ${feature} toggled: ${this.settings[feature] ? "ENABLED" : "DISABLED"}`)

    
    await this.saveState()

    
    this.updateUI()

    
    this.showToggleFeedback(feature)

    
    await this.notifyContentScripts(feature)

    
    if (feature === "extensionEnabled" && !this.settings[feature]) {
      await this.performDirectCleanup()
    }
  }

  updateUI() {
    console.log("🎨 Updating UI with GLOBAL state:", this.settings)

    const extensionToggle = document.getElementById("enableToggle")
    const statusDot = document.getElementById("statusDot")
    const statusText = document.getElementById("statusText")

    
    this.updateToggleState(extensionToggle, this.settings.extensionEnabled)

    
    this.updateStatusIndicator(statusDot, statusText, this.settings.extensionEnabled)

    console.log("🎨 GLOBAL UI updated successfully")
  }

  async notifyContentScripts(feature) {
    try {
      console.log("📡 Notifying content scripts with GLOBAL state:", this.settings)

      
      const tabs = await chrome.tabs.query({})
      let notifiedTabs = 0

      
      for (const tab of tabs) {
        try {
          
          if (tab.url && tab.url.includes("axiom.trade")) {
            const response = await chrome.tabs.sendMessage(tab.id, {
              action: `${feature.replace("Enabled", "")}Toggled`,
              data: { enabled: this.settings[feature] },
              timestamp: Date.now(),
              forceUpdate: true,
            })

            if (response && response.success) {
              notifiedTabs++
              console.log(`📤 Successfully notified tab ${tab.id} (${tab.url})`)
            }
          }
        } catch (error) {
          
          if (
            !error.message.includes("Could not establish connection") &&
            !error.message.includes("Receiving end does not exist")
          ) {
            console.log(`⚠️ Could not notify tab ${tab.id}:`, error.message)
          }
        }
      }

      console.log(`📡 Successfully notified ${notifiedTabs} tabs`)

      
      await chrome.storage.local.set({
        ...this.settings,
        lastToggleTime: Date.now(),
      })
    } catch (error) {
      console.error("❌ Error notifying content scripts:", error)
    }
  }

  async performDirectCleanup() {
    try {
      console.log(`🧹 Performing direct cleanup of ALL extension elements...`)

      const tabs = await chrome.tabs.query({})

      for (const tab of tabs) {
        try {
          if (tab.url && tab.url.includes("axiom.trade")) {
            
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                console.log(`🧹 Direct cleanup script executing for ALL extension elements...`)

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

                // 3️⃣ REMOVE HEATMAP COLORS (market-cap classes)
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
                  
                  console.log("🗑️ Removed heatmap colors from container")
                })

                // 4️⃣ REMOVE EXTENSION UI ELEMENTS
                const elementsToRemove = [
                  "#axiom-skill-bar",
                  "#xca-button-main",
                  "#xca-tweets-panel",
                  ".xca-button-main",
                  ".xca-tweets-panel",
                  "[id*='axiom']",
                  "[id*='xca']",
                  "[class*='axiom-skill']",
                  "[class*='twitter-scanner']",
                ]

                elementsToRemove.forEach((selector) => {
                  const elements = document.querySelectorAll(selector)
                  elements.forEach((element) => {
                    try {
                      if (element && element.parentNode) {
                        element.parentNode.removeChild(element)
                        console.log("🗑️ Removed extension element:", element.id || element.className)
                      }
                    } catch (e) {
                      // Ignore
                    }
                  })
                })

                // 5️⃣ STOP ALL TIMERS
                for (let i = 1; i < 99999; i++) {
                  window.clearInterval(i)
                  window.clearTimeout(i)
                }

                console.log(`✅ Direct cleanup completed - Blue borders removed, XAPE logo removed, heatmap colors cleared, UI elements removed`)
              },
            })

            console.log(`🧹 Direct cleanup script executed on tab ${tab.id}`)
          }
        } catch (error) {
          console.log(`⚠️ Could not execute cleanup script on tab ${tab.id}:`, error.message)
        }
      }
    } catch (error) {
      console.error(`❌ Error performing direct cleanup:`, error)
    }
  }

  showToggleFeedback(feature) {
    const toggle = document.getElementById(feature === "extensionEnabled" ? "enableToggle" : "xcaToggle")
    const indicator = document.getElementById("statusDot")

    if (toggle) {
      toggle.style.transform = "scale(0.95)"
      toggle.style.transition = "transform 0.1s ease"

      setTimeout(() => {
        toggle.style.transform = "scale(1)"
      }, 100)
    }

    if (indicator && feature === "extensionEnabled") {
      indicator.style.transform = "scale(1.3)"
      indicator.style.transition = "transform 0.2s ease"

      setTimeout(() => {
        indicator.style.transform = "scale(1)"
      }, 200)
    }

    
    document.body.style.transition = "opacity 0.1s ease"
    document.body.style.opacity = "0.8"

    setTimeout(() => {
      document.body.style.opacity = "1"
    }, 100)

    console.log(`🎉 GLOBAL ${feature} toggled - UI feedback shown`)
  }

  updateToggleState(toggle, enabled) {
    if (!toggle) return

    if (enabled) {
      toggle.classList.add("active")
    } else {
      toggle.classList.remove("active")
    }
  }

  updateStatusIndicator(indicator, textElement, enabled) {
    if (!indicator || !textElement) return

    if (enabled) {
      indicator.classList.add("active")
      textElement.textContent = "Extension Active"
    } else {
      indicator.classList.remove("active")
      textElement.textContent = "Extension Disabled"
    }
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 XAPE Popup loaded")

  
  new XapePopup()
})


window.xapePopupInitialized = true

console.log("🚀 XAPE Popup script loaded")
