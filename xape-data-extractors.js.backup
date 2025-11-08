




function extractCoinDataFromContainer(container) {
  const coinData = {
    timestamp: Date.now(),
    scrapedAt: new Date().toISOString()
  }
  
  try {
    
    
    let nameEl = container.querySelector('div.text-textPrimary.text-\\[16px\\]')
    if (!nameEl) {
      
      nameEl = container.querySelector('span.text-textPrimary.text-\\[16px\\]')
    }
    if (!nameEl) {
      
      const allDivs = container.querySelectorAll('div')
      for (const div of allDivs) {
        const text = div.textContent.trim()
        
        if (text && text.length < 30 && !text.includes('$') && !text.includes('SOL')) {
          nameEl = div
          break
        }
      }
    }
    if (nameEl) {
      coinData.name = nameEl.textContent.trim()
    }
    
    
    const addressButton = container.querySelector('button span[class*="max-w"]')
    if (addressButton) {
      coinData.address = addressButton.textContent.trim()
    }
    
    
    const ageSpans = Array.from(container.querySelectorAll('span.text-primaryGreen, span.text-primaryBlue, span.text-primaryRed, span.text-textTertiary'))
    for (const span of ageSpans) {
      const text = span.textContent.trim()
      
      if (text.match(/^\d+(?:mo|[smhd])$/i)) {
        if (!coinData.age) {
          coinData.age = text
        }
        
        if (window.location.href.includes('/meme/')) {
          coinData.walletAge = text
        }
        break
      }
    }
    
    
    const allSpans = container.querySelectorAll('span')
    for (let i = 0; i < allSpans.length; i++) {
      const span = allSpans[i]
      const text = span.textContent.trim()
      
      if (text === 'MC' && allSpans[i + 1]) {
        coinData.marketCap = allSpans[i + 1].textContent.replace('$', '').trim()
      }
      if (text === 'V' && allSpans[i + 1]) {
        coinData.volume = allSpans[i + 1].textContent.replace('$', '').trim()
      }
    }
    
    
    const priceSpans = Array.from(container.querySelectorAll('span')).filter(s => 
      s.textContent.startsWith('$') && s.textContent.match(/\$\d+/)
    )
    if (priceSpans.length > 0) {
      coinData.price = priceSpans[0].textContent.trim()
    }
    
    
    const groupIcon = container.querySelector('i.ri-group-line')
    if (groupIcon) {
      
      let holderSpan = groupIcon.parentElement.querySelector('span')
      
      
      if (!holderSpan) {
        holderSpan = groupIcon.nextElementSibling
      }
      
      
      if (!holderSpan) {
        const parentDiv = groupIcon.closest('div[class*="flex"]')
        if (parentDiv) {
          holderSpan = parentDiv.querySelector('span.text-\\[14px\\]')
        }
      }
      
      if (holderSpan) {
        const holdersText = holderSpan.textContent.trim()
        coinData.holders = parseInt(holdersText.replace(/,/g, '')) || 0
      }
    }
    
    
    if (!coinData.holders || coinData.holders === 0) {
      const allSpans = Array.from(container.querySelectorAll('span'))
      for (let i = 0; i < allSpans.length; i++) {
        if (allSpans[i].textContent.trim() === 'Holders' && allSpans[i - 1]) {
          coinData.holders = parseInt(allSpans[i - 1].textContent.replace(/,/g, '')) || 0
          break
        }
      }
    }
    
    
    // 🏆 ENHANCED CABAL DETECTION
    const trophyIcon = container.querySelector('i.ri-trophy-line')
    if (trophyIcon) {
      const cabalSpan = trophyIcon.parentElement.querySelector('span.text-textPrimary')
      if (cabalSpan) {
        coinData.cabals = parseInt(cabalSpan.textContent.trim()) || 0
      }
      
      // 🔥 Check if it's the SPECIAL GLOWING CABAL TROPHY (top cabal coin!)
      if (trophyIcon.classList.contains('cabal-trophy-glow')) {
        coinData.topCabalCoin = true
        coinData.cabalPriority = 'HIGH'
        console.log('🏆🔥 TOP CABAL COIN DETECTED:', coinData.name)
      }
    } else {
      coinData.cabals = 0
    }
    
    // 📊 Market Cap Category Detection
    const marketCapClasses = ['market-cap-low', 'market-cap-medium', 'market-cap-high', 'market-cap-very-high', 'market-cap-mega']
    for (const mcClass of marketCapClasses) {
      if (container.classList.contains(mcClass)) {
        coinData.marketCapCategory = mcClass.replace('market-cap-', '')
        break
      }
    }
    
    
    const proTraderIcon = container.querySelector('i.icon-pro-trader, img[alt="Pro Traders"]')
    if (proTraderIcon) {
      const proSpan = proTraderIcon.parentElement.querySelector('span.text-textPrimary')
      if (proSpan) {
        coinData.proTraders = parseInt(proSpan.textContent.trim()) || 0
      }
    }
    
    
    const txSpans = Array.from(container.querySelectorAll('span')).filter(s => 
      s.textContent.includes('TX')
    )
    if (txSpans.length > 0) {
      const txMatch = txSpans[0].textContent.match(/TX\s*(\d+)/)
      if (txMatch) {
        coinData.transactions = parseInt(txMatch[1]) || 0
      }
    }
    
    
    const percentageSpans = container.querySelectorAll('span[class*="text-primary"]')
    const percentages = []
    percentageSpans.forEach(span => {
      const text = span.textContent.trim()
      if (text.includes('%')) {
        percentages.push(text)
      }
    })
    coinData.percentageChanges = percentages
    
    
    const socialLinks = {
      twitter: !!container.querySelector('a[href*="twitter"], a[href*="x.com"]'),
      telegram: !!container.querySelector('i.ri-telegram-line, a[href*="t.me"]'),
      website: !!container.querySelector('i.icon-pill, a[href*="pump.fun"]'),
      community: !!container.querySelector('i.ri-quill-pen-line')
    }
    coinData.socialLinks = Object.values(socialLinks).filter(Boolean).length
    coinData.socialDetails = socialLinks
    
    
    const paidBadge = container.querySelector('span:contains("Paid"), i:contains("Paid")')
    coinData.isPaid = !!paidBadge || container.textContent.includes('Paid')
    
    
    const liquiditySpans = Array.from(container.querySelectorAll('span')).filter(s => 
      s.textContent.includes('SOL') && s.previousElementSibling?.textContent === 'F'
    )
    if (liquiditySpans.length > 0) {
      coinData.liquidity = liquiditySpans[0].textContent.trim()
    }
    
    
    const progressBars = container.querySelectorAll('div[class*="bg-increase"], div[class*="bg-decrease"]')
    if (progressBars.length >= 2) {
      const buyBar = progressBars[0]
      const sellBar = progressBars[1]
      const buyWidth = buyBar.style.width
      const sellWidth = sellBar.style.width
      coinData.buySellRatio = {
        buy: buyWidth,
        sell: sellWidth
      }
    }
    
    
    const section = getCurrentSection(container)
    coinData.section = section
    
    
    const borderColor = container.style.borderColor
    if (borderColor && borderColor.includes('rgb')) {
      coinData.riskColor = borderColor
    }
    
    
    if (window.location.href.includes('/meme/')) {
      
      const balanceSpans = Array.from(container.querySelectorAll('span.text-textTertiary'))
      for (const span of balanceSpans) {
        const text = span.textContent.trim()
        
        if (text.match(/[\d.]+[KMB]?\s*\/\s*\d+/)) {
          coinData.walletBalance = text
          break
        }
      }
      
      
      const insiderIcon = container.querySelector('i.ri-user-star-line')
      if (insiderIcon) {
        const parent = insiderIcon.closest('div')
        if (parent) {
          const spans = parent.querySelectorAll('span')
          for (const span of spans) {
            const match = span.textContent.match(/(\d+)%/)
            if (match) {
              coinData.insiderPercent = parseFloat(match[1])
              break
            }
          }
        }
      }
      
      
      const sniperIcon = container.querySelector('i.ri-crosshair-2-line')
      if (sniperIcon) {
        const parent = sniperIcon.closest('div')
        if (parent) {
          const spans = parent.querySelectorAll('span')
          for (const span of spans) {
            const match = span.textContent.match(/(\d+)%/)
            if (match) {
              coinData.sniperPercent = parseFloat(match[1])
              break
            }
          }
        }
      }
      
      
      const bundleIcon = container.querySelector('i.ri-ghost-line')
      if (bundleIcon) {
        const parent = bundleIcon.closest('div')
        if (parent) {
          const spans = parent.querySelectorAll('span')
          for (const span of spans) {
            const match = span.textContent.match(/(\d+)%/)
            if (match) {
              coinData.bundlePercent = parseFloat(match[1])
              break
            }
          }
        }
      }
      
      
      const rankSpans = Array.from(container.querySelectorAll('span.text-textTertiary'))
      for (const span of rankSpans) {
        const text = span.textContent.trim()
        if (/^\d+$/.test(text) && parseInt(text) < 1000) {
          coinData.walletRank = parseInt(text)
          break
        }
      }
    }
    
    
    if (window.location.href.match(/\/meme\/[A-Za-z0-9]+$/)) {
      console.log('📊 Scraping COMPLETE /meme/ page data...')
      
      
      const metricBoxes = Array.from(document.querySelectorAll('div.border.border-primaryStroke\\/50'))
      
      metricBoxes.forEach(box => {
        const labelSpan = box.querySelector('span.text-textTertiary.text-\\[12px\\]')
        const valueSpan = box.querySelector('span.text-\\[14px\\]')
        
        if (!labelSpan || !valueSpan) return
        
        const label = labelSpan.textContent.trim()
        const value = valueSpan.textContent.trim()
        
        
        switch(label) {
          case 'Top 10 H.':
            coinData.top10HoldersPercent = parseFloat(value.replace('%', ''))
            console.log('📊 Top 10 Holders:', value)
            break
          case 'Dev H.':
            coinData.devHoldersPercent = parseFloat(value.replace('%', ''))
            console.log('👨‍💻 Dev Holders:', value)
            break
          case 'Snipers H.':
            coinData.snipersPercent = parseFloat(value.replace('%', ''))
            console.log('🎯 Snipers:', value)
            break
          case 'Insiders':
            coinData.insidersPercent = parseFloat(value.replace('%', ''))
            console.log('👁️ Insiders:', value)
            break
          case 'Bundlers':
            coinData.bundlersPercent = parseFloat(value.replace('%', ''))
            console.log('📦 Bundlers:', value)
            break
          case 'LP Burned':
            coinData.lpBurnedPercent = parseFloat(value.replace('%', ''))
            console.log('🔥 LP Burned:', value)
            break
          case 'Holders':
            coinData.totalHolders = parseInt(value.replace(/,/g, ''))
            console.log('👥 Total Holders:', value)
            break
          case 'Pro Traders':
            coinData.proTradersCount = parseInt(value.replace(/,/g, ''))
            console.log('⭐ Pro Traders:', value)
            break
          case 'Dex Paid':
            coinData.dexPaidStatus = value 
            console.log('💰 Dex Paid:', value)
            break
          case 'Price':
            coinData.price = value
            console.log('💵 Price:', value)
            break
          case 'Liquidity':
            coinData.liquidity = value
            console.log('💧 Liquidity:', value)
            break
          case 'Supply':
            coinData.supply = value
            console.log('📦 Supply:', value)
            break
          case 'Global Fees Paid':
            coinData.globalFeesPaid = value
            console.log('💸 Global Fees:', value)
            break
        }
      })
      
      
      const mcSpans = Array.from(document.querySelectorAll('span.text-increase, span.text-decrease, span.text-textPrimary'))
      for (const span of mcSpans) {
        const text = span.textContent.trim()
        
        if (text.match(/^\$[\d.]+[KMB]$/) && parseFloat(text.replace(/[$KMB]/g, '')) > 10) {
          coinData.marketCap = text.replace('$', '')
          console.log('📈 Market Cap:', coinData.marketCap)
          break
        }
      }
      
      
      const nameDiv = document.querySelector('div.text-textPrimary.text-\\[16px\\]')
      if (nameDiv) {
        coinData.coinName = nameDiv.textContent.trim()
        console.log('🪙 Coin Name:', coinData.coinName)
      }
      
      
      const timeBadge = document.querySelector('span[data-time-colored="true"]')
      if (timeBadge) {
        coinData.coinAge = timeBadge.textContent.trim()
        console.log('⏰ Coin Age:', coinData.coinAge)
      }
      
      
      const caDiv = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('CA:'))
      if (caDiv) {
        const addressSpan = caDiv.querySelector('span.text-textSecondary')
        if (addressSpan) {
          coinData.contractAddress = addressSpan.textContent.trim()
          console.log('📄 Contract Address:', coinData.contractAddress)
        }
      }
      
      
      const daDiv = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('DA:'))
      if (daDiv) {
        const addressSpan = daDiv.querySelector('span')
        if (addressSpan) {
          coinData.developerAddress = addressSpan.textContent.trim()
          console.log('👨‍💻 Developer Address:', coinData.developerAddress)
        }
      }
      
      
      const walletRows = document.querySelectorAll('div[class*="min-h-[48px]"][class*="max-h-[48px]"][class*="flex-row"]')
      const walletData = []
      
      walletRows.forEach((row, idx) => {
        if (idx > 50) return 
        
        const wallet = {}
        
        
        const addressSpan = row.querySelector('span.text-textSecondary.text-\\[12px\\]')
        if (addressSpan) {
          wallet.address = addressSpan.textContent.trim()
        }
        
        
        const timeSpan = row.querySelector('span[data-time-colored="true"]')
        if (timeSpan) {
          wallet.age = timeSpan.textContent.trim()
        }
        
        
        const solSpans = Array.from(row.querySelectorAll('span')).filter(s => 
          s.textContent.includes('0.0') || s.textContent.match(/^\d+\.\d+$/)
        )
        if (solSpans.length > 0) {
          wallet.solBalance = solSpans[0].textContent.trim()
        }
        
        if (wallet.address && wallet.age) {
          walletData.push(wallet)
        }
      })
      
      if (walletData.length > 0) {
        coinData.wallets = walletData
        console.log(`👛 Scraped ${walletData.length} individual wallets`)
        
        
        const ageGroups = {}
        walletData.forEach(w => {
          if (!ageGroups[w.age]) ageGroups[w.age] = []
          ageGroups[w.age].push(w.address)
        })
        
        coinData.walletAgeGroups = ageGroups
        console.log('📊 Wallet age groups:', Object.keys(ageGroups).map(age => `${age}: ${ageGroups[age].length}`).join(', '))
      }
    }
    
  } catch (error) {
    console.log('Error extracting coin data:', error)
  }
  
  
  if (coinData.name || coinData.marketCap) {
    console.log(`📊 Extracted: ${coinData.name || 'Unknown'} | MC: ${coinData.marketCap || 'N/A'} | Holders: ${coinData.holders || 0} | Age: ${coinData.age || 'N/A'}`)
  }
  
  return coinData
}


function getCurrentSection(container) {
  
  let current = container
  while (current && current !== document.body) {
    const prevSibling = current.previousElementSibling
    if (prevSibling) {
      const text = prevSibling.textContent
      if (text.includes('New Pairs')) return 'New Pairs'
      if (text.includes('Final Stretch')) return 'Final Stretch'
      if (text.includes('Migrated')) return 'Migrated'
      if (text.includes('Graduated')) return 'Graduated'
    }
    current = current.parentElement
  }
  return 'Unknown'
}


window.extractCoinDataFromContainer = extractCoinDataFromContainer
window.getCurrentSection = getCurrentSection









