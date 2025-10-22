// Reset XAPE User Data Script
// Run this in the browser console on axiom.trade to clear all user data

console.log('🔄 Resetting XAPE user data...');

// Clear all XAPE-related localStorage items
const keysToRemove = [
  'xape_user_name',
  'xape_user_title',
  'xape_user_gender',
  'xape_user_id',
  'xape_wallet_address',
  'xape_session_initialized',
  'xape_backend_url',
  'axiom_skillbar_session_v4',
  'axiom_skillbar_persistent_v4',
  'blue_phase_completed'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
  }
});

// Clear sessionStorage too
sessionStorage.clear();
console.log('✅ SessionStorage cleared');

console.log('');
console.log('═══════════════════════════════════════');
console.log('✅ XAPE USER DATA RESET COMPLETE!');
console.log('═══════════════════════════════════════');
console.log('');
console.log('NOW:');
console.log('  1. Refresh the page (F5)');
console.log('  2. XAPE will ask for your name');
console.log('  3. Say "initialize" to start');
console.log('');
console.log('═══════════════════════════════════════');









