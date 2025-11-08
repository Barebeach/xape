




function getSkillbarHTML(settings) {
  const buyHotkeys = settings.buyHotkeys || ['Q', 'W', 'E', 'R']
  const sellHotkeys = settings.sellHotkeys || ['A', 'S', 'D', 'F']
  const buyAmounts = settings.buyAmounts || [0.1, 0.25, 0.5, 1.0]
  const sellAmounts = settings.sellAmounts || [25, 50, 75, 100]
  
  return `
    <div class="skill-bar-container">
      <div class="skill-bar-main">
        <!-- Buy Buttons -->
        <div class="skill-button buy-button" data-action="buy" data-amount="${buyAmounts[0]}">
          <div class="skill-button-value">${buyAmounts[0]}</div>
          <div class="skill-button-hotkey">${buyHotkeys[0]}</div>
        </div>
        <div class="skill-button buy-button" data-action="buy" data-amount="${buyAmounts[1]}">
          <div class="skill-button-value">${buyAmounts[1]}</div>
          <div class="skill-button-hotkey">${buyHotkeys[1]}</div>
        </div>
        <div class="skill-button buy-button" data-action="buy" data-amount="${buyAmounts[2]}">
          <div class="skill-button-value">${buyAmounts[2]}</div>
          <div class="skill-button-hotkey">${buyHotkeys[2]}</div>
        </div>
        <div class="skill-button buy-button" data-action="buy" data-amount="${buyAmounts[3]}">
          <div class="skill-button-value">${buyAmounts[3]}</div>
          <div class="skill-button-hotkey">${buyHotkeys[3]}</div>
        </div>
        
        <!-- Sell Buttons -->
        <div class="skill-button sell-button" data-action="sell" data-amount="${sellAmounts[0]}">
          <div class="skill-button-value">${sellAmounts[0]}%</div>
          <div class="skill-button-hotkey">${sellHotkeys[0]}</div>
        </div>
        <div class="skill-button sell-button" data-action="sell" data-amount="${sellAmounts[1]}">
          <div class="skill-button-value">${sellAmounts[1]}%</div>
          <div class="skill-button-hotkey">${sellHotkeys[1]}</div>
        </div>
        <div class="skill-button sell-button" data-action="sell" data-amount="${sellAmounts[2]}">
          <div class="skill-button-value">${sellAmounts[2]}%</div>
          <div class="skill-button-hotkey">${sellHotkeys[2]}</div>
        </div>
        <div class="skill-button sell-button" data-action="sell" data-amount="${sellAmounts[3]}">
          <div class="skill-button-value">${sellAmounts[3]}%</div>
          <div class="skill-button-hotkey">${sellHotkeys[3]}</div>
        </div>
        
        <!-- Settings Button -->
        <div class="skill-button settings-button" id="settings-toggle" onclick="window.openSettings && window.openSettings()" style="pointer-events: auto !important; cursor: pointer !important; z-index: 150 !important; position: relative !important;">
          <div class="skill-button-value" style="font-size: 18px; font-weight: bold; pointer-events: auto !important; cursor: pointer !important;">⚙️</div>
        </div>
      </div>
      
      <!-- Settings Dropdown -->
      <div class="settings-dropdown" id="settings-dropdown">
        <div class="settings-header">
          <h3>Skillbar Settings</h3>
          <button class="close-settings" id="close-settings">✕</button>
        </div>
        
        <div class="settings-content">
          <!-- Buy Settings -->
          <div class="settings-section">
            <h4>Buy Amounts (SOL)</h4>
            <div class="settings-row">
              <label>${buyHotkeys[0]}</label>
              <input type="number" class="buy-amount-input" data-index="0" value="${buyAmounts[0]}" step="0.1" min="0.01">
            </div>
            <div class="settings-row">
              <label>${buyHotkeys[1]}</label>
              <input type="number" class="buy-amount-input" data-index="1" value="${buyAmounts[1]}" step="0.1" min="0.01">
            </div>
            <div class="settings-row">
              <label>${buyHotkeys[2]}</label>
              <input type="number" class="buy-amount-input" data-index="2" value="${buyAmounts[2]}" step="0.1" min="0.01">
            </div>
            <div class="settings-row">
              <label>${buyHotkeys[3]}</label>
              <input type="number" class="buy-amount-input" data-index="3" value="${buyAmounts[3]}" step="0.1" min="0.01">
            </div>
          </div>
          
          <!-- Sell Settings -->
          <div class="settings-section">
            <h4>Sell Amounts (%)</h4>
            <div class="settings-row">
              <label>${sellHotkeys[0]}</label>
              <input type="number" class="sell-amount-input" data-index="0" value="${sellAmounts[0]}" step="5" min="1" max="100">
            </div>
            <div class="settings-row">
              <label>${sellHotkeys[1]}</label>
              <input type="number" class="sell-amount-input" data-index="1" value="${sellAmounts[1]}" step="5" min="1" max="100">
            </div>
            <div class="settings-row">
              <label>${sellHotkeys[2]}</label>
              <input type="number" class="sell-amount-input" data-index="2" value="${sellAmounts[2]}" step="5" min="1" max="100">
            </div>
            <div class="settings-row">
              <label>${sellHotkeys[3]}</label>
              <input type="number" class="sell-amount-input" data-index="3" value="${sellAmounts[3]}" step="5" min="1" max="100">
            </div>
          </div>
          
          <!-- Feature Toggles -->
          <div class="settings-section">
            <h4>Features</h4>
            <div class="settings-row">
              <label>Market Cap Heatmap</label>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-market-cap" ${settings.marketCapEnabled !== false ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
            <div class="settings-row">
              <label>Auto-refresh Data</label>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-auto-refresh" ${settings.autoRefresh !== false ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <button class="apply-settings" id="apply-settings">Apply Changes</button>
        </div>
      </div>
    </div>
  `
}


function getXapeWidgetHTML(brainUrl) {
  return `
    <div id="xape-floating-widget" style="
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 200;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      pointer-events: auto;
    ">
      <!-- Brain GIF (replaces logo + wave) -->
      <img src="${brainUrl}" id="xape-brain-indicator" style="
        width: 48px;
        height: 48px;
        cursor: pointer;
        filter: drop-shadow(0 0 8px rgba(0, 191, 255, 0.4));
        transition: all 0.3s ease;
      " title="Click for XAPE Tutorial">
    </div>
  `
}


window.getSkillbarHTML = getSkillbarHTML
window.getXapeWidgetHTML = getXapeWidgetHTML









