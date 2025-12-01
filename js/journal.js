/* ==========================================
   JOURNAL.JS - Nhật ký với localStorage
   ========================================== */

console.log('📖 Journal Page Loaded!');

// ==========================================
// 1. LẤY CÁC ELEMENTS
// ==========================================
const moodBtns = document.querySelectorAll('.mood-btn');
const journalInput = document.getElementById('journalInput');
const charCount = document.getElementById('charCount');
const btnSave = document.getElementById('btnSave');
const entriesList = document.getElementById('entriesList');
const filterTabs = document.querySelectorAll('.filter-tab');
const streakCount = document.getElementById('streakCount');

// Modal
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

// Toast
const toast = document.getElementById('toast');

// State
let selectedMood = null;
let currentFilter = 'all';


// ==========================================
// 2. MOOD SELECTOR
// ==========================================
const moodEmojis = {
  happy: '😊',
  peaceful: '😌',
  neutral: '😐',
  sad: '😢',
  angry: '😡',
  anxious: '😰',
  tired: '😴'
};

const moodLabels = {
  happy: 'Vui vẻ',
  peaceful: 'Bình yên',
  neutral: 'Bình thường',
  sad: 'Buồn',
  angry: 'Tức giận',
  anxious: 'Lo lắng',
  tired: 'Mệt mỏi'
};

moodBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    // Bỏ selected tất cả
    moodBtns.forEach(b => b.classList.remove('selected'));
    // Thêm selected cho btn được click
    this.classList.add('selected');
    // Lưu mood
    selectedMood = this.dataset.mood;
    // Check enable save button
    checkSaveButton();
    
    console.log('Mood selected:', selectedMood);
  });
});


// ==========================================
// 3. TEXTAREA - Đếm ký tự
// ==========================================
journalInput.addEventListener('input', function() {
  const length = this.value.length;
  charCount.textContent = length;
  checkSaveButton();
});

function checkSaveButton() {
  const hasContent = journalInput.value.trim().length > 0;
  const hasMood = selectedMood !== null;
  btnSave.disabled = !(hasContent && hasMood);
}


// ==========================================
// 4. LƯU NHẬT KÝ
// ==========================================
btnSave.addEventListener('click', async function() {
  const content = journalInput.value.trim();
  
  if (!content || !selectedMood) {
    showToast('Chọn mood và viết nội dung đã!');
    return;
  }
  
  // Disable button
  btnSave.disabled = true;
  btnSave.textContent = '🔄 Đang phân tích...';
  
  // Phân tích cảm xúc (nếu có emotion.js)
  let analysis = null;
  if (window.analyzeEmotion) {
    try {
      analysis = await window.analyzeEmotion(content, selectedMood);
    } catch (err) {
      console.log('Emotion analysis failed:', err);
    }
  }
  
  // Tạo entry mới
  const entry = {
    id: Date.now(),
    mood: selectedMood,
    content: content,
    date: new Date().toISOString(),
    analysis: analysis // Thêm analysis
  };
  
  // Lấy danh sách cũ
  const entries = getEntries();
  entries.unshift(entry);
  
  // Lưu lại
  localStorage.setItem('journal_entries', JSON.stringify(entries));
  
  // Reset form
  journalInput.value = '';
  charCount.textContent = '0';
  selectedMood = null;
  moodBtns.forEach(function(b) {
    b.classList.remove('selected');
  });
  btnSave.disabled = true;
  btnSave.textContent = '💾 Lưu nhật ký';
  
  // Cập nhật UI
  renderEntries();
  updateStreak();
  showToast('✅ Đã lưu nhật ký!');
  
  // Hiển thị analysis result
  if (analysis && window.showAnalysisResult) {
    setTimeout(() => {
      window.showAnalysisResult(analysis);
    }, 500);
  }
});


// ==========================================
// 6. RENDER ENTRIES
// ==========================================
function renderEntries() {
  let entries = getEntries();

  // Filter nếu cần
  if (currentFilter !== 'all') {
    entries = entries.filter(e => e.mood === currentFilter);
  }

  // Nếu không có entries
  if (entries.length === 0) {
    entriesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p class="empty-text">Chưa có nhật ký nào</p>
        <p class="empty-subtext">Hãy bắt đầu viết những suy nghĩ của bạn!</p>
      </div>
    `;
    return;
  }

  // Render entries
  entriesList.innerHTML = entries.map(entry => `
    <div class="entry-card" data-id="${entry.id}">
      <div class="entry-header">
        <span class="entry-date">${formatDate(entry.createdAt)}</span>
        <span class="entry-mood">${moodEmojis[entry.mood] || '😐'}</span>
      </div>
      <div class="entry-content">${escapeHtml(entry.content)}</div>
      <div class="entry-footer">
        <button class="btn-entry btn-view" data-id="${entry.id}">👁️ Xem</button>
        <button class="btn-entry btn-delete delete" data-id="${entry.id}">🗑️ Xóa</button>
      </div>
    </div>
  `).join('');

  // Attach event listeners
  attachEntryEvents();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hôm nay, ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Hôm qua, ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }
}


// ==========================================
// 7. EVENT LISTENERS CHO ENTRIES
// ==========================================
function attachEntryEvents() {
  // Xem chi tiết
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseInt(this.dataset.id);
      viewEntry(id);
    });
  });

  // Xóa
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseInt(this.dataset.id);
      deleteEntry(id);
    });
  });

  // Click card để xem
  document.querySelectorAll('.entry-card').forEach(card => {
    card.addEventListener('click', function() {
      const id = parseInt(this.dataset.id);
      viewEntry(id);
    });
  });
}


// ==========================================
// 8. XEM CHI TIẾT ENTRY
// ==========================================
function viewEntry(id) {
  const entries = getEntries();
  const entry = entries.find(e => e.id === id);

  if (!entry) return;

  modalTitle.innerHTML = `${moodEmojis[entry.mood]} ${moodLabels[entry.mood]} - ${formatDate(entry.createdAt)}`;
  modalBody.textContent = entry.content;
  modal.classList.add('active');
}


// ==========================================
// 9. XÓA ENTRY
// ==========================================
function deleteEntry(id) {
  if (!confirm('Bạn có chắc muốn xóa nhật ký này?')) return;

  let entries = getEntries();
  entries = entries.filter(e => e.id !== id);
  localStorage.setItem('journal_entries', JSON.stringify(entries));

  renderEntries();
  updateStreak();
  showToast('🗑️ Đã xóa nhật ký!');
}


// ==========================================
// 10. ĐÓNG MODAL
// ==========================================
modalClose.addEventListener('click', () => {
  modal.classList.remove('active');
});

modal.addEventListener('click', function(e) {
  if (e.target === this) {
    this.classList.remove('active');
  }
});

// Đóng bằng ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    modal.classList.remove('active');
  }
});


// ==========================================
// 11. FILTER TABS
// ==========================================
filterTabs.forEach(tab => {
  tab.addEventListener('click', function() {
    filterTabs.forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.filter;
    renderEntries();
  });
});


// ==========================================
// 12. STREAK SYSTEM
// ==========================================
function updateStreak() {
  const entries = getEntries();
  
  if (entries.length === 0) {
    streakCount.textContent = '0';
    localStorage.setItem('journal_streak', '0');
    return;
  }

  // Tính streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group entries theo ngày
  const entriesByDay = {};
  entries.forEach(entry => {
    const date = new Date(entry.createdAt);
    date.setHours(0, 0, 0, 0);
    const key = date.getTime();
    entriesByDay[key] = true;
  });

  // Đếm ngược từ hôm nay
  let checkDate = new Date(today);
  
  // Nếu hôm nay chưa viết, bắt đầu từ hôm qua
  if (!entriesByDay[checkDate.getTime()]) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (entriesByDay[checkDate.getTime()]) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  streakCount.textContent = streak;
  localStorage.setItem('journal_streak', streak.toString());

  // Animation
  streakCount.style.transform = 'scale(1.3)';
  setTimeout(() => {
    streakCount.style.transform = 'scale(1)';
  }, 200);
}


// ==========================================
// 13. TOAST NOTIFICATION
// ==========================================
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = 'toast';
  if (type === 'error') {
    toast.classList.add('error');
  }
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}


// ==========================================
// 14. KHỞI TẠO
// ==========================================
function init() {
  renderEntries();
  updateStreak();
  
  // Load streak từ localStorage
  const savedStreak = localStorage.getItem('journal_streak');
  if (savedStreak) {
    streakCount.textContent = savedStreak;
  }
}

// Chạy khi trang load
init();

console.log('✅ Journal initialized!');