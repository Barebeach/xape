class AxiomSkillBar {
  constructor() {
    this.removeExistingSkillbars()

    // ✅ Initialize holderTracker FIRST to prevent errors
    this.holderTracker = new Map()
    this.activeHolderEffects = new Map()
    
    // ✅ Initialize marketCapTracker to prevent errors
    this.marketCapTracker = new Map()
    this.activeMarketCapGlows = new Map()
    
    // 🔐 Initialize token gate as FAILED by default
    this.tokenGatePassed = false
    this.hasShownTokenGateMessage = false
    
    // 📰 Initialize news state (restore from localStorage if previously disabled)
    const savedNewsState = localStorage.getItem('xape_news_enabled')
    this.newsEnabled = savedNewsState === null || savedNewsState === 'true'
    console.log('📰 News enabled on startup:', this.newsEnabled)

    this.config = {
      buyAmounts: [0.01, 0.1, 1, 10],
      sellPercentages: [10, 25, 50, 100],
      buyHotkeys: ["q", "w", "e", "r"],
      sellHotkeys: ["a", "s", "d", "f"],
      extensionEnabled: true, 
      xcaEnabled: true,
      soundEnabled: true,
      doubleClickEnabled: false,
      marketCapFiltering: true,
      marketCapThresholds: {
        low: 10000,     
        medium: 100000, 
        high: 1000000,  
        veryHigh: 10000000 
      },
      heatmapEnabled: true,
      heatmapMode: 'traction', 
      heatmapWeights: {
        holderGrowth: 0.4,      
        transactionRatio: 0.3,   
        proTraders: 0.2,         
        age: 0.1                 
      },
      tradingAgent: {
        enabled: false, 
        voiceAlerts: true,
        textAlerts: true,
        alertThresholds: {
          lossWarning: -10,    
          lossCritical: -20,   
          profitTarget: 50,    
          positionSize: 1000   
        },
        monitoringInterval: 5000, 
        maxAlerts: 3 
      },
      scamDetection: {
        enabled: true,
        thresholds: {
          holderToMarketCapRatio: 0.001, 
          minHoldersForHighMC: 100, 
          maxMCForLowHolders: 10000, 
          suspiciousAge: 300 
        },
        alertLevels: {
          warning: 0.7, 
          critical: 0.9 
        }
      }
    }

    this.depositAddress = null
    this.isVerified = { skillbar: true, xca: false }
    this.isLoading = false
    this.lastKeyPress = { key: null, time: 0 }
    this.doubleClickDelay = 300

    this.lastTradingAction = null 
    this.lastTradingTime = null
    this.lastTradingAmount = null
    this.balanceBeforeBuy = null 

    this.audioContext = null
    this.initializeAudio()

    this.skillBar = null
    this.currentMode = null
    this.settingsOpen = false
    this.isEditingAmounts = false
    this.twitterScanner = null

    this.loadConfig()

    this.extractDepositAddressAndVerifyOnce()

    try {

        this.position = { x: window.innerWidth / 2 - 200, y: window.innerHeight - 80 }
      
      localStorage.removeItem("axiomSkillBarPosition")
      console.log('🔒 Skillbar position RESET - will always be centered')
    } catch (e) {
      this.position = { x: window.innerWidth / 2 - 200, y: window.innerHeight - 80 }
    }

    console.log('🏗️ AxiomSkillBar constructor starting...')
    
    try {
    this.setupMessageListener()
      console.log('✅ Message listener setup')
    } catch (error) {
      console.error('❌ Failed to setup message listener:', error)
    }
    
    // 🔐 DON'T CREATE SKILLBAR YET - wait for token verification
    // Will be created after token gate passes
    console.log('🔐 Skillbar creation delayed until token verification')
    
    try {
    this.setupEventListeners()
      console.log('✅ Event listeners setup')
    } catch (error) {
      console.error('❌ Failed to setup event listeners:', error)
    }
    
    try {
    this.initializeLocalTwitterScanner()
      console.log('✅ Twitter scanner initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Twitter scanner:', error)
    }
    
    try {
    this.startContinuousVerification()
      console.log('✅ Continuous verification started')
    } catch (error) {
      console.error('❌ Failed to start verification:', error)
    }
    
    console.log('🚫 Market cap filtering will wait for initialize command')
    console.log('🎉 AxiomSkillBar constructor COMPLETE!')

    this.initializeXapeAgent() 
    this.setupPushToTalkHotkey() 
    this.initializeHolderCountMonitoring()
    this.initializeMarketCapGrowthMonitoring()
    this.initializeCabalMonitoring()
    
    if (window.location.href.includes('axiom.trade/meme/')) {
      console.log('? /meme/ page detected - initializing time grouping')
      this.initializeTimeGrouping()
    } else {
      console.log('?? Not a /meme/ page - time grouping disabled')
    }
    
    console.log('🚫 Aggressive monitoring will NOT start - waiting for initialize command')
    
    // 🔐 TOKEN GATE CHECK ON LOAD - But DON'T create skillbar yet
    this.performTokenGateCheck().then(() => {
      if (this.tokenGatePassed) {
        console.log('✅ Token gate passed')
        console.log('🎯 Skillbar will be created when you say "initialize"')
      } else {
        console.log('🚫 Token gate failed - user needs 100 XAPE tokens')
      }
    })
  }
  
  async performTokenGateCheck(forceRefresh = false) {
    console.log(`🔐 Starting token gate check...${forceRefresh ? ' (FORCE REFRESH)' : ''}`)
    
    try {
      // Get wallet address
      const walletAddress = await this.getWalletAddress()
      
      if (!walletAddress) {
        console.log('⚠️ No wallet address - token gate will block features')
        this.tokenGatePassed = false
        return
      }
      
      console.log('👛 Wallet detected:', walletAddress)
      console.log(`🔐 Checking token balance...${forceRefresh ? ' (forcing blockchain check)' : ''}`)
      
      // Check balance with backend
      const backendUrl = localStorage.getItem('xape_backend_url') || 'https://postgres-production-958e.up.railway.app'
      
      console.log('📡 Checking token balance at:', `${backendUrl}/api/check-token-balance`)
      
      const response = await fetch(`${backendUrl}/api/check-token-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress,
          forceRefresh: forceRefresh 
        })
      })
      
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Backend returned HTML instead of JSON - is the backend running?`)
      }
      
      const data = await response.json()
      
      if (data.hasAccess) {
        console.log(`✅ TOKEN GATE PASSED! Balance: ${data.balance} tokens`)
        this.tokenGatePassed = true
        this.currentTokenBalance = data.balance
      } else {
        console.log(`🚫 TOKEN GATE FAILED! Balance: ${data.balance}, Required: ${data.required}`)
        this.tokenGatePassed = false
        this.requiredTokenAmount = data.required
        this.currentTokenBalance = data.balance
      }
    } catch (error) {
      console.error('❌ Token gate check failed:', error)
      this.tokenGatePassed = false
    }
  }
  

  setupPushToTalkHotkey() {
    console.log('⌨️ Setting up Push-to-Talk hotkey (Caps Lock key)...')
    
    this.capsLockActive = false
    
    document.addEventListener('keydown', (e) => {
      
      if (e.key === 'CapsLock') {
        e.preventDefault() 
        
        this.capsLockActive = !this.capsLockActive
        
        if (this.capsLockActive) {
          
          console.log('⌨️ CAPS LOCK ON - XAPE IS LISTENING!')
          console.log('💡 Just speak naturally - NO wake word needed!')
          this.startContinuousListening()
          this.showPushToTalkIndicator(true)
        } else {
          
          console.log('⌨️ CAPS LOCK OFF - XAPE STOPPED LISTENING')
          console.log('💤 Press Caps Lock again when you want to talk')
          this.stopContinuousListening()
          this.showPushToTalkIndicator(false)
        }
      }
    })
    
    console.log('✅ Push-to-Talk hotkey ready! Press Caps Lock to TOGGLE XAPE on/off.')
    console.log('💡 IMPORTANT: When Caps Lock is ON, just speak - NO wake word needed!')
    console.log('🎤 Just say your commands directly: "What\'s the news?", "Show coins", etc.')
  }
  
  showPushToTalkIndicator(isActive) {
    
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
          z-index: 200 !important;
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
        
        if (!document.getElementById('xape-ptt-animation')) {
          const style = document.createElement('style')
          style.id = 'xape-ptt-animation'
          style.textContent = `
            @keyframes xapePulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.05); }
            }
          `
          document.head.appendChild(style)
        }
      }
    } else {
      if (indicator) {
        indicator.remove()
      }
    }
  }

  startAggressiveMonitoring() {
    console.log('?? Starting AGGRESSIVE monitoring for color persistence...')
    
    this.aggressiveRefreshInterval = setInterval(() => {
      try {
        this.refreshAllVisuals()
        this.addXapeLogo() 
      } catch (error) {
        console.error('Error in aggressive refresh:', error)
      }
    }, 800) 
    
    console.log('? Aggressive monitoring active - colors will NEVER disappear!')
  }
  
  addXapeLogo() {
    
    const spans = document.querySelectorAll('span.text-\\[14px\\].font-medium, span[class*="text-[14px]"][class*="font-medium"]')
    
    spans.forEach(span => {
      
      if (span.textContent.trim() === 'Rewards' && !span.hasAttribute('data-xape-logo-added')) {
        span.setAttribute('data-xape-logo-added', 'true')
        span.classList.add('xape-rewards-logo')
      }
    })
    
    this.addXapeAgentButton()
  }
  
  addXapeAgentButton() {
    
    return
    
    let solButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.querySelector('img[alt="SOL"]')
    )
    
    if (!solButton) {
      console.log('?? SOL button not found, trying BTC/ETH...')
      solButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.querySelector('img[alt="BTC"]') || btn.querySelector('img[alt="ETH"]')
      )
    }
    
    if (!solButton) {
      console.log('? No crypto price buttons found yet')
      return
    }
    
    console.log('? Found crypto button:', solButton)
    
    let container = solButton.closest('.flex.flex-1.flex-row')
    
    if (!container) {
      console.log('?? Container not found with .flex.flex-1.flex-row, trying parent...')
      container = solButton.parentElement?.parentElement
    }
    
    if (!container) {
      console.log('? No suitable container found')
      return
    }
    
    console.log('? Found container:', container)
    
    const xapeButton = document.createElement('span')
    xapeButton.className = 'contents'
    xapeButton.innerHTML = `
      <button class="xape-voice-agent-button text-[#00ffff] flex flex-row flex-shrink-0 h-[32px] px-[12px] gap-[6px] justify-start items-center hover:brightness-125 transition-all duration-125 ease-in-out" title="?? Talk to XAPE AI Assistant" style="background: rgba(0, 191, 255, 0.2); border: 2px solid #00bfff; border-radius: 8px; box-shadow: 0 0 20px rgba(0, 191, 255, 0.6); animation: xapePulse 2s infinite;">
        <div class="xape-agent-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
            <circle cx="12" cy="12" r="4" fill="currentColor" class="xape-pulse-circle"/>
          </svg>
        </div>
        <span class="text-[15px] font-extrabold xape-agent-text" style="letter-spacing: 1.5px;">XAPE</span>
        <div class="xape-mic-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="currentColor"/>
            <path d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.93V21H13V17.93C16.39 17.43 19 14.53 19 11H17Z" fill="currentColor"/>
          </svg>
        </div>
      </button>
    `
    
    const solSpan = solButton.closest('span.contents')
    if (solSpan && solSpan.nextSibling) {
      container.insertBefore(xapeButton, solSpan.nextSibling)
      console.log('? XAPE button inserted after crypto button')
    } else {
      container.appendChild(xapeButton)
      console.log('? XAPE button appended to container')
    }
    
    const button = xapeButton.querySelector('.xape-voice-agent-button')
    if (button) {
      button.addEventListener('click', () => this.openXapeVoiceAgent())
      console.log('? XAPE button click handler added')
      console.log('?? XAPE BUTTON IS NOW VISIBLE!')
    } else {
      console.log('? Could not find XAPE button element')
    }
  }
  
  openXapeVoiceAgent() {
    console.log('?? Toggling XAPE Voice Agent...')
    
    if (!this.xapeFloatingWidget) {
      this.createXapeFloatingWidget()
    }
    
    if (this.isListening) {
      console.log('?? Stopping continuous listening')
      this.stopContinuousListening()
    } else {
      console.log('?? Starting continuous listening')
      this.startContinuousListening()
      
      const userName = localStorage.getItem('xape_user_name')
      const hasGreeted = localStorage.getItem('xape_has_greeted')
      
      if (!userName && !hasGreeted) {
        setTimeout(() => {
          this.greetUser(null)
        }, 500)
      }
      
      this.startPeriodicDataSync()
    }
  }
  
  greetUser(userName) {
    let greeting = "Hey! I'm XAPE. What's your name?"
    
    this.showXapeResponse(greeting)
    this.speakResponse(greeting)
    localStorage.setItem('xape_has_greeted', 'true')
  }
  
  startPeriodicDataSync() {
    
    if (this.dataSyncInterval) {
      clearInterval(this.dataSyncInterval)
    }
    
    this.dataSyncInterval = setInterval(() => {
      this.syncCoinDataToBackend()
    }, 5 * 60 * 1000)
    
    this.syncCoinDataToBackend()
    
    console.log('? Started periodic data sync (every 5 minutes)')
  }
  
  startNewsPolling() {
    if (this.newsPollingInterval) {
      clearInterval(this.newsPollingInterval)
    }
    
    // Initialize last announced headline from localStorage
    if (!this.lastAnnouncedHeadline) {
      this.lastAnnouncedHeadline = localStorage.getItem('xape_last_announced_headline') || null
    }
    
    const backendUrl = localStorage.getItem('xape_backend_url') || 'https://postgres-production-958e.up.railway.app'
    
    this.newsPollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`${backendUrl}/api/news/check`)
        const data = await response.json()
        
        if (data.hasNew && data.news) {
          const news = data.news
          
          // CHECK: Have we already announced this headline?
          if (this.lastAnnouncedHeadline === news.headline) {
            console.log(`🔇 Skipping duplicate news: "${news.headline}"`)
            return
          }
          
          console.log(`🔔 NEW NEWS ALERT: ${news.headline}`)
          
          // Store this headline so we don't announce it again
          this.lastAnnouncedHeadline = news.headline
          localStorage.setItem('xape_last_announced_headline', news.headline)
          
          // Get user's proper title (Sir/Madam/Boss)
          const userTitle = localStorage.getItem('xape_user_title') || 'Sir'
          let announcement = `Breaking news, ${userTitle}! ${news.headline}.`
          
          if (news.sentiment) {
            const emoji = news.sentiment === 'Positive' ? '📈' : news.sentiment === 'Negative' ? '📉' : '📰'
            announcement += ` ${emoji}`
          }
          
          this.showXapeResponse(announcement)
          this.speakResponse(announcement)
        }
      } catch (error) {
        console.log('⚠️ Error checking for new news:', error.message)
      }
    }, 30000)
    
    console.log('📰 Started news polling (every 30 seconds)')
    this.newsEnabled = true
    localStorage.setItem('xape_news_enabled', 'true')
  }
  
  stopNewsPolling() {
    if (this.newsPollingInterval) {
      clearInterval(this.newsPollingInterval)
      this.newsPollingInterval = null
      console.log('📰 Stopped news polling')
    }
    this.newsEnabled = false
    localStorage.setItem('xape_news_enabled', 'false')
  }
  
  async syncCoinDataToBackend() {
    try {
      const context = await this.getContext()
      
      if (!context.coins || context.coins.length === 0) {
        console.log('?? No coins to sync')
        return
      }
      
      const backendUrl = localStorage.getItem('xape_backend_url') || 'https://postgres-production-958e.up.railway.app'
      
      console.log(`?? Syncing ${context.coins.length} coins to backend...`)
      
      const response = await fetch(`${backendUrl}/api/coins/snapshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.getUserId(),
          coins: context.coins,
          marketData: context.marketData,
          timestamp: Date.now()
        })
      })
      
      if (response.ok) {
        console.log('? Coin data synced to backend')
      } else {
        console.log('?? Failed to sync coin data:', response.status)
      }
    } catch (error) {
      console.log('?? Error syncing coin data:', error.message)
    }
  }
  
  createXapeFloatingWidget() {
    
    const existingWidget = document.getElementById('xape-floating-widget')
    if (existingWidget && document.body.contains(existingWidget)) {
      console.log('? XAPE widget already exists in DOM, skipping creation')
      this.xapeFloatingWidget = existingWidget 
      this.brainIndicator = existingWidget.querySelector('#xape-brain-indicator')
      return
    }
    
    document.querySelectorAll('#xape-mini-waveform, #xape-floating-widget').forEach(w => w.remove())
    this.xapeFloatingWidget = null 
    
    let targetContainer = null
    let insertionMethod = null
    
    const bcurveElements = Array.from(document.querySelectorAll('span'))
      .filter(el => el.textContent.trim() === 'B.Curve')
    
    if (bcurveElements.length > 0) {
      const bcurve = bcurveElements[0]
      targetContainer = bcurve.closest('div')
      insertionMethod = 'bcurve'
      console.log('? Found B.Curve! Method: bcurve')
    }
    
    if (!targetContainer) {
      const questionButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.querySelector('i.ri-question-line')
      )
      if (questionButton) {
        targetContainer = questionButton.parentElement
        insertionMethod = 'question'
        console.log('? Found question mark! Method: question')
      }
    }
    
    if (!targetContainer) {
      const solImg = document.querySelector('img[alt="SOL"]')
      if (solImg) {
        targetContainer = solImg.closest('.flex')
        insertionMethod = 'sol'
        console.log('? Found SOL element! Method: sol')
      }
    }
    
    if (!targetContainer) {
      const headerFlexes = document.querySelectorAll('header .flex, [class*="header"] .flex, .flex.flex-row')
      if (headerFlexes.length > 0) {
        targetContainer = headerFlexes[0]
        insertionMethod = 'header-flex'
        console.log('? Found header flex! Method: header-flex')
      }
    }
    
    if (!targetContainer) {
      console.log('?? NO CONTAINER FOUND - Will retry in 500ms...')
      return 
    }
    
    const widget = document.createElement('div')
    widget.id = 'xape-floating-widget'
    widget.style.cssText = `
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 0px !important;
      margin: 0 auto !important;
      padding: 0px !important;
      background: transparent !important;
      border-radius: 0px !important;
      backdrop-filter: none !important;
      border: none !important;
      box-shadow: none !important;
      transition: all 0.3s ease !important;
    `
    
    let logoUrl
    try {
      logoUrl = chrome.runtime.getURL('logo.png')
    } catch (error) {
      console.error('?? Extension context invalidated - reload page!')
      
      const reloadMsg = document.createElement('div')
      reloadMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ff4444; color: white; padding: 15px 20px; border-radius: 8px; z-index: 200; font-weight: bold; box-shadow: 0 4px 20px rgba(0,0,0,0.5);'
      reloadMsg.textContent = '?? XAPE: Please reload the page (F5)'
      document.body.appendChild(reloadMsg)
      setTimeout(() => reloadMsg.remove(), 5000)
      return
    }
    
    let brainUrl
    try {
      brainUrl = chrome.runtime.getURL('icons/brain.gif')
    } catch (error) {
      brainUrl = logoUrl 
    }
    
    widget.innerHTML = `
      <div style="
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 12px !important;
        position: relative !important;
      ">
        <div style="
          position: relative !important;
          width: 60px !important;
          height: 60px !important;
        ">
          <div style="
            position: absolute !important;
            inset: -10px !important;
            background: radial-gradient(circle, rgba(0, 191, 255, 0.4) 0%, transparent 70%) !important;
            filter: blur(15px) !important;
            animation: xapeGlowPulse 3s ease-in-out infinite !important;
            pointer-events: none !important;
            z-index: 0 !important;
          "></div>
      <img src="${brainUrl}" id="xape-brain-indicator"
        style="
              position: relative !important;
          width: 60px !important;
          height: 60px !important;
          cursor: pointer !important;
          background: transparent !important;
          border-radius: 0px !important;
              filter: grayscale(80%) drop-shadow(0 0 8px rgba(0, 191, 255, 0.6)) !important;
          border: none !important;
          object-fit: contain !important;
              opacity: 0.5 !important;
          transition: all 0.3s ease !important;
              z-index: 1 !important;
            " 
            title="XAPE AI - Click to open"
            onmouseover="this.style.opacity='0.7'; this.style.transform='scale(1.1)'"
            onmouseout="if(!this.classList.contains('active')) { this.style.opacity='0.5'; this.style.transform='scale(1)'; }">
        </div>
        <span style="
          font-family: 'Orbitron', 'Rajdhani', 'Exo 2', monospace, sans-serif !important;
          font-size: 22px !important;
          font-weight: 900 !important;
          letter-spacing: 3px !important;
          color: #00bfff !important;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7) !important;
          text-transform: uppercase !important;
          user-select: none !important;
          cursor: default !important;
        ">XAPE</span>
      </div>
    `
    
    if (targetContainer) {
      targetContainer.style.display = 'flex'
      targetContainer.style.justifyContent = 'center'
      targetContainer.style.alignItems = 'center'
    }
    
    if (insertionMethod === 'bcurve' && targetContainer && targetContainer.nextSibling) {
      targetContainer.parentElement.insertBefore(widget, targetContainer.nextSibling)
      console.log('? XAPE inserted after B.Curve!')
    } else if (insertionMethod === 'question' && targetContainer) {
      targetContainer.insertBefore(widget, targetContainer.firstChild)
      console.log('? XAPE inserted before question mark!')
    } else if (targetContainer) {
      
      targetContainer.appendChild(widget)
      console.log('? XAPE inserted into container! Method:', insertionMethod)
    }
    
    this.xapeFloatingWidget = widget
    
    this.xapeWidgetCreated = true
    this.lastWidgetCreation = Date.now()
    
    console.log('? XAPE brain icon inserted!')
    
    this.brainIndicator = widget.querySelector('#xape-brain-indicator')
    
    this.brainIndicator.addEventListener('click', () => {
      this.showXapeTutorial()
    })
    
    console.log('? XAPE brain widget created (simple & clean)')
  }
  
  updateBrainAnimation(isActive) {
    const brainIndicator = document.getElementById('xape-brain-indicator')
    if (!brainIndicator) return
    
    if (isActive) {
      if (this.brainDeactivateTimeout) {
        clearTimeout(this.brainDeactivateTimeout)
        this.brainDeactivateTimeout = null
      }
      
      brainIndicator.classList.add('active')
      brainIndicator.style.filter = 'drop-shadow(0 0 12px rgba(0, 191, 255, 0.9)) drop-shadow(0 0 20px rgba(0, 191, 255, 0.6))'
      brainIndicator.style.opacity = '1'
      brainIndicator.style.transform = 'scale(1.05)'
      console.log('🧠 Brain ACTIVE (animating)')
    } else {
      if (this.brainDeactivateTimeout) {
        clearTimeout(this.brainDeactivateTimeout)
      }
      
      this.brainDeactivateTimeout = setTimeout(() => {
        if (!this.isListening && !this.isSpeaking) {
          brainIndicator.classList.remove('active')
          brainIndicator.style.filter = 'grayscale(80%) drop-shadow(0 0 8px rgba(0, 191, 255, 0.6))'
          brainIndicator.style.opacity = '0.5'
          brainIndicator.style.transform = 'scale(1)'
          console.log('🧠 Brain IDLE (frozen)')
        }
      }, 1000)
    }
  }
  
  showXapeTutorial() {
    
    const existing = document.getElementById('xape-tutorial-modal')
    if (existing) existing.remove()
    
    const modal = document.createElement('div')
    modal.id = 'xape-tutorial-modal'
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.75) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      animation: fadeIn 0.2s ease-out !important;
    `
    
    modal.innerHTML = `
      <div style="
        background: rgba(0, 0, 0, 0.4) !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        border: 1px solid rgba(0, 191, 255, 0.3) !important;
        border-radius: 16px !important;
        padding: 24px !important;
        max-width: 480px !important;
        max-height: 85vh !important;
        overflow-y: auto !important;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        animation: slideUp 0.3s ease-out !important;
      ">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 16px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🤖</div>
          <h1 style="color: #00bfff; font-size: 20px; margin: 0 0 4px 0; font-weight: 600; letter-spacing: 0.5px;">
            XAPE v0.1
          </h1>
          <p style="color: rgba(255, 255, 255, 0.6); font-size: 11px; margin: 0; font-weight: 400;">
            Cryptocurrency AI Assistant
          </p>
        </div>
        
        <div style="margin-bottom: 16px;">
          <h2 style="color: #00bfff; font-size: 13px; margin: 0 0 10px 0; font-weight: 600; display: flex; align-items: center; gap: 6px;">
            <span>📋</span> How to Use
          </h2>
          <div style="color: rgba(255, 255, 255, 0.8); font-size: 11px; line-height: 1.6; margin-left: 0;">
            <div style="margin-bottom: 8px;"><strong style="color: rgba(255, 255, 255, 0.9);">Setup:</strong> Say "initialize" to activate</div>
            <div style="margin-bottom: 8px;"><strong style="color: rgba(255, 255, 255, 0.9);">Talk:</strong> Press <kbd style="background: rgba(0, 191, 255, 0.2); padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(0, 191, 255, 0.3); font-size: 10px;">Caps Lock</kbd> ON, then speak</div>
            <div style="margin-bottom: 8px;"><strong style="color: rgba(255, 255, 255, 0.9);">Ask:</strong> "Latest news?", "Show coins", etc. (NO wake word!)</div>
            <div><strong style="color: rgba(255, 255, 255, 0.9);">Stop:</strong> Press <kbd style="background: rgba(0, 191, 255, 0.2); padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(0, 191, 255, 0.3); font-size: 10px;">Caps Lock</kbd> OFF or say "stop"</div>
          </div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <h2 style="color: #00bfff; font-size: 13px; margin: 0 0 10px 0; font-weight: 600; display: flex; align-items: center; gap: 6px;">
            <span>✨</span> Features (v1)
          </h2>
          <div style="color: rgba(255, 255, 255, 0.8); font-size: 11px; line-height: 1.6;">
            <div style="margin-bottom: 4px;"><strong style="color: #00bfff;">🎨 Heatmap:</strong> Color-coded coins by market cap (red→yellow→green→blue→purple)</div>
            <div style="margin-bottom: 4px;"><strong style="color: #00bfff;">💙 Cabal Alerts:</strong> Blue glow when cabals buy - instant visual alert</div>
            <div style="margin-bottom: 4px;"><strong style="color: #00bfff;">👁️ X-Ray Vision:</strong> High contrast design - spot opportunities instantly</div>
            <div style="margin-bottom: 4px;"><strong style="color: #00bfff;">📰 News:</strong> Ask XAPE for latest crypto news & market updates</div>
            <div><strong style="color: #00bfff;">🔍 Analysis:</strong> Real-time holder tracking, wallet ages, scam detection</div>
          </div>
        </div>
        
        <div style="background: rgba(0, 191, 255, 0.1); border-left: 2px solid rgba(0, 191, 255, 0.5); padding: 12px; margin-bottom: 16px; border-radius: 6px;">
          <div style="color: rgba(0, 191, 255, 0.9); font-size: 11px; font-weight: 600; margin-bottom: 6px;">🚀 Coming in v2</div>
          <p style="color: rgba(255, 255, 255, 0.7); line-height: 1.5; margin: 0; font-size: 10px;">
            Auto-trading, swing trading strategies, portfolio management, autonomous trading agent, and more!
          </p>
        </div>
        
        <div style="background: rgba(255, 100, 100, 0.1); border-left: 2px solid rgba(255, 100, 100, 0.5); padding: 12px; margin-bottom: 16px; border-radius: 6px;">
          <div style="color: rgba(255, 100, 100, 0.9); font-size: 11px; font-weight: 600; margin-bottom: 6px;">⚠️ Disclaimer</div>
          <p style="color: rgba(255, 255, 255, 0.7); line-height: 1.5; margin: 0; font-size: 10px;">
            Not financial advice. For educational purposes only. DYOR. Trading carries risk.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button id="close-tutorial" style="
            background: linear-gradient(135deg, rgba(0, 191, 255, 0.2) 0%, rgba(0, 100, 255, 0.2) 100%);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: #00bfff;
            border: 1px solid rgba(0, 191, 255, 0.4);
            padding: 10px 28px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 191, 255, 0.2);
            transition: all 0.2s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 191, 255, 0.4)'; this.style.borderColor='rgba(0, 191, 255, 0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 191, 255, 0.2)'; this.style.borderColor='rgba(0, 191, 255, 0.4)'">
            Got it
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    const closeBtn = modal.querySelector('#close-tutorial')
    closeBtn.addEventListener('click', () => {
      modal.style.animation = 'fadeOut 0.3s ease-out'
      setTimeout(() => modal.remove(), 300)
    })
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out'
        setTimeout(() => modal.remove(), 300)
      }
    })
  }
  
  updateToggleButton(isAwake) {
    if (!this.xapeFloatingWidget) return
    
    const toggleButton = this.xapeFloatingWidget.querySelector('#xape-sleep-toggle')
    if (!toggleButton) return
    
    if (isAwake) {
      
      toggleButton.innerHTML = '???'
      toggleButton.style.background = 'rgba(0, 191, 255, 0.25)'
      toggleButton.style.borderColor = 'rgba(0, 191, 255, 0.8)'
      toggleButton.style.boxShadow = '0 0 20px rgba(0, 191, 255, 0.4)'
      toggleButton.title = 'XAPE is AWAKE - Click to put to sleep'
      console.log('??? Toggle button: AWAKE')
    } else {
      
      toggleButton.innerHTML = '??'
      toggleButton.style.background = 'rgba(100, 100, 100, 0.15)'
      toggleButton.style.borderColor = 'rgba(100, 100, 100, 0.4)'
      toggleButton.style.boxShadow = '0 0 8px rgba(100, 100, 100, 0.2)'
      toggleButton.title = 'XAPE is SLEEPING - Press Caps Lock to activate'
      console.log('?? Toggle button: ASLEEP')
    }
  }
  
  async toggleXapeSleep() {
    console.log('?? Toggle XAPE awake/sleep')
    
    try {
      const backendUrl = localStorage.getItem('xape_backend_url') || 'https://postgres-production-958e.up.railway.app'
      const response = await fetch(`${backendUrl}/api/xape/sleep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.getUserId() })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('?? XAPE is now ASLEEP')
        this.showXapeResponse('💤 XAPE sleeping. Press Caps Lock to activate.')
        
        this.updateToggleButton(false)
        
        window.speechSynthesis.cancel()
      }
    } catch (error) {
      console.error('Error toggling XAPE sleep:', error)
    }
  }
  
  toggleXapeAgent() {
    if (!this.xapeFloatingWidget) {
      console.log('? Widget not found')
      return
    }
    
    if (this.isListening) {
      
      console.log('?? Stopping XAPE...')
      this.stopContinuousListening()
      this.stopRealAudioVisualization()
      
      console.log('?? XAPE stopped')
    } else {
      
      console.log('?? Starting XAPE...')
      this.startContinuousListening()
      
      console.log('?? XAPE started')
    }
  }
  
  startIdleWaveformAnimation() {
    
    const animate = () => {
      if (this.miniWaveformCtx && this.miniWaveformCanvas) {
        if (!this.isListening) {
          
          this.drawIdleWaveform()
        }
        
      }
      this.idleAnimationId = requestAnimationFrame(animate)
    }
    animate()
  }
  
  drawWaitingWaveform() {
    
    const ctx = this.miniWaveformCtx
    const canvas = this.miniWaveformCanvas
    
    if (!ctx || !canvas) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    const time = Date.now() / 2000
    const opacity = 0.4 + Math.sin(time * Math.PI) * 0.3
    
    ctx.strokeStyle = `rgba(0, 191, 255, ${opacity})`
    ctx.lineWidth = 3
    ctx.shadowBlur = 8
    ctx.shadowColor = `rgba(0, 191, 255, ${opacity})`
    
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }
  
  async startContinuousListening() {
    console.log('?????? STARTING CONTINUOUS LISTENING... ??????')
    
    if (!this.recognition) {
      console.log('?? Initializing voice recognition for first time...')
      this.initializeVoiceRecognition()
    }
    
    console.log('🎤 CAPS LOCK MODE: Press Caps Lock to toggle listening ON/OFF')
    console.log('💡 NO WAKE WORD NEEDED! When Caps Lock is ON, just speak your commands!')
    console.log('💡 Example: Turn on Caps Lock, then say "what\'s the latest news?"')
    
    if (this.xapeFloatingWidget) {
      this.xapeFloatingWidget.classList.add('active')
      console.log('? Added "active" class to waveform')
    }
    
    try {
      if (!this.audioStream) {
        console.log('?? Requesting microphone access...')
        console.log('?? A popup should appear asking for microphone permission - PLEASE ALLOW IT!')
        
        this.audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        })
        console.log('??? Microphone access GRANTED! ???')
        console.log('?? Microphone stream active:', this.audioStream)
        console.log('?? Audio tracks:', this.audioStream.getAudioTracks())
      } else {
        console.log('? Already have microphone stream')
      }
    } catch (error) {
      console.error('??? Microphone access DENIED or FAILED:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      
      const errorMsg = `
? MICROPHONE ACCESS FAILED!

Error: ${error.name}
Details: ${error.message}

TO FIX:
1. Click the ?? or ?? icon in browser address bar
2. Allow microphone access for this site
3. Refresh the page (F5)
4. Or click the blue wave manually to try again
      `
      alert(errorMsg)
      return
    }
    
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.isListening = true
    this.updateBrainAnimation(true)
    console.log('? Set isListening = true')
    
    try {
      this.recognition.start()
      console.log('✅ RECOGNITION ACTIVE - Caps Lock is ON! Just speak naturally!')
      console.log('💡 No wake word needed - just say your questions/commands!')
      console.log('💡 Example: "What\'s happening?" or "Show me the coins"')
      
      this.setupRealAudioVisualization()
      
      // 🚫 DON'T START NEWS POLLING YET - wait for initialize command
      console.log('📰 News polling will start after "initialize" command')
    } catch (error) {
      if (error.message && error.message.includes('already started')) {
        console.log('?? Recognition already running, continuing...')
      } else {
        console.error('? Error starting recognition:', error)
      }
    }
  }
  
  stopContinuousListening() {
    if (this.recognition) {
      this.recognition.stop()
    }
    
    this.isListening = false
    
    if (this.xapeFloatingWidget) {
      this.xapeFloatingWidget.classList.remove('active')
    }
    
    this.stopRealAudioVisualization()
    
    setTimeout(() => {
      if (!this.isListening && !this.isSpeaking) {
        this.updateBrainAnimation(false)
      }
    }, 500)
    
    console.log('?? Continuous listening stopped')
  }
  
  initializeVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported')
      return
    }
    
    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'
    
    this.recognition.maxAlternatives = 5  
    
    this.recognition.onresult = (event) => {
      const last = event.results.length - 1
      let transcript = event.results[last][0].transcript
      const isFinal = event.results[last].isFinal
      
      this.updateBrainAnimation(true)
      
      console.log(`?? HEARD (RAW): "${transcript}" (final: ${isFinal})`)
      
      if (isFinal) {
        
        const originalTranscript = transcript
        transcript = this.correctPhoneticMishearings(transcript)
        
        if (transcript !== originalTranscript) {
          console.log(`✅ CORRECTED: "${originalTranscript}" → "${transcript}"`)
        }
        
        // 🛑 ALLOW "STOP" COMMAND TO BYPASS SPEAKING BLOCK
        const lowerTranscript = transcript.toLowerCase().trim()
        const isStopCommand = lowerTranscript.includes('stop') || 
                              lowerTranscript.includes('silence') || 
                              lowerTranscript.includes('mute') || 
                              lowerTranscript.includes('shut up') || 
                              lowerTranscript.includes('quiet')
        
        if (this.isSpeaking && !isStopCommand) {
          console.log('?? BLOCKED (XAPE is speaking):', transcript)
          return
        }
        
        if (this.isSpeaking && isStopCommand) {
          console.log('🛑 STOP COMMAND DETECTED WHILE SPEAKING - FORCING IMMEDIATE STOP!')
          
          // Cancel speech synthesis IMMEDIATELY
          window.speechSynthesis.cancel()
          window.speechSynthesis.pause()
          setTimeout(() => window.speechSynthesis.cancel(), 0)
          setTimeout(() => window.speechSynthesis.cancel(), 50)
          setTimeout(() => window.speechSynthesis.cancel(), 100)
          
          this.isSpeaking = false
          this.stopRequested = true
          
          this.showXapeResponse('🛑 Stopped')
          console.log('✅ XAPE FORCE STOPPED mid-speech')
          return
        }
        
        // 🔇 ECHO PREVENTION: Block input for 1 second after XAPE finishes speaking
        if (this.lastSpeechEndTime && (Date.now() - this.lastSpeechEndTime) < 1000) {
          console.log('?? BLOCKED (Too soon after XAPE spoke - 1000ms echo window):', transcript)
          return
        }
        
        const cleanTranscript = transcript
          .toLowerCase()
          .replace(/[^\w\s]/g, '') 
          .replace(/\s+/g, ' ')     
          .trim()
        
        if (!this.recentXapeResponses) {
          this.recentXapeResponses = []
        }
        
        for (const response of this.recentXapeResponses) {
          const cleanResponse = response
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
          
          const words = cleanTranscript.split(' ')
          const responseWords = cleanResponse.split(' ')
          
          let maxMatch = 0
          for (let i = 0; i < words.length; i++) {
            for (let j = 0; j < responseWords.length; j++) {
              let match = 0
              while (i + match < words.length && 
                     j + match < responseWords.length && 
                     words[i + match] === responseWords[j + match]) {
                match++
              }
              if (match > maxMatch) maxMatch = match
            }
          }
          
          // Block if 3+ consecutive matching words (was 5) - catches "stand by", "breaking news", etc.
          if (maxMatch >= 3) {
            console.log(`?? BLOCKED (Echo detected - ${maxMatch} matching words):`, transcript)
            return
          }
          
          // Also check for high percentage match on short phrases
          if (words.length <= 3 && maxMatch >= 2) {
            console.log(`?? BLOCKED (Short phrase echo - ${maxMatch}/${words.length} words):`, transcript)
            return
          }
        }
        
        // ⚡ LESS AGGRESSIVE: Removed blocking based on common crypto words
        // Users should be able to ask about crypto topics!
        // Only block obvious echo patterns (handled above)
        
        console.log('✅ VALID USER INPUT - Processing')
        console.log('🎤 FINAL TRANSCRIPT:', transcript)
        console.log('📡 Sending to backend (NO wake word needed!)')
        
        this.processVoiceCommand(transcript)
      }
    }
    
    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        console.log('🔇 No speech detected (silence timeout) - continuing to listen...')
        return
      }
      
      if (event.error === 'audio-capture') {
        console.error('❌ Microphone error - please check your microphone')
        return
      }
      
      if (event.error !== 'aborted') {
        console.log('⚠️ Speech recognition error:', event.error)
      }
      
      if (event.error !== 'aborted' && this.isListening) {
        setTimeout(() => {
          if (this.isListening) {
            console.log('🔄 Restarting recognition after error...')
            try {
              this.recognition.start()
            } catch (error) {
              
              if (!error.message.includes('already started')) {
                console.error('Failed to restart recognition:', error)
              }
            }
          }
        }, 1000)
      }
    }
    
    this.recognition.onend = () => {
      
      if (this.isListening && !this.isSpeaking) {
        setTimeout(() => {
          if (this.isListening && !this.isSpeaking) {
            console.log('?? Restarting recognition...')
            try {
              this.recognition.start()
            } catch (error) {
              console.log('Recognition already started')
            }
          }
        }, 500)
      } else if (this.isSpeaking) {
        console.log('?? Recognition ended (XAPE speaking, will resume after)')
      }
    }
  }
  
  showXapeResponse(text) {
    
    let toast = document.getElementById('xape-response-toast')
    
    if (!toast) {
      toast = document.createElement('div')
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
        pointer-events: auto !important;
        cursor: default !important;
        letter-spacing: 0.2px !important;
        line-height: 1.5 !important;
        white-space: normal !important;
        word-wrap: break-word !important;
        text-align: center !important;
        display: inline-block !important;
      `
      document.body.appendChild(toast)
      
      // 🖱️ KEEP TEXT VISIBLE WHEN HOVERING
      toast.addEventListener('mouseenter', () => {
        if (toast.hideTimeout) {
          clearTimeout(toast.hideTimeout)
          toast.hideTimeout = null
          console.log('🖱️ Mouse over XAPE text - keeping visible')
        }
      })
      
      toast.addEventListener('mouseleave', () => {
        console.log('🖱️ Mouse left XAPE text - hiding in 2 seconds')
        toast.hideTimeout = setTimeout(() => {
          toast.style.opacity = '0'
          toast.style.transform = 'translateX(-50%) translateY(-20px)'
        }, 2000)
      })
    }
    
    // Clear any existing hide timeout
    if (toast.hideTimeout) {
      clearTimeout(toast.hideTimeout)
    }
    
    toast.textContent = text
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(-50%) translateY(0)'
    
    // Auto-hide after 5 seconds (unless user is hovering)
    toast.hideTimeout = setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(-50%) translateY(-20px)'
    }, 5000)
  }
  
  createXapeVoiceModal() {
    
    const existing = document.getElementById('xape-voice-modal')
    if (existing) existing.remove()
    
    this.xapeVoiceModal = document.createElement('div')
    this.xapeVoiceModal.id = 'xape-voice-modal'
    this.xapeVoiceModal.className = 'xape-voice-modal'
    this.xapeVoiceModal.innerHTML = `
      <div class="xape-modal-backdrop"></div>
      <div class="xape-modal-content">
        <div class="xape-modal-header">
          <div class="xape-logo-header">
            <div class="xape-avatar">??</div>
            <h2>XAPE AI Assistant</h2>
          </div>
          <button class="xape-close-btn">&times;</button>
        </div>
        
        <div class="xape-modal-body">
          <div class="xape-status-indicator">
            <div class="xape-status-dot"></div>
            <span class="xape-status-text">Ready to listen</span>
          </div>
          
          <div class="xape-waveform-container">
            <canvas id="xape-waveform-canvas" width="400" height="100"></canvas>
          </div>
          
          <div class="xape-transcript-box">
            <p class="xape-transcript-text">Click the microphone to start talking...</p>
          </div>
          
          <div class="xape-controls">
            <button class="xape-mic-button" id="xape-mic-toggle">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="currentColor"/>
                <path d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.93V21H13V17.93C16.39 17.43 19 14.53 19 11H17Z" fill="currentColor"/>
              </svg>
              <span>Start Listening</span>
            </button>
            <button class="xape-stop-button" id="xape-stop-talking" style="background: #ff4444; margin-left: 10px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="12" height="12" fill="currentColor"/>
              </svg>
              <span>STOP</span>
            </button>
          </div>
          
          <div class="xape-response-box">
            <div class="xape-response-header">XAPE Response:</div>
            <div class="xape-response-text">I'm ready to assist you! Ask me about market conditions, your positions, or anything trading related.</div>
          </div>
        </div>
        
        <div class="xape-modal-footer">
          <button class="xape-settings-btn">?? Settings</button>
          <span class="xape-powered-by">Powered by AI</span>
        </div>
      </div>
    `
    
    document.body.appendChild(this.xapeVoiceModal)
    
    this.setupXapeVoiceListeners()
  }
  
  setupXapeVoiceListeners() {
    
    const closeBtn = this.xapeVoiceModal.querySelector('.xape-close-btn')
    closeBtn.addEventListener('click', () => {
      this.xapeVoiceModal.style.display = 'none'
      this.stopVoiceRecognition()
    })
    
    const backdrop = this.xapeVoiceModal.querySelector('.xape-modal-backdrop')
    backdrop.addEventListener('click', () => {
      this.xapeVoiceModal.style.display = 'none'
      this.stopVoiceRecognition()
    })
    
    const micButton = this.xapeVoiceModal.querySelector('#xape-mic-toggle')
    micButton.addEventListener('click', () => this.toggleVoiceRecognition())
    
    const stopButton = this.xapeVoiceModal.querySelector('#xape-stop-talking')
    stopButton.addEventListener('click', () => {
      this.stopSpeaking()
      this.stopVoiceRecognition()
      const responseBox = this.xapeVoiceModal.querySelector('.xape-response-text')
      responseBox.textContent = '?? Stopped'
    })
    
    const settingsBtn = this.xapeVoiceModal.querySelector('.xape-settings-btn')
    settingsBtn.addEventListener('click', () => this.openXapeSettings())
    
    this.initializeWaveform()
  }
  
  toggleVoiceRecognition() {
    if (this.isListening) {
      this.stopVoiceRecognition()
    } else {
      this.startVoiceRecognition()
    }
  }
  
  async startVoiceRecognition() {
    console.log('?? Starting voice recognition...')
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }
    
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.setupRealAudioVisualization()
    } catch (error) {
      console.error('Microphone access denied:', error)
      alert('Please allow microphone access to use voice commands!')
      return
    }
    
    if (!this.recognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'
      
      this.recognition.onstart = () => {
        this.isListening = true
        this.updateBrainAnimation(true)
        this.updateVoiceStatus('Listening...', 'listening')
      }
      
      this.recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        this.updateBrainAnimation(true)
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        
        const transcriptBox = this.xapeVoiceModal.querySelector('.xape-transcript-text')
        if (transcriptBox) {
        transcriptBox.textContent = finalTranscript || interimTranscript || 'Listening...'
        }
        
        if (finalTranscript) {
          const cleanedTranscript = finalTranscript.trim()

          if (this.isSpeaking) {
            console.log('🔇 BLOCKED (XAPE is speaking):', cleanedTranscript)
            return
          }

          if (this.lastSpeechEndTime && (Date.now() - this.lastSpeechEndTime) < 1000) {
            console.log('🔇 BLOCKED (Too soon after XAPE spoke):', cleanedTranscript)
            return
          }
          
          this.processVoiceCommand(cleanedTranscript)
        }
      }
      
      this.recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          console.log('🔇 No speech detected (silence timeout) - continuing to listen...')
          return
        }
        
        if (event.error === 'audio-capture') {
          console.error('❌ Microphone error - please check your microphone')
          this.updateVoiceStatus('Microphone error', 'error')
          return
        }
        
        if (event.error !== 'aborted') {
          console.log('⚠️ Voice recognition error:', event.error)
        this.updateVoiceStatus(`Error: ${event.error}`, 'error')
        }
        
        this.isListening = false
        this.updateBrainAnimation(false)
      }
      
      this.recognition.onend = () => {
        this.isListening = false
        this.updateVoiceStatus('Stopped', 'stopped')
        this.stopRealAudioVisualization()
        
        setTimeout(() => {
          if (!this.isListening && !this.isSpeaking) {
            this.updateBrainAnimation(false)
          }
        }, 500)
      }
    }
    
    this.recognition.start()
  }
  
  setupRealAudioVisualization() {
    
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 2048
    
    const source = this.audioContext.createMediaStreamSource(this.audioStream)
    source.connect(this.analyser)
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    
    this.startRealWaveformAnimation()
  }
  
  startRealWaveformAnimation() {
    if (this.waveformAnimationId) return
    
    const animate = () => {
      this.drawRealWaveform()
      this.waveformAnimationId = requestAnimationFrame(animate)
    }
    
    animate()
  }
  
  drawRealWaveform() {
    
    const ctx = this.miniWaveformCtx
    const canvas = this.miniWaveformCanvas
    
    if (!ctx || !canvas) {
      
      this.drawIdleWaveform()
      return
    }
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    if (!this.analyser || !this.dataArray) {
      
      this.drawIdleWaveform()
      return
    }
    
    this.analyser.getByteTimeDomainData(this.dataArray)
    
    ctx.lineWidth = 3
    ctx.strokeStyle = '#00bfff'
    ctx.shadowBlur = 12
    ctx.shadowColor = 'rgba(0, 191, 255, 0.8)'
    
    ctx.beginPath()
    
    const sliceWidth = width / this.dataArray.length
    let x = 0
    
    for (let i = 0; i < this.dataArray.length; i++) {
      const v = this.dataArray[i] / 128.0
      const y = (v * height) / 2
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      
      x += sliceWidth
    }
    
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }
  
  drawIdleWaveform() {
    
    const ctx = this.miniWaveformCtx
    const canvas = this.miniWaveformCanvas
    
    if (!ctx || !canvas) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    const barCount = 30
    const barWidth = width / barCount
    const time = Date.now() / 1000
    
    for (let i = 0; i < barCount; i++) {
      
      const barHeight = Math.sin(time * 2 + i * 0.4) * (height * 0.35) + (height * 0.15)
      const x = i * barWidth
      const y = (height - barHeight) / 2
      
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
      gradient.addColorStop(0, 'rgba(0, 191, 255, 0.8)')
      gradient.addColorStop(0.5, 'rgba(0, 191, 255, 1)')
      gradient.addColorStop(1, 'rgba(0, 191, 255, 0.6)')
      
      ctx.fillStyle = gradient
      ctx.shadowBlur = 10
      ctx.shadowColor = 'rgba(0, 191, 255, 0.6)'
      
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight)
    }
  }
  
  stopRealAudioVisualization() {
    if (this.waveformAnimationId) {
      cancelAnimationFrame(this.waveformAnimationId)
      this.waveformAnimationId = null
    }
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    if (this.miniWaveformCtx && this.miniWaveformCanvas) {
      this.miniWaveformCtx.clearRect(0, 0, this.miniWaveformCanvas.width, this.miniWaveformCanvas.height)
    }
    
    console.log('?? Audio visualization stopped')
  }
  
  stopVoiceRecognition() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
      this.updateVoiceStatus('Ready to listen', 'ready')
      this.stopRealAudioVisualization()
    }
  }
  
  updateVoiceStatus(text, status) {
    const statusText = this.xapeVoiceModal.querySelector('.xape-status-text')
    const statusDot = this.xapeVoiceModal.querySelector('.xape-status-dot')
    const micButton = this.xapeVoiceModal.querySelector('#xape-mic-toggle span')
    
    statusText.textContent = text
    statusDot.className = `xape-status-dot xape-status-${status}`
    
    if (status === 'listening') {
      micButton.textContent = 'Stop Listening'
      micButton.parentElement.classList.add('active')
    } else {
      micButton.textContent = 'Start Listening'
      micButton.parentElement.classList.remove('active')
    }
  }
  
  async processVoiceCommand(command) {
    console.log('🎯 Processing command:', command)
    
    // 🛑 STOP COMMAND - ALWAYS PROCESS FIRST, EVEN BEFORE TOKEN GATE!
    const lowerCmd = command.toLowerCase().trim()
    if (lowerCmd.includes('stop') || lowerCmd.includes('silence') || lowerCmd.includes('mute') || 
        lowerCmd.includes('shut up') || lowerCmd.includes('quiet')) {
      console.log('🛑 STOP COMMAND DETECTED - STOPPING IMMEDIATELY!')
      
      // Cancel speech synthesis multiple times to ensure it stops
      window.speechSynthesis.cancel()
      window.speechSynthesis.pause()
      setTimeout(() => window.speechSynthesis.cancel(), 0)
      setTimeout(() => window.speechSynthesis.cancel(), 50)
      setTimeout(() => window.speechSynthesis.cancel(), 100)
      
      this.isSpeaking = false
      this.stopRequested = true
      
      this.showXapeResponse('🛑 Stopped')
      console.log('✅ XAPE stopped talking')
      return 
    }
    
    // 📰 SMART NEWS CONTROL - Detect natural language commands for news
    const newsDisableKeywords = [
      'stop the breaking news', 'stop breaking news', 'disable breaking news',
      'turn off breaking news', 'turn off news', 'disable news', 'stop news',
      'no more breaking news', 'no more news', 'stop telling me news',
      'dont tell me news', "don't tell me news", 'stop announcing news',
      'disable the news', 'turn the news off', 'shut off news'
    ]
    
    const newsEnableKeywords = [
      'start breaking news', 'enable breaking news', 'turn on breaking news',
      'activate breaking news', 'start news', 'enable news', 'turn on news',
      'give me breaking news', 'start the news', 'turn the news on',
      'activate news', 'resume breaking news', 'resume news'
    ]
    
    const shouldDisableNews = newsDisableKeywords.some(keyword => 
      lowerCmd.includes(keyword)
    )
    
    const shouldEnableNews = newsEnableKeywords.some(keyword => 
      lowerCmd.includes(keyword)
    )
    
    if (shouldDisableNews) {
      console.log('📰 USER REQUESTED TO DISABLE BREAKING NEWS')
      this.stopNewsPolling()
      const response = 'Breaking news notifications disabled. I will no longer announce news updates. Let me know when you want them back.'
      this.showXapeResponse(response)
      this.speakResponse(response)
      return
    }
    
    if (shouldEnableNews) {
      console.log('📰 USER REQUESTED TO ENABLE BREAKING NEWS')
      this.startNewsPolling()
      const response = 'Breaking news notifications enabled. I will now keep you updated with the latest crypto news.'
      this.showXapeResponse(response)
      this.speakResponse(response)
      return
    }
    
    // 🔐 CHECK TOKEN GATE AFTER STOP COMMAND
    if (!this.tokenGatePassed) {
      console.log('🚫 TOKEN GATE FAILED - Checking if user bought tokens...')
      
      // 🔇 ONLY TELL USER ONCE about needing tokens
      if (!this.hasShownTokenGateMessage) {
        const required = this.requiredTokenAmount || 100
        const current = this.currentTokenBalance || 0
        const message = `Sir, to access this extension you must hold at least ${required} XAPE tokens. Your current balance is ${current}. If you just bought tokens, please wait a few seconds and try again.`
        this.showXapeResponse(message)
        this.speakResponse(message)
        this.hasShownTokenGateMessage = true
      }
      
      // Force re-check balance (user might have just bought tokens!)
      await this.performTokenGateCheck(true)
      
      // Check again after refresh
      if (!this.tokenGatePassed) {
        console.log('🚫 Still no access after refresh')
        return
      } else {
        console.log('✅ ACCESS GRANTED after refresh!')
        const message = `Welcome, Sir! Token verification successful. You now have full access to the extension. How can I assist you?`
        this.showXapeResponse(message)
        this.speakResponse(message)
        this.hasShownTokenGateMessage = false // Reset for next session
        
        // Re-initialize features now that user has access
        this.initializeMarketCapFiltering()
        this.initializeHolderCountMonitoring()
        this.initializeMarketCapGrowthMonitoring()
        return
      }
    }
    
    // 🔥 INSTANT NEWS FETCH - If user asks for news, fetch immediately!
    const newsKeywords = /(news|update|event|happening|latest|breaking|headline|announce|tell me|what's new|fetch)/i
    if (newsKeywords.test(lowerCmd)) {
      console.log('📰 NEWS QUERY DETECTED - FETCHING FRESH NEWS NOW!')
      this.showXapeResponse('📰 Fetching latest news...')
      
      const backendUrl = localStorage.getItem('xape_backend_url') || 'https://postgres-production-958e.up.railway.app'
      try {
        // Force immediate news fetch on backend
        const fetchResponse = await fetch(`${backendUrl}/api/news/fetch`, { method: 'POST' })
        const fetchData = await fetchResponse.json()
        console.log('✅ Fresh news fetched:', fetchData.count, 'events')
      } catch (error) {
        console.warn('⚠️ Could not fetch fresh news, using cache:', error.message)
      }
    }
    
    if (this.xapeSetupMode) {
      console.log('?? SETUP MODE ACTIVE - Step:', this.xapeSetupStep)
      
      if (this.xapeSetupStep === 'name') {
        
        // 👤 SMART NAME EXTRACTION - Extract just the name from common phrases
        let rawCommand = command.trim()
        console.log('📝 Raw command received:', rawCommand)
        
        // Clean the command - remove extra spaces and normalize
        let cleanedCommand = rawCommand.replace(/\s+/g, ' ').trim().toLowerCase()
        console.log('📝 Cleaned command:', cleanedCommand)
        
        let name = rawCommand.trim()
        
        // Remove common prefixes like "call me", "my name is", "I'm", etc.
        const namePatterns = [
          /(?:call me|you can call me)\s+(\w+)/i,
          /(?:my name is|my name's)\s+(\w+)/i,
          /(?:i'm|i am|im)\s+(\w+)/i,
          /(?:it's|its|it is)\s+(\w+)/i,
          /(?:the name is|name is)\s+(\w+)/i,
          /(?:please call me)\s+(\w+)/i
        ];
        
        let extracted = false
        for (const pattern of namePatterns) {
          const match = cleanedCommand.match(pattern);
          if (match && match[1]) {
            name = match[1].trim();
            console.log(`✅ Extracted name "${name}" from phrase "${rawCommand}" using pattern ${pattern}`);
            extracted = true
            break;
          }
        }
        
        // If no pattern matched, take just the first word (likely just the name)
        if (!extracted) {
          const words = name.split(' ')
          name = words[0]
          console.log(`📝 No pattern matched, using first word: "${name}"`)
        }
        
        // Capitalize first letter of each word
        name = name.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        localStorage.setItem('xape_user_name', name)
        console.log('✅ User name saved:', name)
        
        this.xapeSetupStep = 'gender'
        
        setTimeout(() => {
          const question = `Excellent, ${name}. And how should I address you? Please say Sir, Madam, or Boss.`
          this.showXapeResponse(question)
          this.speakResponse(question)
        }, 500)
        
        return 
      }
      
      if (this.xapeSetupStep === 'gender') {
        
        const response = command.toLowerCase().trim()
        let title = 'Sir'
        let gender = 'male'
        
        if (response.includes('madam') || response.includes('ma\'am') || response.includes('miss') || response.includes('mrs')) {
          title = 'Madam'
          gender = 'female'
        } else if (response.includes('boss') || response.includes('neutral')) {
          title = 'Boss'
          gender = 'neutral'
        } else {
          
          title = 'Sir'
          gender = 'male'
        }
        
        localStorage.setItem('xape_user_title', title)
        localStorage.setItem('xape_user_gender', gender)
        console.log('? User title saved:', title)
        
        this.xapeSetupMode = false
        this.xapeSetupStep = null
        
        const finalName = localStorage.getItem('xape_user_name')
        setTimeout(() => {
          const greeting = `Very good, ${title} ${finalName}. Remember: After initialization, press Caps Lock to activate me. The orb turns blue when I'm listening. Click the orb anytime to see how it works. Whenever you are ready, please give me the order to initialize.`
          this.showXapeResponse(greeting)
          this.speakResponse(greeting)
        }, 500)
        
        return 
      }
    }
    
    const lowerCommand = command.toLowerCase().trim()
    if (lowerCommand.includes('initialize') || lowerCommand.includes('initialise') || 
        lowerCommand.includes('load extension') || lowerCommand.includes('activate')) {
      console.log('🎯🎯🎯 INITIALIZE COMMAND DETECTED!')
      
      // 🏗️ CREATE SKILLBAR NOW (if not already created)
      if (!document.getElementById('axiom-skill-bar')) {
        try {
          this.createSkillBar()
          console.log('✅ Skillbar created after initialize')
        } catch (error) {
          console.error('❌ Failed to create skillbar:', error)
        }
      }
      
      // 📰 START NEWS POLLING NOW (only if user hasn't disabled it)
      if (this.newsEnabled) {
        this.startNewsPolling()
        console.log('📰 News polling started after initialize')
      } else {
        console.log('📰 News polling NOT started (user disabled it previously)')
      }
      
      const response = 'Initializing extension. Stand by.'
      this.showXapeResponse(response)
      
      this.speakResponse(response)
      
      setTimeout(() => {
        console.log('?? Removing dormant mode - activating all features!')
        
        document.body.classList.remove('extension-dormant')
        
        window.marketCapSystemEnabled = true
        marketCapSystemEnabled = true
        console.log('🎯 Market Cap System ENABLED!')
        
        window.isFirstInitialization = true
        window.isAutoLoad = false 
        sessionStorage.removeItem('blue_phase_completed')
        sessionStorage.setItem('xape_session_initialized', 'true')
        console.log('✅ Saved to sessionStorage - will persist until browser closes!')
        console.log('🔄 Blue phase flag cleared - animation will run!')
        
        if (window.showExtensionInitializationAnimation) {
          window.showExtensionInitializationAnimation()
        } else {
          console.error('? Border animation function not found!')
        }
        
        setTimeout(() => {
          console.log('🔍 Checking if skillbar loaded...')
          
          if (!window.skillbarInstance) {
            console.error('❌ CRITICAL: Skillbar instance not found after 16s!')
            console.log('🔄 Retrying in 2s...')
            setTimeout(() => {
              if (window.skillbarInstance) {
                console.log('✅ Found skillbar on retry!')
                activateAllSystems()
              } else {
                console.error('❌ FAILED: Skillbar never loaded. Please refresh and try again.')
                alert('⚠️ Extension failed to initialize. Please refresh the page (F5) and say "initialize" again.')
              }
            }, 2000)
            return
          }
          
          const skillbarElement = document.getElementById('axiom-skill-bar')
          if (!skillbarElement) {
            console.error('❌ Skillbar instance exists but element NOT in DOM!')
            console.log('🔄 Forcing skillbar recreation...')
            
            try {
              window.skillbarInstance.createSkillBar()
              console.log('✅ Skillbar recreated!')
              
              setTimeout(() => {
                activateAllSystems()
              }, 500)
            } catch (error) {
              console.error('❌ Failed to recreate skillbar:', error)
              alert('⚠️ Extension failed to initialize. Please refresh the page (F5) and say "initialize" again.')
            }
            return
          }
          
          activateAllSystems()
          
          function activateAllSystems() {
            console.log('✅ Skillbar instance found! Activating all systems...')
            
            const skillbar = document.getElementById('axiom-skill-bar')
            const skillbarMain = document.querySelector('.skill-bar-main')
            const skillbarContainer = document.querySelector('.skill-bar-container')
            
            if (skillbar) {

              skillbar.style.cssText = `
                position: fixed !important;
                bottom: 20px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                z-index: 200 !important;
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                justify-content: center !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                width: auto !important;
                max-width: 90vw !important;
                transition: none !important;
              `
              
              if (skillbarMain) {
                skillbarMain.style.display = 'block'
                skillbarMain.style.visibility = 'visible'
                skillbarMain.style.opacity = '1'
                skillbarMain.style.transition = 'none'
              }
              if (skillbarContainer) {
                skillbarContainer.style.display = 'flex'
                skillbarContainer.style.flexDirection = 'row'
                skillbarContainer.style.alignItems = 'center'
                skillbarContainer.style.visibility = 'visible'
                skillbarContainer.style.opacity = '1'
                skillbarContainer.style.transition = 'none'
              }
              
              console.log('✅ Skillbar forced visible (all elements) - HORIZONTAL layout!')
            } else {
              console.error('❌ CRITICAL: Skillbar element not found in DOM!')
            }
            
            if (window.skillbarInstance.initializeMarketCapFiltering) {
              console.log('🎨 ACTIVATING market cap filtering...')
              window.skillbarInstance.initializeMarketCapFiltering()
              console.log('✅ Market cap filtering applied!')
              
              setTimeout(() => {
                if (window.activateHeatmapColors) {
                  console.log('💥 NOW showing heatmap explosions!')
                  window.activateHeatmapColors()
                } else {
                  console.warn('⚠️ activateHeatmapColors function not found')
                }
              }, 500)
            }
            
            if (window.skillbarInstance.startAggressiveMonitoring) {
              console.log('🔥 Starting aggressive monitoring NOW!')
              window.skillbarInstance.startAggressiveMonitoring()
              console.log('✅ Aggressive monitoring started!')
            }
            
            console.log('🎉 ALL SYSTEMS ONLINE!')
            
            let lockCount = 0
            const lockInterval = setInterval(() => {
              const skillbar = document.getElementById('axiom-skill-bar')
              if (skillbar) {
                
                const currentLeft = skillbar.style.left
                const currentTransform = skillbar.style.transform
                const needsLock = currentLeft !== '50%' || !currentTransform.includes('translateX(-50%)')
                
                if (needsLock || lockCount < 10) {
                  
                  skillbar.style.cssText = `
                    position: fixed !important;
                    bottom: 20px !important;
                    left: 50% !important;
                    right: auto !important;
                    top: auto !important;
                    transform: translateX(-50%) !important;
                    z-index: 200 !important;
                    width: auto !important;
                    max-width: 90vw !important;
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: center !important;
                    justify-content: center !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    transition: none !important;
                  `
                  lockCount++
                  if (needsLock) {
                    console.log('⚠️ Position changed! RE-LOCKING to center...')
                  }
                }
              }
            }, 100) 
            
            window.skillbarPositionLock = lockInterval
            console.log('✅ CONTINUOUS position locking STARTED! (will lock 10 times + whenever position changes)')
          }
        }, 16000) 
        
        setTimeout(() => {
          
          if (window.isFirstInitialization) {
          const completionResponse = 'Extension fully initialized. All systems online.'
          this.showXapeResponse(completionResponse)
          this.speakResponse(completionResponse)
            console.log('✅ Extension fully initialized! (FIRST TIME)')
            
            setTimeout(() => {
              if (window.skillbarInstance && window.skillbarInstance.isListening) {
                console.log('🔇 AUTO-MUTING XAPE after initialization...')
                console.log('💡 User must press Caps Lock to talk to XAPE now')
                window.skillbarInstance.stopContinuousListening()
                console.log('✅ XAPE auto-muted! Press Caps Lock to wake him.')
              }
            }, 2000) 
            
            window.isFirstInitialization = false
          } else {
            console.log('✅ Extension reactivated from session (silent)')
          }
        }, 17000) 
        
      }, 800)
      
      return 
    }
    
    const exactStopWords = ['stop', 'stops', 'cancel', 'stop xape', 'stop listening', 
                            'shut up', 'cancel xape', 'nope', 'enough',
                            'that\'s it', 'thats it', 'just stop', 'please stop', 'be quiet']
    
    const isStopCommand = exactStopWords.includes(lowerCommand) || 
                         lowerCommand.startsWith('stop ') ||
                         lowerCommand.startsWith('cancel ')
    
    if (isStopCommand) {
      console.log('?????? STOP COMMAND DETECTED:', lowerCommand)
      
      this.stopRequested = true
      
      window.speechSynthesis.cancel()
      setTimeout(() => window.speechSynthesis.cancel(), 0)
      setTimeout(() => window.speechSynthesis.cancel(), 50)
      setTimeout(() => window.speechSynthesis.cancel(), 100)
      
      this.stopContinuousListening()
      this.stopRealAudioVisualization()
      
      this.showXapeResponse('?? Stopped')
      
      console.log('?????? EVERYTHING STOPPED!')
      return 
    }
    
    const cleanCommand = command.trim()
    if (!cleanCommand || cleanCommand.length < 5) {
      console.log('?? Command too short, ignoring:', cleanCommand)
      return  
    }
    
    const falsePositives = ['yeah', 'yes', 'no', 'the', 'and', 'but', 'so', 'for', 'to', 'of', 'in', 'on', 'at', 'is', 'are', 'was', 'were', 'um', 'uh', 'hmm']
    const xapeResponses = ['experts', 'bitcoin', 'predicted', 'tracking', 'looks', 
                          'honestly', 'analysts', 'strong', 'bullish', 'bearish',
                          'percent', 'gain', 'loss', 'market', 'solid', 'inflows',
                          'crypto', 'headlines', 'overview', 'buzz', 'world', 'based',
                          'latest', 'dive', 'since', 'haven', 'specified', 'topic']
    
    if (falsePositives.includes(cleanCommand.toLowerCase())) {
      console.log('?? False positive detected, ignoring:', cleanCommand)
      return
    }
    
    if (xapeResponses.some(word => cleanCommand.toLowerCase().includes(word)) && cleanCommand.length < 50) {
      console.log('?? Sounds like my own response, ignoring:', cleanCommand)
      return
    }
    
    const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'is', 'are', 'can', 'could', 'would', 'should', 'do', 'does', 'did', 'tell', 'show', 'check', 'give', 'get', 'find', 'hello', 'hi', 'hey', 'thanks', 'thank']
    const hasQuestionWord = questionWords.some(word => cleanCommand.toLowerCase().includes(word))
    const hasQuestionMark = cleanCommand.includes('?')
    
    if (!hasQuestionWord && !hasQuestionMark && cleanCommand.length < 50) {
      console.log('?? Not a question or command, ignoring:', cleanCommand)
      return
    }
    
    this.updateXapeStatus('Processing...', 'processing')
    
    let userName = localStorage.getItem('xape_user_name')
    
    // 👤 SMART NAME EXTRACTION - Check if user is introducing themselves
    if (cleanCommand.toLowerCase().includes('my name is') || 
        cleanCommand.toLowerCase().includes("i'm ") || 
        cleanCommand.toLowerCase().includes("i am ") ||
        cleanCommand.toLowerCase().includes("call me")) {
      
      const namePatterns = [
        /(?:call me|you can call me)\s+(.+?)(?:\s|$)/i,
        /(?:my name is|my name's)\s+(.+?)(?:\s|$)/i,
        /(?:i'm|i am|im)\s+(.+?)(?:\s|$)/i,
      ];
      
      for (const pattern of namePatterns) {
        const nameMatch = cleanCommand.match(pattern);
        if (nameMatch) {
          userName = nameMatch[1].trim();
          
          // Capitalize first letter of each word
          userName = userName.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          localStorage.setItem('xape_user_name', userName);
          console.log('✅ Updated user name:', userName);
          break;
        }
      }
    }
    
    try {
      
      const backendUrl = localStorage.getItem('xape_backend_url') || 'https://postgres-production-958e.up.railway.app'
      
      console.log('?? Calling backend:', `${backendUrl}/api/chat`)
      
      // 🔐 Get wallet address for token gating
      const walletAddress = await this.getWalletAddress()
      console.log('👛 Wallet address:', walletAddress || 'Not found')
      
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.getUserId(),
          message: cleanCommand,
          context: await this.getContext(),
          walletAddress: walletAddress
        })
      })
      
      console.log('?? Backend response status:', response.status)
      
      const data = await response.json()
      console.log('?? Backend data:', data)
      
      // 🚫 CHECK IF USER IS BLOCKED (TOKEN GATE)
      if (data.blocked) {
        console.log('🚫 USER BLOCKED:', data.reason)
        this.showXapeResponse(data.response)
        this.speakResponse(data.response)
        return
      }
      
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
      }
      
      if (data.success) {
        
        if (data.isAwake === true) {
          this.updateToggleButton(true) 
        } else if (data.isAwake === false) {
          this.updateToggleButton(false) 
        }
        
        if (data.response) {
          console.log('? Got AI response:', data.response.substring(0, 100) + '...')
          this.showXapeResponse(data.response)
          this.speakResponse(data.response)
        }
        
        if (data.action) {
          console.log('?? Executing control action:', data.action)
          this.executeControlAction(data.action)
        }
        
        this.updateXapeStatus('LISTENING', 'listening')
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
      
    } catch (error) {
      console.error('? Backend error:', error)
      console.error('? Error type:', error.name)
      console.error('? Error message:', error.message)
      
      const fallbackResponse = this.generateBasicResponse(cleanCommand)
      this.showXapeResponse(fallbackResponse)
      this.speakResponse(fallbackResponse)
      this.updateXapeStatus('LISTENING', 'listening')
    }
  }
  
  updateXapeStatus(text, status) {
    if (this.xapeFloatingWidget) {
      const statusDot = this.xapeFloatingWidget.querySelector('.xape-status-dot')
      const statusText = this.xapeFloatingWidget.querySelector('.xape-status-text')
      
      if (statusDot) {
        statusDot.className = `xape-status-dot xape-status-${status}`
      }
      if (statusText) {
        statusText.textContent = text
      }
    }
  }
  
  getUserId() {
    
    let userId = localStorage.getItem('xape_user_id')
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(7)
      localStorage.setItem('xape_user_id', userId)
    }
    return userId
  }
  
  showVerificationOverlay() {
    // Create black overlay with loading message
    const overlay = document.createElement('div')
    overlay.id = 'xape-verification-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Inter', sans-serif;
      backdrop-filter: blur(10px);
    `
    
    overlay.innerHTML = `
      <div style="text-align: center;">
        <div style="
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: #10b981;
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: spin 1s linear infinite;
        "></div>
        <h2 style="
          color: #fff;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 10px 0;
        ">Verifying Access...</h2>
        <p style="
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin: 0;
        ">Checking token balance, please wait</p>
      </div>
    `
    
    // Add spinner animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `
    overlay.appendChild(style)
    
    document.body.appendChild(overlay)
    console.log('🔒 Verification overlay shown')
  }
  
  hideVerificationOverlay() {
    const overlay = document.getElementById('xape-verification-overlay')
    if (overlay) {
      overlay.remove()
      console.log('✅ Verification overlay hidden')
    }
  }

  async getWalletAddress() {
    try {
      // First check if we already have it cached
      const cachedWallet = localStorage.getItem('xape_wallet_address')
      if (cachedWallet) {
        console.log('👛 Using cached wallet:', cachedWallet)
        return cachedWallet
      }
      
      // Try to get wallet from Phantom/Solana wallet
      if (window.solana && window.solana.publicKey) {
        const address = window.solana.publicKey.toString()
        console.log('👛 Found wallet from window.solana:', address)
        localStorage.setItem('xape_wallet_address', address)
        return address
      }
      
      // 🔒 SHOW BLACK OVERLAY - Hide the extraction process
      this.showVerificationOverlay()
      
      // AUTO-DETECTION: Click SOL balance → Deposit → Extract address
      console.log('👛 Starting automatic wallet detection...')
      const address = await this.autoDetectWalletFromUI()
      
      // 🔒 HIDE OVERLAY
      this.hideVerificationOverlay()
      
      if (address) {
        console.log('✅ Auto-detected wallet:', address)
        localStorage.setItem('xape_wallet_address', address)
        return address
      }
      
      console.warn('⚠️ No wallet address found')
      return null
    } catch (error) {
      // Make sure to hide overlay even on error
      this.hideVerificationOverlay()
      console.error('❌ Error getting wallet address:', error)
      return null
    }
  }
  
  async autoDetectWalletFromUI() {
    try {
      console.log('🎯 AUTO WALLET DETECTION STARTING...')
      console.log('🎯 Step 1: Finding SOL balance element...')
      
      // Find SOL balance element
      const solImages = document.querySelectorAll('img[alt="SOL"]')
      console.log(`Found ${solImages.length} SOL images`)
      
      let solBalanceDiv = null
      
      for (const img of solImages) {
        const parent = img.closest('.flex-row')
        if (parent && parent.querySelector('span.font-semibold')) {
          solBalanceDiv = parent
          console.log('✅ Found SOL balance parent with font-semibold')
          break
        }
      }
      
      if (!solBalanceDiv) {
        console.error('❌ Could not find SOL balance element with required classes')
        console.log('💡 TIP: Make sure you are on Axiom.trade and wallet is visible')
        return null
      }
      
      console.log('✅ Found SOL balance element, clicking...')
      solBalanceDiv.click()
      
      // Wait for popup to appear
      await new Promise(resolve => setTimeout(resolve, 800))
      
      console.log('🎯 Step 2: Finding Deposit button...')
      
      // Find Deposit button
      const allSpans = document.querySelectorAll('span')
      console.log(`Searching through ${allSpans.length} spans for Deposit button`)
      
      const depositButton = Array.from(allSpans).find(span => {
        const text = span.textContent.trim()
        const hasText = text === 'Deposit'
        const hasBackground = span.classList.contains('text-background')
        const hasBold = span.classList.contains('font-bold')
        
        if (hasText) {
          console.log(`Found "Deposit" text, classes: background=${hasBackground}, bold=${hasBold}`)
        }
        
        return hasText && hasBackground && hasBold
      })
      
      if (!depositButton) {
        console.error('❌ Could not find Deposit button with exact classes')
        console.log('🔍 Looking for any "Deposit" text...')
        
        const anyDeposit = Array.from(allSpans).find(s => s.textContent.trim() === 'Deposit')
        if (anyDeposit) {
          console.log('✅ Found Deposit text without exact classes, using it')
          anyDeposit.click()
        } else {
          console.error('❌ No Deposit button found at all')
          // Close popup
          const closeButtons = document.querySelectorAll('[class*="close"], button[aria-label="Close"]')
          closeButtons.forEach(btn => btn.click())
          return null
        }
      } else {
        console.log('✅ Found Deposit button with correct classes, clicking...')
        const depositContainer = depositButton.closest('button') || depositButton.parentElement
        if (depositContainer) {
          depositContainer.click()
        } else {
          depositButton.click()
        }
      }
      
      // Wait for address to appear
      await new Promise(resolve => setTimeout(resolve, 800))
      
      console.log('🎯 Step 3: Extracting wallet address...')
      console.log('🔍 Looking for Solana address pattern (32-44 chars)...')
      
      // Find wallet address span (looks for Solana address pattern)
      const addressSpan = Array.from(document.querySelectorAll('span')).find(span => {
        const text = span.textContent.trim()
        const isRightLength = text.length >= 32 && text.length <= 44
        const isBase58 = /^[1-9A-HJ-NP-Za-km-z]+$/.test(text)
        const hasBreakAll = span.classList.contains('break-all')
        
        if (isRightLength && isBase58) {
          console.log(`Found potential address: ${text.substring(0, 8)}... (length: ${text.length}, break-all: ${hasBreakAll})`)
        }
        
        return isRightLength && isBase58 && hasBreakAll
      })
      
      if (!addressSpan) {
        console.error('❌ Could not find wallet address with exact pattern')
        console.log('🔍 Looking for ANY address-like text...')
        
        const anyAddress = Array.from(document.querySelectorAll('span')).find(span => {
          const text = span.textContent.trim()
          return text.length >= 32 && text.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(text)
        })
        
        if (anyAddress) {
          const address = anyAddress.textContent.trim()
          console.log(`✅ Found address without break-all class: ${address}`)
          
          // Close popup
          await new Promise(resolve => setTimeout(resolve, 200))
          const closeButtons = document.querySelectorAll('[class*="close"], button[aria-label="Close"]')
          closeButtons.forEach(btn => btn.click())
          
          return address
        }
        
        console.error('❌ No address found at all!')
        // Close popup
        const closeButtons = document.querySelectorAll('[class*="close"], button[aria-label="Close"]')
        closeButtons.forEach(btn => btn.click())
        return null
      }
      
      const walletAddress = addressSpan.textContent.trim()
      console.log('✅ ✅ ✅ WALLET ADDRESS EXTRACTED:', walletAddress)
      
      // Close popup
      await new Promise(resolve => setTimeout(resolve, 200))
      const closeButtons = document.querySelectorAll('[class*="close"], button[aria-label="Close"]')
      closeButtons.forEach(btn => btn.click())
      
      return walletAddress
    } catch (error) {
      console.error('❌ ERROR IN AUTO-DETECTION:', error)
      console.error('Stack:', error.stack)
      return null
    }
  }
  
  async getContext() {
    
    const context = {
      marketData: {},
      coins: [],
      positions: [],
      redFlags: [],
      
      lastTradingAction: this.lastTradingAction, 
      lastTradingTime: this.lastTradingTime,
      lastTradingAmount: this.lastTradingAmount,
      
      // 👤 USER PROFILE - Always include user's name, gender, and title
      userName: localStorage.getItem('xape_user_name') || null,
      userGender: localStorage.getItem('xape_user_gender') || null,
      userTitle: localStorage.getItem('xape_user_title') || 'Sir'
    }

    context.pageType = this.detectPageType()
    context.url = window.location.href
    
    try {
      
      if (window.location.href.match(/\/meme\/[A-Za-z0-9]+$/)) {
        console.log('📊 XAPE: Extracting MAIN COIN from /meme/ page...')
        
        const mainCoin = { timestamp: Date.now() }
        
        const metricBoxes = Array.from(document.querySelectorAll('div.border.border-primaryStroke\\/50'))
        metricBoxes.forEach(box => {
          const label = box.querySelector('span.text-textTertiary.text-\\[12px\\]')
          const value = box.querySelector('span.text-\\[14px\\]')
          if (!label || !value) return
          
          const l = label.textContent.trim()
          const v = value.textContent.trim()
          
          if (l === 'Top 10 H.') mainCoin.top10HoldersPercent = parseFloat(v.replace('%', ''))
          if (l === 'Dev H.') mainCoin.devHoldersPercent = parseFloat(v.replace('%', ''))
          if (l === 'Snipers H.') mainCoin.snipersPercent = parseFloat(v.replace('%', ''))
          if (l === 'Insiders') mainCoin.insidersPercent = parseFloat(v.replace('%', ''))
          if (l === 'Bundlers') mainCoin.bundlersPercent = parseFloat(v.replace('%', ''))
          if (l === 'LP Burned') mainCoin.lpBurnedPercent = parseFloat(v.replace('%', ''))
          if (l === 'Holders') mainCoin.totalHolders = parseInt(v.replace(/,/g, ''))
          if (l === 'Pro Traders') mainCoin.proTradersCount = parseInt(v.replace(/,/g, ''))
          if (l === 'Dex Paid') mainCoin.dexPaidStatus = v
          if (l === 'Price') mainCoin.price = v
          if (l === 'Liquidity') mainCoin.liquidity = v
          if (l === 'Supply') mainCoin.supply = v
          if (l === 'Global Fees Paid') mainCoin.globalFeesPaid = v
        })
        
        Array.from(document.querySelectorAll('span')).some(s => {
          const t = s.textContent.trim()
          if (t.match(/^\$[\d.]+[KMB]$/)) {
            mainCoin.marketCap = t.replace('$', '')
            return true
          }
        })
        
        const nameDiv = document.querySelector('div.text-textPrimary.text-\\[16px\\]')
        if (nameDiv) mainCoin.name = nameDiv.textContent.trim()
        
        const timeBadge = document.querySelector('span[data-time-colored="true"]')
        if (timeBadge) mainCoin.age = timeBadge.textContent.trim()
        
        console.log('📊 ========== MAIN COIN DATA ==========')
        console.log('📊 Name:', mainCoin.name || 'Unknown')
        console.log('📊 Market Cap:', mainCoin.marketCap || 'N/A')
        console.log('📊 Price:', mainCoin.price || 'N/A')
        console.log('📊 Liquidity:', mainCoin.liquidity || 'N/A')
        console.log('📊 Supply:', mainCoin.supply || 'N/A')
        console.log('📊 Age:', mainCoin.age || 'N/A')
        console.log('📊 Top 10 Holders:', mainCoin.top10HoldersPercent + '%' || 'N/A')
        console.log('📊 Total Holders:', mainCoin.totalHolders || 'N/A')
        console.log('📊 Pro Traders:', mainCoin.proTradersCount || 'N/A')
        console.log('📊 Dex Paid:', mainCoin.dexPaidStatus || 'N/A')
        console.log('📊 Dev Holders:', mainCoin.devHoldersPercent + '%' || 'N/A')
        console.log('📊 Snipers:', mainCoin.snipersPercent + '%' || 'N/A')
        console.log('📊 Insiders:', mainCoin.insidersPercent + '%' || 'N/A')
        console.log('📊 Bundlers:', mainCoin.bundlersPercent + '%' || 'N/A')
        console.log('📊 LP Burned:', mainCoin.lpBurnedPercent + '%' || 'N/A')
        console.log('📊 ====================================')
        context.coins.push(mainCoin)
        context.redFlags = this.detectSuspiciousWalletPatterns([mainCoin])
      } else {
        
      const coinContainers = this.findAllCoinContainersForXape()
      console.log(`🔥 XAPE: Found ${coinContainers.length} coins on ${context.pageType} page - EXTRACTING ALL!`)
      
      // 🚀 NO LIMIT - XAPE SEES EVERYTHING!
      for (let idx = 0; idx < coinContainers.length; idx++) {
        try {
          const coinData = this.extractCoinDataFromContainer(coinContainers[idx])
          if (coinData && (coinData.name || coinData.address)) {
            context.coins.push(coinData)
            console.log(`✅ XAPE Coin ${idx + 1}/${coinContainers.length}:`, coinData.name || 'Unknown', '|', coinData.marketCap || 'No MC', '|', coinData.age || 'No age')
          }
        } catch (err) {
          console.warn(`⚠️ Failed to extract coin ${idx + 1}:`, err.message)
        }
      }
      console.log(`🔥 XAPE NOW SEES ALL ${context.coins.length} COINS - NO LIMITS!`)
      }
      
      console.log(`?? ? XAPE: Extracted ${context.coins.length} coins`)
      
      if (context.redFlags && context.redFlags.length > 0) {
        console.log(`?? XAPE: ${context.redFlags.length} red flags!`)
          context.redFlags.forEach(flag => console.log(`  ?? ${flag}`))
      }
    } catch (error) {
      console.error('? Could not extract coin data:', error)
    }
    
    return context
  }
  
  detectSuspiciousWalletPatterns(coins) {
    
    return window.detectSuspiciousWalletPatterns(coins)
  }
  
  detectPageType() {
    
    return window.detectPageType()
  }
  
  findAllCoinContainersForXape() {
    
    return window.findAllCoinContainersForXape()
  }
  
  extractCoinDataFromContainer(container) {
    
    return window.extractCoinDataFromContainer(container)
  }
  
  getCurrentSection(container) {
    
    return window.getCurrentSection(container)
  }
  
  correctPhoneticMishearings(transcript) {
    
    return window.correctPhoneticMishearings(transcript)
  }
  
  generateBasicResponse(command) {
    
    return window.generateBasicResponse(command)
  }
  
  speakResponse(text) {
    
    window.xapeSpeechContext.isListening = this.isListening
    window.xapeSpeechContext.recognition = this.recognition
    window.speakResponse(text, window.xapeSpeechContext)
  }
  
  executeControlAction(action) {
    console.log('?? Executing control action:', action.type)
    
    try {
      switch (action.type) {
        case 'hideSkillbar':
          
          const hideSkillbar = () => {
            const skillbar = document.querySelector('#axiom-skill-bar')
            if (skillbar) {
              skillbar.style.display = 'none'
              skillbar.style.visibility = 'hidden'
              skillbar.style.opacity = '0'
              skillbar.setAttribute('data-xape-hidden', 'true')
              console.log('? Skillbar hidden successfully')
              return true
            } else {
              console.log('?? Skillbar not found, will retry...')
              return false
            }
          }
          
          if (!hideSkillbar()) {
            
            setTimeout(() => {
              if (!hideSkillbar()) {
                console.log('? Skillbar not found after retry')
              }
            }, 100)
          }
          break
          
        case 'showSkillbar':
          
          const showSkillbar = () => {
            const skillbarToShow = document.querySelector('#axiom-skill-bar')
            if (skillbarToShow) {
              skillbarToShow.style.display = 'block'
              skillbarToShow.style.visibility = 'visible'
              skillbarToShow.style.opacity = '1'
              skillbarToShow.style.pointerEvents = 'auto'
              skillbarToShow.removeAttribute('data-xape-hidden')
              console.log('? Skillbar shown successfully (FORCED visible)')
              return true
            } else {
              console.log('?? Skillbar not found, will retry...')
              return false
            }
          }
          
          if (!showSkillbar()) {
            
            setTimeout(() => {
              if (!showSkillbar()) {
                console.log('? Skillbar not found after retry')
              }
            }, 100)
          }
          break
          
        case 'disableXCA':
          
          const xcaButton = document.querySelector('#xca-button-main')
          const xcaPanel = document.querySelector('#xca-tweets-panel')
          if (xcaButton) xcaButton.style.display = 'none'
          if (xcaPanel) xcaPanel.style.display = 'none'
          console.log('? XCA disabled temporarily')
          break
          
        case 'enableXCA':
          
          const xcaButtonToShow = document.querySelector('#xca-button-main')
          if (xcaButtonToShow) xcaButtonToShow.style.display = ''
          console.log('? XCA enabled temporarily')
          break
          
        case 'disableExtension':
          
          const allElements = document.querySelectorAll('#axiom-skill-bar, #xca-button-main, #xca-tweets-panel')
          allElements.forEach(el => el.style.display = 'none')
          console.log('? Extension disabled temporarily (XAPE still active)')
          break
          
        case 'enableExtension':
          
          const allElementsToShow = document.querySelectorAll('#axiom-skill-bar, #xca-button-main')
          allElementsToShow.forEach(el => el.style.display = '')
          console.log('? Extension enabled temporarily')
          break
          
        default:
          console.log('?? Unknown action type:', action.type)
      }
    } catch (error) {
      console.error('? Error executing control action:', error)
    }
  }
  
  pauseRecognitionForSpeech() {
    if (this.recognition && this.isListening) {
      console.log('?? Pausing recognition (XAPE speaking)')
      this.isSpeaking = true
      
      this.updateXapeStatus('SPEAKING', 'processing')
      
      try {
        this.recognition.stop()
      } catch (error) {
        
      }
    }
  }
  
  resumeRecognitionAfterSpeech() {
    if (this.isListening && this.isSpeaking) {
      console.log('?? Resuming recognition (XAPE finished)')
      this.isSpeaking = false
      
      setTimeout(() => {
        if (this.isListening && !this.isSpeaking) {
          try {
            this.recognition.start()
            console.log('? Recognition resumed')
            
            this.updateXapeStatus('LISTENING', 'listening')
          } catch (error) {
            console.log('Recognition already running')
            this.updateXapeStatus('LISTENING', 'listening')
          }
        }
      }, 500)
    }
  }
  
  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }
  
  initializeWaveform() {
    this.waveformCanvas = this.xapeVoiceModal.querySelector('#xape-waveform-canvas')
    this.waveformCtx = this.waveformCanvas.getContext('2d')
  }
  
  openXapeSettings() {
    
    alert('Settings panel coming soon! Here you will configure:\n\n- Your name\n- Telegram account\n- AI backend (OpenAI, Anthropic, Local LLM)\n- Notification preferences\n- Position monitoring thresholds')
  }

  removeExistingSkillbars() {
    const existingSkillbars = document.querySelectorAll("#axiom-skill-bar")
    existingSkillbars.forEach((skillbar) => {
      if (skillbar.parentNode) {
        skillbar.parentNode.removeChild(skillbar)
      }
    })
  }
  
  setupSkillbarGuardian(skillbarElement) {
    console.log('🛡️ Setting up Skillbar Guardian (anti-removal protection)...')

    if (this.skillbarGuardian) {
      this.skillbarGuardian.disconnect()
    }

    this.protectedSkillbar = skillbarElement

    this.skillbarGuardian = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          for (const removedNode of mutation.removedNodes) {
            if (removedNode === this.protectedSkillbar || removedNode.id === 'axiom-skill-bar') {
              console.log('🚨 GUARDIAN ALERT: Skillbar was removed! Re-inserting immediately...')

              if (this.protectedSkillbar && !this.protectedSkillbar.parentElement) {
                document.body.appendChild(this.protectedSkillbar)
                console.log('✅ Guardian successfully re-inserted skillbar!')

                this.protectedSkillbar.style.cssText = `
                  position: fixed !important;
                  bottom: 20px !important;
                  left: 50% !important;
                  right: auto !important;
                  top: auto !important;
                  transform: translateX(-50%) !important;
                  z-index: 200 !important;
                  width: auto !important;
                  max-width: 90vw !important;
                  display: flex !important;
                  flex-direction: row !important;
                  align-items: center !important;
                  justify-content: center !important;
                `
              }
            }
          }
        }
      }
    })

    this.skillbarGuardian.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    console.log('✅ Skillbar Guardian active - watching for removal attempts')
  }

  startContinuousVerification() {
    this.verificationInterval = setInterval(async () => {
      const sessionData = getSessionData()
      if (sessionData && sessionData.depositAddress) {
        const previousVerification = { ...this.isVerified }
        await this.verifyWithAPI(sessionData.depositAddress)
        setSessionData({
          ...sessionData,
          verified: { ...this.isVerified },
          timestamp: Date.now(),
        })

        const skillbarChanged = previousVerification.skillbar !== this.isVerified.skillbar
        const xcaChanged = previousVerification.xca !== this.isVerified.xca

        this.updateUIBasedOnVerification()

        if (xcaChanged) {
          if (this.isVerified.xca && !this.twitterScanner) {
            await this.initializeLocalTwitterScanner()
          } else if (!this.isVerified.xca && this.twitterScanner) {
            if (this.twitterScanner.updateVerificationStatus) {
              this.twitterScanner.updateVerificationStatus(false)
            }
          }
        }
      } else {
        this.isVerified = { skillbar: true, xca: false }
        this.updateUIBasedOnVerification()
      }
    }, 30000)
  }

  initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      
    }
  }

  playKeySound() {
    if (!this.config.soundEnabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.1)
    } catch (error) {
      
    }
  }

  async extractDepositAddressAndVerifyOnce() {
    const sessionData = getSessionData()

    if (sessionData && sessionData.timestamp) {
      const hoursSinceLastCheck = (Date.now() - sessionData.timestamp) / (1000 * 60 * 60)

      if (hoursSinceLastCheck < 24) {
        if (sessionData.depositAddress) {
          this.depositAddress = sessionData.depositAddress
          this.isVerified = sessionData.verified || { skillbar: true, xca: false }
        } else {
          this.isVerified = { skillbar: true, xca: false }
        }

        this.updateUIBasedOnVerification()

        if (this.isVerified.xca) {
          await this.initializeLocalTwitterScanner()
        }
        return
      }
    }

    this.showLoadingOverlay()

    try {
      await this.waitForPageLoad()
      const depositAddress = await this.clickDepositAndExtractAddress()

      if (depositAddress) {
        this.depositAddress = depositAddress
        await this.verifyWithAPI(depositAddress)
        setSessionData({
          depositAddress: depositAddress,
          verified: { ...this.isVerified },
          timestamp: Date.now(),
        })
      } else {
        this.isVerified = { skillbar: true, xca: false }
        setSessionData({
          depositAddress: null,
          verified: { ...this.isVerified },
          timestamp: Date.now(),
        })
      }
    } catch (error) {
      this.isVerified = { skillbar: true, xca: false }
      setSessionData({
        depositAddress: null,
        verified: { ...this.isVerified },
        timestamp: Date.now(),
      })
    } finally {
      this.hideLoadingOverlay()
      this.updateUIBasedOnVerification()

      if (this.isVerified.xca) {
        await this.initializeLocalTwitterScanner()
      }
    }
  }

  showLoadingOverlay() {
    this.isLoading = true

    const overlay = document.createElement("div")
    overlay.id = "skillbar-loading-overlay"
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.95) !important;
      z-index: 9000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      backdrop-filter: blur(10px) !important;
    `

    overlay.innerHTML = `
      <div style="text-align: center; color: white;">
        <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #00bfff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Verifying Access</div>
        <div style="font-size: 14px; opacity: 0.7;">Checking token holdings...</div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `

    document.body.appendChild(overlay)
  }

  hideLoadingOverlay() {
    this.isLoading = false
    const overlay = document.getElementById("skillbar-loading-overlay")
    if (overlay) {
      overlay.remove()
    }
  }

  waitForPageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === "complete") {
        setTimeout(resolve, 1000)
      } else {
        window.addEventListener("load", () => {
          setTimeout(resolve, 1000)
        })
      }
    })
  }

  async clickDepositAndExtractAddress() {
    try {
      let depositButton = null

      const buttons = document.querySelectorAll("button")
      for (const button of buttons) {
        const spans = button.querySelectorAll("span")
        for (const span of spans) {
          if (span.textContent.trim() === "Deposit") {
            depositButton = button
            break
          }
        }
        if (depositButton) break
      }

      if (!depositButton) {
        depositButton = document.querySelector("button.bg-primaryBlue")
      }

      if (!depositButton) {
        const depositSpans = Array.from(document.querySelectorAll("span")).filter(
          (span) => span.textContent.trim() === "Deposit",
        )
        if (depositSpans.length > 0) {
          depositButton = depositSpans[0].closest("button")
        }
      }

      if (depositButton) {
        depositButton.click()
        await new Promise((resolve) => setTimeout(resolve, 1500))

        let extractedAddress = null

        const addressContainers = document.querySelectorAll(
          "div.flex.flex-row.w-full.justify-start.items-start.break-all",
        )
        for (const container of addressContainers) {
          const span = container.querySelector("span.text-textSecondary")
          if (span) {
            const address = span.textContent.trim()
            if (this.isValidSolanaAddress(address)) {
              extractedAddress = address
              break
            }
          }
        }

        if (!extractedAddress) {
          const breakAllSpans = document.querySelectorAll("span.break-all")
          for (const span of breakAllSpans) {
            const address = span.textContent.trim()
            if (this.isValidSolanaAddress(address)) {
              extractedAddress = address
              break
            }
          }
        }

        if (!extractedAddress) {
          const secondarySpans = document.querySelectorAll("span.text-textSecondary")
          for (const span of secondarySpans) {
            const address = span.textContent.trim()
            if (this.isValidSolanaAddress(address)) {
              extractedAddress = address
              break
            }
          }
        }

        if (!extractedAddress) {
          const allSpans = document.querySelectorAll("span")
          for (const span of allSpans) {
            const text = span.textContent.trim()
            if (this.isValidSolanaAddress(text)) {
              extractedAddress = text
              break
            }
          }
        }

        if (extractedAddress) {
          await this.closeDepositModal()
        }

        return extractedAddress
      }

      return null
    } catch (error) {
      return null
    }
  }

  async closeDepositModal() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      let closeButton = document.querySelector("button i.ri-close-line")
      if (closeButton) {
        closeButton = closeButton.closest("button")
      }

      if (!closeButton) {
        const buttons = document.querySelectorAll("button")
        for (const button of buttons) {
          if (button.textContent.includes("??") || button.textContent.includes("???")) {
            closeButton = button
            break
          }
        }
      }

      if (!closeButton) {
        const closeSelectors = [
          "button[class*='close']",
          "button[aria-label*='close']",
          "button[aria-label*='Close']",
          ".group.flex.flex-row button",
        ]

        for (const selector of closeSelectors) {
          closeButton = document.querySelector(selector)
          if (closeButton) {
            break
          }
        }
      }

      if (!closeButton) {
        const specificCloseButtons = document.querySelectorAll(
          "button.group.flex.flex-row.p-\\[4px\\].w-\\[24px\\].h-\\[24px\\]",
        )
        for (const button of specificCloseButtons) {
          const icon = button.querySelector("i.ri-close-line")
          if (icon) {
            closeButton = button
            break
          }
        }
      }

      if (closeButton) {
        closeButton.click()
        await new Promise((resolve) => setTimeout(resolve, 300))
      } else {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    } catch (error) {
      
    }
  }

  isValidSolanaAddress(address) {
    if (!address || typeof address !== "string") return false

    const cleaned = address.trim()

    if (cleaned.length < 32 || cleaned.length > 44) return false

    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
    if (!base58Regex.test(cleaned)) return false

    if (cleaned.includes("...") || cleaned.includes(" ")) return false

    if (!cleaned.match(/^[1-9A-HJ-NP-Za-km-z]/)) return false

    return true
  }

  async verifyWithAPI(depositAddress) {
    
    this.isVerified = {
      skillbar: true, 
      xca: false, 
    };
    this.updateUIBasedOnVerification();
  }

  updateUIBasedOnVerification() {
    if (!this.skillBar) return

    const skillButtons = this.skillBar.querySelectorAll(".skill-button:not(.settings-button)")
    skillButtons.forEach((button) => {
      button.style.opacity = "1"
      button.style.pointerEvents = "auto"
      button.style.filter = "none"
      button.style.cursor = "pointer"
      button.removeAttribute("title")
    })

    const settingsButton = this.skillBar.querySelector(".settings-button")
    if (settingsButton) {
      settingsButton.style.opacity = "1"
      settingsButton.style.pointerEvents = "auto"
      settingsButton.style.filter = "none"
      settingsButton.style.cursor = "pointer"
      settingsButton.removeAttribute("title")
    }

    if (window.xcaInstance && window.xcaInstance.updateVerificationStatus) {
      window.xcaInstance.updateVerificationStatus(this.isVerified.xca)
    }

    if (this.isVerified.xca && !this.twitterScanner) {
      this.initializeLocalTwitterScanner()
    }
  }

  showDoubleClickFeedback(buttonElement, action, value) {
    if (!this.config.doubleClickEnabled) return

    const popup = document.createElement("div")
    popup.style.cssText = `
      position: fixed !important;
      background: rgba(0, 0, 0, 0.9) !important;
      color: #ffffff !important;
      padding: 8px 12px !important;
      border-radius: 8px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      z-index: 150 !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      backdrop-filter: blur(10px) !important;
      pointer-events: none !important;
      animation: fadeInOut 2s ease-out forwards !important;
    `

    const rect = buttonElement.getBoundingClientRect()
    popup.style.left = `${rect.right + 10}px`
    popup.style.top = `${rect.top}px`

    popup.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px;">
        <span>???????</span>
        <span>Press 2x for ${action.toUpperCase()} ${value}${action === "sell" ? "%" : " SOL"}</span>
      </div>
    `

    document.body.appendChild(popup)

    setTimeout(() => {
      if (popup.parentNode) {
        popup.remove()
      }
    }, 2000)
  }

  handleKeyPress(key, buttonElement = null, action = null, value = null) {
    const now = Date.now()

    if (this.config.doubleClickEnabled) {
      if (this.lastKeyPress.key === key && now - this.lastKeyPress.time < this.doubleClickDelay) {
        this.lastKeyPress = { key: null, time: 0 }
        return true
      } else {
        this.lastKeyPress = { key, time: now }
        if (buttonElement && action && value) {
          this.showDoubleClickFeedback(buttonElement, action, value)
        }
        return false
      }
    } else {
      return true
    }
  }

  handleGlobalXCAToggle(enabled) {
    if (enabled) {
      if (this.config.xcaEnabled && this.isVerified.xca) {
        this.initializeLocalTwitterScanner()
      }
    } else {
      if (this.twitterScanner) {
        this.twitterScanner.destroy()
        this.twitterScanner = null
      }
    }
  }

  async checkGlobalExtensionStatus() {
    try {
      if (chrome && chrome.storage) {
        const result = await chrome.storage.local.get(["extensionEnabled", "xcaEnabled"])
        const globalEnabled = result.extensionEnabled !== false
        const xcaEnabled = result.xcaEnabled !== false
        return { globalEnabled, xcaEnabled }
      } else {
        return { globalEnabled: true, xcaEnabled: true }
      }
    } catch (error) {
      return { globalEnabled: true, xcaEnabled: true }
    }
  }

  setupMessageListener() {
    if (chrome && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "extensionToggled") {
          if (message.data.enabled) {
            this.enableSkillbar()
          } else {
            this.disableSkillbar()
          }
          sendResponse({ success: true })
        }
        return true
      })
    }
  }

  enableSkillbar() {
    if (!this.skillBar) {
      this.createSkillBar()
      this.setupEventListeners()
    } else {
      this.showSkillBar()
    }
    this.initializeLocalTwitterScanner()
  }

  disableSkillbar() {
    this.destroyAllComponents()
  }

  destroyAllComponents() {
    
    if (this.skillbarGuardian) {
      console.log('🛡️ Disconnecting Skillbar Guardian...')
      this.skillbarGuardian.disconnect()
      this.skillbarGuardian = null
      this.protectedSkillbar = null
    }
    
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval)
      this.verificationInterval = null
    }

    if (this.skillBar && this.skillBar.parentNode) {
      this.skillBar.parentNode.removeChild(this.skillBar)
      this.skillBar = null
    }

    if (this.twitterScanner && this.twitterScanner.destroy) {
      this.twitterScanner.destroy()
      this.twitterScanner = null
    }

    if (this.marketCapObserver) {
      this.marketCapObserver.disconnect()
      this.marketCapObserver = null
    }
    
    if (this.periodicRescanInterval) {
      clearInterval(this.periodicRescanInterval)
      this.periodicRescanInterval = null
    }
    
    if (this.contentChangeObserver) {
      this.contentChangeObserver.disconnect()
      this.contentChangeObserver = null
    }
    
    if (this.aggressiveRefreshInterval) {
      clearInterval(this.aggressiveRefreshInterval)
      this.aggressiveRefreshInterval = null
    }

    if (this.heatmapUpdateInterval) {
      clearInterval(this.heatmapUpdateInterval)
      this.heatmapUpdateInterval = null
    }

    if (this.holderMonitoringInterval) {
      clearInterval(this.holderMonitoringInterval)
      this.holderMonitoringInterval = null
    }
    
    if (this.holderHeartbeatInterval) {
      clearInterval(this.holderHeartbeatInterval)
      this.holderHeartbeatInterval = null
    }
    
    if (this.holderCountObserver) {
      this.holderCountObserver.disconnect()
      this.holderCountObserver = null
    }
    
    if (this.holderUpdateTimeout) {
      clearTimeout(this.holderUpdateTimeout)
      this.holderUpdateTimeout = null
    }
    
    if (this.holderTracker) {
      this.holderTracker.clear()
      this.holderTracker = null
    }
    
    if (this.activeHolderEffects) {
      this.activeHolderEffects.clear()
      this.activeHolderEffects = null
    }

    const marketCapElements = [
      '#market-cap-filter-toggle',
      '#market-cap-legend', 
      '#market-cap-stats'
    ]
    
    marketCapElements.forEach(selector => {
      const element = document.querySelector(selector)
      if (element) {
        element.remove()
      }
    })

    if (this.tradingAgent) {
      this.tradingAgent.destroy()
      this.tradingAgent = null
    }

    if (this.cabalMonitor && this.cabalMonitor.destroy) {
      this.cabalMonitor.destroy()
      this.cabalMonitor = null
    }

    if (this.timeGrouping && this.timeGrouping.destroy) {
      this.timeGrouping.destroy()
      this.timeGrouping = null
    }

  }

  showSkillBar() {
    if (this.skillBar) {
      this.skillBar.style.display = "block"
    }
  }

  hideSkillBar() {
    if (this.skillBar) {
      this.skillBar.style.display = "none"
    }
  }

  async initializeLocalTwitterScanner() {
    try {
      const { globalEnabled, xcaEnabled } = await this.checkGlobalExtensionStatus()

      if (!globalEnabled || !xcaEnabled || !this.config.xcaEnabled) {
        return
      }

      if (window.TwitterScanner && !this.twitterScanner) {
        this.twitterScanner = new window.TwitterScanner()

        if (window.xcaInstance && window.xcaInstance.updateVerificationStatus) {
          window.xcaInstance.updateVerificationStatus(this.isVerified.xca)
        }
      } else if (this.twitterScanner) {
        if (window.xcaInstance && window.xcaInstance.updateVerificationStatus) {
          window.xcaInstance.updateVerificationStatus(this.isVerified.xca)
        }
      }
    } catch (error) {
      
    }
  }

  loadConfig() {
    try {
      const savedConfig = localStorage.getItem("axiomSkillBarConfig")
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig)
        this.config = { ...this.config, ...parsed }

        if (this.config.xcaEnabled === false) {
          this.config.xcaEnabled = true
          localStorage.setItem("axiomSkillBarConfig", JSON.stringify(this.config))
        }
      } else {
        this.config.xcaEnabled = true
      }
    } catch (e) {
      this.config.xcaEnabled = true
    }
  }

  async saveConfig() {
    try {
      localStorage.setItem("axiomSkillBarConfig", JSON.stringify(this.config))

      const { globalEnabled, xcaEnabled } = await this.checkGlobalExtensionStatus()
      if (globalEnabled && xcaEnabled) {
        if (this.config.xcaEnabled && !this.twitterScanner && this.isVerified.xca) {
          await this.initializeLocalTwitterScanner()
        } else if (!this.config.xcaEnabled && this.twitterScanner && this.twitterScanner.updateVerificationStatus) {
          this.twitterScanner.updateVerificationStatus(false)
        }
      }
    } catch (e) {
      
    }
  }

  createSkillBar() {
    
    localStorage.removeItem("axiomSkillBarPosition")
    console.log('🔥 FORCED CLEAR: Removed any saved skillbar position from localStorage')
    
    const existingInDom = document.getElementById('axiom-skill-bar')
    if (existingInDom && this.skillBar && existingInDom === this.skillBar) {
      console.log('✅ Skillbar already exists and is valid, skipping creation')
      return
    }
    
    if (existingInDom && existingInDom !== this.skillBar) {
      console.log('🗑️ Removing orphaned skillbar element (not our instance)')
      existingInDom.remove()
    }

    console.log('🔧 CREATING SKILLBAR...')
    
    this.skillBar = null
    
    this.skillBar = document.createElement("div")
    this.skillBar.id = "axiom-skill-bar"
    console.log('✅ Skillbar element created with ID:', this.skillBar.id)

    console.log('📝 Setting skillbar HTML...')
    this.skillBar.innerHTML = `
<div class="skill-bar-main">
  <div class="skill-bar-container">
    <div class="drag-handle">
      <div class="drag-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
    
    <div class="skill-button settings-button" id="settings-toggle" onclick="window.openSettings && window.openSettings()" style="pointer-events: auto !important; cursor: pointer !important; z-index: 150 !important; position: relative !important;">
      <div class="skill-button-value" style="font-size: 18px; font-weight: bold; pointer-events: auto !important; cursor: pointer !important;">⚙️</div>
    </div>
    
    ${this.config.buyAmounts
      .map(
        (amount, index) => `
      <div class="skill-button buy-button" data-action="buy" data-value="${amount}" data-hotkey="${this.config.buyHotkeys[index]}">
        <div class="skill-button-value">${amount}</div>
        <div class="skill-button-hotkey">${this.config.buyHotkeys[index].toUpperCase()}</div>
      </div>
    `,
      )
      .join("")}
    
    ${this.config.sellPercentages
      .map(
        (percentage, index) => `
      <div class="skill-button sell-button" data-action="sell" data-value="${percentage}" data-hotkey="${this.config.sellHotkeys[index]}">
        <div class="skill-button-value">${percentage}%</div>
        <div class="skill-button-hotkey">${this.config.sellHotkeys[index].toUpperCase()}</div>
      </div>
    `,
      )
      .join("")}
  </div>

  <div class="settings-dropdown" id="settings-dropdown" style="display: none;">
    <div class="settings-header">
      <span>CUSTOMIZE CONTROLS</span>
      <button class="settings-close-btn">&times;</button>
    </div>
    <div class="settings-content">
      <div class="settings-section">
        <div class="settings-section-header">
          <span class="title">Sound Effects</span>
          <span class="description">Play sound when keys are pressed</span>
        </div>
        <div class="settings-section-control">
          <label class="switch">
            <input type="checkbox" id="soundToggle" ${this.config.soundEnabled ? "checked" : ""}>
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-header">
          <span class="title">Double-Click Mode</span>
          <span class="description">Require double key press to execute</span>
        </div>
        <div class="settings-section-control">
          <label class="switch">
            <input type="checkbox" id="doubleClickToggle" ${this.config.doubleClickEnabled ? "checked" : ""}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
      
      <div class="settings-section-title">BUY AMOUNTS (SOL)</div>
      <div class="settings-grid">
        ${this.config.buyAmounts
          .map(
            (amount, index) => `
          <div class="settings-grid-item">
            <input type="text" class="hotkey-input" id="buy-hotkey-${index}" value="${this.config.buyHotkeys[index].toUpperCase()}" maxlength="1">
            <input type="number" class="amount-input" id="buy-amount-${index}" step="0.01" min="0" value="${amount}">
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="settings-section-title">SELL PERCENTAGES (%)</div>
      <div class="settings-grid">
        ${this.config.sellPercentages
          .map(
            (percentage, index) => `
          <div class="settings-grid-item">
            <input type="text" class="hotkey-input" id="sell-hotkey-${index}" value="${this.config.sellHotkeys[index].toUpperCase()}" maxlength="1">
            <input type="number" class="amount-input" id="sell-percentage-${index}" min="1" max="100" value="${percentage}">
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="settings-footer">
        <button id="apply-settings" style="flex: 1; padding: 8px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #fff; font-weight: 500; font-size: 10px; cursor: pointer; transition: all 0.2s ease;">APPLY</button>
        <button id="cancel-settings" style="flex: 1; padding: 8px 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; color: #888; font-weight: 500; font-size: 10px; cursor: pointer; transition: all 0.2s ease;">CANCEL</button>
      </div>

      <div id="validation-message" style="margin-top: 8px; padding: 6px; background: rgba(255, 100, 100, 0.1); border: 1px solid rgba(255, 100, 100, 0.3); border-radius: 3px; color: #ff6666; font-size: 9px; text-align: center; display: none;">?????? Duplicate keys detected! Each key must be unique.</div>
    </div>
  </div>
</div>
`

    console.log('🎯 Setting skillbar CENTER position IMMEDIATELY with cssText...')
    
    this.skillBar.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      left: 50% !important;
      right: auto !important;
      top: auto !important;
      transform: translateX(-50%) !important;
      z-index: 9000 !important;
      width: auto !important;
      max-width: 90vw !important;
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: center !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transition: none !important;
    `
    console.log('✅ Skillbar positioned at CENTER (before append) - LOCKED WITH cssText!')

    console.log('📍 APPENDING SKILLBAR TO BODY...')
    
    try {
      
      const skillbarElement = this.skillBar
      
      document.body.appendChild(this.skillBar)
      console.log('✅ Skillbar appended to body!')
      
      const immediateCheck = document.getElementById('axiom-skill-bar')
      if (immediateCheck) {
        console.log('✅ IMMEDIATE CHECK: Skillbar is in DOM!')
        
        console.log('✅ Skillbar position already locked to CENTER from creation!')
      } else {
        console.error('❌ IMMEDIATE CHECK: Skillbar NOT in DOM!')
      }
      
      this.setupSkillbarGuardian(skillbarElement)

      setTimeout(() => {
        const verifyElement = document.getElementById('axiom-skill-bar')
        if (verifyElement) {
          console.log('✅✅✅ SYNC CHECK: Skillbar STILL in DOM!')
          console.log('   → Parent:', verifyElement.parentElement?.tagName)
          console.log('   → ID:', verifyElement.id)
          console.log('   → Display:', window.getComputedStyle(verifyElement).display)
          console.log('   → Visibility:', window.getComputedStyle(verifyElement).visibility)
          console.log('   → Opacity:', window.getComputedStyle(verifyElement).opacity)
          console.log('   → Height:', verifyElement.offsetHeight)
          
          console.log('🔒 RE-FORCING SKILLBAR CENTER POSITION (immediate)...')
          verifyElement.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            left: 50% !important;
            right: auto !important;
            top: auto !important;
            transform: translateX(-50%) !important;
            z-index: 200 !important;
            width: auto !important;
            max-width: 90vw !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: center !important;
          `
          console.log('✅ Skillbar position RE-LOCKED to CENTER!')
          
          setTimeout(() => {
            const finalLock = document.getElementById('axiom-skill-bar')
            if (finalLock) {
              console.log('🔒 FINAL CENTER LOCK...')
              finalLock.style.cssText = `
                position: fixed !important;
                bottom: 20px !important;
                left: 50% !important;
                right: auto !important;
                top: auto !important;
                transform: translateX(-50%) !important;
                z-index: 200 !important;
                width: auto !important;
                max-width: 90vw !important;
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                justify-content: center !important;
              `
              console.log('✅ FINAL LOCK COMPLETE!')
              
              console.log('🔧 RE-SETTING UP SETTINGS BUTTON (after skillbar is stable)...')
              this.setupSettingsButton()
            }
          }, 0) 
    } else {
          console.error('❌❌❌ 100ms CHECK: Skillbar WAS REMOVED FROM DOM!')
          console.error('   → Something deleted the skillbar between append and now!')
          console.error('   → Checking if element still exists:', skillbarElement)
          console.error('   → Element parent:', skillbarElement.parentElement)
          
          console.log('🔄 Forcing re-append via guardian...')
          if (skillbarElement && !skillbarElement.parentElement) {
          document.body.appendChild(skillbarElement)
          }
        }
      }, 0)
      
    } catch (error) {
      console.error('❌❌❌ FAILED TO APPEND SKILLBAR:', error)
      throw error
    }
    
    this.setupSkillBarEvents()
    this.setupSoundToggle()
    this.setupDoubleClickToggle()

    setTimeout(() => {
      this.updateUIBasedOnVerification()
    }, 100)

    const style = document.createElement("style")
    style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-5px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-5px); }
    }
  `
    document.head.appendChild(style)
  }

  setupSoundToggle() {
    const soundToggle = document.getElementById("soundToggle")

    if (soundToggle) {
      if (this.config.soundEnabled) {
        soundToggle.checked = true
      } else {
        soundToggle.checked = false
      }

      soundToggle.addEventListener("change", (e) => {
        this.config.soundEnabled = e.target.checked
        this.saveConfig()
        this.showFeedback(`???? Sound ${e.target.checked ? "ENABLED" : "DISABLED"}`, "buy")
      })
    }
  }

  setupDoubleClickToggle() {
    const doubleClickToggle = document.getElementById("doubleClickToggle")

    if (doubleClickToggle) {
      if (this.config.doubleClickEnabled) {
        doubleClickToggle.checked = true
      } else {
        doubleClickToggle.checked = false
      }

      doubleClickToggle.addEventListener("change", (e) => {
        this.config.doubleClickEnabled = e.target.checked
        this.saveConfig()
        this.showFeedback(`??????? Double-Click ${e.target.checked ? "ENABLED" : "DISABLED"}`, "buy")
      })
    }
  }

  setupSkillBarEvents() {
    console.log('🚀🚀🚀 setupSkillBarEvents() CALLED! 🚀🚀🚀')
    
    this.skillBar.querySelectorAll(".skill-button:not(#settings-toggle)").forEach((button) => {
      button.addEventListener("click", (e) => {
        
        const isTradingPage = window.location.href.match(/\/meme\/[A-Za-z0-9]+/)
        if (!isTradingPage) {
          console.log('⚠️ Trading button clicked on non-trading page')
          this.showFeedback("⚠️ Skillbar works only on trading pages", "sell")
          e.preventDefault()
          return
        }
        this.handleSkillClick(e.target.closest(".skill-button"))
      })
    })

    this.setupSettingsButton()
  }

  setupSettingsButton() {
    
    console.log('🔍 DEBUG: Looking for settings button...')
    console.log('🔍 DEBUG: this.skillBar:', this.skillBar)
    
    const settingsButton = (this.skillBar ? this.skillBar.querySelector("#settings-toggle") : null) || 
                           (this.skillBar ? this.skillBar.querySelector(".settings-button") : null) ||
                           document.getElementById("settings-toggle") ||
                           document.querySelector("#settings-toggle")
    
    console.log('🔍 DEBUG: Settings button found?', !!settingsButton)
    if (settingsButton) {
      console.log('🔍 DEBUG: Settings button element:', settingsButton)
      console.log('🔍 DEBUG: Settings button ID:', settingsButton.id)
      console.log('🔍 DEBUG: Settings button class:', settingsButton.className)
      console.log('🔍 DEBUG: Settings button HTML:', settingsButton.outerHTML)
      console.log('🔍 DEBUG: Settings button parent:', settingsButton.parentElement)
      
      const newButton = settingsButton.cloneNode(true)
      settingsButton.parentNode.replaceChild(newButton, settingsButton)
      
      console.log('✅ Button cloned and replaced, adding listeners...')
      
      const clickHandler = (e) => {
        console.log('🚨🚨🚨🚨🚨 SETTINGS CLICKED! 🚨🚨🚨🚨🚨')
        console.log('🔍 Event type:', e.type)
        console.log('🔍 Clicked element:', e.target)
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        
        const isTradingPage = window.location.href.match(/\/meme\/[A-Za-z0-9]+/)
        if (!isTradingPage) {
          console.log('⚠️ Settings clicked on non-trading page')
          this.showFeedback("⚠️ Skillbar works only on trading pages", "sell")
          return
        }
        
        console.log('📢 Calling toggleSettings()...')
        this.toggleSettings()
        console.log('✅ toggleSettings() called!')
      }
      
      console.log('➕ Adding click listener to button...')
      newButton.addEventListener("click", clickHandler, { capture: true })
      
      const children = newButton.querySelectorAll('*')
      console.log(`➕ Found ${children.length} children, adding listeners...`)
      children.forEach((child, index) => {
        child.addEventListener("click", clickHandler, { capture: true })
        console.log(`✅ Added listeners to child ${index}:`, child.tagName, child.className)
      })
      
      newButton.style.pointerEvents = 'auto'
      newButton.style.cursor = 'pointer'
      newButton.style.zIndex = '150' 
      newButton.style.position = 'relative' 
      
      children.forEach(child => {
        child.style.pointerEvents = 'auto'
        child.style.cursor = 'pointer'
      })
      
      console.log('✅ Set pointerEvents, cursor, and z-index')
      
      window._settingsButton = newButton
      
      window.openSettings = () => {
        console.log('🚨🚨🚨 ONCLICK HANDLER TRIGGERED! 🚨🚨🚨')
        this.toggleSettings()
      }
      console.log('✅ Created window.openSettings() function')
      
      console.log('✅ Settings button ready - click the "?" to open settings')
      
      console.log('✅✅✅ ULTRA AGGRESSIVE LISTENERS ADDED TO BUTTON AND ALL CHILDREN!')
    } else {
      console.error('❌❌❌ Settings button NOT FOUND!')
      console.error('Available buttons:', this.skillBar.querySelectorAll('.skill-button'))
      console.error('All elements in skillbar:', this.skillBar.querySelectorAll('*'))
    }
  }

  toggleSettings() {
    console.log('🔧🔧🔧 toggleSettings() CALLED! 🔧🔧🔧')
    console.log('🔍 Current settingsOpen:', this.settingsOpen)
    
    this.settingsOpen = !this.settingsOpen
    console.log('🔍 New settingsOpen:', this.settingsOpen)
    
    const dropdown = document.getElementById("settings-dropdown")
    const settingsButton = document.getElementById("settings-toggle")

    console.log('🔍 Dropdown element:', dropdown)
    console.log('🔍 Settings button element:', settingsButton)

    if (!dropdown) {
      console.error('❌❌❌ Settings dropdown not found in DOM!')
      console.error('All elements with "settings":', document.querySelectorAll('[id*="settings"], [class*="settings"]'))
      return
    }

    if (this.settingsOpen) {
      console.log('⚙️⚙️⚙️ OPENING settings dropdown...')
      
      dropdown.style.cssText = `
        position: fixed !important;
        bottom: 80px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: 380px !important;
        min-width: 380px !important;
        background: rgba(0, 0, 0, 0.15) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(0, 191, 255, 0.4) !important;
        border-radius: 16px !important;
        box-shadow: 
          0 0 20px rgba(0, 191, 255, 0.3),
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 0 1px 2px rgba(255, 255, 255, 0.1) !important;
        z-index: 150 !important;
        height: auto !important;
        max-height: 70vh !important;
        overflow-y: auto !important;
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        flex-direction: column !important;
        padding: 20px !important;
        animation: expand-up 0.3s ease-out forwards !important;
      `
      
      if (settingsButton) {
        settingsButton.style.background = "linear-gradient(145deg, rgba(100, 100, 120, 0.9), rgba(60, 60, 80, 0.9)) !important"
      }

      console.log('✅ Settings dropdown display:', dropdown.style.display)
      console.log('✅ Settings dropdown visibility:', dropdown.style.visibility)
      console.log('✅ Settings dropdown opacity:', dropdown.style.opacity)
      console.log('✅ Settings dropdown z-index:', dropdown.style.zIndex)
      console.log('✅✅✅ Settings dropdown should be VISIBLE now!')

      this.setupSettingsEvents()
      
      if (this.clickOutsideListener) {
        document.removeEventListener('click', this.clickOutsideListener)
      }
      
      this.clickOutsideListener = (e) => {
        const isClickInsideDropdown = dropdown.contains(e.target)
        const isClickOnSettingsButton = e.target.closest('#settings-toggle')
        
        console.log('🔍 Click detected:', {
          insideDropdown: isClickInsideDropdown,
          onSettingsButton: isClickOnSettingsButton,
          target: e.target
        })
        
        if (!isClickInsideDropdown && !isClickOnSettingsButton) {
          console.log('✅ Clicking outside - closing dropdown')
          this.toggleSettings()
        }
      }
      
      setTimeout(() => {
        document.addEventListener('click', this.clickOutsideListener)
        console.log('✅ Click-outside listener added')
      }, 100)
    } else {
      console.log('⚙️ CLOSING settings dropdown...')
      
      if (this.clickOutsideListener) {
        document.removeEventListener('click', this.clickOutsideListener)
        this.clickOutsideListener = null
        console.log('✅ Click-outside listener removed')
      }
      
      dropdown.style.cssText = `
        position: fixed !important;
        bottom: 80px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: 380px !important;
        min-width: 380px !important;
        background: rgba(0, 0, 0, 0.15) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(0, 191, 255, 0.4) !important;
        border-radius: 16px !important;
        box-shadow: 
          0 0 20px rgba(0, 191, 255, 0.3),
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 0 1px 2px rgba(255, 255, 255, 0.1) !important;
        z-index: 150 !important;
        height: auto !important;
        max-height: 70vh !important;
        overflow-y: auto !important;
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        flex-direction: column !important;
        padding: 20px !important;
        animation: collapse-down 0.2s ease-in forwards !important;
      `
      
      if (settingsButton) {
        settingsButton.style.background = "linear-gradient(145deg, rgba(100, 100, 120, 0.9), rgba(60, 60, 80, 0.9)) !important"
      }
      
      console.log('✅ Settings dropdown CLOSED')
    }
  }

  setupSettingsEvents() {
    const applyBtn = document.getElementById("apply-settings")
    const cancelBtn = document.getElementById("cancel-settings")
    const closeBtn = this.skillBar.querySelector(".settings-close-btn")

    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        this.applySettings()
        this.toggleSettings()
      })
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.toggleSettings()
      })
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.toggleSettings()
      })
    }

    this.setupInputFocusEffects()
  }

  setupInputFocusEffects() {
    const inputs = document.querySelectorAll("#settings-dropdown input")
    inputs.forEach((input) => {
      input.addEventListener("focus", (e) => {
        e.target.style.borderColor = "rgba(255, 255, 255, 0.4)"
        e.target.style.background = "rgba(255, 255, 255, 0.08)"
        e.target.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.1)"
      })

      input.addEventListener("blur", (e) => {
        e.target.style.borderColor = e.target.id.includes("hotkey")
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(255, 255, 255, 0.15)"
        e.target.style.background = e.target.id.includes("hotkey")
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(255, 255, 255, 0.05)"
        e.target.style.boxShadow = "none"
      })

      if (input.id.includes("hotkey")) {
        input.addEventListener("input", (e) => {
          e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
          this.validateHotkeys()
        })
      }
    })

    const buttons = document.querySelectorAll("#settings-dropdown button")
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", (e) => {
        if (e.target.id === "apply-settings") {
          e.target.style.background = "rgba(255, 255, 255, 0.15)"
          e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"
        } else {
          e.target.style.background = "rgba(255, 255, 255, 0.08)"
          e.target.style.borderColor = "rgba(255, 255, 255, 0.15)"
        }
      })

      button.addEventListener("mouseleave", (e) => {
        if (e.target.id === "apply-settings") {
          e.target.style.background = "rgba(255, 255, 255, 0.1)"
          e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"
        } else {
          e.target.style.background = "rgba(255, 255, 255, 0.05)"
          e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"
        }
      })
    })
  }

  validateHotkeys() {
    const allHotkeys = []
    const validationMessage = document.getElementById("validation-message")

    for (let i = 0; i < 4; i++) {
      const buyHotkey = document.getElementById(`buy-hotkey-${i}`)?.value.toLowerCase()
      const sellHotkey = document.getElementById(`sell-hotkey-${i}`)?.value.toLowerCase()
      if (buyHotkey) allHotkeys.push(buyHotkey)
      if (sellHotkey) allHotkeys.push(sellHotkey)
    }

    const hasDuplicates = allHotkeys.length !== new Set(allHotkeys).size
    const hasEmptyKeys = allHotkeys.some((key) => !key || key.length === 0)

    if (hasDuplicates || hasEmptyKeys) {
      validationMessage.style.display = "block"
      validationMessage.textContent = hasDuplicates
        ? "?????? Duplicate keys detected! Each key must be unique."
        : "?????? All hotkey fields must be filled."
      return false
    } else {
      validationMessage.style.display = "none"
      return true
    }
  }

  async applySettings() {
    if (!this.validateHotkeys()) {
      return
    }

    const newBuyAmounts = []
    const newBuyHotkeys = []
    const newSellPercentages = []
    const newSellHotkeys = []

    for (let i = 0; i < 4; i++) {
      newBuyAmounts.push(Number.parseFloat(document.getElementById(`buy-amount-${i}`).value) || 0.01)
      newBuyHotkeys.push(document.getElementById(`buy-hotkey-${i}`).value.toLowerCase())
      newSellPercentages.push(Number.parseInt(document.getElementById(`sell-percentage-${i}`).value) || 10)
      newSellHotkeys.push(document.getElementById(`sell-hotkey-${i}`).value.toLowerCase())
    }

    const soundToggle = document.getElementById("soundToggle")
    const newSoundEnabled = soundToggle ? soundToggle.checked : this.config.soundEnabled

    const doubleClickToggle = document.getElementById("doubleClickToggle")
    const newDoubleClickEnabled = doubleClickToggle
      ? doubleClickToggle.checked
      : this.config.doubleClickEnabled

    const buyAmountsChanged = JSON.stringify(newBuyAmounts) !== JSON.stringify(this.config.buyAmounts)

    const sellPercentagesChanged = JSON.stringify(newSellPercentages) !== JSON.stringify(this.config.sellPercentages)

    const soundChanged = newSoundEnabled !== this.config.soundEnabled

    const doubleClickChanged = newDoubleClickEnabled !== this.config.doubleClickEnabled

    this.config.buyAmounts = newBuyAmounts
    this.config.buyHotkeys = newBuyHotkeys
    this.config.sellPercentages = newSellPercentages
    this.config.sellHotkeys = newSellHotkeys
    this.config.soundEnabled = newSoundEnabled
    this.config.doubleClickEnabled = newDoubleClickEnabled

    await this.saveConfig()

    if (buyAmountsChanged) {
      await this.syncWithAxiomInterface()
    }

    if (sellPercentagesChanged) {
      await this.syncSellPercentagesWithAxiom()
    }

    if (soundChanged) {
      console.log(`🔊 Sound ${newSoundEnabled ? "ENABLED" : "DISABLED"}`)
      
    }

    if (doubleClickChanged) {
      console.log(`🖱️ Double-Click ${newDoubleClickEnabled ? "ENABLED" : "DISABLED"}`)
      
    }

    console.log('🔧 Updating skillbar button values (without recreation)...')
    
    const buyButtons = this.skillBar.querySelectorAll('.buy-button')
    buyButtons.forEach((button, index) => {
      const valueEl = button.querySelector('.skill-button-value')
      const hotkeyEl = button.querySelector('.skill-button-hotkey')
      if (valueEl) valueEl.textContent = newBuyAmounts[index]
      if (hotkeyEl) hotkeyEl.textContent = newBuyHotkeys[index].toUpperCase()
      button.setAttribute('data-value', newBuyAmounts[index])
      button.setAttribute('data-hotkey', newBuyHotkeys[index])
    })
    
    const sellButtons = this.skillBar.querySelectorAll('.sell-button')
    sellButtons.forEach((button, index) => {
      const valueEl = button.querySelector('.skill-button-value')
      const hotkeyEl = button.querySelector('.skill-button-hotkey')
      if (valueEl) valueEl.textContent = `${newSellPercentages[index]}%`
      if (hotkeyEl) hotkeyEl.textContent = newSellHotkeys[index].toUpperCase()
      button.setAttribute('data-value', newSellPercentages[index])
      button.setAttribute('data-hotkey', newSellHotkeys[index])
    })
    
    console.log('✅ Skillbar updated (NO RECREATION - position stays perfect!)')
    console.log('✅ SETTINGS SAVED & SYNCED!')
  }

  async syncSellPercentagesWithAxiom() {
    try {
      const sellTabButtons = document.querySelectorAll('button[type="button"]')
      let sellTabFound = false

      for (const button of sellTabButtons) {
        const span = button.querySelector("span")

        if (span && span.textContent.trim() === "Sell") {
          button.click()
          sellTabFound = true
          break
        }
      }

      if (!sellTabFound) {
        return
      }

      await this.delay(800)

      let editButton = null
      const editSelectors = [
        "div.flex.flex-row.w-\\[28px\\].h-full.justify-center.items-center.cursor-pointer i.ri-edit-line",
        "i.ri-edit-line",
        "[class*='ri-edit-line']",
        "div[class*='cursor-pointer'] i[class*='edit']",
      ]

      for (const selector of editSelectors) {
        const element = document.querySelector(selector)
        if (element) {
          editButton = element
          break
        }
      }

      if (editButton) {
        editButton.closest("div").click()
        await this.delay(500)
      } else {
        return
      }

      await this.delay(300)

      let sellInputs = []

      const directInputs = Array.from(document.querySelectorAll('input[type="text"]')).filter((input) => {
        const container = input.closest('div[class*="flex"]')
        return (
          container &&
          container.querySelector("span") &&
          !isNaN(Number.parseInt(input.value)) &&
          Number.parseInt(input.value) >= 1 &&
          Number.parseInt(input.value) <= 100
        )
      })

      if (directInputs.length >= 4) {
        sellInputs = directInputs.slice(0, 4)
      } else {
        const containers = Array.from(document.querySelectorAll('div[class*="flex"][class*="cursor-pointer"]'))
        for (const container of containers) {
          const input = container.querySelector('input[type="text"]')
          if (
            input &&
            !isNaN(Number.parseInt(input.value)) &&
            Number.parseInt(input.value) >= 1 &&
            Number.parseInt(input.value) <= 100
          ) {
            sellInputs.push(input)
          }
        }
      }

      if (sellInputs.length === 0) {
        return
      }

      for (let i = 0; i < Math.min(sellInputs.length, this.config.sellPercentages.length); i++) {
        const input = sellInputs[i]
        const currentValue = input.value
        const newValue = this.config.sellPercentages[i].toString()

        if (currentValue !== newValue) {
          document.activeElement?.blur()
          await this.delay(100)

          input.focus()
          await this.delay(100)

          input.select()
          await this.delay(100)

          input.value = ""
          await this.delay(100)

          input.value = newValue
          await this.delay(100)

          const events = [
            new Event("focus", { bubbles: true }),
            new Event("input", { bubbles: true, cancelable: true }),
            new Event("change", { bubbles: true, cancelable: true }),
            new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
            new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
            new Event("blur", { bubbles: true }),
          ]

          for (const event of events) {
            input.dispatchEvent(event)
            await this.delay(50)
          }

          await this.delay(200)
        }
      }

      await this.delay(500)

      let checkButton = null
      const checkSelectors = [
        "div.flex.flex-row.w-\\[28px\\].h-full.justify-center.items-center.cursor-pointer i.ri-check-line",
        "i.ri-check-line",
        "[class*='ri-check-line']",
        "div[class*='cursor-pointer'] i[class*='check']",
      ]

      for (const selector of checkSelectors) {
        const element = document.querySelector(selector)
        if (element) {
          checkButton = element
          break
        }
      }

      if (checkButton) {
        checkButton.closest("div").click()
        await this.delay(800)
      } else {
        const lastInput = sellInputs[sellInputs.length - 1]
        if (lastInput) {
          lastInput.focus()
          lastInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
          await this.delay(500)
        }
      }
    } catch (error) {
      
    }
  }

  async syncWithAxiomInterface() {
    try {
      await this.ensureBuyModeForSettings()
      await this.delay(800)

      let editButton = null
      const editSelectors = [
        "div.flex.flex-row.w-\\[28px\\].h-full.justify-center.items-center.cursor-pointer i.ri-edit-line",
        "i.ri-edit-line",
        "[class*='ri-edit-line']",
        "div[class*='cursor-pointer'] i[class*='edit']",
      ]

      for (const selector of editSelectors) {
        const element = document.querySelector(selector)
        if (element) {
          editButton = element
          break
        }
      }

      if (editButton) {
        editButton.closest("div").click()
        await this.delay(500)
        await this.updateBuyInputsWithConfirmation()

        await this.delay(300)
        let finalCheckButton = null
        const checkSelectors = [
          "div.flex.flex-row.w-\\[28px\\].h-full.justify-center.items-center.cursor-pointer i.ri-check-line",
          "i.ri-check-line",
          "[class*='ri-check-line']",
          "div[class*='cursor-pointer'] i[class*='check']",
        ]

        for (const selector of checkSelectors) {
          const element = document.querySelector(selector)
          if (element) {
            finalCheckButton = element
            break
          }
        }

        if (finalCheckButton) {
          finalCheckButton.closest("div").click()
          await this.delay(500)
        }
      }
    } catch (error) {
      
    }
  }

  async ensureBuyModeForSettings() {
    const activeBuyButton = document.querySelector("button.bg-increase span")
    if (activeBuyButton && activeBuyButton.textContent.trim() === "Buy") {
      return true
    }

    const inactiveBuyButtons = Array.from(document.querySelectorAll("button.bg-transparent"))
    for (const button of inactiveBuyButtons) {
      const span = button.querySelector("span")
      if (span && span.textContent.trim() === "Buy") {
        button.click()
        return true
      }
    }

    return false
  }

  async updateBuyInputsWithConfirmation() {
    const inputs = document.querySelectorAll('input[type="text"][class*="bg-transparent"][class*="text-center"]')

    for (let i = 0; i < Math.min(inputs.length, this.config.buyAmounts.length); i++) {
      const input = inputs[i]
      const newValue = this.config.buyAmounts[i].toString()

      if (input && input.value !== newValue) {
        input.focus()
        input.select()
        input.value = newValue

        input.dispatchEvent(new Event("input", { bubbles: true }))
        input.dispatchEvent(new Event("change", { bubbles: true }))
        input.blur()

        await this.delay(200)

        const checkButton = document.querySelector(
          "div.flex.flex-row.w-\\[28px\\].h-full.justify-center.items-center.cursor-pointer i.ri-check-line",
        )

        if (checkButton) {
          checkButton.closest("div").click()
          await this.delay(300)
        }
      }
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  makeDraggable() {

    console.log('⚠️ makeDraggable() called but DISABLED - skillbar is locked to center')
    return
    
    const container = this.skillBar.querySelector(".skill-bar-container")
    let isDragging = false
    const dragOffset = { x: 0, y: 0 }

    container.style.cursor = "grab"

    const startDrag = (e) => {
      if (e.target.closest("#settings-toggle")) return

      isDragging = true
      const rect = this.skillBar.getBoundingClientRect()
      dragOffset.x = e.clientX - rect.left
      dragOffset.y = e.clientY - rect.top
      container.style.cursor = "grabbing"
      this.skillBar.classList.add("dragging")
      e.preventDefault()
    }

    const drag = (e) => {
      if (!isDragging) return
      let newX = e.clientX - dragOffset.x
      let newY = e.clientY - dragOffset.y

      const padding = 10
      const skillBarWidth = this.skillBar.offsetWidth
      const skillBarHeight = this.skillBar.offsetHeight

      newX = Math.max(padding, Math.min(window.innerWidth - skillBarWidth - padding, newX))
      newY = Math.max(padding, Math.min(window.innerHeight - skillBarHeight - padding, newY))

      this.position.x = newX
      this.position.y = newY
      this.skillBar.style.left = `${newX}px`
      this.skillBar.style.top = `${newY}px`
      this.skillBar.style.transform = "none"
      e.preventDefault()
    }

    const stopDrag = () => {
      if (!isDragging) return
      isDragging = false
      container.style.cursor = "grab"
      this.skillBar.classList.remove("dragging")

      console.log('🔒 Drag stopped - position NOT saved (keeping centered)')
    }

    container.addEventListener("mousedown", startDrag)
    document.addEventListener("mousemove", drag)
    document.addEventListener("mouseup", stopDrag)
  }

  setupEventListeners() {
    console.log("Setting up event listeners, extensionEnabled:", this.config.extensionEnabled)
    if (!this.config.extensionEnabled) {
      console.log("Extension not enabled, skipping event listeners")
      return
    }

    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return

      const key = e.key.toLowerCase()
      
      const isTradingPage = window.location.href.match(/\/meme\/[A-Za-z0-9]+/)
      const isTradingKey = this.config.buyHotkeys.includes(key) || this.config.sellHotkeys.includes(key)
      
      if (isTradingKey && !isTradingPage) {
        
        console.log(`⚠️ Trading key ${key} pressed on non-trading page`)
        this.showFeedback("⚠️ Skillbar works only on trading pages", "sell")
        e.preventDefault()
        return 
      }

      console.log("Key pressed:", key, "Hotkeys:", this.config.buyHotkeys, this.config.sellHotkeys)

      if (this.config.soundEnabled) {
        this.playKeySound()
      }

      const buyIndex = this.config.buyHotkeys.indexOf(key)
      if (buyIndex !== -1) {
        console.log("Buy key matched:", key, "Amount:", this.config.buyAmounts[buyIndex])
        const buyButton = this.skillBar.querySelector(`[data-action="buy"][data-hotkey="${key}"]`)
        if (this.handleKeyPress(key, buyButton, "buy", this.config.buyAmounts[buyIndex])) {
          e.preventDefault()
          this.executeBuy(this.config.buyAmounts[buyIndex])
          this.animateSkillButton("buy", buyIndex)
        }
      }

      const sellIndex = this.config.sellHotkeys.indexOf(key)
      if (sellIndex !== -1) {
        console.log("Sell key matched:", key, "Percentage:", this.config.sellPercentages[sellIndex])
        const sellButton = this.skillBar.querySelector(`[data-action="sell"][data-hotkey="${key}"]`)
        if (this.handleKeyPress(key, sellButton, "sell", this.config.sellPercentages[sellIndex])) {
          e.preventDefault()
          this.executeSell(this.config.sellPercentages[sellIndex])
          this.animateSkillButton("sell", sellIndex)
        }
      }

      if (key === "escape") {
        e.preventDefault()
        if (this.settingsOpen) {
          this.toggleSettings()
        } else {
          this.skillBar.style.display = this.skillBar.style.display === "none" ? "block" : "none"
        }
      }
    })
  }

  handleSkillClick(button) {
    
    const action = button.dataset.action
    const value = Number.parseFloat(button.dataset.value)

    button.classList.add("clicked")
    setTimeout(() => button.classList.remove("clicked"), 200)

    if (action === "buy") {
      this.executeBuy(value)
    } else if (action === "sell") {
      this.executeSell(value)
    }
  }

  executeBuy(amount) {
    
    this.lastTradingAction = 'buy'
    this.lastTradingTime = Date.now()
    this.lastTradingAmount = amount
    
    this.balanceBeforeBuy = this.lastSOLBalance
    console.log(`🎯 Tracked BUY: ${amount} SOL at ${new Date().toISOString()}`)
    console.log(`💰 Balance BEFORE buy: ${this.balanceBeforeBuy} SOL`)
    
    if (this.currentMode === "sell") {
      this.selectBuyMode()
      setTimeout(() => {
        this.setAmount(amount)
        this.executeFinalBuy()
      }, 300)
    } else {
      this.selectBuyMode()
      setTimeout(() => {
        this.setAmount(amount)
        this.executeFinalBuy()
      }, 100)
    }

    this.currentMode = "buy"
    this.showFeedback(`BUY ${amount} SOL`, "buy")
  }

  executeFinalBuy() {
    setTimeout(() => {
      const buyButton =
        document.querySelector("div.flex.flex-row.flex-1.px-\\[16px\\].pb-\\[16px\\] button") ||
        document.querySelector("button.bg-increase")

      if (buyButton) {
        buyButton.click()
      }
    }, 300)
  }

  executeSell(percentage) {
    
    this.lastTradingAction = 'sell'
    this.lastTradingTime = Date.now()
    this.lastTradingAmount = percentage
    console.log(`🎯 Tracked SELL: ${percentage}% at ${new Date().toISOString()}`)
    
    if (this.currentMode === "buy") {
      this.selectSellMode()
      setTimeout(() => {
        this.setSellPercentage(percentage)
        this.executeFinalSell()
      }, 300)
    } else {
      this.selectSellMode()
      setTimeout(() => {
        this.setSellPercentage(percentage)
        this.executeFinalSell()
      }, 100)
    }

    this.currentMode = "sell"
    this.showFeedback(`SELL ${percentage}%`, "sell")
  }

  executeFinalSell() {
    setTimeout(() => {
      const sellButton = document.querySelector("div.flex.flex-row.flex-1.px-\\[16px\\].pb-\\[16px\\] button")

      if (sellButton) {
        sellButton.click()
      }
    }, 300)
  }

  selectBuyMode() {
    const activeBuyButton = document.querySelector("button.bg-increase span")
    if (activeBuyButton && activeBuyButton.textContent.trim() === "Buy") {
      return true
    }

    const inactiveBuyButtons = Array.from(document.querySelectorAll("button.bg-transparent"))
    for (const button of inactiveBuyButtons) {
      const span = button.querySelector("span")
      if (span && span.textContent.trim() === "Buy") {
        button.click()
        return true
      }
    }

    const allButtons = Array.from(document.querySelectorAll("button"))
    for (const button of allButtons) {
      if (button.textContent.includes("Buy")) {
        button.click()
        return true
      }
    }

    return false
  }

  selectSellMode() {
    const activeSellButton = document.querySelector("button.bg-decrease span")
    if (activeSellButton && activeSellButton.textContent.trim() === "Sell") {
      return true
    }

    const inactiveSellButtons = Array.from(document.querySelectorAll("button.bg-transparent"))
    for (const button of inactiveSellButtons) {
      const span = button.querySelector("span")
      if (span && span.textContent.trim() === "Sell") {
        button.click()
        return true
      }
    }

    const allButtons = Array.from(document.querySelectorAll("button"))
    for (const button of allButtons) {
      if (button.textContent.includes("Sell")) {
        button.click()
        return true
      }
    }

    return false
  }

  setSellPercentage(percentage) {
    setTimeout(() => {
      const percentageDivs = Array.from(
        document.querySelectorAll("div.flex.flex-row.flex-1.h-full.justify-center.items-center.cursor-pointer"),
      )

      for (const div of percentageDivs) {
        const span = div.querySelector("span.text-textPrimary")
        if (span && span.textContent.trim() === percentage.toString()) {
          div.click()
          return true
        }
      }

      return false
    }, 200)
  }

  setAmount(amount) {
    setTimeout(() => {
      console.log('?? Looking for amount:', amount)
      
      const inputFields = Array.from(document.querySelectorAll('input[type="text"]')).filter(input => {
        const style = window.getComputedStyle(input)
        return style.display !== 'none' && input.offsetParent !== null
      })
      
      console.log('Found', inputFields.length, 'visible input fields')
      
      for (const input of inputFields) {
        const placeholder = input.placeholder || ''
        const value = input.value || ''
        
        console.log('Input field:', { placeholder, value, classList: input.className })
        
        if (input.className.includes('text-center') || placeholder.toLowerCase().includes('amount')) {
          console.log('? Found buy amount input field! Typing value...')
          
          input.value = ''
          input.focus()
          
          input.value = amount.toString()
          
          input.dispatchEvent(new Event('input', { bubbles: true }))
          input.dispatchEvent(new Event('change', { bubbles: true }))
          input.dispatchEvent(new Event('blur', { bubbles: true }))
          
          console.log('? Value typed:', amount)
          return true
        }
      }
      
      console.log('?? Input field not found, trying button click method...')
      const amountDivs = Array.from(
        document.querySelectorAll("div.flex.flex-row.flex-1.h-full.justify-center.items-center.cursor-pointer"),
      )
      
      console.log('Found', amountDivs.length, 'amount divs')

      for (const div of amountDivs) {
        const span = div.querySelector("span.text-textPrimary")
        if (span) {
          const text = span.textContent.trim()
          
          if (text === amount.toString() || parseFloat(text) === amount) {
            console.log('? Found matching button! Clicking...')
            div.click()
            return true
          }
        }
      }
      
      const buttonIndex = { 0.01: 0, 0.1: 1, 1: 2, 10: 3 }[amount]
      if (buttonIndex !== undefined && amountDivs[buttonIndex]) {
        console.log('?? Using position-based fallback, clicking button', buttonIndex)
        amountDivs[buttonIndex].click()
        return true
      }

      console.log('? Could not set amount:', amount)
      return false
    }, 200)
  }

  animateSkillButton(type, index) {
    if (!this.skillBar) return
    const buttons = this.skillBar.querySelectorAll(".skill-button")
    const buttonIndex = type === "buy" ? index + 1 : index + 5
    if (buttons[buttonIndex]) {
      buttons[buttonIndex].classList.add("clicked")
      setTimeout(() => buttons[buttonIndex].classList.remove("clicked"), 200)
    }
  }

  showFeedback(message, type) {
    const feedback = document.createElement("div")
    const color = type === "buy" ? "#00aaff" : type === "sell" ? "#ff4444" : "#888888"
    feedback.style.cssText = `
      position: fixed !important;
      top: 20% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background: rgba(0, 0, 0, 0.15) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      color: #fff !important;
      padding: 12px 24px !important;
      border-radius: 12px !important;
      border: 1px solid ${color} !important;
      font-family: 'Courier New', monospace !important;
      font-weight: bold !important;
      font-size: 14px !important;
      z-index: 1000000 !important;
      box-shadow: 
        0 0 20px ${color},
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.1) !important;
      animation: feedback-popup 1s ease-out forwards !important;
      text-shadow: 0 0 10px ${color} !important;
    `
    feedback.textContent = message

    document.body.appendChild(feedback)
    setTimeout(() => feedback.remove(), 1000)
  }

  initializeMarketCapFiltering() {
    // 🔐 TOKEN GATE DISABLED FOR TESTING
    /*
    if (!this.tokenGatePassed) {
      console.log('🔐 Market cap filtering BLOCKED - no token access')
      return
    }
    */
    
    if (!sessionStorage.getItem('blue_phase_completed')) {
      window.bluePhaseComplete = false
      console.log('🔄 First initialization - blue phase will run')
    } else {
      window.bluePhaseComplete = true
      console.log('⏭️ Blue phase already completed in this session - skipping')
    }
    
    if (!window.marketCapSystemEnabled) {
      console.log("? Market Cap System DISABLED - Will activate on initialize command")
      return
    }
    
    if (!this.config.marketCapFiltering) {
      console.log("??? Market Cap Filtering disabled in config")
      return
    }

    console.log("?? Initializing Market Cap Filtering...")
    console.log("?? Current URL:", window.location.href)
    
    setTimeout(() => this.processExistingCoinContainers(), 500)
    setTimeout(() => this.processExistingCoinContainers(), 1500)
    setTimeout(() => this.processExistingCoinContainers(), 3000)
    
    this.setupMarketCapObserver()
    
    this.createMarketCapUI()
    
    console.log("? Market Cap Filtering initialized and running continuously")
  }

  processExistingCoinContainers() {
    
    if (!window.marketCapSystemEnabled) {
      console.log('? BLOCKED: processExistingCoinContainers - system disabled')
      return 
    }
    
    const coinContainers = this.findCoinContainers()
    console.log(`?? Found ${coinContainers.length} existing coin containers`)
    
    coinContainers.forEach((container, index) => {
      this.applyMarketCapStyling(container)
    })
  }

  setupMarketCapObserver() {
    console.log('??? Setting up market cap observer for new coins...')
    
    this.marketCapObserver = new MutationObserver((mutations) => {
      let foundNewContainers = false
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            
            if (this.isCoinContainer(node)) {
              console.log('?? NEW COIN DETECTED! Applying styling + tracking')
              this.applyMarketCapStyling(node)
              this.trackHolderCount(node)
              foundNewContainers = true
            }
            
            const coinContainers = node.querySelectorAll ? 
              Array.from(node.querySelectorAll('*')).filter(el => this.isCoinContainer(el)) : []
            
            if (coinContainers.length > 0) {
              console.log(`?? ${coinContainers.length} NEW COINS detected in DOM`)
              foundNewContainers = true
            }
            
            coinContainers.forEach(container => {
              this.applyMarketCapStyling(container)
              this.trackHolderCount(container)
            })
          }
        })
      })
      
      if (foundNewContainers) {
        setTimeout(() => {
          this.processExistingCoinContainers()
          this.processExistingHolderCounts()
        }, 300)
      }
    })

    this.marketCapObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    console.log('? Market cap observer active')
    
    this.periodicRescanInterval = setInterval(() => {
      try {
        this.processExistingCoinContainers()
        this.processExistingHolderCounts()
      } catch (error) {
        console.error('Error in periodic rescan:', error)
      }
    }, 1000) 
    
    console.log('? Periodic rescan active (every 1s)')
    
    this.contentChangeObserver = new MutationObserver((mutations) => {
      
      const significantChange = mutations.some(m => m.addedNodes.length > 5)
      
      if (significantChange) {
        console.log('?? Major DOM change detected, refreshing colors...')
        setTimeout(() => {
          this.processExistingCoinContainers()
          
          this.processExistingHolderCounts()
        }, 300)
      }
    })
    
    this.contentChangeObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    console.log('? Content change observer active')
  }

  findCoinContainers() {
    
    const selectors = [
      
      'div[class*="h-[142px]"]',
      'div[class*="h-[116px]"]'
    ]
    
    let containers = []
    selectors.forEach(selector => {
      const found = document.querySelectorAll(selector)
      containers = containers.concat(Array.from(found))
    })
    
    containers = [...new Set(containers)]
    
    // Filter containers
    containers = containers.filter(container => {
      const classList = container.className || ''
      const text = container.textContent || ''
      
      if (classList.includes('min-h-[48px]') && !classList.includes('h-[142px]') && !classList.includes('h-[116px]')) {
        return false
      }
      
      if (classList.includes('sticky')) {
        return false
      }
      
      const titlePatterns = ['New Pairs', 'Final Stretch', 'Migrated', 'Trending', 'Graduated']
      for (const pattern of titlePatterns) {
        if (text.includes(pattern) && !text.includes('MC') && text.length < 300) {
          return false
        }
      }
      
      const hasTokenName = container.querySelector('span[class*="text-[16px]"]')
      const hasMC = text.includes('MC') || text.includes('$') 
      const hasHolders = container.querySelector('i.ri-group-line')
      const hasTokenImage = container.querySelector('img[alt]')
      
      if (!hasTokenName && !hasMC && !hasHolders && !hasTokenImage) {
        return false
      }
      
      return true
    })
    
    return containers
  }

  isCoinContainer(element) {
    if (!element || !element.classList) return false
    
    const hasBorderClass = element.classList.toString().includes('border-primaryStroke')
    const hasFlexClass = element.classList.toString().includes('flex-col')
    const hasHeightClass = element.classList.toString().includes('h-[142px]') || 
                          element.classList.toString().includes('h-[116px]')
    
    return hasBorderClass && hasFlexClass && hasHeightClass
  }

  extractHoldersFromContainer(container) {
    try {
      
      const groupIcon = container.querySelector('i.ri-group-line')
      if (!groupIcon) return 0
      
      const parent = groupIcon.closest('div')
      if (!parent) return 0
      
      const spans = parent.querySelectorAll('span')
      for (const span of spans) {
        const text = span.textContent.trim()
        
        if (/^\d+$/.test(text)) {
          return parseInt(text)
        }
      }
      
      return 0
    } catch (error) {
      console.error('Error extracting holders:', error)
      return 0
    }
  }

  extractMarketCapFromContainer(container) {
    try {
      
      const mcLabels = container.querySelectorAll('span')
      
      for (const span of mcLabels) {
        if (span.textContent.trim() === 'MC') {
          
          const nextSpan = span.nextElementSibling
          if (nextSpan && nextSpan.textContent.includes('$')) {
            return this.parseMarketCapValue(nextSpan.textContent.trim())
          }
        }
      }
      
      const dollarSpans = container.querySelectorAll('span')
      for (const span of dollarSpans) {
        const text = span.textContent.trim()
        if (text.includes('$') && (text.includes('K') || text.includes('M') || text.includes('B'))) {
          
          const parent = span.parentElement
          if (parent && parent.textContent.includes('MC')) {
            return this.parseMarketCapValue(text)
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Error extracting market cap:', error)
      return null
    }
  }

  parseMarketCapValue(text) {
    try {
      
      const cleanText = text.replace('$', '').trim()
      
      let multiplier = 1
      let numericValue = cleanText
      
      if (cleanText.includes('K')) {
        multiplier = 1000
        numericValue = cleanText.replace('K', '')
      } else if (cleanText.includes('M')) {
        multiplier = 1000000
        numericValue = cleanText.replace('M', '')
      } else if (cleanText.includes('B')) {
        multiplier = 1000000000
        numericValue = cleanText.replace('B', '')
      }
      
      const value = parseFloat(numericValue)
      return isNaN(value) ? null : value * multiplier
    } catch (error) {
      console.error('Error parsing market cap value:', error)
      return null
    }
  }
  
  parseValue(text) {
    return this.parseMarketCapValue(text)
  }

  getMarketCapCategory(marketCap) {
    if (!marketCap) return 'unknown'
    
    if (marketCap < this.config.marketCapThresholds.low) {
      return 'low'
    } else if (marketCap < this.config.marketCapThresholds.medium) {
      return 'medium'
    } else if (marketCap < this.config.marketCapThresholds.high) {
      return 'high'
    } else if (marketCap < this.config.marketCapThresholds.veryHigh) {
      return 'veryHigh'
    } else {
      return 'mega'
    }
  }

  calculateTokenHealthScore(container) {
    
    const text = container.textContent || ''
    
    const holdersCount = this.extractHoldersFromContainer(container) || 0
    const volumeText = text.match(/V\s*\$?([\d.]+)([KMB]?)/i)
    const volume = volumeText ? this.parseMarketCapValue('$' + volumeText[1] + volumeText[2]) : 0
    const txMatch = text.match(/TX\s*(\d+)/i)
    const transactions = txMatch ? parseInt(txMatch[1]) : 0
    const marketCap = this.extractMarketCapFromContainer(container) || 0
    
    let snipersHolding = 0, insidersHolding = 0, bundleHolding = 0, biggestCluster = 0
    
    const insidersMatch = container.querySelector('i.ri-user-star-line')
    if (insidersMatch) {
      const parent = insidersMatch.closest('div')
      if (parent) {
        const spans = parent.querySelectorAll('span')
        for (const span of spans) {
          const match = span.textContent.match(/(\d+)%/)
          if (match) {
            insidersHolding = parseFloat(match[1])
            break
          }
        }
      }
    }
    
    const snipersMatch = container.querySelector('i.ri-crosshair-2-line')
    if (snipersMatch) {
      const parent = snipersMatch.closest('div')
      if (parent) {
        const spans = parent.querySelectorAll('span')
        for (const span of spans) {
          const match = span.textContent.match(/(\d+)%/)
          if (match) {
            snipersHolding = parseFloat(match[1])
            break
          }
        }
      }
    }
    
    const bundleMatch = container.querySelector('i.ri-ghost-line')
    if (bundleMatch) {
      const parent = bundleMatch.closest('div')
      if (parent) {
        const spans = parent.querySelectorAll('span')
        for (const span of spans) {
          const match = span.textContent.match(/(\d+)%/)
          if (match) {
            bundleHolding = parseFloat(match[1])
            break
          }
        }
      }
    }
    
    const clusterMatch = container.querySelector('i[class*="icon-boxes"]')
    if (clusterMatch) {
      const parent = clusterMatch.closest('div')
      if (parent) {
        const spans = parent.querySelectorAll('span')
        for (const span of spans) {
          const match = span.textContent.match(/(\d+)%/)
          if (match) {
            biggestCluster = parseFloat(match[1])
            break
          }
        }
      }
    }
    
    const holdersScore = Math.min(holdersCount / 500, 1) * 100 
    const volumeScore = Math.min(volume / 10000, 1) * 100 
    const txScore = Math.min(transactions / 200, 1) * 100 
    const marketCapScore = marketCap < 20000 ? 100 : marketCap < 100000 ? 60 : 20
    const snipersScore = 100 - snipersHolding 
    const insidersScore = 100 - insidersHolding 
    const bundleScore = 100 - bundleHolding 
    const clusterScore = 100 - biggestCluster 

    const weights = {
      holdersCount: 0.15,
      volume: 0.15,
      transactions: 0.15,
      marketCap: 0.15,
      snipersHolding: 0.15,
      insidersHolding: 0.1,
      bundleHolding: 0.1,
      biggestCluster: 0.05
    }
    
    const totalScore = (
      holdersScore * weights.holdersCount +
      volumeScore * weights.volume +
      txScore * weights.transactions +
      marketCapScore * weights.marketCap +
      snipersScore * weights.snipersHolding +
      insidersScore * weights.insidersHolding +
      bundleScore * weights.bundleHolding +
      clusterScore * weights.biggestCluster
    )
    
    console.log(`?? HEALTH SCORE: ${totalScore.toFixed(1)}/100`, {
      holders: holdersCount,
      volume: volume,
      transactions: transactions,
      marketCap: marketCap,
      snipers: snipersHolding + '%',
      insiders: insidersHolding + '%',
      bundles: bundleHolding + '%',
      cluster: biggestCluster + '%'
    })
    
    console.log(`?? Individual Scores:`, {
      holdersScore: holdersScore.toFixed(1),
      volumeScore: volumeScore.toFixed(1),
      txScore: txScore.toFixed(1),
      marketCapScore: marketCapScore.toFixed(1),
      snipersScore: snipersScore.toFixed(1),
      insidersScore: insidersScore.toFixed(1),
      bundleScore: bundleScore.toFixed(1),
      clusterScore: clusterScore.toFixed(1)
    })
    
    return totalScore
  }
  
  scoreToColor(score) {
    
    const hue = (score / 100) * 120 
    return `hsl(${hue}, 85%, 50%)`
  }
  
  scoreToColorCategory(score) {
    if (score <= 30) return { name: 'very-risky', color: 'rgb(239, 68, 68)', label: 'Very Risky' }
    if (score <= 60) return { name: 'uncertain', color: 'rgb(251, 146, 60)', label: 'Uncertain' }
    if (score <= 80) return { name: 'healthy', color: 'rgb(250, 204, 21)', label: 'Healthy' }
    return { name: 'strong', color: 'rgb(34, 197, 94)', label: 'Strong' }
  }

  applyMarketCapStyling(container) {
    
    if (!window.marketCapSystemEnabled) {
      console.log('? BLOCKED: applyMarketCapStyling - system disabled')
      return 
    }
    
    if (!container) return
    
    const marketCap = this.extractMarketCapFromContainer(container)
    const holders = this.extractHoldersFromContainer(container)
    let category = this.getMarketCapCategory(marketCap)
    
    const trophyIcon = container.querySelector('i.ri-trophy-line')
    let cabalCount = 0
    if (trophyIcon) {
      const cabalSpan = trophyIcon.parentElement.querySelector('span.text-textPrimary')
      if (cabalSpan) {
        cabalCount = parseInt(cabalSpan.textContent.trim()) || 0
      }
    }
    
    if (cabalCount >= 1) {
      console.log(`?? CABAL TROPHY: ${cabalCount} cabal(s) detected!`)
      this.highlightCabalTrophy(container)
    }
    
    if (marketCap && holders !== null) {
      
      if (marketCap > 50000 && holders < 50) {
        category = 'low' 
        console.log(`?? RED FLAG: $${(marketCap/1000).toFixed(1)}K MC with only ${holders} holders!`)
      }
      
      else if (marketCap > 20000 && holders < 20) {
        category = 'low' 
        console.log(`?? RED FLAG: $${(marketCap/1000).toFixed(1)}K MC with only ${holders} holders!`)
      }
    }
    
    container.setAttribute('data-market-cap-processed', 'true')
    container.setAttribute('data-market-cap-value', marketCap || 'unknown')
    container.setAttribute('data-market-cap-category', category)
    container.setAttribute('data-holders-count', holders || 'unknown')
    container.setAttribute('data-cabal-count', cabalCount)
    
    container.classList.remove('market-cap-low', 'market-cap-medium', 'market-cap-high', 'market-cap-very-high', 'market-cap-mega')
    
    if (container.hasAttribute('data-blue-locked')) {
      console.log('🔒 BLUE PHASE ACTIVE - IGNORING ALL COLOR CHANGES')
      return 
    }
    
    if (window.bluePhaseComplete) {
      console.log('⏭️ Blue phase already complete - skipping blue, applying heatmap directly')
    container.classList.add(`market-cap-${category}`)
      this.applyMarketCapBorderStyling(container, category)
      return
    }
    
    if (!container.hasAttribute('data-blue-applied')) {
      container.setAttribute('data-blue-applied', 'true')
      container.setAttribute('data-blue-locked', 'true') 

      container.classList.add('market-cap-blue-loading')
      
      console.log('💙 BLUE PHASE STARTED - LOCKED FOR 5 SECONDS')

      setTimeout(() => {
        console.log('🎨 BLUE PHASE COMPLETE - UNLOCKING AND APPLYING HEATMAP')

        window.bluePhaseComplete = true
        sessionStorage.setItem('blue_phase_completed', 'true')

        container.removeAttribute('data-blue-locked')

        container.classList.remove('market-cap-blue-loading')

        container.style.borderColor = ''
        container.style.backgroundColor = ''
        container.style.boxShadow = ''
        container.style.animation = ''

        container.style.transition = 'none'

        container.classList.add(`market-cap-${category}`)
    this.applyMarketCapBorderStyling(container, category)
    
        setTimeout(() => {
          container.style.transition = 'all 0.3s ease'
        }, 50)
      }, 5000)

      return
    } else {
      
      container.classList.add(`market-cap-${category}`)
      this.applyMarketCapBorderStyling(container, category)
    }

    if (this.config.marketCapFiltering) {
      this.updateMarketCapStats()
    }
  }
  
  highlightCabalTrophy(container) {
    
    const trophyIcon = container.querySelector('i.ri-trophy-line')
    if (!trophyIcon) return
    
    trophyIcon.classList.remove('cabal-trophy-glow')
    
    trophyIcon.classList.add('cabal-trophy-glow')
    
    const trophyParent = trophyIcon.parentElement
    if (trophyParent) {
      trophyParent.setAttribute('data-cabal-highlight', 'true')
    }
  }

  applyMarketCapBorderStyling(container, category) {
    
    if (container.hasAttribute('data-blue-locked')) {
      console.log('🔒 LOCKED: Skipping border styling (blue phase active)')
      return
    }
    
    const colors = {
      low: 'rgba(239, 68, 68, 0.6)',      
      medium: 'rgba(245, 158, 11, 0.6)',  
      high: 'rgba(34, 197, 94, 0.6)',     
      veryHigh: 'rgba(59, 130, 246, 0.6)', 
      mega: 'rgba(147, 51, 234, 0.6)',    
      unknown: 'rgba(107, 114, 128, 0.3)' 
    }
    
    const color = colors[category] || colors.unknown
    
    container.style.setProperty('border-color', color, 'important')
    container.style.setProperty('border-width', '2px', 'important')
    container.style.setProperty('border-style', 'solid', 'important')
    
    container.style.setProperty('background-color', color.replace('0.6', '0.05'), 'important')
    
    container.style.boxShadow = `0 0 10px ${color.replace('0.6', '0.2')}, inset 0 0 0 1px ${color.replace('0.6', '0.1')}`
  }

  createMarketCapUI() {
    
    this.createMarketCapLegend()
    this.createMarketCapStats()
  }

  createMarketCapToggle() {
    
    const existingToggle = document.getElementById('market-cap-filter-toggle')
    if (existingToggle) {
      existingToggle.remove()
    }

    const toggle = document.createElement('button')
    toggle.id = 'market-cap-filter-toggle'
    toggle.className = 'market-cap-filter-toggle'
    toggle.textContent = 'MC Filter'
    toggle.addEventListener('click', () => {
      this.toggleMarketCapFiltering()
    })

    document.body.appendChild(toggle)
  }

  createMarketCapLegend() {
    
    const existingLegend = document.getElementById('market-cap-legend')
    if (existingLegend) {
      existingLegend.remove()
    }

    const legend = document.createElement('div')
    legend.id = 'market-cap-legend'
    legend.className = 'market-cap-legend'
    legend.style.display = 'none' 

    legend.innerHTML = `
      <h4>Market Cap Colors</h4>
      <div class="market-cap-legend-item">
        <div class="market-cap-legend-color low"></div>
        <span>Low: &lt;$10K</span>
      </div>
      <div class="market-cap-legend-item">
        <div class="market-cap-legend-color medium"></div>
        <span>Medium: $10K-$100K</span>
      </div>
      <div class="market-cap-legend-item">
        <div class="market-cap-legend-color high"></div>
        <span>High: $100K-$1M</span>
      </div>
      <div class="market-cap-legend-item">
        <div class="market-cap-legend-color very-high"></div>
        <span>Very High: $1M-$10M</span>
      </div>
      <div class="market-cap-legend-item">
        <div class="market-cap-legend-color mega"></div>
        <span>Mega: &gt;$10M</span>
      </div>
    `

    document.body.appendChild(legend)
  }

  createMarketCapStats() {
    
    const existingStats = document.getElementById('market-cap-stats')
    if (existingStats) {
      existingStats.remove()
    }

    const stats = document.createElement('div')
    stats.id = 'market-cap-stats'
    stats.className = 'market-cap-stats'
    stats.style.display = 'none' 

    stats.innerHTML = `
      <h5>Market Cap Stats</h5>
      <div id="market-cap-stats-content">
        <div class="market-cap-stats-item">
          <span class="market-cap-stats-count">Low:</span>
          <span class="market-cap-stats-percentage">0</span>
        </div>
        <div class="market-cap-stats-item">
          <span class="market-cap-stats-count">Medium:</span>
          <span class="market-cap-stats-percentage">0</span>
        </div>
        <div class="market-cap-stats-item">
          <span class="market-cap-stats-count">High:</span>
          <span class="market-cap-stats-percentage">0</span>
        </div>
        <div class="market-cap-stats-item">
          <span class="market-cap-stats-count">Very High:</span>
          <span class="market-cap-stats-percentage">0</span>
        </div>
        <div class="market-cap-stats-item">
          <span class="market-cap-stats-count">Mega:</span>
          <span class="market-cap-stats-percentage">0</span>
        </div>
      </div>
    `

    document.body.appendChild(stats)
  }

  toggleMarketCapFiltering() {
    const toggle = document.getElementById('market-cap-filter-toggle')
    const legend = document.getElementById('market-cap-legend')
    const stats = document.getElementById('market-cap-stats')

    if (this.config.marketCapFiltering) {
      
      this.config.marketCapFiltering = false
      toggle.classList.remove('active')
      toggle.textContent = 'MC Filter OFF'
      legend.style.display = 'none'
      stats.style.display = 'none'
      
      this.removeAllMarketCapStyling()
      
      console.log("???? Market Cap Filtering DISABLED")
    } else {
      
      this.config.marketCapFiltering = true
      toggle.classList.add('active')
      toggle.textContent = 'MC Filter ON'
      legend.style.display = 'block'
      stats.style.display = 'block'
      
      this.processExistingCoinContainers()
      this.updateMarketCapStats()
      
      console.log("???? Market Cap Filtering ENABLED")
    }

    this.saveConfig()
  }

  removeAllMarketCapStyling() {
    const containers = document.querySelectorAll('[data-market-cap-processed]')
    containers.forEach(container => {
      container.classList.remove('market-cap-low', 'market-cap-medium', 'market-cap-high', 'market-cap-very-high', 'market-cap-mega')
      container.style.borderColor = ''
      container.style.borderWidth = ''
      container.style.borderStyle = ''
      container.style.backgroundColor = ''
      container.style.boxShadow = ''
    })
  }

  updateMarketCapStats() {
    const containers = document.querySelectorAll('[data-market-cap-category]')
    const stats = {
      low: 0,
      medium: 0,
      high: 0,
      veryHigh: 0,
      mega: 0
    }

    containers.forEach(container => {
      const category = container.getAttribute('data-market-cap-category')
      if (stats.hasOwnProperty(category)) {
        stats[category]++
      }
    })

    const total = Object.values(stats).reduce((sum, count) => sum + count, 0)
    
    if (total > 0) {
      const statsContent = document.getElementById('market-cap-stats-content')
      if (statsContent) {
        const items = statsContent.querySelectorAll('.market-cap-stats-item')
        const categories = ['low', 'medium', 'high', 'veryHigh', 'mega']
        
        categories.forEach((category, index) => {
          const percentage = Math.round((stats[category] / total) * 100)
          const percentageElement = items[index].querySelector('.market-cap-stats-percentage')
          if (percentageElement) {
            percentageElement.textContent = `${stats[category]} (${percentage}%)`
          }
        })
      }
    }
  }

  testMarketCapParsing() {
    console.log("???? Testing Market Cap Parsing...")
    
    const testValues = [
      "$5.2K",    
      "$28K",      
      "$62.9K",    
      "$500K",     
      "$2.5M",     
      "$15M",      
      "$100M",     
      "invalid",   
      "$",         
    ]
    
    testValues.forEach(testValue => {
      const parsed = this.parseMarketCapValue(testValue)
      const category = this.getMarketCapCategory(parsed)
      console.log(`???? "${testValue}" ??? ${parsed} ??? ${category}`)
    })
    
    console.log("??? Market Cap Parsing Test Complete")
  }

  initializeHeatmap() {
    if (!this.config.heatmapEnabled) {
      console.log('?? Heatmap disabled')
      return
    }
    
    console.log('?? Initializing Heatmap System...')
    console.log('Mode:', this.config.heatmapMode)
    
    setTimeout(() => this.processHeatmapForContainers(), 500)
    setTimeout(() => this.processHeatmapForContainers(), 1500)
    setTimeout(() => this.processHeatmapForContainers(), 3000)
    
    this.heatmapUpdateInterval = setInterval(() => {
      try {
        this.processHeatmapForContainers()
      } catch (error) {
        console.error('Error in heatmap update:', error)
      }
    }, 1000) 
    
    console.log('? Heatmap initialized - will run continuously every 1s')
  }

  processHeatmapForContainers() {
    const containers = this.findCoinContainers()
    
    if (containers.length === 0) {
      console.log('?? No containers found for heatmap')
      return
    }
    
    console.log(`?? Applying heatmap to ${containers.length} containers`)
    
    containers.forEach(container => {
      this.applyHeatmapStyling(container)
    })
  }
  
  refreshAllVisuals() {
    
    if (!window.marketCapSystemEnabled) {
      
      return 
    }
    
    console.log('?? MASTER REFRESH - Applying all colors and effects...')
    
    const containers = this.findCoinContainers()
    console.log(`Found ${containers.length} containers to refresh`)
    
    if (containers.length === 0) {
      console.log('?? No containers found - page might still be loading')
      return
    }
    
    containers.forEach(container => {
      try {
        
        this.applyMarketCapStyling(container)
      } catch (e) {
        console.error('Error applying market cap:', e)
      }
      
      try {
        
        this.trackHolderCount(container)
      } catch (e) {
        console.error('Error tracking holders:', e)
      }
    
    try {
        
        this.applySocialGlow(container)
    } catch (e) {
        console.error('Error applying social glow:', e)
    }
    })
    
    console.log('? Master refresh complete - all visuals applied!')
  }
  
  applySocialGlow(container) {
    
    if (!window.marketCapSystemEnabled) {
      return 
    }
    
    if (!container) return
    
    const socialSelectors = [
      'i.ri-user-line',         
      'i.ri-global-line',       
      'i.ri-telegram-2-line',   
      'i.ri-quill-pen-line',    
      'i.icon-pill',            
    ]
    
    let socialCount = 0
    socialSelectors.forEach(selector => {
      const icons = container.querySelectorAll(selector)
      socialCount += icons.length
    })
    
    container.classList.remove('social-glow-light', 'social-glow-medium', 'social-glow-strong')
    
    if (socialCount === 0) {
      
      return
    } else if (socialCount <= 2) {
      container.classList.add('social-glow-light')
    } else if (socialCount <= 4) {
      container.classList.add('social-glow-medium')
    } else {
      
      container.classList.add('social-glow-strong')
    }
  }

  applyHeatmapStyling(container) {
    
    const score = this.calculateHeatmapScore(container)
    
    const color = this.getHeatmapColor(score)
    
    container.style.setProperty('border-color', color.border, 'important')
    container.style.setProperty('background-color', color.background, 'important')
    container.style.setProperty('box-shadow', color.shadow, 'important')
    container.style.setProperty('border-width', '2px', 'important')
    container.style.setProperty('border-style', 'solid', 'important')
    
    container.setAttribute('data-heatmap-score', score.toFixed(1))
    container.setAttribute('data-heatmap-applied', 'true')
    
    console.log(`?? Heatmap: ${container.querySelector('span')?.textContent?.substring(0,20) || 'Token'} ? Score ${score.toFixed(1)} ? ${color.label}`)
  }

  calculateHeatmapScore(container) {
    let totalScore = 0
    const weights = this.config.heatmapWeights
    
    const holderGrowthScore = this.calculateHolderGrowthScore(container)
    totalScore += holderGrowthScore * weights.holderGrowth
    
    const transactionScore = this.calculateTransactionScore(container)
    totalScore += transactionScore * weights.transactionRatio
    
    const proTraderScore = this.calculateProTraderScore(container)
    totalScore += proTraderScore * weights.proTraders
    
    const ageScore = this.calculateAgeScore(container)
    totalScore += ageScore * weights.age
    
    return Math.min(100, Math.max(0, totalScore))
  }

  calculateHolderGrowthScore(container) {
    
    const holderElement = this.findHolderElement(container)
    if (!holderElement) return 50 
    
    const currentCount = this.extractHolderCount(holderElement)
    if (!currentCount) return 50
    
    const containerId = this.getContainerId(container)
    const trackedData = this.holderTracker.get(containerId)
    
    if (!trackedData) return 50 
    
    const previousCount = trackedData.count
    const increase = currentCount - previousCount
    
    if (increase >= 10) return 100 
    if (increase >= 5) return 85   
    if (increase >= 3) return 75   
    if (increase >= 1) return 65   
    if (increase === 0) return 50  
    if (increase <= -3) return 20  
    return 40 
  }

  calculateTransactionScore(container) {
    
    const txElements = container.querySelectorAll('div[class*="bg-increase"], div[class*="bg-decrease"]')
    
    if (txElements.length < 2) return 50 
    
    const buyBar = container.querySelector('div[class*="bg-increase"]')
    const sellBar = container.querySelector('div[class*="bg-decrease"]')
    
    if (!buyBar || !sellBar) return 50
    
    const buyWidth = parseFloat(buyBar.style.width) || 50
    const sellWidth = parseFloat(sellBar.style.width) || 50
    
    if (buyWidth >= 90) return 95  
    if (buyWidth >= 75) return 80  
    if (buyWidth >= 60) return 65  
    if (buyWidth >= 40) return 50  
    if (buyWidth >= 25) return 35  
    return 20 
  }

  calculateProTraderScore(container) {
    
    const proTraderElements = container.querySelectorAll('i.icon-pro-trader, img[alt*="Pro"]')
    
    if (proTraderElements.length === 0) return 50
    
    for (const element of proTraderElements) {
      const parent = element.parentElement
      if (parent) {
        const spans = parent.querySelectorAll('span')
        for (const span of spans) {
          const text = span.textContent.trim()
          if (text.match(/^\d+$/)) {
            const count = parseInt(text)
            
            if (count >= 20) return 100
            if (count >= 10) return 85
            if (count >= 5) return 70
            if (count >= 2) return 60
            if (count >= 1) return 55
            return 45 
          }
        }
      }
    }
    
    return 50 
  }

  calculateAgeScore(container) {
    
    const timeElements = container.querySelectorAll('span[class*="text-primaryGreen"]')
    
    for (const element of timeElements) {
      const text = element.textContent.trim()
      
      const match = text.match(/^(\d+)([smhd])$/)
      if (!match) continue
      
      const value = parseInt(match[1])
      const unit = match[2]
      
      let ageInMinutes = 0
      if (unit === 's') ageInMinutes = value / 60
      else if (unit === 'm') ageInMinutes = value
      else if (unit === 'h') ageInMinutes = value * 60
      else if (unit === 'd') ageInMinutes = value * 60 * 24
      
      if (ageInMinutes < 1) return 40      
      if (ageInMinutes < 5) return 55      
      if (ageInMinutes < 15) return 70     
      if (ageInMinutes < 30) return 65     
      if (ageInMinutes < 60) return 55     
      if (ageInMinutes < 120) return 45    
      return 35 
    }
    
    return 50 
  }

  getHeatmapColor(score) {
    
    if (score >= 80) {
      
      return {
        border: 'rgba(34, 197, 94, 0.8)',
        background: 'rgba(34, 197, 94, 0.08)',
        shadow: '0 0 15px rgba(34, 197, 94, 0.3)',
        label: '?? Strong Green (Bullish)'
      }
    } else if (score >= 65) {
      
      return {
        border: 'rgba(74, 222, 128, 0.7)',
        background: 'rgba(74, 222, 128, 0.06)',
        shadow: '0 0 12px rgba(74, 222, 128, 0.25)',
        label: '?? Green (Good)'
      }
    } else if (score >= 50) {
      
      return {
        border: 'rgba(245, 158, 11, 0.7)',
        background: 'rgba(245, 158, 11, 0.06)',
        shadow: '0 0 12px rgba(245, 158, 11, 0.25)',
        label: '?? Yellow (Neutral)'
      }
    } else if (score >= 35) {
      
      return {
        border: 'rgba(249, 115, 22, 0.7)',
        background: 'rgba(249, 115, 22, 0.06)',
        shadow: '0 0 12px rgba(249, 115, 22, 0.25)',
        label: '?? Orange (Weak)'
      }
    } else {
      
      return {
        border: 'rgba(239, 68, 68, 0.8)',
        background: 'rgba(239, 68, 68, 0.08)',
        shadow: '0 0 15px rgba(239, 68, 68, 0.3)',
        label: '?? Red (Bearish)'
      }
    }
  }

  initializeHolderCountMonitoring() {
    // 🔐 TOKEN GATE DISABLED FOR TESTING
    /*
    if (!this.tokenGatePassed) {
      console.log('🔐 Holder monitoring BLOCKED - no token access')
      return
    }
    */
    
    console.log("?? Initializing Holder Count Monitoring...")
    
    this.holderTracker = new Map()
    
    this.holderConfig = {
      rapidChangeThreshold: 1,    
      monitoringInterval: 500,    
      inactivityTimeout: 2000,    
      minHoldersForAlert: 1       
    }

    this.activeHolderEffects = new Map()
    
    this.processExistingHolderCounts()
    
    this.startHolderCountMonitoring()
    
    this.startHolderMonitoringHeartbeat()
    
    console.log("? Holder Count Monitoring initialized and RUNNING!")
  }

  startHolderMonitoringHeartbeat() {
    
    this.holderHeartbeatInterval = setInterval(() => {
      const trackedCount = this.holderTracker.size
      const activeCount = this.activeHolderEffects.size
      console.log(`?? HEARTBEAT: Tracking ${trackedCount} tokens, ${activeCount} with active effects`)
    }, 10000) 
  }

  processExistingHolderCounts() {
    const coinContainers = this.findCoinContainers()
    console.log(`???? Processing holder counts for ${coinContainers.length} containers`)
    
    coinContainers.forEach((container) => {
      this.trackHolderCount(container)
    })
  }

  startHolderCountMonitoring() {
    console.log('?? Starting holder count monitoring...')
    
    if (this.holderMonitoringInterval) {
      clearInterval(this.holderMonitoringInterval)
    }
    
    this.holderMonitoringInterval = setInterval(() => {
      try {
        const coinContainers = this.findCoinContainers()
        
        if (coinContainers.length > 0) {
          coinContainers.forEach((container) => {
            this.trackHolderCount(container)
          })
        }
      } catch (error) {
        console.error('Error in holder monitoring:', error)
      }
    }, this.holderConfig.monitoringInterval)
    
    console.log('? Holder monitoring interval started (every', this.holderConfig.monitoringInterval, 'ms)')
    
    this.setupHolderCountObserver()
  }

  setupHolderCountObserver() {
    
    if (this.holderCountObserver) {
      return
    }
    
    this.holderCountObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          
          let element = mutation.target
          while (element && element !== document.body) {
            if (this.isCoinContainer(element)) {
              
              clearTimeout(this.holderUpdateTimeout)
              this.holderUpdateTimeout = setTimeout(() => {
                this.trackHolderCount(element)
              }, 500)
              break
            }
            element = element.parentElement
          }
        }
      })
    })
    
    this.holderCountObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: false
    })
  }

  trackHolderCount(container) {
    // Safety check - if monitoring not initialized, skip silently
    if (!this.holderConfig || !this.holderTracker) {
      return
    }
    
    const holderElement = this.findHolderElement(container)
    if (!holderElement) {
      return
    }
    
    const currentCount = this.extractHolderCount(holderElement)
    if (currentCount === null || currentCount < this.holderConfig.minHoldersForAlert) {
      return
    }
    
    if (!this.holderTracker) {
      console.warn('?? holderTracker not initialized yet, skipping...')
      return
    }
    
    const containerId = this.getContainerId(container)
    
    const trackedData = this.holderTracker.get(containerId)
    const now = Date.now()
    
    if (trackedData) {
      const previousCount = trackedData.count
      const increase = currentCount - previousCount
      const timeSinceLastUpdate = now - trackedData.timestamp
      
      if (increase >= this.holderConfig.rapidChangeThreshold) {
        console.log(`?? RAPID INCREASE! ${containerId}: ${previousCount} ? ${currentCount} (+${increase})`)
        
        this.applyOrRefreshHolderPulsation(holderElement, containerId, increase, now)
        
      } else if (increase === 0) {
        
        const activeEffect = this.activeHolderEffects.get(containerId)
        if (activeEffect && (now - activeEffect.lastUpdate > this.holderConfig.inactivityTimeout)) {
          console.log(`? Removing effect from ${containerId} - no changes for ${this.holderConfig.inactivityTimeout}ms`)
          this.removeHolderPulsation(holderElement, containerId)
        }
      }
    }
    
    this.holderTracker.set(containerId, {
      count: currentCount,
      timestamp: now,
      element: holderElement
    })
  }

  applyOrRefreshHolderPulsation(holderElement, containerId, increase, timestamp) {
    const existingEffect = this.activeHolderEffects.get(containerId)
    
    if (existingEffect) {
      
      console.log(`?? Refreshing effect for ${containerId} (+${increase})`)
      existingEffect.lastUpdate = timestamp
      existingEffect.totalIncrease += increase
      
      this.updateHolderIncreaseBadge(holderElement, existingEffect.totalIncrease)
    } else {
      
      console.log(`? NEW effect for ${containerId} (+${increase})`)
      this.applyHolderPulsation(holderElement, increase)
      
      this.activeHolderEffects.set(containerId, {
        element: holderElement,
        lastUpdate: timestamp,
        totalIncrease: increase
      })
    }
  }

  removeHolderPulsation(holderElement, containerId) {
    
    holderElement.classList.remove('holder-rapid-increase')
    holderElement.removeAttribute('data-holder-rapid-change')
    holderElement.removeAttribute('data-holder-increase')
    
    const badge = holderElement.querySelector('.holder-increase-badge')
    if (badge) {
      badge.remove()
    }
    
    this.activeHolderEffects.delete(containerId)
    console.log(`?? Heartbeat effect removed from ${containerId}`)
  }

  findHolderElement(container) {
    
    const groupIcons = container.querySelectorAll('i.ri-group-line')
    
    if (groupIcons.length === 0) {
      return null
    }
    
    for (const icon of groupIcons) {

      const parentDiv = icon.parentElement
      if (parentDiv) {
        
        const spans = parentDiv.querySelectorAll('span')
        for (const span of spans) {
          const text = span.textContent.trim()
          if (text.match(/^\d+$/)) {
            return parentDiv 
          }
        }
      }
    }
    
    return null
  }

  extractHolderCount(holderElement) {
    
    const selectors = [
      'span[class*="text-[12px]"]',
      'span[class*="font-medium"]',
      'span'
    ]
    
    for (const selector of selectors) {
      const spans = holderElement.querySelectorAll(selector)
      for (const span of spans) {
        const text = span.textContent.trim()
        if (text.match(/^\d+$/)) {
          const count = parseInt(text)
          if (!isNaN(count)) {
            return count
          }
        }
      }
    }
    
    console.log('? Could not extract holder count')
    return null
  }

  getContainerId(container) {

    const tokenNameElement = container.querySelector('span[class*="text-textPrimary"][class*="text-[16px]"]')
    if (tokenNameElement) {
      return tokenNameElement.textContent.trim()
    }
    
    const allContainers = this.findCoinContainers()
    const index = Array.from(allContainers).indexOf(container)
    return `container-${index}`
  }

  applyHolderPulsation(holderElement, increase) {
    console.log('?? HEARTBEAT: Holder count increased by +' + increase)
    
    holderElement.setAttribute('data-holder-rapid-change', 'true')
    holderElement.setAttribute('data-holder-increase', increase.toString())
    
    holderElement.classList.add('holder-rapid-increase')
    
    this.createHolderIncreaseBadge(holderElement, increase)
    
    setTimeout(() => {
      holderElement.classList.remove('holder-rapid-increase')
      holderElement.removeAttribute('data-holder-rapid-change')
      console.log('?? Heartbeat complete')
    }, 3600)
    
    console.log('?? Heartbeat animation triggered!')
  }

  updateHolderIncreaseBadge(holderElement, totalIncrease) {
    const badge = holderElement.querySelector('.holder-increase-badge')
    if (badge) {
      badge.textContent = `+${totalIncrease}`
      
      badge.style.animation = 'none'
      setTimeout(() => {
        badge.style.animation = ''
      }, 10)
    }
  }

  createHolderIncreaseBadge(holderElement, increase) {
    
    const existingBadge = holderElement.querySelector('.holder-increase-badge')
    if (existingBadge) {
      existingBadge.remove()
    }
    
    const countSpan = holderElement.querySelector('span')
    if (!countSpan) {
      console.log('? Could not find holder count span for badge')
      return
    }
    
    const badge = document.createElement('span')
    badge.className = 'holder-increase-badge'
    badge.textContent = `+${increase}`
    
    if (countSpan.nextSibling) {
      countSpan.parentNode.insertBefore(badge, countSpan.nextSibling)
    } else {
      countSpan.parentNode.appendChild(badge)
    }
    
    console.log('? Badge inserted next to holder count')
  }

  // 🔥 MARKET CAP GROWTH MONITORING - Real-time green glow on growing market caps!
  initializeMarketCapGrowthMonitoring() {
    // 🔐 TOKEN GATE DISABLED FOR TESTING
    /*
    if (!this.tokenGatePassed) {
      console.log('🔐 Market cap growth monitoring BLOCKED - no token access')
      return
    }
    */
    
    console.log("💚 Initializing Market Cap Growth Monitoring...")
    
    this.marketCapTracker = new Map()
    
    this.marketCapConfig = {
      monitoringInterval: 500,    // Check every 0.5s
      inactivityTimeout: 500,     // Remove glow after 0.5s of no growth
      minChangeThreshold: 1       // Min $1 change to trigger glow
    }

    this.activeMarketCapGlows = new Map()
    
    this.startMarketCapMonitoring()
    
    console.log("✅ Market Cap Growth Monitoring initialized and RUNNING!")
  }

  startMarketCapMonitoring() {
    console.log('💚 Starting market cap growth monitoring...')
    
    if (this.marketCapMonitoringInterval) {
      clearInterval(this.marketCapMonitoringInterval)
    }
    
    this.marketCapMonitoringInterval = setInterval(() => {
      try {
        const coinContainers = this.findCoinContainers()
        if (coinContainers.length > 0) {
          coinContainers.forEach((container) => {
            this.trackMarketCapGrowth(container)
          })
        }
      } catch (error) {
        console.error('Error in market cap monitoring:', error)
      }
    }, this.marketCapConfig.monitoringInterval)
    
    console.log('✅ Market cap monitoring interval started (every', this.marketCapConfig.monitoringInterval, 'ms)')
  }

  trackMarketCapGrowth(container) {
    // Safety check - if monitoring not initialized, skip silently
    if (!this.marketCapConfig || !this.marketCapTracker) {
      return
    }
    
    const marketCapElement = this.findMarketCapElement(container)
    if (!marketCapElement) {
      return
    }
    
    const currentMarketCap = this.extractMarketCapFromContainer(container)
    if (currentMarketCap === null || currentMarketCap === 0) {
      return
    }
    
    if (!this.marketCapTracker) {
      console.warn('⚠️ marketCapTracker not initialized yet, skipping...')
      return
    }
    
    const containerId = this.getContainerId(container)
    const trackedData = this.marketCapTracker.get(containerId)
    const now = Date.now()
    
    if (trackedData) {
      const previousMarketCap = trackedData.marketCap
      const change = currentMarketCap - previousMarketCap
      
      if (change >= this.marketCapConfig.minChangeThreshold) {
        // 💚 GROWTH DETECTED - Apply green glow!
        console.log(`💚 MC GROWTH! ${containerId}: $${previousMarketCap.toFixed(0)} → $${currentMarketCap.toFixed(0)} (+$${change.toFixed(0)})`)
        this.applyMarketCapGreenGlow(marketCapElement, containerId, now)
      } else {
        // ⏱️ No significant growth - check if we should remove glow
        const activeGlow = this.activeMarketCapGlows.get(containerId)
        if (activeGlow) {
          const timeSinceLastGrowth = now - activeGlow.lastGrowth
          
          // Remove glow if no growth for the timeout period
          if (timeSinceLastGrowth > this.marketCapConfig.inactivityTimeout) {
            console.log(`📉 Removing green glow from ${containerId} - no growth for ${timeSinceLastGrowth}ms (change: $${change.toFixed(0)})`)
            this.removeMarketCapGreenGlow(marketCapElement, containerId)
          }
        }
      }
    }
    
    this.marketCapTracker.set(containerId, {
      marketCap: currentMarketCap,
      timestamp: now,
      element: marketCapElement
    })
  }

  findMarketCapElement(container) {
    // Find the MC label and its value span
    const mcLabels = container.querySelectorAll('span')
    
    for (const span of mcLabels) {
      if (span.textContent.trim() === 'MC') {
        const nextSpan = span.nextElementSibling
        if (nextSpan && nextSpan.textContent.includes('$')) {
          return nextSpan
        }
      }
    }
    
    return null
  }

  applyMarketCapGreenGlow(marketCapElement, containerId, timestamp) {
    // Store original color
    if (!this.activeMarketCapGlows.has(containerId)) {
      const originalColor = window.getComputedStyle(marketCapElement).color
      this.activeMarketCapGlows.set(containerId, {
        element: marketCapElement,
        originalColor: originalColor,
        lastGrowth: timestamp
      })
    } else {
      // Update last growth time
      const glowData = this.activeMarketCapGlows.get(containerId)
      glowData.lastGrowth = timestamp
    }
    
    // Apply green glow
    marketCapElement.style.color = 'rgb(34, 197, 94)'
    marketCapElement.style.textShadow = '0 0 8px rgba(34, 197, 94, 0.6), 0 0 12px rgba(34, 197, 94, 0.4)'
    marketCapElement.style.transition = 'color 0.3s ease, text-shadow 0.3s ease'
    marketCapElement.setAttribute('data-mc-growing', 'true')
  }

  removeMarketCapGreenGlow(marketCapElement, containerId) {
    const glowData = this.activeMarketCapGlows.get(containerId)
    if (!glowData) return
    
    // Restore original color
    marketCapElement.style.color = glowData.originalColor
    marketCapElement.style.textShadow = ''
    marketCapElement.style.transition = 'color 0.5s ease, text-shadow 0.5s ease'
    marketCapElement.removeAttribute('data-mc-growing')
    
    // Remove from active glows
    this.activeMarketCapGlows.delete(containerId)
    console.log(`✅ Market cap glow removed, restored to ${glowData.originalColor}`)
  }

  initializeXapeAgent() {
    console.log("?????? INITIALIZING XAPE VOICE AGENT - ULTRA AGGRESSIVE MODE! ??????")
    
    this.createXapeFloatingWidget()
    
    for (let i = 1; i <= 10; i++) {
      setTimeout(() => this.createXapeFloatingWidget(), i * 50)
    }
    
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => this.createXapeFloatingWidget(), 500 + (i * 500))
    }
    
    setTimeout(async () => {
      
      if (window.isAutoLoad) {
        console.log('🔇 Auto-load detected - skipping XAPE initialization messages')
        return 
      }
      
      console.log('🎯 First initialization - showing messages')
      
      console.log('🎤🎤🎤 AUTO-STARTING XAPE LISTENING... 🎤🎤🎤')
      if (!this.isListening) {
        try {
          await this.startContinuousListening()
          console.log('✅ XAPE is listening! Waiting for "initialize" command...')
        } catch (error) {
          console.error('❌ FAILED TO START XAPE:', error)
          alert('⚠️ XAPE FAILED TO START!\n\nPlease:\n1. Allow microphone access\n2. Click the blue wave to start XAPE manually')
          return
        }
      }
      
      const userName = localStorage.getItem('xape_user_name')
      const userGender = localStorage.getItem('xape_user_gender')
      const userTitle = localStorage.getItem('xape_user_title')
      
      if (!userName || !userGender || !userTitle) {
        console.log('👤 First-time XAPE setup - asking by VOICE!')
        
        this.xapeSetupMode = true
        this.xapeSetupStep = 'name'
        
        setTimeout(() => {
          const greeting = "Good day. I am XAPE, your cryptocurrency AI assistant. Important: After initialization, press Caps Lock to activate me. When the orb turns blue, I'm listening. Click on the orb anytime to see how it works. Now, before we begin, I need to know your name. What shall I call you?"
          this.showXapeResponse(greeting)
          this.speakResponse(greeting)
        }, 2000)
      } else {
        
        const finalName = localStorage.getItem('xape_user_name') || 'User'
        const finalTitle = localStorage.getItem('xape_user_title') || 'Sir'
        
        const currentHour = new Date().getHours()
        let timeGreeting
        if (currentHour >= 5 && currentHour < 12) {
          timeGreeting = 'Good morning'
        } else if (currentHour >= 12 && currentHour < 17) {
          timeGreeting = 'Good afternoon'
        } else if (currentHour >= 17 && currentHour < 21) {
          timeGreeting = 'Good evening'
        } else {
          timeGreeting = 'Good night'
        }
        
        setTimeout(() => {
          
          let userName = finalName
          if (!userName || userName === 'User' || userName.includes('looking') || userName.includes('undefined')) {
            console.log('⚠️ User name not set or invalid, asking for setup...')
            
            this.xapeSetupMode = true
            this.xapeSetupStep = 'name'
            const setupGreeting = `${timeGreeting}. I am XAPE, your cryptocurrency AI assistant. Important: After initialization, press Caps Lock to activate me. When the orb turns blue, I'm listening. Click on the orb anytime to see how it works. Now, before we begin, I need to know your name. What shall I call you?`
            this.showXapeResponse(setupGreeting)
            this.speakResponse(setupGreeting)
            return
          }
          
          const greeting = `${timeGreeting}, ${finalTitle} ${userName}. Important reminder: After initialization, press Caps Lock to activate me. The orb will turn blue when I'm listening. Click on the orb anytime to see how it works. Whenever you are ready, please give me the order to initialize.`
          this.showXapeResponse(greeting)
          this.speakResponse(greeting)
        }, 2000)
      }
    }, 300) 
    
    setInterval(() => {
      if (!this.xapeFloatingWidget || !document.body.contains(this.xapeFloatingWidget)) {
        const existingWidget = document.getElementById('xape-mini-waveform')
        if (!existingWidget) {
          console.log('?????? XAPE WIDGET DISAPPEARED - RECREATING NOW!')
          this.createXapeFloatingWidget()
        }
      }
    }, 1500) 
    
    console.log("? XAPE Voice Agent initialized!")
    
    this.startSOLBalanceMonitoring()
  }
  
  startSOLBalanceMonitoring() {
    console.log("?? Starting SOL Balance Monitoring...")
    
    this.lastSOLBalance = null
    this.solBalanceCheckInterval = setInterval(() => {
      this.checkSOLBalance()
    }, 2000) 
    
    this.checkSOLBalance()
    
    console.log("? SOL Balance Monitoring active!")
  }
  
  checkSOLBalance() {
    try {
      
      const solBalanceElements = document.querySelectorAll('span.text-\\[14px\\].font-semibold.text-textPrimary')
      
      let solBalance = null
      for (const el of solBalanceElements) {
        const text = el.textContent.trim()
        
        if (text.match(/^\d+\.\d+$/)) {
          
          const parent = el.closest('.flex-row')
          if (parent && parent.querySelector('img[alt="SOL"]')) {
            solBalance = parseFloat(text)
            break
          }
        }
      }
      
      if (solBalance === null) {
        
        const altElements = document.querySelectorAll('img[alt="SOL"]')
        for (const img of altElements) {
          const balanceSpan = img.parentElement?.querySelector('span.text-\\[14px\\].font-semibold')
          if (balanceSpan) {
            const text = balanceSpan.textContent.trim()
            if (text.match(/^\d+\.\d+$/)) {
              solBalance = parseFloat(text)
              break
            }
          }
        }
      }
      
      if (solBalance !== null) {
        
        if (this.lastSOLBalance !== null && solBalance !== this.lastSOLBalance) {
          const diff = solBalance - this.lastSOLBalance
          const absDiff = Math.abs(diff)
          
          if (absDiff >= 0.001) { 
            console.log(`💰 SOL Balance changed: ${this.lastSOLBalance} → ${solBalance} (${diff > 0 ? '+' : ''}${diff.toFixed(4)})`)
            
            const timeSinceAction = this.lastTradingTime ? Date.now() - this.lastTradingTime : 999999
            const isRecentAction = timeSinceAction < 30000 
            
            if (isRecentAction && this.lastTradingAction === 'buy' && diff < 0) {
              
              console.log(`🎯 Balance drop is from BUY action (${Math.round(timeSinceAction/1000)}s ago) - NOT commenting on it!`)
              
            } else if (isRecentAction && this.lastTradingAction === 'sell') {
              
              console.log(`🎯 Balance change is from SELL action (${Math.round(timeSinceAction/1000)}s ago) - Commenting on P&L!`)
              
              if (this.balanceBeforeBuy !== null) {
                const realDiff = solBalance - this.balanceBeforeBuy
                const realAbsDiff = Math.abs(realDiff)
                
                console.log(`💰 Balance BEFORE buy: ${this.balanceBeforeBuy} SOL`)
                console.log(`💰 Balance AFTER sell: ${solBalance} SOL`)
                console.log(`💰 REAL P&L: ${realDiff > 0 ? '+' : ''}${realDiff.toFixed(4)} SOL`)
                
                if (realDiff > 0.001) {
                  
                  const message = `Yes! Let's fucking go! We just gained ${realAbsDiff.toFixed(4)} SOL! Balance now ${solBalance}`
                  this.showXapeResponse(message)
                  if (this.isListening) {
                    this.speakResponse(message)
                  }
                } else if (realDiff < -0.001) {
                  
                  const message = `Rough one. We lost ${realAbsDiff.toFixed(4)} SOL on that trade. Balance down to ${solBalance}. Let's get it back!`
                  this.showXapeResponse(message)
                  if (this.isListening) {
                    this.speakResponse(message)
                  }
                } else {
                  
                  const message = `Break even on that trade. Balance: ${solBalance} SOL`
                  this.showXapeResponse(message)
                  if (this.isListening) {
                    this.speakResponse(message)
                  }
                }
                
                this.balanceBeforeBuy = null
              } else {
                
                console.log(`⚠️ No balanceBeforeBuy tracked - using simple diff`)
            if (diff > 0) {
                  const message = `Balance increased by ${absDiff.toFixed(4)} SOL`
              this.showXapeResponse(message)
              if (this.isListening) {
                this.speakResponse(message)
              }
            } else {
                  const message = `Balance decreased by ${absDiff.toFixed(4)} SOL`
              this.showXapeResponse(message)
              if (this.isListening) {
                this.speakResponse(message)
              }
                }
              }
            } else if (!isRecentAction) {
              
              console.log(`💰 Balance changed without trading action - likely a transfer or external action`)
              
            }
          }
        }
        
        this.lastSOLBalance = solBalance
      }
    } catch (error) {
      
    }
  }

  initializeCabalMonitoring() {
    console.log("?? Initializing Cabal Monitoring...")
    
    this.cabalMonitor = new CabalMonitor()
    
    this.cabalMonitor.start()
    
    console.log("? Cabal Monitoring initialized and ACTIVE!")
  }

  initializeTimeGrouping() {
    console.log("? Initializing Time Grouping...")
    
    this.timeGrouping = new TimeGrouping()
    
    this.timeGrouping.start()
    
    console.log("? Time Grouping initialized and ACTIVE!")
  }

  initializeTradingAgent() {
    if (!this.config.tradingAgent.enabled) {
      console.log("???? Trading Agent disabled in config")
      return
    }

    console.log("???? Initializing AI Trading Agent...")
    
    this.tradingAgent = new AITradingAgent(this.config.tradingAgent, this)
    this.tradingAgent.initialize()
    
    console.log("??? AI Trading Agent initialized")
  }

  initializeScamDetection() {
    if (!this.config.scamDetection.enabled) {
      console.log("???? Scam Detection disabled in config")
      return
    }

    console.log("???? Initializing Scam Detection System...")
    
    this.scamDetector = new ScamDetector(this.config.scamDetection, this)
    this.scamDetector.initialize()
    
    console.log("??? Scam Detection System initialized")
  }

}

let periodicCheckInterval = null

function startPeriodicStateCheck() {
  if (periodicCheckInterval) return

  periodicCheckInterval = setInterval(async () => {
    try {
      if (!chrome || !chrome.storage) {
        stopPeriodicStateCheck()
        return
      }

      const settings = await chrome.storage.local.get({ extensionEnabled: true, skillbarEnabled: true })

      if (!settings.extensionEnabled) {
        const skillBar = document.getElementById("axiom-skill-bar")
        if (skillBar) {
          forceCleanupAll()
        }
      }

      if (settings.extensionEnabled && !settings.skillbarEnabled) {
        const skillBar = document.getElementById("axiom-skill-bar")
        if (skillBar) {
          if (skillbarInstance) {
            skillbarInstance.destroyAllComponents()
            skillbarInstance = null
          }
        }
      }
    } catch (error) {
      if (error.message.includes("Extension context invalidated")) {
        stopPeriodicStateCheck()
      }
    }
  }, 10000)
}

function stopPeriodicStateCheck() {
  if (periodicCheckInterval) {
    clearInterval(periodicCheckInterval)
    periodicCheckInterval = null
  }
}

startPeriodicStateCheck()

window.addEventListener("beforeunload", () => {
  stopPeriodicStateCheck()
  forceCleanupAll()
  observer.disconnect()
})

window.testHolderEffect = () => {
  console.log('?? TESTING HOLDER PULSATION EFFECT...')
  
  if (!skillbarInstance) {
    console.log('? Skillbar not initialized')
    return
  }
  
  const containers = document.querySelectorAll('[data-market-cap-category]')
  console.log(`Found ${containers.length} containers`)
  
  if (containers.length === 0) {
    console.log('? No containers found on page')
    return
  }
  
  const firstContainer = containers[0]
  console.log('Testing with first container:', firstContainer)
  
  const holderElement = skillbarInstance.findHolderElement(firstContainer)
  
  if (!holderElement) {
    console.log('? Could not find holder element')
    console.log('Checking for ri-group-line icons...')
    const icons = document.querySelectorAll('i.ri-group-line')
    console.log(`Found ${icons.length} holder icons on page`)
    if (icons.length > 0) {
      console.log('First icon structure:', icons[0].parentElement.innerHTML)
      console.log('?? Applying effect to first icon directly...')
      skillbarInstance.applyHolderPulsation(icons[0].parentElement, 5)
    }
    return
  }
  
  console.log('? Found holder element:', holderElement)
  console.log('?? Applying pulsation effect with +5 increase...')
  skillbarInstance.applyHolderPulsation(holderElement, 5)
  console.log('? Effect applied! Should see bright green pulsating animation for 3 seconds')
}

window.testHolderEffectAll = () => {
  console.log('?? TESTING HOLDER EFFECT ON ALL TOKENS...')
  
  if (!skillbarInstance) {
    console.log('? Skillbar not initialized')
    return
  }
  
  const icons = document.querySelectorAll('i.ri-group-line')
  console.log(`Found ${icons.length} holder icons`)
  
  icons.forEach((icon, index) => {
    setTimeout(() => {
      const parent = icon.parentElement
      console.log(`Applying effect to icon ${index + 1}/${icons.length}`)
      skillbarInstance.applyHolderPulsation(parent, 3 + index)
    }, index * 500) 
  })
  
  console.log('? Effects will apply to all tokens with stagger')
}

window.refreshAllColors = () => {
  console.log('?? Manual refresh triggered...')
  if (skillbarInstance && skillbarInstance.refreshAllVisuals) {
    skillbarInstance.refreshAllVisuals()
  } else {
    console.log("? Skillbar instance not available")
  }
}

window.testMarketCapParsing = () => {
  if (skillbarInstance && skillbarInstance.testMarketCapParsing) {
    skillbarInstance.testMarketCapParsing()
  } else {
    console.log("??? Skillbar instance not available")
  }
}

window.testTradingAgent = () => {
  if (skillbarInstance && skillbarInstance.tradingAgent) {
    console.log("???? Testing Trading Agent position detection...")
    skillbarInstance.tradingAgent.scanForPositions()
    console.log("???? Current positions:", Array.from(skillbarInstance.tradingAgent.positions.entries()))
  } else {
    console.log("??? Trading Agent not available")
  }
}

window.refreshTradingAgent = () => {
  if (skillbarInstance && skillbarInstance.tradingAgent) {
    console.log("???? Refreshing Trading Agent...")
    skillbarInstance.tradingAgent.positions.clear()
    skillbarInstance.tradingAgent.alertCounts.clear()
    skillbarInstance.tradingAgent.scanForPositions()
    skillbarInstance.tradingAgent.sendAgentMessage("???? Position scan refreshed! Check your positions now.", "system")
  } else {
    console.log("??? Trading Agent not available")
  }
}

window.clearAllScamBadges = () => {
  document.querySelectorAll('.scam-badge').forEach(badge => badge.remove())
  document.querySelectorAll('.scam-flagged').forEach(el => {
    el.classList.remove('scam-flagged')
  })
  console.log("All scam badges cleared")
}

window.refreshEverything = () => {
  if (skillbarInstance) {
    console.log('?? Refreshing everything...')
    
    window.clearAllScamBadges()
    
    skillbarInstance.removeAllMarketCapStyling()
    skillbarInstance.processExistingCoinContainers()
    
    console.log('? Everything refreshed')
  }
}

window.refreshMarketCapFiltering = () => {
  if (skillbarInstance) {
    console.log('???? Refreshing Market Cap Filtering...')
    document.querySelectorAll('[class*="market-cap-"]').forEach(el => {
      el.classList.remove('market-cap-low', 'market-cap-medium', 'market-cap-high', 'market-cap-very-high', 'market-cap-mega', 'market-cap-unknown')
    })
    if (skillbarInstance.processExistingCoinContainers) {
      skillbarInstance.processExistingCoinContainers()
    }
    console.log('??? Market Cap Filtering refreshed')
  } else {
    console.log('??? Skillbar instance not available')
  }
}

