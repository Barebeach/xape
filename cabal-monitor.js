

class CabalMonitor {
  constructor() {
    this.cabalData = new Map() 
    this.isMonitoring = false
    this.scanInterval = null
    console.log('🏆 CabalMonitor initialized')
  }

  start() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    console.log('🏆 Starting cabal monitoring...')
    
    
    this.scanForCabals()
    
    
    this.scanInterval = setInterval(() => {
      this.scanForCabals()
    }, 2000)
  }

  stop() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval)
      this.scanInterval = null
    }
    this.isMonitoring = false
    console.log('🏆 Cabal monitoring stopped')
  }

  scanForCabals() {
    
    const containers = document.querySelectorAll('div[class*="border-b-[1px]"][class*="flex-col"]')
    
    containers.forEach(container => {
      
      const trophyIcon = container.querySelector('i.ri-trophy-line')
      if (!trophyIcon) return
      
      
      const cabalCountSpan = trophyIcon.parentElement.querySelector('span.text-textPrimary')
      if (!cabalCountSpan) return
      
      const cabalCount = parseInt(cabalCountSpan.textContent.trim()) || 0
      
      
      const tokenAddress = this.extractTokenAddress(container)
      if (!tokenAddress) return
      
      
      const previousData = this.cabalData.get(tokenAddress)
      
      if (previousData) {
        const previousCount = previousData.count
        const lastAlertedCount = previousData.lastAlertedCount || 0
        
        
        
        if (cabalCount > previousCount && cabalCount > lastAlertedCount) {
          console.log(`🏆⚡ CABAL BOUGHT! Token: ${tokenAddress}, Count: ${previousCount} → ${cabalCount}`)
          this.triggerShockWave(container, cabalCount, previousCount)
          this.playShockSound()
          
          
          this.cabalData.set(tokenAddress, {
            count: cabalCount,
            lastAlertedCount: cabalCount, 
            lastUpdate: Date.now()
          })
        } else {
          
          this.cabalData.set(tokenAddress, {
            count: cabalCount,
            lastAlertedCount: previousData.lastAlertedCount || 0,
            lastUpdate: Date.now()
          })
        }
      } else {
        
        this.cabalData.set(tokenAddress, {
          count: cabalCount,
          lastAlertedCount: cabalCount, 
          lastUpdate: Date.now()
        })
      }
    })
  }

  triggerShockWave(container, newCount, oldCount) {
    
    container.classList.add('cabal-shock-wave')
    container.classList.add('cabal-blue-glow')
    
    
    this.makeTrophyPop(container)
    
    
    setTimeout(() => {
      container.classList.remove('cabal-shock-wave')
    }, 5100)
    
    setTimeout(() => {
      container.classList.remove('cabal-blue-glow')
    }, 3000)
  }

  makeTrophyPop(container) {
    
    const trophyIcon = container.querySelector('i.ri-trophy-line, i.ri-trophy-fill')
    if (!trophyIcon) return
    
    
    trophyIcon.classList.add('trophy-pop-effect')
    
    
    setTimeout(() => {
      trophyIcon.classList.remove('trophy-pop-effect')
    }, 600)
  }

  playShockSound() {
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      
      oscillator.frequency.value = 880 
      oscillator.type = 'square'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Could not play shock sound:', error)
    }
  }

  extractTokenAddress(container) {
    
    
    
    const copyButton = container.querySelector('button[class*="text-textTertiary"]')
    if (copyButton) {
      const addressSpan = copyButton.querySelector('span')
      if (addressSpan && addressSpan.textContent.includes('...')) {
        return addressSpan.textContent.trim()
      }
    }
    
    
    const tokenNameDiv = container.querySelector('div.text-textPrimary.text-\\[16px\\]')
    if (tokenNameDiv) {
      return tokenNameDiv.textContent.trim()
    }
    
    
    return `token_${Array.from(document.querySelectorAll('div[class*="border-b-[1px]"]')).indexOf(container)}`
  }

  destroy() {
    this.stop()
    this.cabalData.clear()
    console.log('🏆 CabalMonitor destroyed')
  }
}


if (typeof module !== 'undefined' && module.exports) {
  module.exports = CabalMonitor
}

