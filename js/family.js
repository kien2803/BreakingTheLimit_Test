/* ==========================================
   FAMILY.JS - Family Connection
   ========================================== */

console.log('🏡 Family Connection loaded!');

// Get current user
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
  window.location.href = 'login.html';
}

// ==========================================
// 1. CHECK ROLE & RENDER VIEW
// ==========================================

function checkRole() {
  const roleCheck = document.getElementById('roleCheck');
  const childView = document.getElementById('childView');
  const familyView = document.getElementById('familyView');

  if (currentUser.role === 'child') {
    childView.style.display = 'block';
    renderChildView();
  } else if (currentUser.role === 'family') {
    familyView.style.display = 'block';
    renderFamilyView();
  } else {
    roleCheck.innerHTML = `
      <div class="connection-card">
        <p>⚠️ Vui lòng đăng nhập với role phù hợp</p>
      </div>
    `;
  }
}

// ==========================================
// 2. CHILD VIEW
// ==========================================

function renderChildView() {
  // Generate invite code
  const inviteCode = currentUser.id.toString();
  const inviteLink = `${window.location.origin}/family.html?connect=${inviteCode}`;
  
  document.getElementById('childInviteLink').value = inviteLink;
  
  // Get connections
  const connections = getFamilyConnections();
  const myConnections = connections.filter(c => c.childId === currentUser.id);
  
  const statusDiv = document.getElementById('connectionStatus');
  
  if (myConnections.length === 0) {
    statusDiv.innerHTML = `
      <div class="connection-status">
        <span class="status-icon">👨‍👩‍👧</span>
        <div class="status-info">
          <h4>Chưa có kết nối</h4>
          <p>Chia sẻ link bên dưới với cha mẹ</p>
        </div>
      </div>
    `;
  } else {
    statusDiv.innerHTML = myConnections.map(conn => {
      const parent = getUserById(conn.familyId);
      return `
        <div class="connection-status">
          <span class="status-icon">👨‍👩‍👧</span>
          <div class="status-info">
            <h4>${parent ? parent.username : 'Gia đình'}</h4>
            <p>Đang theo dõi cảm xúc của bạn</p>
          </div>
          <span class="status-badge connected">✓ Đã kết nối</span>
        </div>
      `;
    }).join('');
  }
}

// Copy button
document.getElementById('btnCopyChild')?.addEventListener('click', () => {
  const input = document.getElementById('childInviteLink');
  input.select();
  navigator.clipboard.writeText(input.value);
  showToast('✅ Đã copy link!');
});

// ==========================================
// 3. FAMILY VIEW
// ==========================================

function renderFamilyView() {
  const connections = getFamilyConnections();
  const myConnections = connections.filter(c => c.familyId === currentUser.id);
  
  const childrenList = document.getElementById('childrenList');
  
  if (myConnections.length === 0) {
    childrenList.innerHTML = `
      <div class="connection-card">
        <p style="text-align: center; color: var(--text-muted);">
          Chưa có kết nối nào. Nhập link từ con để bắt đầu.
        </p>
      </div>
    `;
    return;
  }
  
  childrenList.innerHTML = myConnections.map(conn => {
    const child = getUserById(conn.childId);
    if (!child) return '';
    
    const stats = getChildStats(conn.childId);
    
    return `
      <div class="child-card" data-child-id="${conn.childId}">
        <div class="child-header">
          <div class="child-avatar">👤</div>
          <div class="child-info">
            <h4>${child.username}</h4>
            <p>Kết nối từ ${formatDate(conn.connectedAt)}</p>
          </div>
        </div>
        
        <div class="child-stats">
          <div class="stat-mini">
            <span class="stat-mini-value">${stats.todayMood}</span>
            <span class="stat-mini-label">Hôm nay</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-value">${stats.weekAvg}/10</span>
            <span class="stat-mini-label">Tuần này</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-value">${stats.streak}🔥</span>
            <span class="stat-mini-label">Streak</span>
          </div>
        </div>
        
        ${stats.hasAlert ? `
          <div class="child-alert">
            ⚠️ Có dấu hiệu cảm xúc tiêu cực kéo dài
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  
  // Attach click events
  document.querySelectorAll('.child-card').forEach(card => {
    card.addEventListener('click', () => {
      const childId = parseInt(card.dataset.childId);
      openChildModal(childId);
    });
  });
}

// Connect button
document.getElementById('btnConnect')?.addEventListener('click', () => {
  const input = document.getElementById('connectCode').value.trim();
  
  if (!input) {
    showToast('Vui lòng nhập link hoặc mã!', 'error');
    return;
  }
  
  // Extract child ID from link or code
  let childId;
  if (input.includes('connect=')) {
    const match = input.match(/connect=(\d+)/);
    childId = match ? parseInt(match[1]) : null;
  } else {
    childId = parseInt(input);
  }
  
  if (!childId || isNaN(childId)) {
    showToast('Link hoặc mã không hợp lệ!', 'error');
    return;
  }
  
  // Check if child exists
  const child = getUserById(childId);
  if (!child || child.role !== 'child') {
    showToast('Không tìm thấy người dùng!', 'error');
    return;
  }
  
  // Check if already connected
  const connections = getFamilyConnections();
  const existing = connections.find(c => 
    c.familyId === currentUser.id && c.childId === childId
  );
  
  if (existing) {
    showToast('Đã kết nối với người này rồi!', 'error');
    return;
  }
  
  // Create connection
  connections.push({
    id: Date.now(),
    familyId: currentUser.id,
    childId: childId,
    connectedAt: new Date().toISOString()
  });
  
  localStorage.setItem('family_connections', JSON.stringify(connections));
  
  showToast('✅ Đã kết nối thành công!');
  document.getElementById('connectCode').value = '';
  renderFamilyView();
});

// ==========================================
// 4. GET CHILD STATS
// ==========================================

function getChildStats(childId) {
  // Get child's journal entries from shared storage
  const allEntries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
  const childEntries = allEntries.filter(e => {
    // In real app, entries would have userId
    // For demo, we assume current entries belong to logged-in user
    return true; // Temporary
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Today's mood
  const todayEntries = childEntries.filter(e => {
    const date = new Date(e.date);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  });
  
  const todayMood = todayEntries.length > 0 
    ? getMoodEmoji(todayEntries[0].mood)
    : '—';
  
  // Week average
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekEntries = childEntries.filter(e => {
    const date = new Date(e.date);
    return date >= weekAgo;
  });
  
  const weekAvg = weekEntries.length > 0
    ? Math.round(weekEntries.reduce((sum, e) => 
        sum + (e.analysis?.intensity || 5), 0) / weekEntries.length)
    : 5;
  
  // Streak
  const streak = calculateStreak(childEntries);
  
  // Check for negative pattern (3+ consecutive sad/angry days)
  const last3Days = childEntries.slice(0, 3);
  const hasAlert = last3Days.length >= 3 && 
    last3Days.every(e => ['sad', 'angry', 'anxious'].includes(e.mood));
  
  return { todayMood, weekAvg, streak, hasAlert };
}

function getMoodEmoji(mood) {
  const emojis = {
    happy: '😊',
    peaceful: '😌',
    neutral: '😐',
    sad: '😢',
    angry: '😡',
    anxious: '😰',
    tired: '😴'
  };
  return emojis[mood] || '😐';
}

function calculateStreak(entries) {
  if (entries.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let checkDate = new Date(today);
  const entriesByDay = {};
  
  entries.forEach(e => {
    const date = new Date(e.date);
    date.setHours(0, 0, 0, 0);
    entriesByDay[date.getTime()] = true;
  });
  
  // Check từ hôm nay ngược lại
  if (!entriesByDay[checkDate.getTime()]) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while (entriesByDay[checkDate.getTime()]) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return streak;
}

// ==========================================
// 5. CHILD DETAIL MODAL
// ==========================================

function openChildModal(childId) {
  const child = getUserById(childId);
  if (!child) return;
  
  document.getElementById('modalChildName').textContent = `👤 ${child.username}`;
  
  // Draw chart
  drawChildChart(childId);
  
  // Render stats
  renderChildStats(childId);
  
  // Show modal
  document.getElementById('childModal').classList.add('active');
}

function drawChildChart(childId) {
  // Similar to emotion chart in dashboard
  // For demo, use current user's data
  const canvas = document.getElementById('childEmotionChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const entries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
  
  // Get 7 days data
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayEntries = entries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= date && entryDate < nextDate;
    });
    
    const avgIntensity = dayEntries.length > 0
      ? Math.round(dayEntries.reduce((sum, e) => 
          sum + (e.analysis?.intensity || 5), 0) / dayEntries.length)
      : 0;
    
    data.push({ intensity: avgIntensity });
  }
  
  // Simple bar chart
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const barWidth = canvas.width / data.length;
  const maxHeight = canvas.height - 40;
  
  data.forEach((point, i) => {
    const x = i * barWidth;
    const height = (point.intensity / 10) * maxHeight;
    const y = canvas.height - height - 20;
    
    ctx.fillStyle = '#1CD8D2';
    ctx.fillRect(x + 10, y, barWidth - 20, height);
  });
}

function renderChildStats(childId) {
  const stats = getChildStats(childId);
  
  document.getElementById('childStats').innerHTML = `
    <div class="stat-box">
      <span class="stat-box-label">Hôm nay</span>
      <span class="stat-box-value">${stats.todayMood}</span>
    </div>
    <div class="stat-box">
      <span class="stat-box-label">TB tuần</span>
      <span class="stat-box-value">${stats.weekAvg}/10</span>
    </div>
    <div class="stat-box">
      <span class="stat-box-label">Streak</span>
      <span class="stat-box-value">${stats.streak}🔥</span>
    </div>
  `;
  
  // Alert
  const alertSection = document.getElementById('alertSection');
  if (stats.hasAlert) {
    alertSection.innerHTML = `
      <div class="alert-box">
        <div class="alert-box-title">
          <span>⚠️</span>
          <span>Cần quan tâm</span>
        </div>
        <p class="alert-box-text">
          Con bạn có dấu hiệu cảm xúc tiêu cực kéo dài 3 ngày. 
          Hãy dành thời gian trò chuyện và lắng nghe con nhé.
        </p>
      </div>
    `;
  } else {
    alertSection.innerHTML = '';
  }
}

// Close modal
document.getElementById('modalClose')?.addEventListener('click', () => {
  document.getElementById('childModal').classList.remove('active');
});

document.getElementById('childModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'childModal') {
    e.target.classList.remove('active');
  }
});

// ==========================================
// 6. HELPER FUNCTIONS
// ==========================================

function getFamilyConnections() {
  return JSON.parse(localStorage.getItem('family_connections') || '[]');
}

function getUserById(id) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.find(u => u.id === id);
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('vi-VN');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==========================================
// 7. INIT
// ==========================================

// Check for connect parameter in URL
const urlParams = new URLSearchParams(window.location.search);
const connectCode = urlParams.get('connect');

if (connectCode && currentUser.role === 'family') {
  document.getElementById('connectCode').value = connectCode;
}

checkRole();

console.log('✅ Family Connection ready!');