// 🎯 XAPE Response Variations - 100+ unique responses for gains and losses

// 💚 GAIN RESPONSES (100 variations)
const gainResponses = [
  // Excited/Hyped (1-20)
  "Fuck yeah, {userTitle}! We're up {amount} SOL! Let's fucking go!",
  "BOOM! {amount} SOL profit, {userTitle}! We're killing it!",
  "Yes! Yes! YES! {amount} SOL in the green! This is what I'm talking about!",
  "We're cooking, {userTitle}! +{amount} SOL and counting!",
  "Hell yeah! {amount} SOL profit! That's how it's done!",
  "Cha-ching! {amount} SOL to the good, {userTitle}!",
  "Winning! Up {amount} SOL! Keep this momentum going!",
  "Absolutely smashing it! {amount} SOL profit, {userTitle}!",
  "This is brilliant! {amount} SOL gain! Well played!",
  "Fantastic! We're up {amount} SOL! Love to see it!",
  "Crushing it! {amount} SOL profit! That's the way!",
  "Superb! {amount} SOL in profit! Excellent move!",
  "Brilliant trade! {amount} SOL profit, {userTitle}!",
  "Textbook! Up {amount} SOL! This is how you trade!",
  "Perfect timing! {amount} SOL profit! Well done!",
  "Nailed it! {amount} SOL gain! Great call!",
  "Spot on! We're up {amount} SOL!",
  "Phenomenal! {amount} SOL profit! Keep going!",
  "Outstanding! {amount} SOL to the good!",
  "Exceptional! We bagged {amount} SOL profit!",
  
  // Professional/Calm (21-40)
  "Excellent. {amount} SOL profit secured, {userTitle}.",
  "Well done. We're up {amount} SOL on this position.",
  "Good exit. {amount} SOL profit realized.",
  "Solid trade. {amount} SOL in the green.",
  "Nice work. We've gained {amount} SOL.",
  "Clean profit of {amount} SOL, {userTitle}.",
  "Respectable gain. Up {amount} SOL.",
  "Good timing. {amount} SOL profit locked in.",
  "Nicely executed. {amount} SOL profit.",
  "Satisfactory. We're up {amount} SOL.",
  "Positive outcome. {amount} SOL profit.",
  "Good result. {amount} SOL gain.",
  "Decent profit. Up {amount} SOL.",
  "Well timed. {amount} SOL profit.",
  "Solid exit. {amount} SOL secured.",
  "Good call. {amount} SOL profit.",
  "Well played. Up {amount} SOL.",
  "Smart move. {amount} SOL gain.",
  "Good decision. {amount} SOL profit.",
  "Well executed. {amount} SOL up.",
  
  // Sarcastic/Witty (41-60)
  "Not bad for a Tuesday! {amount} SOL profit.",
  "I suppose {amount} SOL profit will do, {userTitle}.",
  "Delightful. {amount} SOL richer. Shall we continue?",
  "How refreshing. {amount} SOL profit. More tea?",
  "Ah yes, {amount} SOL profit. Quite acceptable.",
  "Well, well. {amount} SOL up. Color me impressed.",
  "Oh my, {amount} SOL profit. However will we spend it?",
  "Splendid! {amount} SOL profit. Fancy that.",
  "Lovely. {amount} SOL up. Aren't we clever?",
  "Charming. {amount} SOL profit, {userTitle}.",
  "How quaint. {amount} SOL gain. Well done, you.",
  "Marvelous. {amount} SOL profit. Such skill!",
  "Oh dear, we're winning. {amount} SOL up.",
  "What a surprise. {amount} SOL profit. Who knew?",
  "Goodness me. {amount} SOL richer. Shocking.",
  "Well I never. {amount} SOL profit. Remarkable.",
  "Blimey! {amount} SOL up. Didn't see that coming.",
  "Cor, {amount} SOL profit! Better than a poke in the eye.",
  "Right then. {amount} SOL up. Jolly good.",
  "I say! {amount} SOL profit. Rather nice.",
  
  // Encouraging/Motivational (61-80)
  "Keep this up! {amount} SOL profit! You're on fire!",
  "This is your rhythm! {amount} SOL gain!",
  "You're in the zone! {amount} SOL profit!",
  "Momentum building! Up {amount} SOL!",
  "This is the way! {amount} SOL profit!",
  "You've got this! {amount} SOL gain!",
  "Riding the wave! {amount} SOL profit!",
  "Hot streak! {amount} SOL up!",
  "You're flowing! {amount} SOL profit!",
  "This is working! Up {amount} SOL!",
  "Stay focused! {amount} SOL profit secured!",
  "Good instincts! {amount} SOL gain!",
  "Trust the process! {amount} SOL profit!",
  "You're dialed in! Up {amount} SOL!",
  "This is it! {amount} SOL profit!",
  "Keep the pressure on! {amount} SOL gain!",
  "You're locked in! {amount} SOL profit!",
  "Don't stop now! Up {amount} SOL!",
  "This is your game! {amount} SOL profit!",
  "Perfect flow! {amount} SOL gain!",
  
  // Crypto-specific (81-100)
  "To the moon! {amount} SOL profit, {userTitle}!",
  "Diamond hands paid off! {amount} SOL gain!",
  "WAGMI! Up {amount} SOL!",
  "Degen win! {amount} SOL profit!",
  "Absolutely giga-brained! {amount} SOL up!",
  "Chad move! {amount} SOL profit!",
  "Moon mission successful! {amount} SOL gain!",
  "Ape together strong! {amount} SOL profit!",
  "Not a paper hands move! {amount} SOL up!",
  "Based! {amount} SOL profit secured!",
  "Bullish! Up {amount} SOL!",
  "Green candles! {amount} SOL profit!",
  "Pump city! {amount} SOL gain!",
  "Gains goblin mode! {amount} SOL up!",
  "Alpha secured! {amount} SOL profit!",
  "Big brain play! {amount} SOL gain!",
  "Pro trader energy! Up {amount} SOL!",
  "Ser, we're winning! {amount} SOL profit!",
  "Ngmi? No, WAGMI! {amount} SOL up!",
  "Absolute king! {amount} SOL profit, {userTitle}!"
];

// 🔴 LOSS RESPONSES (100 variations)
const lossResponses = [
  // Supportive/Comforting (1-20)
  "Rough one. Down {amount} SOL. But we'll bounce back, {userTitle}.",
  "That stings. Lost {amount} SOL. Next one's ours.",
  "Ouch. {amount} SOL gone. We'll recover.",
  "Tough break. Down {amount} SOL. Shake it off.",
  "Painful. {amount} SOL loss. Learn and move on.",
  "Not ideal. Lost {amount} SOL. We'll get it back.",
  "That hurt. {amount} SOL down. Tomorrow's another day.",
  "Damn. {amount} SOL loss. We'll be fine.",
  "Frustrating. Down {amount} SOL. Stay calm.",
  "Unlucky. {amount} SOL gone. Next trade.",
  "Unfortunate. Lost {amount} SOL. Keep going.",
  "Setback. {amount} SOL down. We'll recover.",
  "Difficult. {amount} SOL loss. Stay focused.",
  "Hard pill. Lost {amount} SOL. Move forward.",
  "Tough loss. {amount} SOL down. Chin up.",
  "Bruising. {amount} SOL gone. We'll survive.",
  "Stinger. Lost {amount} SOL. Regroup.",
  "Costly. {amount} SOL down. Learn from it.",
  "Heavy. {amount} SOL loss. Push through.",
  "Painful exit. Lost {amount} SOL. Next time.",
  
  // Aggressive/Determined (21-40)
  "Fuck! Lost {amount} SOL! Let's get it back, {userTitle}!",
  "Bollocks! {amount} SOL down! Time to hunt!",
  "Shit! {amount} SOL loss! We're not done!",
  "Damn it! Lost {amount} SOL! Next one's ours!",
  "Bastard! {amount} SOL gone! Let's recover!",
  "Fucking hell! {amount} SOL down! Fight back!",
  "Christ! Lost {amount} SOL! Regroup and attack!",
  "Balls! {amount} SOL loss! Time to strike!",
  "Bloody hell! {amount} SOL down! Let's go!",
  "Sod it! Lost {amount} SOL! We'll recover!",
  "Bugger! {amount} SOL gone! Not giving up!",
  "Piss! {amount} SOL down! Back to work!",
  "Hell! Lost {amount} SOL! Reset and go!",
  "Dammit! {amount} SOL loss! Fight!",
  "Fuck's sake! {amount} SOL down! Rally!",
  "Jesus! Lost {amount} SOL! Recover!",
  "Shit show! {amount} SOL gone! Next!",
  "Brutal! {amount} SOL loss! Attack mode!",
  "Savage! {amount} SOL down! Let's hunt!",
  "Wrecked! Lost {amount} SOL! Revenge time!",
  
  // Analytical/Learning (41-60)
  "Suboptimal. {amount} SOL loss. Review the data.",
  "Miscalculation. Down {amount} SOL. Adjust strategy.",
  "Error. Lost {amount} SOL. Analyze and improve.",
  "Mistimed. {amount} SOL loss. Study the patterns.",
  "Off mark. Down {amount} SOL. Refine approach.",
  "Misjudged. Lost {amount} SOL. Learn the lesson.",
  "Wrong call. {amount} SOL loss. Back to analysis.",
  "Bad timing. Down {amount} SOL. Review entry point.",
  "Incorrect read. Lost {amount} SOL. Study charts.",
  "Flawed execution. {amount} SOL loss. Improve technique.",
  "Poor entry. Down {amount} SOL. Better next time.",
  "Weak exit. Lost {amount} SOL. Practice patience.",
  "Hasty decision. {amount} SOL loss. Think deeper.",
  "Impulsive. Down {amount} SOL. More discipline.",
  "Rushed. Lost {amount} SOL. Slow down.",
  "Premature. {amount} SOL loss. Wait for signal.",
  "Sloppy. Down {amount} SOL. Tighten up.",
  "Careless. Lost {amount} SOL. Focus better.",
  "Impatient. {amount} SOL loss. Control yourself.",
  "Reckless. Down {amount} SOL. Be smarter.",
  
  // British Humor (61-80)
  "Well bugger me. {amount} SOL loss. Spot of bad luck.",
  "Crikey. Lost {amount} SOL. That's unfortunate.",
  "Blimey! {amount} SOL down. Not brilliant.",
  "Bloody Nora! Lost {amount} SOL. Bit rubbish.",
  "Cor blimey! {amount} SOL loss. Not ideal.",
  "Stone me! Down {amount} SOL. Rather poor.",
  "Gordon Bennett! Lost {amount} SOL. Disappointing.",
  "Strewth! {amount} SOL loss. Not our finest.",
  "Flippin' heck! Down {amount} SOL. Bit pants.",
  "Blooming hell! Lost {amount} SOL. Not great.",
  "Ruddy hell! {amount} SOL loss. Rather annoying.",
  "Daft! Down {amount} SOL. Silly mistake.",
  "Muppet move! Lost {amount} SOL. My fault.",
  "Pear-shaped! {amount} SOL loss. Gone wrong.",
  "Cock-up! Down {amount} SOL. Bit of a mess.",
  "Balls-up! Lost {amount} SOL. Not clever.",
  "Bodge job! {amount} SOL loss. Poor show.",
  "Shambles! Down {amount} SOL. Bit dodgy.",
  "Naff! Lost {amount} SOL. Rather rubbish.",
  "Pants! {amount} SOL loss. Utterly crap.",
  
  // Crypto Slang (81-100)
  "Rekt. {amount} SOL loss, {userTitle}. Paper hands.",
  "Dumped on. Lost {amount} SOL. Brutal.",
  "Exit liquidity. {amount} SOL down. Classic.",
  "Rug pulled? {amount} SOL loss. Ouch.",
  "Bearish. Down {amount} SOL. Market's cold.",
  "Red candles. Lost {amount} SOL. Painful.",
  "Dump city. {amount} SOL loss. Savage.",
  "Liquidated vibes. Down {amount} SOL. Harsh.",
  "Bag holder moment. Lost {amount} SOL. Damn.",
  "FOMO got us. {amount} SOL loss. Learn.",
  "Degen loss. Down {amount} SOL. It happens.",
  "Shitcoin vibes. Lost {amount} SOL. Move on.",
  "Market's brutal. {amount} SOL loss. Survive.",
  "Whales dumping. Down {amount} SOL. Tough.",
  "Scam wicked. Lost {amount} SOL. Lesson learned.",
  "Ponzi energy. {amount} SOL loss. Yikes.",
  "Got exit liquidity'd. Down {amount} SOL. Classic trap.",
  "Honeypot? Lost {amount} SOL. Suspicious.",
  "Jeet behavior. {amount} SOL loss. Weak hands.",
  "Ngmi energy. Down {amount} SOL. We'll fix this."
];

// 🎯 Get random response
function getGainResponse(userTitle, amount) {
  const response = gainResponses[Math.floor(Math.random() * gainResponses.length)];
  return response.replace('{userTitle}', userTitle).replace('{amount}', amount);
}

function getLossResponse(userTitle, amount) {
  const response = lossResponses[Math.floor(Math.random() * lossResponses.length)];
  return response.replace('{userTitle}', userTitle).replace('{amount}', amount);
}

module.exports = {
  getGainResponse,
  getLossResponse
};

















