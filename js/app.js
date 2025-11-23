/* ==========================================
   APP.JS - Breaking The Limit
   ========================================== */

console.log('🚀 Breaking The Limit - Loaded!');

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll('.fade-in-section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // chỉ chạy 1 lần
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => {
    observer.observe(section);
  });
});


// ==========================================
// 1. SIDEBAR NAVIGATION
// ==========================================
const sidebarIcons = document.querySelectorAll('.sidebar-icon');

sidebarIcons.forEach(icon => {
  icon.addEventListener('click', function () {
    // Bỏ active tất cả
    sidebarIcons.forEach(i => i.classList.remove('active'));
    // Thêm active cho icon được click
    this.classList.add('active');
  });
});


// ==========================================
// 2. HEADER NAVIGATION
// ==========================================
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
  item.addEventListener('click', function () {
    navItems.forEach(i => i.classList.remove('active'));
    this.classList.add('active');
  });
});


// ==========================================
// 3. TOGGLE SWITCHES
// ==========================================
const toggles = document.querySelectorAll('.toggle-switch');

toggles.forEach(toggle => {
  toggle.addEventListener('click', function () {
    this.classList.toggle('active');

    // Log trạng thái
    const isActive = this.classList.contains('active');
    console.log('Toggle:', isActive ? 'ON' : 'OFF');
  });
});


// ==========================================
// 4. MOOD TABS
// ==========================================
const moodTabs = document.querySelectorAll('.mood-tab');

moodTabs.forEach(tab => {
  tab.addEventListener('click', function () {
    moodTabs.forEach(t => t.classList.remove('active'));
    this.classList.add('active');

    console.log('Mood selected:', this.textContent);
  });
});


// ==========================================
// 5. MOOD TAGS (có thể chọn nhiều)
// ==========================================
const moodTags = document.querySelectorAll('.mood-tag');

moodTags.forEach(tag => {
  tag.addEventListener('click', function () {
    this.classList.toggle('selected');

    // Thêm style khi selected
    if (this.classList.contains('selected')) {
      this.style.background = 'var(--primary)';
      this.style.color = 'white';
      this.style.borderColor = 'var(--primary)';
    } else {
      this.style.background = 'var(--bg-main)';
      this.style.color = 'var(--text-secondary)';
      this.style.borderColor = 'var(--border-light)';
    }
  });
});


// ==========================================
// 6. AI CHAT - Gửi tin nhắn
// ==========================================
const chatInput = document.querySelector('.chat-input');
const btnSend = document.querySelector('.btn-send');

// Danh sách câu trả lời mẫu của AI
const aiResponses = [
  "Mình hiểu cảm xúc của bạn. Hãy kể thêm nhé! 💙",
  "Bạn đang làm rất tốt rồi đó! Tiếp tục nhé 🌟",
  "Mình luôn ở đây lắng nghe bạn 🤗",
  "Cảm ơn bạn đã chia sẻ với mình ❤️",
  "Hôm nay bạn có muốn viết nhật ký không? 📝",
  "Bạn thật dũng cảm khi chia sẻ điều này 💪",
  "Mình tin bạn sẽ vượt qua được! ✨"
];

function sendMessage() {
  const message = chatInput.value.trim();

  if (message === '') return;

  console.log('User:', message);

  // Random câu trả lời
  const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

  // Hiển thị alert tạm thời (sau này sẽ làm UI chat thật)
  setTimeout(() => {
    alert(`🐱 Kem Buồn: ${randomResponse}`);
  }, 500);

  // Xóa input
  chatInput.value = '';
}

btnSend.addEventListener('click', sendMessage);

// Gửi khi nhấn Enter
chatInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});


// ==========================================
// 7. PHOTO GRID - Click xem ảnh
// ==========================================
const photoItems = document.querySelectorAll('.photo-item');

photoItems.forEach(item => {
  item.addEventListener('click', function () {
    const img = this.querySelector('img');
    if (img) {
      // Mở ảnh trong tab mới (tạm thời)
      // Sau này sẽ làm modal đẹp hơn
      window.open(img.src, '_blank');
    }
  });
});


// ==========================================
// 8. QUICK ACTIONS - Các nút hành động
// ==========================================
const actionBtns = document.querySelectorAll('.action-btn');

actionBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    const action = this.textContent.trim();

    switch (action) {
      case 'Write Journal':
        alert('📝 Tính năng viết nhật ký sẽ được thêm sau!');
        break;
      case 'Chat with AI':
        // Scroll đến chat section
        document.querySelector('.card-ai-chat').scrollIntoView({
          behavior: 'smooth'
        });
        chatInput.focus();
        break;
      case 'Chat with':
        alert('👥 Tính năng chat với bạn bè sẽ được thêm sau!');
        break;
      case 'Upload Photo':
        alert('📸 Tính năng upload ảnh sẽ được thêm sau!');
        break;
    }
  });
});


// ==========================================
// 9. INVITE BUTTONS
// ==========================================
const inviteBtns = document.querySelectorAll('.btn-invite');

inviteBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    // Tạo link giả
    const inviteCode = Math.random().toString(36).substring(2, 10);
    const inviteLink = `breakingthelimit.com/invite/${inviteCode}`;

    // Copy vào clipboard
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert(`✅ Đã copy link mời!\n\n${inviteLink}`);
    }).catch(() => {
      alert(`📋 Link mời của bạn:\n\n${inviteLink}`);
    });
  });
});


// ==========================================
// 10. CREATE INVITE LINK (Header)
// ==========================================
const btnCreate = document.querySelector('.btn-create');

if (btnCreate) {
  btnCreate.addEventListener('click', function () {
    const inviteCode = Math.random().toString(36).substring(2, 10);
    const inviteLink = `breakingthelimit.com/invite/${inviteCode}`;

    navigator.clipboard.writeText(inviteLink).then(() => {
      alert(`✅ Đã tạo và copy link!\n\n${inviteLink}`);
    });
  });
}


// ==========================================
// 11. STREAK ANIMATION
// ==========================================
// Animate số streak khi load trang
const bigNumber = document.querySelector('.big-number');

if (bigNumber) {
  const targetNumber = parseInt(bigNumber.textContent);
  let currentNumber = 0;

  const animateStreak = setInterval(() => {
    currentNumber += 1;
    bigNumber.textContent = currentNumber;

    if (currentNumber >= targetNumber) {
      clearInterval(animateStreak);
    }
  }, 30);
}


// ==========================================
// 12. BUTTON SUBMIT MOOD
// ==========================================
const btnPrimary = document.querySelector('.btn-primary');

if (btnPrimary) {
  btnPrimary.addEventListener('click', function () {
    // Lấy mood đã chọn
    const selectedTab = document.querySelector('.mood-tab.active');
    const selectedTags = document.querySelectorAll('.mood-tag.selected');

    const mood = selectedTab ? selectedTab.textContent : 'Chưa chọn';
    const tags = Array.from(selectedTags).map(t => t.textContent);

    console.log('Mood:', mood);
    console.log('Tags:', tags);

    alert(`✅ Đã lưu mood hôm nay!\n\nMood: ${mood}\nTags: ${tags.join(', ') || 'Không có'}`);
  });
}


// ==========================================
// 13. VIEW ALL PHOTOS
// ==========================================
const btnViewAll = document.querySelector('.btn-view-all');

if (btnViewAll) {
  btnViewAll.addEventListener('click', function () {
    alert('🖼️ Trang xem tất cả ảnh sẽ được thêm sau!');
  });
}


// ==========================================
// 14. CANVAS BUTTONS
// ==========================================
const btnCanvasInvite = document.querySelector('.btn-canvas-invite');
const btnCanvasClose = document.querySelector('.btn-canvas-close');

if (btnCanvasInvite) {
  btnCanvasInvite.addEventListener('click', function () {
    const inviteCode = Math.random().toString(36).substring(2, 10);
    alert(`🎨 Mời bạn vẽ cùng!\n\nLink: breakingthelimit.com/draw/${inviteCode}`);
  });
}

if (btnCanvasClose) {
  btnCanvasClose.addEventListener('click', function () {
    const card = this.closest('.card');
    if (card) {
      card.style.display = 'none';
    }
  });
}


// ==========================================
// 15. RANDOM USERNAME GENERATOR
// ==========================================
const animals = [
  "Chó", "Mèo", "Gấu", "Cáo", "Thỏ",
  "Sói", "Hổ", "Rồng", "Chim", "Cá"
];

const traits = [
  "Lạnh Lùng", "Vui Vẻ", "Dịu Dàng", "Hài Hước",
  "Bí Ẩn", "Đáng Yêu", "Mạnh Mẽ", "Tinh Nghịch"
];

function generateUsername() {
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const trait = traits[Math.floor(Math.random() * traits.length)];
  return `${animal} ${trait}`;
}

// Test: Log username ngẫu nhiên
console.log('🎲 Random Username:', generateUsername());


// ==========================================
// DONE! Tất cả tương tác cơ bản đã sẵn sàng
// ==========================================
console.log('✅ All event listeners attached!');
