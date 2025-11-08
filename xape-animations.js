




function drawIdleWaveform(ctx, width, height, time) {
  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = '#00bfff' 
  ctx.lineWidth = 2
  ctx.beginPath()
  
  const amplitude = 3
  const frequency = 0.02
  const centerY = height / 2
  
  for (let x = 0; x < width; x++) {
    const y = centerY + Math.sin(x * frequency + time * 0.002) * amplitude
    if (x === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  
  ctx.stroke()
}


function drawWaitingWaveform(ctx, width, height, time) {
  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = '#00bfff'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  const amplitude = 8
  const frequency = 0.03
  const centerY = height / 2
  
  for (let x = 0; x < width; x++) {
    const y = centerY + Math.sin(x * frequency + time * 0.005) * amplitude
    if (x === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  
  ctx.stroke()
}


function drawRealWaveform(ctx, width, height, dataArray, bufferLength) {
  ctx.clearRect(0, 0, width, height)
  ctx.lineWidth = 2
  ctx.strokeStyle = '#00bfff'
  ctx.beginPath()
  
  const sliceWidth = width / bufferLength
  let x = 0
  
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0
    const y = v * height / 2
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    
    x += sliceWidth
  }
  
  ctx.lineTo(width, height / 2)
  ctx.stroke()
}


function fadeIn(element, duration = 300) {
  element.style.opacity = '0'
  element.style.transition = `opacity ${duration}ms ease`
  
  setTimeout(() => {
    element.style.opacity = '1'
  }, 10)
}


function fadeOut(element, duration = 300, callback) {
  element.style.transition = `opacity ${duration}ms ease`
  element.style.opacity = '0'
  
  setTimeout(() => {
    if (callback) callback()
  }, duration)
}


function pulse(element) {
  element.style.animation = 'xapePulse 1s ease-in-out'
  setTimeout(() => {
    element.style.animation = ''
  }, 1000)
}


function shake(element) {
  element.style.animation = 'shake 0.5s ease-in-out'
  setTimeout(() => {
    element.style.animation = ''
  }, 500)
}


window.drawIdleWaveform = drawIdleWaveform
window.drawWaitingWaveform = drawWaitingWaveform
window.drawRealWaveform = drawRealWaveform
window.fadeIn = fadeIn
window.fadeOut = fadeOut
window.pulse = pulse
window.shake = shake

















