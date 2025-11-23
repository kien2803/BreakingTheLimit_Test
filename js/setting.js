/* ==========================================
   SETTINGS COMPONENT - Dùng cho tất cả trang
   ========================================== */

console.log('⚙️ Settings loaded!');

// ==========================================
// 1. TẠO NÚT SETTINGS
// ==========================================

function createSettingsButton() {
  if (document.querySelector('.btn-settings')) return;
  
  const btn = document.createElement('button');
  btn.className = 'btn-settings';
  btn.id = 'btnOpenSettings';
  btn.innerHTML = '⚙️';
  btn.setAttribute('aria-label', 'Cài đặt');
  
  document.body.appendChild(btn);
  return btn;
}


// ==========================================
// 2. TẠO SETTINGS MODAL
// ==========================================

function createSettingsModal() {
  if (document.querySelector('.settings-modal')) return;
  
  const modal = document.createElement('div');
  modal.className = 'settings-modal';
  modal.id = 'settingsModal';
  
  modal.innerHTML = `
    <div class="settings-box">
      <div class="settings-header">
        <h3 class="settings-title">⚙️ Cài đặt</h3>
        <button class="settings-close" id="closeSettings">✕</button>
      </div>

      <div class="settings-user">
        <div class="settings-avatar" id="settingsAvatar">👤</div>
        <div class="settings-user-info">
          <h4 id="settingsUsername">Username</h4>
          <p id="settingsEmail">email@example.com</p>
        </div>
      </div>

      <div class="settings-item">
        <div class="settings-label">
          <span class="settings-label-text">
            <span class="settings-label-icon" id="themeIcon">🌙</span>
            <span id="themeLabel">Dark Mode</span>
          </span>
          <div class="theme-switch" id="themeSwitch">
            <div class="theme-switch-slider">
              <span id="themeSwitchIcon">🌙</span>
            </div>
          </div>
        </div>
        <p class="settings-desc">Chế độ ban đêm bảo vệ mắt</p>
      </div>

      <button class="btn-logout" id="btnLogout">🚪 Đăng xuất</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  return modal;
}


// ==========================================
// 3. LOAD USER INFO
// ==========================================

function loadUserInfo() {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const avatar = document.getElementById('settingsAvatar');
  const username = document.getElementById('settingsUsername');
  const email = document.getElementById('settingsEmail');
  
  if (user.username) {
    username.textContent = user.username;
    email.textContent = user.email || '';
    avatar.textContent = user.role === 'family' ? '👨‍👩‍👧' : '👤';
  } else {
    username.textContent = 'Guest';
    email.textContent = 'Chưa đăng nhập';
  }
}


// ==========================================
// 4. UPDATE THEME UI
// ==========================================

function updateThemeUI() {
  const theme = localStorage.getItem('theme') || 'light';
  const themeSwitch = document.getElementById('themeSwitch');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');
  const themeSwitchIcon = document.getElementById('themeSwitchIcon');
  
  if (!themeSwitch) return;
  
  if (theme === 'dark') {
    themeSwitch.classList.add('active');
    themeIcon.textContent = '🌙';
    themeLabel.textContent = 'Dark Mode';
    themeSwitchIcon.textContent = '🌙';
  } else {
    themeSwitch.classList.remove('active');
    themeIcon.textContent = '☀️';
    themeLabel.textContent = 'Light Mode';
    themeSwitchIcon.textContent = '☀️';
  }
}


// ==========================================
// 5. TOGGLE THEME
// ==========================================

function toggleTheme() {
  const current = localStorage.getItem('theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  
  updateThemeUI();
}


// ==========================================
// 6. ATTACH EVENTS
// ==========================================

function attachSettingsEvents() {
  const btnOpen = document.getElementById('btnOpenSettings');
  const modal = document.getElementById('settingsModal');
  const btnClose = document.getElementById('closeSettings');
  const themeSwitch = document.getElementById('themeSwitch');
  const btnLogout = document.getElementById('btnLogout');
  
  if (!btnOpen || !modal) return;
  
  // Open modal
  btnOpen.addEventListener('click', () => {
    modal.classList.add('active');
    loadUserInfo();
    updateThemeUI();
  });
  
  // Close modal
  btnClose.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
  
  // Toggle theme
  themeSwitch.addEventListener('click', toggleTheme);
  
  // Logout
  btnLogout.addEventListener('click', () => {
    if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    }
  });
}


// ==========================================
// 7. KHỞI TẠO
// ==========================================

function initSettings() {
  createSettingsButton();
  createSettingsModal();
  attachSettingsEvents();
  updateThemeUI();
}

// Auto run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSettings);
} else {
  initSettings();
}

console.log('✅ Settings ready!');