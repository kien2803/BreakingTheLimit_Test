/* ==========================================
   AUTH.JS - Đăng ký / Đăng nhập
   ========================================== */

console.log('🔐 Auth loaded!');

// ==========================================
// 1. LẤY ELEMENTS
// ==========================================

const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const usernamePreview = document.getElementById('usernamePreview');
const randomUsernameEl = document.getElementById('randomUsername');
const refreshUsernameBtn = document.getElementById('refreshUsername');
const toast = document.getElementById('toast');

// Links chuyển tab
const goToRegister = document.getElementById('goToRegister');
const goToLogin = document.getElementById('goToLogin');

// Role buttons
const roleBtns = document.querySelectorAll('.role-btn');

// Biến lưu trạng thái
let selectedRole = 'child';
let generatedUsername = '';


// ==========================================
// 2. RANDOM USERNAME GENERATOR
// ==========================================

const animals = ['Chó', 'Mèo', 'Gấu', 'Cáo', 'Thỏ', 'Sói', 'Hổ', 'Rồng', 'Chim', 'Cá', 'Voi', 'Khỉ'];
const traits = ['Lạnh Lùng', 'Vui Vẻ', 'Dễ Thương', 'Bí Ẩn', 'Đáng Yêu', 'Mạnh Mẽ', 'Tinh Nghịch', 'Hiền Lành', 'Dũng Cảm', 'Thông Minh'];
const emojis = ['🐶', '🐱', '🐻', '🦊', '🐰', '🐺', '🐯', '🐲', '🐦', '🐟', '🐘', '🐵'];

function generateUsername() {
  const randomAnimal = Math.floor(Math.random() * animals.length);
  const randomTrait = Math.floor(Math.random() * traits.length);
  const emoji = emojis[randomAnimal];
  const name = animals[randomAnimal] + ' ' + traits[randomTrait];
  
  generatedUsername = name;
  return emoji + ' ' + name;
}

// Hiển thị username ngẫu nhiên
function updateUsernamePreview() {
  randomUsernameEl.textContent = generateUsername();
}

// Click refresh
refreshUsernameBtn.addEventListener('click', updateUsernamePreview);


// ==========================================
// 3. CHUYỂN TABS
// ==========================================

function switchTab(tabName) {
  // Update tab buttons
  authTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // Update forms
  if (tabName === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    usernamePreview.classList.remove('show');
  } else {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
    usernamePreview.classList.add('show');
    updateUsernamePreview();
  }
}

// Click tabs
authTabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// Click links
goToRegister.addEventListener('click', (e) => {
  e.preventDefault();
  switchTab('register');
});

goToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  switchTab('login');
});


// ==========================================
// 4. CHỌN ROLE
// ==========================================

roleBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    roleBtns.forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    selectedRole = this.dataset.role;
  });
});


// ==========================================
// 5. TOAST NOTIFICATION
// ==========================================

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}


// ==========================================
// 6. ĐĂNG KÝ
// ==========================================

registerForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  
  // Validate
  if (!email || !password) {
    showToast('Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }
  
  if (password.length < 6) {
    showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
    return;
  }
  
  if (password !== confirm) {
    showToast('Mật khẩu không khớp!', 'error');
    return;
  }
  
  // Kiểm tra email đã tồn tại chưa
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const exists = users.find(u => u.email === email);
  
  if (exists) {
    showToast('Email đã được sử dụng!', 'error');
    return;
  }
  
  // Tạo user mới
  const newUser = {
    id: Date.now(),
    email: email,
    password: password, // Thực tế cần hash, đây chỉ là demo
    username: generatedUsername,
    role: selectedRole,
    createdAt: new Date().toISOString()
  };
  
  // Lưu user
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  // Auto login
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  showToast('🎉 Đăng ký thành công!', 'success');
  
  // Chuyển trang sau 1.5s
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1500);
});


// ==========================================
// 7. ĐĂNG NHẬP
// ==========================================

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  // Validate
  if (!email || !password) {
    showToast('Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }
  
  // Tìm user
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    showToast('Email hoặc mật khẩu không đúng!', 'error');
    return;
  }
  
  // Lưu session
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  showToast('✅ Đăng nhập thành công!', 'success');
  
  // Chuyển trang
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1500);
});


// ==========================================
// 8. KIỂM TRA ĐÃ ĐĂNG NHẬP CHƯA
// ==========================================

function checkAuth() {
  const user = localStorage.getItem('currentUser');
  if (user) {
    // Đã đăng nhập → chuyển dashboard
    window.location.href = 'dashboard.html';
  }
}

// Kiểm tra khi load trang
checkAuth();


console.log('✅ Auth ready!');