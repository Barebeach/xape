




function correctPhoneticMishearings(transcript) {
  
  
  
  let corrected = transcript
  
  
  const corrections = [
    // 🎯 XAPE NAME RECOGNITION - ALL VARIATIONS!
    [/\bexape\b/gi, 'XAPE'],
    [/\bx ape\b/gi, 'XAPE'],
    [/\bex ape\b/gi, 'XAPE'],
    [/\bx8\b/gi, 'XAPE'],
    [/\bex 8\b/gi, 'XAPE'],
    [/\bexcape\b/gi, 'XAPE'],
    [/\bescape\b/gi, 'XAPE'],
    [/\bex cape\b/gi, 'XAPE'],
    [/\bex ape\b/gi, 'XAPE'],
    [/\bex a p\b/gi, 'XAPE'],
    [/\bzape\b/gi, 'XAPE'],
    [/\bz ape\b/gi, 'XAPE'],
    [/\bksape\b/gi, 'XAPE'],
    [/\bxaip\b/gi, 'XAPE'],
    [/\bxape\b/gi, 'XAPE'], // Exact match
    
    // 🗣️ HOLDER CORRECTIONS
    [/\bfolders?\b/gi, 'holders'],
    [/\bfolder\b/gi, 'holder'],
    [/\bthe folders?\b/gi, 'the holders'],
    [/\bcheck folders?\b/gi, 'check holders'],
    
    
    [/\bliquid city\b/gi, 'liquidity'],
    [/\bliquid ditty\b/gi, 'liquidity'],
    [/\blick widdy\b/gi, 'liquidity'],
    
    
    [/\bmarket cap\b/gi, 'market cap'], 
    [/\bmarket cab\b/gi, 'market cap'],
    [/\bmarket caps?\b/gi, 'market cap'],
    
    
    [/\bwallet age\b/gi, 'wallet age'], 
    [/\bwall it age\b/gi, 'wallet age'],
    [/\bwall at age\b/gi, 'wallet age'],
    
    
    [/\btoken age\b/gi, 'token age'],
    [/\btokin\b/gi, 'token'],
    [/\bcoin age\b/gi, 'coin age'],
    [/\bcoin\b/gi, 'coin'], 
    
    
    [/\bsole\b/gi, 'SOL'],
    [/\bsoul\b/gi, 'SOL'],
    [/\bso\b(?! )/gi, 'SOL'], 
    
    
    [/\bdex paid\b/gi, 'dex paid'], 
    [/\bdex payed\b/gi, 'dex paid'],
    [/\bdecks paid\b/gi, 'dex paid'],
    
    
    [/\bsnipers?\b/gi, 'snipers'], 
    [/\bsnippers?\b/gi, 'snipers'],
    
    
    [/\binsiders?\b/gi, 'insiders'], 
    [/\bin siders?\b/gi, 'insiders'],
    
    
    [/\bbundlers?\b/gi, 'bundlers'], 
    [/\bbun lers?\b/gi, 'bundlers'],
    
    
    [/\bbalance\b/gi, 'balance'], 
    [/\bbal ance\b/gi, 'balance'],
    [/\bmy balance\b/gi, 'my balance'],
    
    
    [/\bbuy\b/gi, 'buy'],
    [/\bbye\b/gi, 'buy'], 
    [/\bsell\b/gi, 'sell'],
    [/\bsale\b/gi, 'sell'],
    [/\btrade\b/gi, 'trade'],
    
    
    [/\bpump fun\b/gi, 'pump fun'],
    [/\bpump done\b/gi, 'pump fun'],
    [/\bpump fund\b/gi, 'pump fun'],
    
    
    [/\bcabal\b/gi, 'cabal'], 
    [/\bka bal\b/gi, 'cabal'],
    [/\bcabals?\b/gi, 'cabal'],
    
    
    [/\bpercent\b/gi, 'percent'],
    [/\bper cent\b/gi, 'percent'],
    [/\b%\b/gi, 'percent'],
    
    
    [/\bcheck\b/gi, 'check'],
    [/\bchuck\b/gi, 'check'],
    [/\bshow me\b/gi, 'show me'],
    [/\btell me\b/gi, 'tell me'],
    [/\bwhat is\b/gi, 'what is'],
    [/\bwhat's\b/gi, 'what is'],
    
    
    [/\bthe game\b/gi, ''], 
    [/\bthe gang\b/gi, ''], 
  ]
  
  
  corrections.forEach(([pattern, replacement]) => {
    corrected = corrected.replace(pattern, replacement)
  })
  
  
  corrected = corrected.replace(/\s+/g, ' ').trim()
  
  return corrected
}


window.correctPhoneticMishearings = correctPhoneticMishearings









