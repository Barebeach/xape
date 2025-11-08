// ========================================
// XAPE STORAGE RESET SCRIPT
// ========================================
// Run this in the browser console on axiom.trade
// to reset all XAPE user data and start fresh

console.log('🔄 Clearing XAPE localStorage...');

// Remove all XAPE-related items
const xapeKeys = [
  'xape_user_name',
  'xape_user_gender', 
  'xape_user_title',
  'xape_has_greeted',
  'xape_backend_url',
  'xape_last_announced_headline',
  'xape_awake_state'
];

xapeKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`  ❌ Removed: ${key} = "${localStorage.getItem(key)}"`);
    localStorage.removeItem(key);
  }
});

console.log('✅ XAPE localStorage cleared!');
console.log('📋 Next steps:');
console.log('   1. Refresh this page (F5)');
console.log('   2. Reload extension at chrome://extensions');
console.log('   3. Say "initialize" to set up XAPE again');

