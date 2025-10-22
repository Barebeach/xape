




window.xapeSpeechContext = {
  isListening: false,
  recognition: null,
  lastSpokenText: '',
  lastSpokenTime: 0
}


function speakResponse(text, context = window.xapeSpeechContext) {
  if ('speechSynthesis' in window) {
    
    window.speechSynthesis.cancel()
    
    
    
    text = text.replace(/XAPE/g, 'ex ape')
    text = text.replace(/Xape/g, 'ex ape')
    text = text.replace(/xape/g, 'ex ape')
    
    
    text = text.replace(/\*\*/g, '')
    text = text.replace(/\*/g, '')
    
    // 🚫 REMOVE ALL EMOJIS - Don't speak them!
    text = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    // Remove common text emojis
    text = text.replace(/📈|📉|📰|🚀|💰|🏆|🔥|⚡|✅|❌|🎯|📊/g, '')
    
    console.log('🎤 Fixed pronunciation: XAPE → ex ape (EX-APE), removed asterisks & emojis')
    
    
    const now = Date.now()
    const timeSinceLastSpeech = now - context.lastSpokenTime
    
    
    if (text === context.lastSpokenText && timeSinceLastSpeech < 2000) {
      console.log('🔇 ECHO PREVENTED: Skipping duplicate speech')
      return
    }
    
    
    context.lastSpokenText = text
    context.lastSpokenTime = now
    
    const speakWithVoice = () => {
      const utterance = new SpeechSynthesisUtterance(text)
      
      
      const voices = window.speechSynthesis.getVoices()
      console.log('🎤 Available voices:', voices.length)
      
      
      console.log('🎤 ALL VOICES:')
      voices.forEach((v, i) => {
        console.log(`  ${i}: ${v.name} (${v.lang}) ${v.default ? '[DEFAULT]' : ''}`)
      })
      
      
      
      const preferredVoice = voices.find(v => 
        
        v.name.includes('Google UK English Male') && v.lang.startsWith('en')
      ) || voices.find(v => 
        
        (v.name.includes('Microsoft David') || v.name.includes('Microsoft George')) && v.lang.includes('GB')
      ) || voices.find(v => 
        
        (v.lang.includes('GB') || v.lang.includes('UK')) && v.name.toLowerCase().includes('male')
      ) || voices.find(v => 
        
        (v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Arthur')) && v.lang.startsWith('en')
      ) || voices.find(v => 
        
        v.name.includes('Google US English Male')
      ) || voices.find(v => 
        
        v.lang.startsWith('en') && v.name.toLowerCase().includes('male')
      ) || voices.find(v => v.lang.startsWith('en-US')) || voices[0]
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
        console.log('🎤 JARVIS VOICE ACTIVATED:', preferredVoice.name, '|', preferredVoice.lang)
      }
      
      
      
      utterance.rate = 1.15    
      utterance.pitch = 0.6    
      utterance.volume = 1.0   
      
      console.log('🎤 JARVIS SETTINGS: Rate=1.15 (faster), Pitch=0.6 (very deep), Volume=1.0')
      
      
      // 🛑 KEEP RECOGNITION RUNNING so user can say "STOP" mid-speech!
      // Don't pause recognition anymore - we have echo prevention in place
      if (context.isListening && context.recognition) {
        console.log('🎤 Recognition STAYS ACTIVE (so you can say "stop")')
        // DO NOT STOP RECOGNITION - let it keep listening for "stop" command
      }
      
      
      if (window.skillbarInstance) {
        window.skillbarInstance.isSpeaking = true
        window.skillbarInstance.updateBrainAnimation(true)
        console.log('🔇 XAPE is now speaking - input blocked')
        
        
        if (!window.skillbarInstance.recentXapeResponses) {
          window.skillbarInstance.recentXapeResponses = []
        }
        window.skillbarInstance.recentXapeResponses.push(text)
        
        if (window.skillbarInstance.recentXapeResponses.length > 5) {
          window.skillbarInstance.recentXapeResponses.shift()
        }
      }
      
      utterance.onend = () => {
        console.log('🎤 Speech ended')
        
        
        if (window.skillbarInstance) {
          window.skillbarInstance.lastSpeechEndTime = Date.now()
          window.skillbarInstance.isSpeaking = false
          window.skillbarInstance.updateBrainAnimation(false)
          console.log('🔇 Echo prevention window started (1 second)')
        }
        
        
        // Recognition is already running, no need to restart
        if (context.isListening && context.recognition) {
          console.log('🎤 Recognition is already active (never stopped)')
        }
      }
      
      utterance.onerror = (event) => {
        console.log('🎤 Speech error:', event.error)
        
        
        if (window.skillbarInstance) {
          window.skillbarInstance.lastSpeechEndTime = Date.now()
          window.skillbarInstance.isSpeaking = false
          window.skillbarInstance.updateBrainAnimation(false)
        }
        
        
        // Recognition is already running, no need to restart
        if (context.isListening && context.recognition) {
          console.log('🎤 Recognition is already active (never stopped)')
        }
      }
    
    
      window.speechSynthesis.speak(utterance)
      console.log(`🎤 Speaking: "${text}"`)
    }
    
    if (window.speechSynthesis.getVoices().length > 0) {
      speakWithVoice()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        speakWithVoice()
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  } else {
    console.log('Speech synthesis not supported')
  }
}


function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    console.log('🔇 Speech stopped')
  }
}


function pauseRecognitionForSpeech(recognition) {
  if (recognition) {
    try {
      recognition.stop()
      console.log('🎤 Recognition paused for speech')
    } catch (e) {
      console.log('Recognition already stopped')
    }
  }
}


function resumeRecognitionAfterSpeech(recognition, isListening) {
  if (recognition && isListening) {
    setTimeout(() => {
      try {
        recognition.start()
        console.log('🎤 Recognition resumed after speech')
      } catch (e) {
        console.log('Could not resume recognition:', e.message)
      }
    }, 500)
  }
}


window.speakResponse = speakResponse
window.stopSpeaking = stopSpeaking
window.pauseRecognitionForSpeech = pauseRecognitionForSpeech
window.resumeRecognitionAfterSpeech = resumeRecognitionAfterSpeech

