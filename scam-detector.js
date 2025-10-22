

class ScamDetector {
  constructor(config, skillbarInstance) {
    this.config = config
    this.skillbarInstance = skillbarInstance
    this.scammedTokens = new Map()
    this.monitoringInterval = null
    this.isInitialized = false
  }

  initialize() {
    if (this.isInitialized) return

    console.log("🚨 Scam Detection System starting up...")
    
    
    this.startScamMonitoring()
    
    
    this.setupScamObservers()
    
    
    console.log("🛡️ Scam Detection System active - adding badges to suspicious tokens")
    
    this.isInitialized = true
  }

  startScamMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    
    this.scanForScams()

    
    this.monitoringInterval = setInterval(() => {
      try {
        this.scanForScams()
      } catch (error) {
        console.error('Error in scam monitoring:', error)
      }
    }, 2000) 
    
    console.log('✅ Scam monitoring active (every 2s)')
  }

  scanForScams() {
    console.log("🔍 Scanning for potential scams...")
    
    
    const coinContainers = this.findCoinContainers()
    
    console.log(`Found ${coinContainers.length} containers to scan`)
    
    coinContainers.forEach(container => {
      const tokenData = this.extractTokenData(container)
      if (tokenData) {
        const scamProbability = this.calculateScamProbability(tokenData)
        
        if (scamProbability >= this.config.alertLevels.warning) {
          this.flagAsScam(container, tokenData, scamProbability)
        } else {
          
          this.removeScamBadge(container)
        }
      }
    })
  }
  
  removeScamBadge(container) {
    const existingBadge = container.querySelector('.scam-badge')
    if (existingBadge) {
      existingBadge.remove()
      container.removeAttribute('data-scam-flagged')
      container.classList.remove('scam-flagged')
    }
  }

  parseValue(text) {
    
    if (!text) return null
    
    const cleanText = text.replace(/\$/g, '').trim()
    const match = cleanText.match(/([\d.]+)([KMB])?/)
    
    if (!match) return null
    
    let value = parseFloat(match[1])
    const suffix = match[2]
    
    if (suffix === 'K') value *= 1000
    else if (suffix === 'M') value *= 1000000
    else if (suffix === 'B') value *= 1000000000
    
    return value
  }

  findCoinContainers() {
    
    if (this.skillbarInstance && this.skillbarInstance.findCoinContainers) {
      return this.skillbarInstance.findCoinContainers()
    }
    
    
    const selectors = [
      'div[class*="border-primaryStroke"][class*="flex"][class*="flex-col"]',
      'div[class*="h-[142px]"][class*="min-h-[142px]"]',
      'div[class*="sm:h-[116px]"][class*="sm:min-h-[116px]"]'
    ]
    
    let containers = []
    selectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector)
        containers = containers.concat(Array.from(found))
      } catch (e) {
        
      }
    })
    
    
    return [...new Set(containers)]
  }

  extractTokenData(container) {
    try {
      const data = {
        name: null,
        holders: null,
        marketCap: null,
        volume: null,
        age: null,
        liquidity: null,
        container: container
      }
      
      
      const nameElements = container.querySelectorAll('span[class*="text-textPrimary"][class*="text-[16px]"]')
      for (const el of nameElements) {
        const text = el.textContent.trim()
        if (text && text.length < 50 && !text.includes('$')) {
          data.name = text
          break
        }
      }
      
      
      if (this.skillbarInstance) {
        const holderElement = this.skillbarInstance.findHolderElement(container)
        if (holderElement) {
          data.holders = this.skillbarInstance.extractHolderCount(holderElement)
        }
      }
      
      
      if (data.holders === null) {
        const groupIcon = container.querySelector('i.ri-group-line')
        if (groupIcon) {
          const parent = groupIcon.parentElement
          if (parent) {
            const spans = parent.querySelectorAll('span')
            for (const span of spans) {
              const text = span.textContent.trim()
              if (text.match(/^\d+$/)) {
                data.holders = parseInt(text)
                break
              }
            }
          }
        }
      }
      
      
      const mcLabels = container.querySelectorAll('span')
      for (let i = 0; i < mcLabels.length; i++) {
        const span = mcLabels[i]
        if (span.textContent.trim() === 'MC') {
          
          const valueSpan = mcLabels[i + 1]
          if (valueSpan) {
            const mcText = valueSpan.textContent.trim()
            data.marketCap = this.parseValue(mcText)
            console.log(`💰 Market Cap: ${mcText} = $${data.marketCap?.toLocaleString()}`)
            break
          }
        }
      }
      
      
      for (let i = 0; i < mcLabels.length; i++) {
        const span = mcLabels[i]
        if (span.textContent.trim() === 'V') {
          
          const valueSpan = mcLabels[i + 1]
          if (valueSpan) {
            const volText = valueSpan.textContent.trim()
            data.volume = this.parseValue(volText)
            console.log(`📊 Volume: ${volText} = $${data.volume?.toLocaleString()}`)
            break
          }
        }
      }
      
      
      const ageMatch = text.match(/(\d+)(s|m|h|d)/i)
      if (ageMatch) {
        let ageInSeconds = parseInt(ageMatch[1])
        const unit = ageMatch[2].toLowerCase()
        
        if (unit === 'm') ageInSeconds *= 60
        else if (unit === 'h') ageInSeconds *= 3600
        else if (unit === 'd') ageInSeconds *= 86400
        
        data.age = ageInSeconds
      }
      
      
      if (data.name && (data.holders !== null || data.marketCap !== null)) {
        console.log(`📊 Extracted token data:`, data)
        return data
      } else {
        
        if (data.name) {
          console.log(`🔍 Found token "${data.name}" but missing data:`, {
            holders: data.holders,
            marketCap: data.marketCap,
            text: text.substring(0, 200) + '...'
          })
        }
      }
    } catch (error) {
      console.error('Error extracting token data:', error)
    }
    
    return null
  }

  calculateScamProbability(tokenData) {
    let scamScore = 0
    const reasons = []
    
    console.log(`🧮 Calculating scam probability for: ${tokenData.name}`)
    console.log(`   Market Cap: $${tokenData.marketCap?.toLocaleString() || 'N/A'}`)
    console.log(`   Holders: ${tokenData.holders}`)
    console.log(`   Volume: ${tokenData.volume || 'N/A'}`)
    
    
    if (tokenData.marketCap && tokenData.holders !== null) {
      
      
      if (tokenData.marketCap >= 100000 && tokenData.holders <= 3) {
        scamScore += 1.0
        reasons.push(`🚨 CRITICAL: $${(tokenData.marketCap/1000).toFixed(0)}K MC with only ${tokenData.holders} holders`)
        console.log(`   ✓ FLAGGED: 100K+ MC with ≤3 holders - DEFINITE SCAM`)
      }
      
      
      else if (tokenData.marketCap >= 50000 && tokenData.holders === 0) {
        scamScore += 1.0
        reasons.push(`🚨 CRITICAL: $${(tokenData.marketCap/1000).toFixed(0)}K MC with 0 holders`)
        console.log(`   ✓ FLAGGED: 50K+ MC with 0 holders - SCAM`)
      }
      
      
      else if (tokenData.marketCap >= 50000 && tokenData.holders >= 1 && tokenData.holders <= 5) {
        scamScore += 0.95
        reasons.push(`🚨 HIGH RISK: $${(tokenData.marketCap/1000).toFixed(0)}K MC with only ${tokenData.holders} holders`)
        console.log(`   ✓ FLAGGED: 50K+ MC with ≤5 holders`)
      }
      
      
      else if (tokenData.marketCap >= 20000 && tokenData.holders <= 2) {
        scamScore += 0.85
        reasons.push(`⚠️ SUSPICIOUS: $${(tokenData.marketCap/1000).toFixed(0)}K MC with only ${tokenData.holders} holders`)
        console.log(`   ✓ FLAGGED: 20K+ MC with ≤2 holders`)
      }
      
      
      else if (tokenData.holders > 0) {
        const mcPerHolder = tokenData.marketCap / tokenData.holders
        console.log(`   MC per holder: $${mcPerHolder.toLocaleString()}`)
        
        
        if (mcPerHolder > 50000) {
          scamScore += 0.8
          reasons.push(`Extreme MC/holder ratio: $${mcPerHolder.toFixed(0)} per holder`)
          console.log(`   ✓ FLAGGED: MC per holder > $50,000`)
        }
        
        else if (mcPerHolder > 20000) {
          scamScore += 0.6
          reasons.push(`High MC/holder ratio: $${mcPerHolder.toFixed(0)} per holder`)
          console.log(`   ✓ FLAGGED: MC per holder > $20,000`)
        }
      }
    }
    
    
    if (tokenData.volume !== null && tokenData.marketCap) {
      
      if (tokenData.volume === 0 && tokenData.marketCap >= 50000) {
        scamScore += 0.5
        reasons.push(`Zero volume with $${(tokenData.marketCap/1000).toFixed(0)}K MC`)
        console.log(`   ✓ FLAGGED: Zero volume with high MC`)
      }
      
      else if (tokenData.volume > 0 && tokenData.marketCap > 0) {
        const volumeRatio = tokenData.volume / tokenData.marketCap
        if (volumeRatio < 0.01 && tokenData.marketCap >= 50000) {
          scamScore += 0.3
          reasons.push(`Very low volume: ${(volumeRatio * 100).toFixed(2)}% of MC`)
          console.log(`   ✓ FLAGGED: Volume < 1% of MC`)
        }
      }
    }
    
    
    
    
    
    if (tokenData.name) {
      const suspiciousPatterns = [
        /pump/i,
        /moon/i,
        /100x/i,
        /guaranteed/i,
        /safe/i,
        /elon/i,
        /doge.*killer/i
      ]
      
      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(tokenData.name)) {
          scamScore += 0.1
          reasons.push(`Suspicious name pattern: ${tokenData.name}`)
        }
      })
    }
    
    
    scamScore = Math.min(scamScore, 1.0)
    
    console.log(`   Final scam score: ${scamScore} (${(scamScore * 100).toFixed(1)}%)`)
    console.log(`   Reasons: ${reasons.join(', ')}`)
    console.log(`   Result: ${scamScore >= 0.6 ? '🚨 SCAM DETECTED' : '✅ Not a scam'}`)
    
    if (scamScore > 0) {
      console.log(`🚨 Scam probability for ${tokenData.name}: ${(scamScore * 100).toFixed(1)}%`, reasons)
    }
    
    return scamScore
  }

  flagAsScam(container, tokenData, scamProbability) {
    
    const previouslyFlagged = container.hasAttribute('data-scam-flagged')
    
    container.setAttribute('data-scam-flagged', 'true')
    container.setAttribute('data-scam-probability', scamProbability.toFixed(2))
    
    
    const isCritical = scamProbability >= this.config.alertLevels.critical
    const level = isCritical ? 'critical' : 'warning'
    
    
    this.addScamBadge(container, level, scamProbability)
    
    
    this.addScamStyling(container, level)
    
    
    if (!previouslyFlagged) {
      this.alertAgent(tokenData, scamProbability, level)
    }
    
    
    this.scammedTokens.set(tokenData.name, {
      ...tokenData,
      probability: scamProbability,
      detectedAt: previouslyFlagged ? this.scammedTokens.get(tokenData.name)?.detectedAt : Date.now()
    })
  }

  addScamBadge(container, level, probability) {
    
    const existingBadge = container.querySelector('.scam-badge')
    if (existingBadge) {
      existingBadge.remove()
    }
    
    const badge = document.createElement('div')
    badge.className = 'scam-badge'
    
    
    badge.innerHTML = `
      <div class="scam-badge-content">
        <span class="scam-icon">🚨</span>
        <span class="scam-text">SCAM</span>
      </div>
    `
    
    
    container.appendChild(badge)
  }

  addScamStyling(container, level) {
    
    
    container.classList.add('scam-flagged')
  }

  alertAgent(tokenData, probability, level) {
    
    console.log(`🚨 Scam detected: ${tokenData.name} (${(probability * 100).toFixed(0)}%)`)
  }

  setupScamObservers() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              
              const tokenData = this.extractTokenData(node)
              if (tokenData) {
                const scamProbability = this.calculateScamProbability(tokenData)
                if (scamProbability >= this.config.alertLevels.warning) {
                  setTimeout(() => {
                    this.flagAsScam(node, tokenData, scamProbability)
                  }, 100)
                }
              }
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  getScamStatistics() {
    const total = this.scammedTokens.size
    const critical = Array.from(this.scammedTokens.values()).filter(t => t.probability >= 0.9).length
    const warning = total - critical
    
    return {
      total,
      critical,
      warning,
      scammedTokens: Array.from(this.scammedTokens.entries())
    }
  }

  destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    
    this.scammedTokens.clear()
    this.isInitialized = false
  }
}

