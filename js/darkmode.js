/* ==========================================
   DARK MODE TOGGLE
   ========================================== */

console.log('🌙 Dark mode loaded!');

// ==========================================
// 1. TẠO NÚT TOGGLE
// ==========================================

function createThemeToggle() {
  // Kiểm tra đã có nút chưa
  if (document.querySelector('.theme-toggle')) return;
  
  const toggle = document.createElement('button');
  toggle.className = 'theme-toggle';
  toggle.setAttribute('aria-label', 'Toggle dark mode');
  toggle.innerHTML = '<span class="theme-toggle-icon">🌙</span>';
  
  document.body.appendChild(toggle);
  
  return toggle;
}


// ==========================================
// 2. LẤY THEME HIỆN TẠI
// ==========================================

function getCurrentTheme() {
  // Ưu tiên: localStorage > system preference > default (light)
  const saved = localStorage.getItem('theme');
  
  if (saved) {
    return saved;
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}


// ==========================================
// 3. ÁP DỤNG THEME
// ==========================================

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update icon
  const icon = document.querySelector('.theme-toggle-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  
  // Lưu vào localStorage
  localStorage.setItem('theme', theme);
  
  console.log('🎨 Theme:', theme);
}


// ==========================================
// 4. TOGGLE THEME
// ==========================================

function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
}


// ==========================================
// 5. KHỞI TẠO
// ==========================================

function initDarkMode() {
  // Áp dụng theme ngay lập tức (tránh flash)
  const currentTheme = getCurrentTheme();
  applyTheme(currentTheme);
  
  // Tạo nút toggle
  const toggle = createThemeToggle();
  
  // Gắn event
  if (toggle) {
    toggle.addEventListener('click', toggleTheme);
  }
  
  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Chỉ tự động đổi nếu user chưa set preference
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

// Chạy ngay khi load
initDarkMode();

console.log('✅ Dark mode ready!');