




function createInitializationSounds() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  
  function playBeep(frequency, duration, delay = 0) {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    }, delay)
  }
  
  
  
  playBeep(600, 0.15, 0)
  playBeep(700, 0.15, 200)
  playBeep(800, 0.15, 400)
  
  
  playBeep(450, 0.1, 2000)    
  playBeep(480, 0.1, 4000)    
  playBeep(500, 0.1, 6000)    
  playBeep(530, 0.1, 8000)    
  playBeep(560, 0.1, 10000)   
  playBeep(600, 0.1, 12000)
  playBeep(650, 0.1, 13500)   
  
  
  playBeep(1000, 0.3, 14600)
  playBeep(1200, 0.4, 14800)
  
  console.log('🎵 Playing initialization sound effects')
}




window.showExtensionInitializationAnimation = function() {
  console.log('🔥 Starting extension initialization animation - TWO DOTS!')
  
  console.log('🔇 Sound effects disabled by user preference')
  
  
  const borderOverlay = document.createElement('div')
  borderOverlay.id = 'axiom-extension-init-overlay'
  document.body.appendChild(borderOverlay)
  
  
  const glowingDot1 = document.createElement('div')
  glowingDot1.id = 'axiom-extension-init-dot'
  glowingDot1.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    background: #00bfff;
    border-radius: 50%;
    pointer-events: none;
    z-index: 50;
    box-shadow: 
      0 0 30px #00bfff,
      0 0 60px #00bfff,
      0 0 90px rgba(0, 191, 255, 1),
      0 0 120px rgba(0, 191, 255, 0.8),
      0 0 100px rgba(59, 130, 246, 0.5);
    filter: blur(2px);
    opacity: 0;
  `
  document.body.appendChild(glowingDot1)
  
  
  const glowingDot2 = document.createElement('div')
  glowingDot2.id = 'axiom-extension-init-dot2'
  glowingDot2.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    background: #00bfff;
    border-radius: 50%;
    pointer-events: none;
    z-index: 50;
    box-shadow: 
      0 0 30px #00bfff,
      0 0 60px #00bfff,
      0 0 90px rgba(0, 191, 255, 1),
      0 0 120px rgba(0, 191, 255, 0.8),
      0 0 100px rgba(59, 130, 246, 0.5);
    filter: blur(2px);
    opacity: 0;
  `
  document.body.appendChild(glowingDot2)
  
  
  setTimeout(() => {
    borderOverlay.classList.add('axiom-border-animating')
    glowingDot1.classList.add('axiom-dot1-animating')
    glowingDot2.classList.add('axiom-dot2-animating')
    console.log('✅ Border animation started! TWO DOTS racing to meet!')
  }, 50)
  
  
  setTimeout(() => {
    borderOverlay.classList.add('axiom-init-complete')
    borderOverlay.classList.remove('axiom-border-animating')
    glowingDot1.remove()
    glowingDot2.remove()
    
    console.log('✅ Initialization animation complete! Dots met successfully!')
    console.log('🔷 Borders will stay active while extension is initialized')
    
    
    borderOverlay.style.transition = 'all 1s ease-out'
    borderOverlay.style.boxShadow = `
      inset 0 0 30px rgba(0, 191, 255, 0.3),
      inset 0 0 60px rgba(0, 191, 255, 0.2)
    `
    
    
    window.persistentBorderOverlay = borderOverlay
    
    
    setTimeout(() => {
      initializeSkillbarWithGlow()
    }, 500)
  }, 15000) 
}


function initializeSkillbarWithGlow(retryCount = 0) {
  console.log(`🔥 Materializing skillbar with epic animation... (attempt ${retryCount + 1})`)
  
  const skillbar = document.getElementById('axiom-skill-bar')
  if (!skillbar) {
    console.log(`⚠️ Skillbar not found yet... (attempt ${retryCount + 1})`)
    
    
    if (retryCount < 30) {
      console.log(`🔄 Retrying in 500ms... (${retryCount + 1}/30)`)
      setTimeout(() => {
        initializeSkillbarWithGlow(retryCount + 1)
      }, 500)
      return
    } else {
      console.error('❌ FAILED: Skillbar never appeared after 30 retries (15 seconds)!')
      
      
      if (window.skillbarInstance) {
        console.log('✅ Skillbar instance EXISTS but element not found!')
        console.log('🔄 Waiting 2 more seconds then retrying...')
        setTimeout(() => {
          initializeSkillbarWithGlow(0) 
        }, 2000)
      } else {
        console.error('❌ CRITICAL: Skillbar instance does not exist!')
        alert('⚠️ Extension failed to initialize. Please refresh the page (F5) and say "initialize" again.')
      }
      return
    }
  }
  
  console.log('✅ Skillbar found! Showing it now (NO ANIMATION)...')
  
  
  
  skillbar.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    left: 50% !important;
    right: auto !important;
    top: auto !important;
    transform: translateX(-50%) !important;
    z-index: 100 !important;
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
  
  
  const skillbarMain = skillbar.querySelector('.skill-bar-main')
  const skillbarContainer = skillbar.querySelector('.skill-bar-container')
  if (skillbarMain) {
    skillbarMain.style.transition = 'none !important'
  }
  if (skillbarContainer) {
    skillbarContainer.style.transition = 'none !important'
  }
  
  console.log('✅ Skillbar visible! NO blue effect! NO transitions!')
  console.log('🎯 Skillbar position LOCKED to CENTER (instant, no animation)')
  
  console.log('⏱️ Waiting for market cap colors to be applied...')
  console.log('💡 Colors and explosions will be triggered by main initialize flow in ~500ms')
  
  
  
  
}


function playMaterializationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3)
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.8)
  } catch (error) {
    
  }
}


function activateHeatmapColors() {
  console.log('🎨 Activating heatmap colors in waves...')
  
  
  const containers = document.querySelectorAll('a[href*="/meme/"], div[class*="cursor-pointer"]')
  console.log(`🎨 Found ${containers.length} containers to colorize`)
  
  if (containers.length === 0) {
    console.log('⚠️ No containers found, will retry...')
    
    setTimeout(() => activateHeatmapColors(), 500)
    return
  }
  
  
  const containerArray = Array.from(containers)
  
  
  containerArray.forEach((container, index) => {
    setTimeout(() => {
      
      const originalPosition = container.style.position
      if (!originalPosition || originalPosition === 'static') {
        container.style.position = 'relative'
      }
      
      
      const explosion = document.createElement('div')
      explosion.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 300%;
        height: 300%;
        margin-left: -150%;
        margin-top: -150%;
        background: radial-gradient(circle at center, 
          rgba(255, 255, 255, 1) 0%,
          rgba(0, 191, 255, 1) 15%,
          rgba(0, 191, 255, 0.9) 30%,
          rgba(0, 191, 255, 0.6) 50%,
          rgba(0, 191, 255, 0.3) 70%,
          transparent 100%);
        border-radius: 50%;
        animation: bigExplosion 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        pointer-events: none;
        z-index: 200;
        box-shadow: 
          0 0 50px rgba(0, 191, 255, 0.8),
          0 0 100px rgba(0, 191, 255, 0.6),
          0 0 150px rgba(0, 191, 255, 0.4);
      `
      container.appendChild(explosion)
      
      
      if (index % 5 === 0) {
        playColorPing(index)
      }
      
      
      setTimeout(() => {
        explosion.remove()
      }, 800)
    }, index * 50) 
  })
  
  
  const totalDuration = containerArray.length * 50
  setTimeout(() => {
    playHeatmapCompleteSound()
    console.log('✅ Heatmap colors fully activated!')
  }, totalDuration + 500)
}


function playColorPing(index) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800 + (index * 10), audioContext.currentTime)
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  } catch (error) {
    
  }
}


function playHeatmapCompleteSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    
    [400, 500, 600, 800].forEach((freq, i) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + (i * 0.05))
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + (i * 0.05))
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + (i * 0.05) + 0.3)
      
      oscillator.start(audioContext.currentTime + (i * 0.05))
      oscillator.stop(audioContext.currentTime + (i * 0.05) + 0.3)
    })
  } catch (error) {
    
  }
}


window.initializeSkillbarWithGlow = initializeSkillbarWithGlow


window.createPersistentBordersWithoutAnimation = function() {
  console.log('🔷 Creating persistent borders (no animation)...')
  
  
  const existingBorders = document.querySelectorAll('.xape-border-overlay')
  existingBorders.forEach(b => b.remove())
  
  
  const borderOverlay = document.createElement('div')
  borderOverlay.className = 'xape-border-overlay'
  borderOverlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    pointer-events: none !important;
    z-index: 100 !important;
  `
  
  
  const borders = [
    { name: 'top', style: 'top: 0; left: 0; width: 100%; height: 6px;' },
    { name: 'bottom', style: 'bottom: 0; left: 0; width: 100%; height: 6px;' },
    { name: 'left', style: 'top: 0; left: 0; width: 6px; height: 100%;' },
    { name: 'right', style: 'top: 0; right: 0; width: 6px; height: 100%;' }
  ]
  
  borders.forEach(border => {
    const borderEl = document.createElement('div')
    borderEl.className = `xape-border-${border.name}`
    borderEl.style.cssText = `
      position: absolute !important;
      ${border.style}
      background: rgba(0, 191, 255, 0.6) !important;
      box-shadow: 
        0 0 40px rgba(0, 191, 255, 0.4),
        inset 0 0 20px rgba(0, 191, 255, 0.3) !important;
      opacity: 0.8 !important;
    `
    borderOverlay.appendChild(borderEl)
  })
  
  document.body.appendChild(borderOverlay)
  
  
  window.persistentBorderOverlay = borderOverlay
  
  console.log('✅ Persistent borders created!')
}

console.log('✅ Border animation module loaded - waiting for "initialize" command')

