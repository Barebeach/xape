




function detectPageType() {
  const url = window.location.href
  if (url.includes('/meme/')) return 'meme'
  if (url.includes('/pulse')) return 'pulse'
  if (url.includes('/wallet')) return 'wallet'
  if (url.includes('/portfolio')) return 'portfolio'
  return 'other'
}


function findAllCoinContainersForXape() {
  
  const selectors = [
    // 🎯 PULSE TAB - Large cards
    'div[class*="h-[142px]"]',
    'div[class*="h-[116px]"]',
    'div[class*="h-[92px]"]',  
    'div[class*="h-[128px]"]', 
    
    // 🏆 CABAL COINS - Rows with trophy icons
    'div[class*="min-h-[48px]"][class*="max-h-[48px]"][class*="flex-row"]',
    'div[class*="flex-row"]:has(i[class*="trophy"])',
    'div[class*="flex-row"]:has(.cabal-trophy-glow)',
    
    // 👥 Wallet/holder indicators
    'div[class*="flex-row"]:has(i.ri-group-line)',
    'div[class*="flex-row"]:has(i.ri-user-star-line)',
    
    // 🖼️ Image-based coins
    'div[class*="flex"][class*="flex-col"]:has(img[alt]):has(span[class*="text"])',
    'div:has(img[src*="pump"]):has(span)',
    'div[class*="cursor-pointer"]:has(img[alt])',
    
    // 📊 ALL visible coin rows (catch-all)
    'a[href*="/meme/"]:has(span)',
    'div[class*="border"]:has(span:contains("$"))',
  ]
  
  let containers = []
  selectors.forEach(selector => {
    try {
      const found = document.querySelectorAll(selector)
      containers = containers.concat(Array.from(found))
    } catch (e) {
      
    }
  })
  
  
  containers = [...new Set(containers)]
  
  
  containers = containers.filter(container => {
    const text = container.textContent || ''
    const classList = container.className || ''
    
    
    if (classList.includes('sticky') || classList.includes('z-30')) {
      return false
    }
    
    
    if ((text.includes('New Pairs') || text.includes('Final Stretch') || 
        text.includes('Migrated')) && text.length < 300) {
      return false
    }
    
    
    const hasIndicator = 
      container.querySelector('i.ri-group-line') ||
      container.querySelector('i.ri-user-star-line') ||
      container.querySelector('img[alt]') ||
      text.includes('$') ||
      /\d+[smhd]/.test(text) ||
      /\d+mo/.test(text)
    
    return hasIndicator
  })
  
  console.log(`🔍 XAPE: Found ${containers.length} valid containers for data extraction`)
  return containers
}


function generateBasicResponse(command) {
  const lowerCommand = command.toLowerCase()
  
  if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
    return "Hello! I'm XAPE, your AI trading assistant. How can I help you today?"
  } else if (lowerCommand.includes('position') || lowerCommand.includes('portfolio')) {
    return "I can help you track your positions. Please set up your Telegram notifications in settings to receive alerts about your trades."
  } else if (lowerCommand.includes('market') || lowerCommand.includes('condition')) {
    return "The market is currently active. I'm analyzing real-time data to provide you with insights. Would you like me to monitor specific tokens?"
  } else if (lowerCommand.includes('notify') || lowerCommand.includes('alert')) {
    return "I can set up custom alerts for you! Please configure your Telegram account in settings, and tell me what conditions you'd like to be notified about."
  } else {
    return `I heard: "${command}". I'm still learning! Please set up your AI backend in settings to unlock my full potential.`
  }
}


window.detectPageType = detectPageType
window.findAllCoinContainersForXape = findAllCoinContainersForXape
window.generateBasicResponse = generateBasicResponse









