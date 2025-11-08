

class TimeGrouping {
  constructor() {
    this.timeGroups = new Map() 
    this.colors = [
      '#FF6B6B', 
      '#4ECDC4', 
      '#45B7D1', 
      '#FFA07A', 
      '#98D8C8', 
      '#F7DC6F', 
      '#BB8FCE', 
      '#85C1E2', 
      '#F8B739', 
      '#52B788', 
      '#E63946', 
      '#06FFA5', 
      '#4CC9F0', 
      '#F72585', 
      '#7209B7', 
      '#3A0CA3', 
      '#F77F00', 
      '#06D6A0', 
    ]
    this.colorIndex = 0
    this.scanInterval = null
    this.lastScanTime = 0
    this.scanThrottle = 100 
    
    console.log('⏰ Time Grouping System initialized')
  }
  
  start() {
    console.log('🎨 Starting time grouping...')
    
    
    if (!this.isMemePage()) {
      console.log('⏸️ Not a /meme/ page - time grouping disabled')
      return
    }
    
    console.log('✅ On /meme/ page - time grouping enabled!')
    
    
    this.scanAndGroupByTime()
    
    
    this.scanInterval = setInterval(() => {
      
      if (!this.isMemePage()) {
        console.log('⏸️ Navigated away from /meme/ page - stopping time grouping')
        this.stop()
        return
      }
      this.scanAndGroupByTime()
    }, 500)
    
    
    this.setupMutationObserver()
  }
  
  setupMutationObserver() {
    
    this.observer = new MutationObserver((mutations) => {
      let hasNewContent = false
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          hasNewContent = true
        }
      })
      
      if (hasNewContent) {
        
        this.scanAndGroupByTime()
      }
    })
    
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    console.log('👁️ MutationObserver active - instant time grouping on new elements!')
  }
  
  isMemePage() {
    
    const url = window.location.href
    return url.includes('axiom.trade/meme/')
  }
  
  stop() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval)
      this.scanInterval = null
    }
    
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    
    console.log('⏸️ Time grouping stopped')
  }
  
  scanAndGroupByTime() {
    
    const now = Date.now()
    if (now - this.lastScanTime < this.scanThrottle) {
      return 
    }
    this.lastScanTime = now
    
    
    const timeElements = this.findTimeElements()
    
    if (timeElements.length === 0) {
      return
    }
    
    
    const groupedByTime = new Map()
    
    timeElements.forEach(({ element, time }) => {
      const timeText = time.toLowerCase()
      
      if (!groupedByTime.has(timeText)) {
        groupedByTime.set(timeText, [])
      }
      
      groupedByTime.get(timeText).push(element)
    })
    
    
    groupedByTime.forEach((elements, timeText) => {
      
      if (!this.timeGroups.has(timeText)) {
        const color = this.getNextColor()
        this.timeGroups.set(timeText, color)
      }
      
      const color = this.timeGroups.get(timeText)
      
      
      elements.forEach(element => {
        this.applyColorToTimeElement(element, color, timeText)
      })
    })
  }
  
  findTimeElements() {
    const timeElements = []
    
    
    const allSpans = document.querySelectorAll('span')
    
    allSpans.forEach(span => {
      const text = span.textContent.trim()
      
      
      const timeMatch = this.extractTimePattern(text)
      if (timeMatch) {
        timeElements.push({ element: span, time: timeMatch })
      }
    })
    
    console.log(`🔍 Time elements found: ${timeElements.length}`)
    return timeElements
  }
  
  extractTimePattern(text) {
    
    
    
    
    if (text.includes('$') || text.includes('/') || text.includes('K') || text.includes('M') || text.includes('•')) {
      return null
    }
    
    
    const timeRegex = /^(\d+(?:mo|[smhd]))$/i
    const match = text.match(timeRegex)
    return match ? match[1] : null
  }
  
  isTimePattern(text) {
    
    const timeRegex = /^\d+(?:mo|[smhd])$/i
    return timeRegex.test(text)
  }
  
  getNextColor() {
    const color = this.colors[this.colorIndex]
    this.colorIndex = (this.colorIndex + 1) % this.colors.length
    return color
  }
  
  applyColorToTimeElement(element, color, timeText) {
    
    if (element.getAttribute('data-time-colored') === 'true') {
      return
    }
    
    
    element.setAttribute('data-time-colored', 'true')
    
    
    const row = this.findParentRow(element)
    
    if (!row) {
      
      element.style.setProperty('color', color, 'important')
      element.style.setProperty('font-weight', '700', 'important')
      element.style.setProperty('text-shadow', `0 0 8px ${color}`, 'important')
      return
    }
    
    
    row.setAttribute('data-time-group', timeText)
    row.setAttribute('data-time-color', color)
    
    
    const rgbaColor = this.hexToRgba(color, 0.08)
    row.style.setProperty('background-color', rgbaColor, 'important')
    
    
    row.style.setProperty('border-left', `4px solid ${color}`, 'important')
    row.style.setProperty('padding-left', '12px', 'important')
    
    
    element.style.setProperty('color', color, 'important')
    element.style.setProperty('font-weight', '700', 'important')
    element.style.setProperty('text-shadow', `0 0 8px ${color}`, 'important')
    
    
    element.style.setProperty('background', `${this.hexToRgba(color, 0.2)}`, 'important')
    element.style.setProperty('padding', '2px 6px', 'important')
    element.style.setProperty('border-radius', '4px', 'important')
  }
  
  findParentRow(element) {
    
    let parent = element.parentElement
    let maxDepth = 10
    let depth = 0
    
    while (parent && depth < maxDepth) {
      
      if (
        parent.classList.contains('flex-row') ||
        parent.classList.contains('flex') && parent.classList.contains('items-center') ||
        parent.style.display === 'flex' && parent.style.flexDirection === 'row' ||
        parent.classList.toString().includes('min-h-[48px]') ||
        parent.classList.toString().includes('max-h-[48px]')
      ) {
        return parent
      }
      
      parent = parent.parentElement
      depth++
    }
    
    return null
  }
  
  hexToRgba(hex, alpha) {
    
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  
  destroy() {
    this.stop()
    this.timeGroups.clear()
    console.log('🗑️ Time grouping destroyed')
  }
}


if (typeof window !== 'undefined') {
  window.TimeGrouping = TimeGrouping
  console.log('✅ TimeGrouping class loaded')
}

