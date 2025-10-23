import './style.css'

<<<<<<< HEAD
// Update copyright year
const yearElement = document.getElementById('year')
if (yearElement) {
  yearElement.textContent = new Date().getFullYear().toString()
}

// Try to autoplay video with sound after user interaction
window.addEventListener('load', () => {
  const heroVideo = document.getElementById('hero-video') as HTMLVideoElement
  if (heroVideo) {
    // Try to autoplay with sound (will likely be blocked by browser)
    heroVideo.play().catch(() => {
      console.log('Video autoplay blocked (expected). User will need to click play to hear audio.')
      // This is expected - browsers block autoplay with sound
      // User can click the play button to start video with audio
    })
  }
})

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault()
    const href = anchor.getAttribute('href')
    const target = href ? document.querySelector(href) : null
    if (target) {
      const navHeight = 64
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  })
})

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
    }
  })
}, observerOptions)

// Observe feature rows
document.querySelectorAll('.feature-row').forEach(row => {
  observer.observe(row)
})

// Add active state to nav on scroll
const nav = document.querySelector('.nav') as HTMLElement

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset

  if (currentScroll > 50) {
    nav.style.background = 'rgba(0, 0, 0, 0.95)'
  } else {
    nav.style.background = 'rgba(0, 0, 0, 0.8)'
  }
})

// Hotkeys interactive demo
const hotkeyItems = document.querySelectorAll('.hotkey-item')
const validKeys = ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f']

// Keyboard event listener
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase()
  
  if (validKeys.includes(key)) {
    const hotkeyItem = document.querySelector(`.hotkey-item[data-key="${key}"]`)
    
    if (hotkeyItem && !hotkeyItem.classList.contains('pressed')) {
      // Add pressed class
      hotkeyItem.classList.add('pressed')
      
      // Remove after animation
      setTimeout(() => {
        hotkeyItem.classList.remove('pressed')
      }, 600)
      
      // Visual feedback
      console.log(`⚡ Hotkey pressed: ${key.toUpperCase()}`)
    }
  }
})

// Click handler for hotkey items
hotkeyItems.forEach(item => {
  item.addEventListener('click', () => {
    if (!item.classList.contains('pressed')) {
      item.classList.add('pressed')
      setTimeout(() => {
        item.classList.remove('pressed')
      }, 600)
    }
  })
})

// Lightbox functionality
const lightbox = document.getElementById('lightbox')
const lightboxImg = document.getElementById('lightbox-img') as HTMLImageElement
const lightboxClose = document.querySelector('.lightbox-close')

// Add click handlers to all feature images
document.querySelectorAll('.feature-img').forEach(img => {
  img.addEventListener('click', (e) => {
    const target = e.target as HTMLImageElement
    if (lightbox && lightboxImg) {
      lightboxImg.src = target.src
      lightboxImg.alt = target.alt
      lightbox.classList.add('active')
      document.body.style.overflow = 'hidden' // Prevent scrolling
    }
  })
})

// Close lightbox on click
if (lightbox) {
  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('active')
    document.body.style.overflow = 'auto' // Re-enable scrolling
  })
}

if (lightboxClose) {
  lightboxClose.addEventListener('click', (e) => {
    e.stopPropagation()
    if (lightbox) {
      lightbox.classList.remove('active')
      document.body.style.overflow = 'auto'
    }
  })
}

// Close lightbox on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox?.classList.contains('active')) {
    lightbox.classList.remove('active')
    document.body.style.overflow = 'auto'
  }
})

console.log('🧠 XAPE website ready')
console.log('⚡ Try pressing Q, W, E, R, A, S, D, F!')
console.log('🖼️ Click on any Before/After image to view full size!')
=======
// ==================== ROUTER ====================
type Page = 'home' | 'privacy'

// Router functionality
function navigateToPage(page: Page, pushState = true) {
  
  if (page === 'home') {
    renderHomePage()
    if (pushState) {
      window.history.pushState({ page: 'home' }, '', '/')
    }
  } else if (page === 'privacy') {
    renderPrivacyPage()
    if (pushState) {
      window.history.pushState({ page: 'privacy' }, '', '/privacy-policy')
    }
  }
  
  window.scrollTo(0, 0)
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  const state = e.state
  if (state && state.page) {
    navigateToPage(state.page, false)
  } else {
    navigateToPage('home', false)
  }
})

// Intercept navigation links
function setupRouting() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const anchor = target.closest('a')
    
    if (anchor && anchor.getAttribute('href') === '/privacy-policy') {
      e.preventDefault()
      navigateToPage('privacy')
    } else if (anchor && anchor.getAttribute('href') === '/') {
      e.preventDefault()
      navigateToPage('home')
    }
  })
}

// ==================== HOME PAGE ====================
function renderHomePage() {
  document.body.innerHTML = `
  <!-- Navigation -->
  <nav class="nav">
    <div class="nav-container">
      <div class="nav-brand">
        <img src="/icons/brain.gif" alt="XAPE" class="nav-logo" />
        <div class="nav-brand-text">
          <span class="nav-title">XAPE</span>
          <span class="nav-slogan" style="color: #60a5fa;">The future is here</span>
        </div>
      </div>
      <div class="nav-links">
        <a href="#platforms" class="nav-link">Platforms</a>
        <a href="#features" class="nav-link">How it works</a>
        <a href="/privacy-policy" class="nav-link">Privacy Policy</a>
        <a href="#download" class="nav-link-cta">Get Extension</a>
      </div>
    </div>
  </nav>

  <!-- Hero Section with Video -->
  <section class="hero">
    <div class="hero-main">
      <div class="hero-header">
        <div class="platform-badge">
          <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="badge-logo">
            <g clip-path="url(#clip0_88_28967)">
              <path d="M24.1384 17.3876H11.8623L18.0001 7.00012L24.1384 17.3876Z" fill="currentColor"></path>
              <path d="M31 29.0003L5 29.0003L9.96764 20.5933L26.0324 20.5933L31 29.0003Z" fill="currentColor"></path>
            </g>
            <defs>
              <clipPath id="clip0_88_28967">
                <rect width="26" height="22" fill="white" transform="translate(5 7)"></rect>
              </clipPath>
            </defs>
          </svg>
          <span>Now available for Axiom</span>
        </div>
        <h1 class="hero-title">
          Smart Trading Intelligence<br />
          for <span class="gradient-text">Axiom</span>
        </h1>
        <p class="hero-subtitle">
          See the <span style="color: #60a5fa; font-weight: 600;">hidden flow of money</span> like never before. Meet <span style="color: #a855f7; font-weight: 700;">XAPE</span>—your AI assistant here to serve. Our <span style="color: #10b981; font-weight: 600;">AI-powered heatmap</span> exposes where funds move, <span style="color: #ef4444; font-weight: 600;">spots scams</span> in <span style="color: #f59e0b; font-weight: 600;">real time</span>, and delivers <span style="color: #3b82f6; font-weight: 600;">instant market insights</span>—think of it as <span style="color: #8b5cf6; font-weight: 600;">ChatGPT</span>, but built to give you <span style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%); -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: 700;">superpowers</span> in crypto trading.
        </p>
      </div>

      <!-- Video embedded in hero -->
      <div class="hero-video-frame">
        <video id="hero-video" class="hero-video" controls loop playsinline preload="auto">
          <source src="/xapee.mp4" type="video/mp4" />
          Your browser does not support video.
        </video>
      </div>

      <div class="hero-cta">
        <a href="#download" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download for Free
        </a>
        <a href="#features" class="btn btn-secondary">
          Learn More
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </a>
      </div>
    </div>
  </section>

  <!-- Token Access Section -->
  <section class="token-section">
    <div class="section-container">
      <div class="token-content">
        <div class="token-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Token-Gated Access</span>
        </div>
        <h2 class="token-title">Hold to <span style="color: #3b82f6;">Unlock</span> the Power</h2>
        <p class="token-description">
          XAPE isn't just free software—it's <span style="color: #10b981; font-weight: 600;">exclusive.</span> 
          To access this <span style="color: #3b82f6; font-weight: 600;">trading superpower</span>, you need to hold 
          <strong style="color: #f59e0b; font-size: 22px;">100,000,000 XAPE tokens</strong> in your wallet. 
          This isn't a subscription fee—it's <span style="color: #ef4444; font-weight: 600;">ownership.</span> 
          Hold once, use forever.
        </p>
        <div class="token-benefits">
          <div class="benefit-item">
            <div class="benefit-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="benefit-text">
              <h4>Real Utility</h4>
              <p>Every holder gets <strong style="color: #3b82f6;">direct value</strong>—not promises, actual access to premium trading tools</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="benefit-text">
              <h4>Constant Buy Pressure</h4>
              <p>Every new user <strong style="color: #10b981;">must buy and hold</strong> tokens—creating continuous demand as XAPE grows</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
            <div class="benefit-text">
              <h4>Diamond Hands Incentive</h4>
              <p>Selling means <strong style="color: #ef4444;">losing access</strong>—holders are rewarded for staying in</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div class="benefit-text">
              <h4>Deflationary by Design</h4>
              <p>Tokens locked in wallets = <strong style="color: #3b82f6;">reduced supply</strong> on the market, increasing scarcity</p>
            </div>
          </div>
        </div>
        <p class="token-cta">
          The more traders discover XAPE, the more valuable your tokens become. 
          <strong style="color: #f59e0b;">Early holders win big.</strong>
        </p>
      </div>
    </div>
  </section>

  <!-- Platforms Section -->
  <section id="platforms" class="platforms-section">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">Supported Platforms</h2>
        <p class="section-desc">Expanding across the trading ecosystem</p>
      </div>
      <div class="platforms-grid">
        <div class="platform-card platform-active">
          <div class="platform-logo">
            <svg width="48" height="48" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_88_28967_2)">
                <path d="M24.1384 17.3876H11.8623L18.0001 7.00012L24.1384 17.3876Z" fill="currentColor"></path>
                <path d="M31 29.0003L5 29.0003L9.96764 20.5933L26.0324 20.5933L31 29.0003Z" fill="currentColor"></path>
              </g>
              <defs>
                <clipPath id="clip0_88_28967_2">
                  <rect width="26" height="22" fill="white" transform="translate(5 7)"></rect>
                </clipPath>
              </defs>
            </svg>
          </div>
          <h3 class="platform-name">Axiom</h3>
          <span class="platform-status status-active">Available Now</span>
        </div>

        <div class="platform-card platform-coming">
          <div class="platform-logo platform-logo-gray">
            <img src="/pumpfun-logo.svg" alt="Pump.fun" />
          </div>
          <h3 class="platform-name">Pump.fun</h3>
          <span class="platform-status status-coming">Coming Soon</span>
        </div>

        <div class="platform-card platform-coming">
          <div class="platform-logo platform-logo-gray">
            <img src="/bullx-logo.svg" alt="BullX" />
          </div>
          <h3 class="platform-name">BullX</h3>
          <span class="platform-status status-coming">Coming Soon</span>
        </div>

        <div class="platform-card platform-coming">
          <div class="platform-logo platform-logo-gray">
            <img src="/photon-logo.svg" alt="Photon" />
          </div>
          <h3 class="platform-name">Photon</h3>
          <span class="platform-status status-coming">Coming Soon</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Hotkeys Demo Section -->
  <section class="hotkeys-section">
    <div class="section-container">
      <div class="section-header">
        <div class="speed-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Lightning Fast</span>
        </div>
        <h2 class="section-title">Trade at Gaming Speed</h2>
        <p class="section-desc">
          Master the art of <span style="color: #60a5fa; font-weight: 600;">hotkey trading.</span> Just like leveling up in a game, 
          the more you use XAPE's <span style="color: #10b981; font-weight: 600;">instant hotkeys</span>, 
          the sharper you get. Your fingers will <span style="color: #f59e0b; font-weight: 600;">fly across keys</span>—
          executing buys and sells in <strong style="color: #ef4444;">milliseconds</strong> while others are still reaching for their mouse. 
          This is <strong style="color: #8b5cf6;">muscle memory</strong> meets <strong style="color: #3b82f6;">trading mastery.</strong><br/>
          <strong style="color: #f59e0b; font-size: 19px; text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);">⚡ Try pressing Q, W, E, R, A, S, D, F on your keyboard!</strong>
        </p>
      </div>

      <div class="hotkeys-demo">
        <div class="hotkeys-container">
          <div class="hotkey-item gear-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6M4.93 4.93l4.24 4.24m5.66 0l4.24-4.24M1 12h6m10 0h6M4.93 19.07l4.24-4.24m5.66 0l4.24 4.24"></path>
            </svg>
          </div>
          <div class="hotkey-item" data-key="q">
            <div class="hotkey-value">0.054</div>
            <div class="hotkey-key">Q</div>
          </div>
          <div class="hotkey-item" data-key="w">
            <div class="hotkey-value">0.4</div>
            <div class="hotkey-key">W</div>
          </div>
          <div class="hotkey-item" data-key="e">
            <div class="hotkey-value">0.22</div>
            <div class="hotkey-key">E</div>
          </div>
          <div class="hotkey-item" data-key="r">
            <div class="hotkey-value">0.12</div>
            <div class="hotkey-key">R</div>
          </div>
          <div class="hotkey-item hotkey-percent" data-key="a">
            <div class="hotkey-value">1%</div>
            <div class="hotkey-key">A</div>
          </div>
          <div class="hotkey-item hotkey-percent" data-key="s">
            <div class="hotkey-value">22%</div>
            <div class="hotkey-key">S</div>
          </div>
          <div class="hotkey-item hotkey-percent" data-key="d">
            <div class="hotkey-value">50%</div>
            <div class="hotkey-key">D</div>
          </div>
          <div class="hotkey-item hotkey-percent" data-key="f">
            <div class="hotkey-value">100%</div>
            <div class="hotkey-key">F</div>
          </div>
        </div>
        <p class="hotkeys-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Execute trades in milliseconds. No mouse needed. Pure speed.
        </p>
      </div>
    </div>
  </section>

  <!-- Features / How It Works -->
  <section id="features" class="features-section">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">How it works</h2>
        <p class="section-desc">Transform your trading with real-time intelligence overlays and instant execution</p>
      </div>

      <div class="feature-row">
        <div class="feature-content">
          <h3 class="feature-title">Heatmap</h3>
          <p class="feature-text">
            <strong style="color: #60a5fa;">X-ray vision for crypto.</strong> Our intelligent heatmap reveals what others can't see—
            exposing wallet connections, fund movements, and hidden patterns in real-time. 
            <strong style="color: #10b981;">Spot high-volume patterns instantly.</strong> Only tokens with real 
            <span style="color: #f59e0b; font-weight: 600;">attention</span> and 
            <span style="color: #3b82f6; font-weight: 600;">volume</span> light up your screen—
            <strong style="color: #ef4444;">no time wasted.</strong> Never miss a red flag. Never miss an opportunity. 
            See through the noise and trade with the confidence of knowing exactly what's happening behind every coin.
          </p>
        </div>
        <div class="feature-visual">
          <div class="comparison-grid">
            <div class="comp-side">
              <div class="comp-label">Before</div>
              <img src="/before.png" alt="Before" class="feature-img" />
            </div>
            <div class="comp-side">
              <div class="comp-label comp-label-after">After</div>
              <img src="/after1.png" alt="After" class="feature-img" />
            </div>
          </div>
        </div>
      </div>

      <div class="feature-row feature-row-reverse">
        <div class="feature-content">
          <h3 class="feature-title">Breaking News, Instant Edge</h3>
          <p class="feature-text">
            <strong style="color: #ef4444;">Stop missing narratives.</strong> While others scramble through Twitter and Discord, 
            your <span style="color: #a855f7; font-weight: 700;">AI companion</span> is 
            <span style="color: #10b981; font-weight: 600;">plugged directly</span> into 
            <strong style="color: #3b82f6;">every major crypto news source.</strong> 
            The moment a <span style="color: #f59e0b; font-weight: 600;">game-changing announcement</span> drops—
            partnerships, trends, breaking developments—<span style="color: #a855f7; font-weight: 700;">XAPE</span> alerts you 
            <span style="color: #ef4444; font-weight: 600;">instantly</span>, right in your trading interface. 
            <strong style="color: #60a5fa;">Ride the wave, don't chase it.</strong> 
            You're not just informed—<strong>you're first.</strong>
          </p>
        </div>
        <div class="feature-visual">
          <div class="comparison-grid">
            <div class="comp-side">
              <div class="comp-label">Before</div>
              <img src="/before.png" alt="Before" class="feature-img" />
            </div>
            <div class="comp-side">
              <div class="comp-label comp-label-after">After</div>
              <img src="/after2.png" alt="After" class="feature-img" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section id="download" class="cta-section">
    <div class="cta-content">
      <h2 class="cta-title">Start trading smarter today</h2>
      <p class="cta-subtitle">Join thousands of traders using XAPE on Axiom</p>
      <p class="cta-tagline">Once you use it, <strong style="color: #ef4444;">without it you'll feel blind!</strong></p>
      <a href="#" class="btn btn-primary btn-large">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Extension
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-left">
        <div class="footer-brand">
          <img src="/icons/brain.gif" alt="XAPE" class="footer-logo" />
          <span class="footer-title">XAPE</span>
        </div>
        <p class="footer-copy">© <span id="year">${new Date().getFullYear()}</span> XAPE. Built for traders.</p>
      </div>
      <div class="footer-links">
        <a href="#" class="footer-link">Twitter</a>
        <a href="#" class="footer-link">Discord</a>
        <a href="#" class="footer-link">Docs</a>
        <a href="#" class="footer-link">Support</a>
      </div>
    </div>
  </footer>

  <!-- Lightbox Modal -->
  <div id="lightbox" class="lightbox-modal">
    <div class="lightbox-close">×</div>
    <div class="lightbox-content">
      <img id="lightbox-img" class="lightbox-img" src="" alt="Full size view" />
    </div>
    <div class="lightbox-hint">Click anywhere to close • ESC to exit</div>
  </div>
  `
  
  initializeHomePage()
}

function initializeHomePage() {
  // Try to autoplay video with sound after user interaction
  const heroVideo = document.getElementById('hero-video') as HTMLVideoElement
  if (heroVideo) {
    heroVideo.play().catch(() => {
      console.log('Video autoplay blocked (expected). User will need to click play to hear audio.')
    })
  }

  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault()
      const href = anchor.getAttribute('href')
      const target = href ? document.querySelector(href) : null
      if (target) {
        const navHeight = 64
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })
      }
    })
  })

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, observerOptions)

  // Observe feature rows
  document.querySelectorAll('.feature-row').forEach(row => {
    observer.observe(row)
  })

  // Add active state to nav on scroll
  const nav = document.querySelector('.nav') as HTMLElement

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset

    if (currentScroll > 50) {
      nav.style.background = 'rgba(0, 0, 0, 0.95)'
    } else {
      nav.style.background = 'rgba(0, 0, 0, 0.8)'
    }
  })

  // Hotkeys interactive demo
  const hotkeyItems = document.querySelectorAll('.hotkey-item')
  const validKeys = ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f']

  // Keyboard event listener
  const hotkeyHandler = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    
    if (validKeys.includes(key)) {
      const hotkeyItem = document.querySelector(`.hotkey-item[data-key="${key}"]`)
      
      if (hotkeyItem && !hotkeyItem.classList.contains('pressed')) {
        hotkeyItem.classList.add('pressed')
        setTimeout(() => {
          hotkeyItem.classList.remove('pressed')
        }, 600)
        console.log(`⚡ Hotkey pressed: ${key.toUpperCase()}`)
      }
    }
  }

  document.addEventListener('keydown', hotkeyHandler)

  // Click handler for hotkey items
  hotkeyItems.forEach(item => {
    item.addEventListener('click', () => {
      if (!item.classList.contains('pressed')) {
        item.classList.add('pressed')
        setTimeout(() => {
          item.classList.remove('pressed')
        }, 600)
      }
    })
  })

  // Lightbox functionality
  const lightbox = document.getElementById('lightbox')
  const lightboxImg = document.getElementById('lightbox-img') as HTMLImageElement

  // Add click handlers to all feature images
  document.querySelectorAll('.feature-img').forEach(img => {
    img.addEventListener('click', (e) => {
      const target = e.target as HTMLImageElement
      if (lightbox && lightboxImg) {
        lightboxImg.src = target.src
        lightboxImg.alt = target.alt
        lightbox.classList.add('active')
        document.body.style.overflow = 'hidden'
      }
    })
  })

  // Close lightbox on click
  if (lightbox) {
    lightbox.addEventListener('click', () => {
      lightbox.classList.remove('active')
      document.body.style.overflow = 'auto'
    })
  }

  const lightboxClose = document.querySelector('.lightbox-close')
  if (lightboxClose) {
    lightboxClose.addEventListener('click', (e) => {
      e.stopPropagation()
      if (lightbox) {
        lightbox.classList.remove('active')
        document.body.style.overflow = 'auto'
      }
    })
  }

  // Close lightbox on ESC key
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && lightbox?.classList.contains('active')) {
      lightbox.classList.remove('active')
      document.body.style.overflow = 'auto'
    }
  }
  document.addEventListener('keydown', escHandler)

  console.log('🧠 XAPE website ready')
  console.log('⚡ Try pressing Q, W, E, R, A, S, D, F!')
  console.log('🖼️ Click on any Before/After image to view full size!')
}

// ==================== PRIVACY PAGE ====================
function renderPrivacyPage() {
  document.body.innerHTML = `
  <!-- Navigation -->
  <nav class="nav">
    <div class="nav-container">
      <div class="nav-brand">
        <img src="/icons/brain.gif" alt="XAPE" class="nav-logo" />
        <span class="nav-title">XAPE</span>
      </div>
      <a href="/" class="nav-link">← Back to Home</a>
    </div>
  </nav>

  <div class="privacy-container">
    <h1 class="privacy-title">Privacy Policy</h1>
    <p class="privacy-updated">Last Updated: October 22, 2024</p>

    <section class="privacy-section">
      <h2>1. Overview</h2>
      <p>XAPE is a Chrome extension that enhances the axiom.trade trading platform with AI-powered analysis and voice control. We are committed to protecting your privacy and being transparent about our data practices.</p>
    </section>

    <section class="privacy-section">
      <h2>2. Data We Collect</h2>
      
      <div class="privacy-highlight">
        <p><strong>Website Content:</strong> The extension reads publicly visible cryptocurrency data from axiom.trade (token names, prices, market caps, holder counts) to provide trading analysis. This data is already visible on your screen - we simply analyze and enhance its presentation.</p>
      </div>
      
      <p><strong>Local Storage:</strong> We store user preferences (notification settings, hotkeys) locally in your browser. This data never leaves your device.</p>

      <p><strong>Token Balance:</strong> If you choose to use token-gated features, we verify your Solana wallet's XAPE token balance via blockchain RPC. We do not store your private keys or have access to your wallet.</p>
    </section>

    <section class="privacy-section">
      <h2>3. How We Use Data</h2>
      <ul>
        <li>Analyze token data to provide heatmaps, cabal alerts, and trading insights</li>
        <li>Process voice commands through our backend API (using OpenAI)</li>
        <li>Fetch cryptocurrency news relevant to your trading</li>
        <li>Verify token ownership for access control</li>
      </ul>
    </section>

    <section class="privacy-section">
      <h2>4. Data Sharing</h2>
      
      <div class="privacy-highlight">
        <p><strong>We do NOT:</strong></p>
        <ul>
          <li>Sell or share your data with third parties</li>
          <li>Collect personally identifiable information</li>
          <li>Track your browsing history</li>
          <li>Store your wallet private keys</li>
          <li>Access data from websites other than axiom.trade</li>
        </ul>
      </div>

      <p><strong>Third-Party Services:</strong> Voice commands are processed through OpenAI's API via our backend. Token balances are verified via public Solana blockchain RPC endpoints. These services receive only the minimum data necessary to function.</p>
    </section>

    <section class="privacy-section">
      <h2>5. Data Security</h2>
      <p>All API communications use HTTPS encryption. User preferences are stored locally in your browser using Chrome's secure storage API. We do not maintain a centralized user database.</p>
    </section>

    <section class="privacy-section">
      <h2>6. Your Rights</h2>
      <p>You can:</p>
      <ul>
        <li>Disable the extension at any time</li>
        <li>Clear local storage data through Chrome settings</li>
        <li>Use the extension without connecting your wallet</li>
        <li>Request deletion of any data we may have stored</li>
      </ul>
    </section>

    <section class="privacy-section">
      <h2>7. Children's Privacy</h2>
      <p>XAPE is not intended for users under 13 years of age. We do not knowingly collect data from children.</p>
    </section>

    <section class="privacy-section">
      <h2>8. Token Gating</h2>
      <p>Access to certain XAPE features requires holding 100 XAPE tokens. We verify token ownership by reading your wallet's public balance on the Solana blockchain. This verification happens on-demand and we do not continuously monitor your wallet.</p>
    </section>

    <section class="privacy-section">
      <h2>9. Voice Commands</h2>
      <p>When you use voice commands, your spoken queries are sent to our backend server and processed through OpenAI's API to generate intelligent responses. We do not store voice recordings. Only the text transcription is temporarily processed and immediately discarded after generating a response.</p>
    </section>

    <section class="privacy-section">
      <h2>10. Changes to This Policy</h2>
      <p>We may update this privacy policy occasionally. Changes will be posted on this page with an updated "Last Updated" date. Continued use of XAPE after changes constitutes acceptance of the updated policy.</p>
    </section>

    <section class="privacy-section">
      <h2>11. Contact</h2>
      <p>For privacy concerns or questions, please contact us at: <strong>support@xape.io</strong></p>
    </section>

    <hr class="privacy-divider">
    
    <div class="privacy-footer">
      <p>XAPE is an independent project and is not affiliated with axiom.trade.</p>
      <p style="margin-top: 1rem;">© ${new Date().getFullYear()} XAPE. All rights reserved.</p>
    </div>
  </div>
  `
  
  console.log('📜 Privacy Policy loaded')
}

// ==================== INITIALIZATION ====================
// Check initial route and render appropriate page
function init() {
  const path = window.location.pathname
  
  if (path === '/privacy-policy' || path === '/privacy-policy.html') {
    navigateToPage('privacy', false)
  } else {
    navigateToPage('home', false)
  }
  
  setupRouting()
}

// Start the app
init()
>>>>>>> c9e3175 (Initial commit - XAPE website with TypeScript router and privacy policy)
