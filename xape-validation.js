




function validateHotkeys(buyHotkeys, sellHotkeys) {
  const allHotkeys = [...buyHotkeys, ...sellHotkeys].map(k => k.toLowerCase())
  
  const hasDuplicates = allHotkeys.length !== new Set(allHotkeys).size
  const hasEmptyKeys = allHotkeys.some(key => !key || key.length === 0)
  
  if (hasDuplicates) {
    return {
      valid: false,
      message: "⚠️ Duplicate keys detected! Each key must be unique."
    }
  }
  
  if (hasEmptyKeys) {
    return {
      valid: false,
      message: "⚠️ All hotkey fields must be filled."
    }
  }
  
  return { valid: true, message: "" }
}


function validateBuyAmount(amount) {
  if (isNaN(amount) || amount <= 0) {
    return {
      valid: false,
      message: "Buy amount must be greater than 0"
    }
  }
  
  if (amount > 100) {
    return {
      valid: false,
      message: "Buy amount seems too high (max 100 SOL recommended)"
    }
  }
  
  return { valid: true, message: "" }
}


function validateSellPercentage(percentage) {
  if (isNaN(percentage) || percentage < 1 || percentage > 100) {
    return {
      valid: false,
      message: "Sell percentage must be between 1 and 100"
    }
  }
  
  return { valid: true, message: "" }
}


function validateSettings(settings) {
  const errors = []
  
  
  if (settings.buyAmounts) {
    settings.buyAmounts.forEach((amount, i) => {
      const result = validateBuyAmount(amount)
      if (!result.valid) {
        errors.push(`Buy ${i + 1}: ${result.message}`)
      }
    })
  }
  
  
  if (settings.sellAmounts) {
    settings.sellAmounts.forEach((percentage, i) => {
      const result = validateSellPercentage(percentage)
      if (!result.valid) {
        errors.push(`Sell ${i + 1}: ${result.message}`)
      }
    })
  }
  
  
  if (settings.buyHotkeys && settings.sellHotkeys) {
    const result = validateHotkeys(settings.buyHotkeys, settings.sellHotkeys)
    if (!result.valid) {
      errors.push(result.message)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  }
}


function isTradingPage() {
  return window.location.href.match(/\/meme\/[A-Za-z0-9]+/) !== null
}


function shouldSkillbarBeActive() {
  const url = window.location.href
  return url.includes('axiom.trade') && 
         (url.includes('/meme/') || url.includes('/pulse'))
}


window.validateHotkeys = validateHotkeys
window.validateBuyAmount = validateBuyAmount
window.validateSellPercentage = validateSellPercentage
window.validateSettings = validateSettings
window.isTradingPage = isTradingPage
window.shouldSkillbarBeActive = shouldSkillbarBeActive

















