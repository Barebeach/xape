import './style.css'

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
