




function parseMarketCap(mcString) {
  if (!mcString) return 0
  
  const cleaned = mcString.replace(/[$,]/g, '').trim()
  const match = cleaned.match(/^([\d.]+)([KMB]?)$/)
  
  if (!match) return 0
  
  const value = parseFloat(match[1])
  const suffix = match[2]
  
  switch (suffix) {
    case 'K': return value * 1000
    case 'M': return value * 1000000
    case 'B': return value * 1000000000
    default: return value
  }
}


function getMarketCapColor(marketCap) {
  
  if (marketCap < 10000) {
    return 'rgba(255, 59, 48, 0.3)' 
  } else if (marketCap < 50000) {
    return 'rgba(255, 149, 0, 0.3)' 
  } else if (marketCap < 100000) {
    return 'rgba(255, 204, 0, 0.3)' 
  } else if (marketCap < 250000) {
    return 'rgba(52, 199, 89, 0.3)' 
  } else if (marketCap < 500000) {
    return 'rgba(0, 191, 255, 0.3)' 
  } else {
    return 'rgba(175, 82, 222, 0.3)' 
  }
}


function getMarketCapRisk(marketCap) {
  if (marketCap < 10000) return 'extreme'
  if (marketCap < 50000) return 'high'
  if (marketCap < 100000) return 'medium'
  return 'low'
}


function formatMarketCap(marketCap) {
  if (marketCap >= 1000000000) {
    return `$${(marketCap / 1000000000).toFixed(2)}B`
  } else if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(2)}M`
  } else if (marketCap >= 1000) {
    return `$${(marketCap / 1000).toFixed(1)}K`
  } else {
    return `$${marketCap.toFixed(0)}`
  }
}


function calculateTokenHealthScore(tokenData) {
  let score = 50 
  
  
  const mc = parseMarketCap(tokenData.marketCap)
  if (mc > 500000) score += 20
  else if (mc > 250000) score += 15
  else if (mc > 100000) score += 10
  else if (mc > 50000) score += 5
  else if (mc < 10000) score -= 20
  else if (mc < 50000) score -= 10
  
  
  if (tokenData.holders > 1000) score += 15
  else if (tokenData.holders > 500) score += 10
  else if (tokenData.holders > 200) score += 5
  else if (tokenData.holders < 50) score -= 15
  else if (tokenData.holders < 100) score -= 10
  
  
  if (tokenData.top10HoldersPercent > 40) score -= 15
  else if (tokenData.top10HoldersPercent > 30) score -= 10
  else if (tokenData.top10HoldersPercent > 20) score -= 5
  
  
  if (tokenData.dexPaidStatus === 'Paid') score += 10
  else if (tokenData.dexPaidStatus === 'Unpaid' && mc > 70000) score -= 10
  
  
  if (tokenData.lpBurnedPercent > 90) score += 10
  else if (tokenData.lpBurnedPercent > 50) score += 5
  
  
  return Math.max(0, Math.min(100, score))
}


function getHealthScoreColor(score) {
  if (score >= 80) return 'rgba(52, 199, 89, 0.8)' 
  if (score >= 60) return 'rgba(0, 191, 255, 0.8)' 
  if (score >= 40) return 'rgba(255, 204, 0, 0.8)' 
  if (score >= 20) return 'rgba(255, 149, 0, 0.8)' 
  return 'rgba(255, 59, 48, 0.8)' 
}


window.parseMarketCap = parseMarketCap
window.getMarketCapColor = getMarketCapColor
window.getMarketCapRisk = getMarketCapRisk
window.formatMarketCap = formatMarketCap
window.calculateTokenHealthScore = calculateTokenHealthScore
window.getHealthScoreColor = getHealthScoreColor

















