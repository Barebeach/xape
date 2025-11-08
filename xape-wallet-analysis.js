




function detectSuspiciousWalletPatterns(coins) {
  const redFlags = []
  
  if (!coins || coins.length === 0) return redFlags
  
  
  const mainCoin = coins.find(c => c.top10HoldersPercent || c.dexPaidStatus || c.walletAgeGroups)
  
  if (mainCoin) {
    
    if (mainCoin.top10HoldersPercent) {
      if (mainCoin.top10HoldersPercent > 40) {
        redFlags.push(`🚨 EXTREME RED FLAG: Top 10 holders own ${mainCoin.top10HoldersPercent}% - MASSIVE whale manipulation risk!`)
      } else if (mainCoin.top10HoldersPercent > 30) {
        redFlags.push(`🚨 RED FLAG: Top 10 holders own ${mainCoin.top10HoldersPercent}% - High whale manipulation risk!`)
      } else if (mainCoin.top10HoldersPercent > 20) {
        redFlags.push(`⚠️ WARNING: Top 10 holders own ${mainCoin.top10HoldersPercent}% - Watch for dumps!`)
      }
    }
    
    
    if (mainCoin.dexPaidStatus && mainCoin.marketCap) {
      if (mainCoin.dexPaidStatus.toLowerCase().includes('unpaid')) {
        
        const mcValue = parseFloat(mainCoin.marketCap.replace(/[KMB]/g, match => {
          return match === 'K' ? 'e3' : match === 'M' ? 'e6' : 'e9'
        }))
        
        if (mcValue > 100000) {
          redFlags.push(`🚨 MAJOR RED FLAG: Dex is UNPAID but market cap is $${mainCoin.marketCap} - Dev didn't pay for listing!`)
        } else if (mcValue > 70000) {
          redFlags.push(`⚠️ WARNING: Dex is unpaid and market cap is $${mainCoin.marketCap} - Suspicious!`)
        }
      }
    }
    
    
    if (mainCoin.walletAgeGroups) {
      const groups = mainCoin.walletAgeGroups
      const totalWallets = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0)
      
      for (const [age, wallets] of Object.entries(groups)) {
        const percentage = (wallets.length / totalWallets) * 100
        const count = wallets.length
        
        if (percentage >= 50 && count >= 10) {
          redFlags.push(`🚨 COORDINATED ATTACK: ${count} wallets (${percentage.toFixed(0)}%) ALL created ${age} ago - Likely pump group!`)
        } else if (percentage >= 40 && count >= 8) {
          redFlags.push(`🚨 HIGHLY SUSPICIOUS: ${count} wallets (${percentage.toFixed(0)}%) created ${age} ago - Watch out!`)
        } else if (percentage >= 30 && count >= 5) {
          redFlags.push(`⚠️ SUSPICIOUS PATTERN: ${count} wallets (${percentage.toFixed(0)}%) created ${age} ago - Possible coordination!`)
        }
        
        
        const match = age.match(/^(\d+)([dhms])/)
        if (match) {
          const num = parseInt(match[1])
          const unit = match[2]
          const isVeryYoung = (unit === 'h' && num < 24) || (unit === 'm') || (unit === 's')
          
          if (isVeryYoung && count >= 5) {
            redFlags.push(`🚨 FRESH WALLETS: ${count} wallets are only ${age} old - Likely sybil attack!`)
          }
        }
      }
    }
  }
  
  
  const walletAges = coins
    .filter(w => w.walletAge)
    .map(w => ({
      wallet: w.name || w.address,
      age: w.walletAge
    }))
  
  if (walletAges.length >= 5) {
  
  const ageGroups = {}
  walletAges.forEach(({wallet, age}) => {
    if (!ageGroups[age]) ageGroups[age] = []
    ageGroups[age].push(wallet)
  })
  
  
  for (const [age, walletsInGroup] of Object.entries(ageGroups)) {
    const percentage = (walletsInGroup.length / walletAges.length) * 100
    if (percentage >= 50 && walletsInGroup.length >= 5) {
        redFlags.push(`🚨 SUSPICIOUS: ${walletsInGroup.length} top wallets (${percentage.toFixed(0)}%) all created ${age} ago - possible coordinated attack!`)
    } else if (percentage >= 30 && walletsInGroup.length >= 3) {
        redFlags.push(`⚠️ WARNING: ${walletsInGroup.length} wallets (${percentage.toFixed(0)}%) created ${age} ago - watch for dump`)
      }
    }
  }
  
  return redFlags
}


window.detectSuspiciousWalletPatterns = detectSuspiciousWalletPatterns

















