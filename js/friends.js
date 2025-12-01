/* ==========================================
   FRIENDS.JS - Friend System
   ========================================== */

console.log('👥 Friends loaded!');

const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
  window.location.href = 'login.html';
}

// ==========================================
// 1. GENERATE INVITE LINK
// ==========================================

function generateInviteLink() {
  const code = currentUser.id.toString();
  return `${window.location.origin}/friends.html?add=${code}`;
}

// ==========================================
// 2. RENDER FRIEND REQUESTS
// ==========================================

function renderRequests() {
  const requests = getFriendRequests();
  const myRequests = requests.filter(r => 
    r.toUserId === currentUser.id && r.status === 'pending'
  );
  
  document.getElementById('requestCount').textContent = myRequests.length;
  
  const requestsList = document.getElementById('requestsList');
  
  if (myRequests.length === 0) {
    requestsList.innerHTML = `
      <div class="empty-requests">
        <div class="empty-icon">📭</div>
        <p>Không có lời mời kết bạn nào</p>
      </div>
    `;
    return;
  }
  
  requestsList.innerHTML = myRequests.map(req => {
    const sender = getUserById(req.fromUserId);
    if (!sender) return '';
    
    return `
      <div class="request-card">
        <div class="request-avatar">👤</div>
        <div class="request-info">
          <h4>${sender.username}</h4>
          <p>${formatDate(req.createdAt)}</p>
        </div>
        <div class="request-actions">
          <button class="btn-accept" data-request-id="${req.id}">✓ Chấp nhận</button>
          <button class="btn-reject" data-request-id="${req.id}">✕ Từ chối</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Attach events
  document.querySelectorAll('.btn-accept').forEach(btn => {
    btn.addEventListener('click', () => {
      acceptRequest(parseInt(btn.dataset.requestId));
    });
  });
  
  document.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', () => {
      rejectRequest(parseInt(btn.dataset.requestId));
    });
  });
}

// ==========================================
// 3. RENDER FRIENDS LIST
// ==========================================

function renderFriends() {
  const friendships = getFriendships();
  const myFriends = friendships.filter(f => 
    f.user1Id === currentUser.id || f.user2Id === currentUser.id
  );
  
  document.getElementById('friendCount').textContent = myFriends.length;
  
  const friendsGrid = document.getElementById('friendsGrid');
  
  if (myFriends.length === 0) {
    friendsGrid.innerHTML = `
      <div class="empty-friends">
        <div class="empty-icon">👥</div>
        <p>Chưa có bạn bè nào</p>
        <p style="font-size: var(--font-size-sm);">Thêm bạn để bắt đầu kết nối!</p>
      </div>
    `;
    return;
  }
  
  friendsGrid.innerHTML = myFriends.map(friendship => {
    const friendId = friendship.user1Id === currentUser.id 
      ? friendship.user2Id 
      : friendship.user1Id;
    
    const friend = getUserById(friendId);
    if (!friend) return '';
    
    return `
      <div class="friend-card" data-friend-id="${friendId}">
        <div class="friend-avatar">👤</div>
        <h4>${friend.username}</h4>
        <p>Bạn từ ${formatDate(friendship.createdAt)}</p>
      </div>
    `;
  }).join('');
  
  // Attach events
  document.querySelectorAll('.friend-card').forEach(card => {
    card.addEventListener('click', () => {
      openFriendModal(parseInt(card.dataset.friendId));
    });
  });
}

// ==========================================
// 4. SEND FRIEND REQUEST
// ==========================================

function sendFriendRequest(friendId) {
  if (friendId === currentUser.id) {
    showToast('Không thể kết bạn với chính mình!', 'error');
    return false;
  }
  
  // Check if friend exists
  const friend = getUserById(friendId);
  if (!friend) {
    showToast('Người dùng không tồn tại!', 'error');
    return false;
  }
  
  // Check if already friends
  const friendships = getFriendships();
  const alreadyFriends = friendships.some(f => 
    (f.user1Id === currentUser.id && f.user2Id === friendId) ||
    (f.user2Id === currentUser.id && f.user1Id === friendId)
  );
  
  if (alreadyFriends) {
    showToast('Đã là bạn bè rồi!', 'error');
    return false;
  }
  
  // Check if request already sent
  const requests = getFriendRequests();
  const existingRequest = requests.find(r => 
    r.fromUserId === currentUser.id && 
    r.toUserId === friendId && 
    r.status === 'pending'
  );
  
  if (existingRequest) {
    showToast('Đã gửi lời mời rồi!', 'error');
    return false;
  }
  
  // Create request
  const newRequest = {
    id: Date.now(),
    fromUserId: currentUser.id,
    toUserId: friendId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  requests.push(newRequest);
  localStorage.setItem('friend_requests', JSON.stringify(requests));
  
  showToast('✅ Đã gửi lời mời kết bạn!');
  return true;
}

// ==========================================
// 5. ACCEPT REQUEST
// ==========================================

function acceptRequest(requestId) {
  const requests = getFriendRequests();
  const request = requests.find(r => r.id === requestId);
  
  if (!request) return;
  
  // Update request status
  request.status = 'accepted';
  localStorage.setItem('friend_requests', JSON.stringify(requests));
  
  // Create friendship
  const friendships = getFriendships();
  friendships.push({
    id: Date.now(),
    user1Id: request.fromUserId,
    user2Id: request.toUserId,
    createdAt: new Date().toISOString()
  });
  
  localStorage.setItem('friendships', JSON.stringify(friendships));
  
  showToast('✅ Đã chấp nhận lời mời!');
  renderRequests();
  renderFriends();
}

// ==========================================
// 6. REJECT REQUEST
// ==========================================

function rejectRequest(requestId) {
  let requests = getFriendRequests();
  requests = requests.filter(r => r.id !== requestId);
  localStorage.setItem('friend_requests', JSON.stringify(requests));
  
  showToast('Đã từ chối lời mời');
  renderRequests();
}

// ==========================================
// 7. UNFRIEND
// ==========================================

function unfriend(friendId) {
  if (!confirm('Bạn chắc chắn muốn hủy kết bạn?')) return;
  
  let friendships = getFriendships();
  friendships = friendships.filter(f => 
    !((f.user1Id === currentUser.id && f.user2Id === friendId) ||
      (f.user2Id === currentUser.id && f.user1Id === friendId))
  );
  
  localStorage.setItem('friendships', JSON.stringify(friendships));
  
  showToast('💔 Đã hủy kết bạn');
  document.getElementById('friendModal').classList.remove('active');
  renderFriends();
}

// ==========================================
// 8. OPEN FRIEND MODAL
// ==========================================

function openFriendModal(friendId) {
  const friend = getUserById(friendId);
  if (!friend) return;
  
  const friendship = getFriendships().find(f => 
    (f.user1Id === currentUser.id && f.user2Id === friendId) ||
    (f.user2Id === currentUser.id && f.user1Id === friendId)
  );
  
  document.getElementById('friendModalName').textContent = `👤 ${friend.username}`;
  document.getElementById('friendName').textContent = friend.username;
  document.getElementById('friendSince').textContent = 
    `Bạn bè từ ${formatDate(friendship?.createdAt)}`;
  
  // Stats (mock data - in real app would fetch friend's data)
  document.getElementById('friendStats').innerHTML = `
    <div class="stat-item">
      <span class="stat-value">🔥 ${Math.floor(Math.random() * 50)}</span>
      <span class="stat-label">Streak</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${Math.floor(Math.random() * 100)}</span>
      <span class="stat-label">Nhật ký</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${Math.floor(Math.random() * 50)}</span>
      <span class="stat-label">Ảnh</span>
    </div>
  `;
  
  // Set unfriend button
  document.getElementById('btnUnfriend').onclick = () => unfriend(friendId);
  
  // Set chat button
  document.getElementById('btnChatFriend').onclick = () => {
    showToast('Tính năng chat đang phát triển!');
  };
  
  document.getElementById('friendModal').classList.add('active');
}

// ==========================================
// 9. MODAL EVENTS
// ==========================================

// Add Friend Modal
document.getElementById('btnAddFriend')?.addEventListener('click', () => {
  const link = generateInviteLink();
  document.getElementById('myInviteLink').value = link;
  document.getElementById('addFriendModal').classList.add('active');
});

document.getElementById('closeAddFriend')?.addEventListener('click', () => {
  document.getElementById('addFriendModal').classList.remove('active');
});

document.getElementById('addFriendModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'addFriendModal') {
    e.target.classList.remove('active');
  }
});

// Copy Link
document.getElementById('btnCopyLink')?.addEventListener('click', () => {
  const input = document.getElementById('myInviteLink');
  input.select();
  navigator.clipboard.writeText(input.value);
  showToast('✅ Đã copy link!');
});

// Send Request
document.getElementById('btnSendRequest')?.addEventListener('click', () => {
  const input = document.getElementById('friendLink').value.trim();
  
  if (!input) {
    showToast('Vui lòng nhập link!', 'error');
    return;
  }
  
  // Extract friend ID
  let friendId;
  if (input.includes('add=')) {
    const match = input.match(/add=(\d+)/);
    friendId = match ? parseInt(match[1]) : null;
  } else {
    friendId = parseInt(input);
  }
  
  if (!friendId || isNaN(friendId)) {
    showToast('Link không hợp lệ!', 'error');
    return;
  }
  
  if (sendFriendRequest(friendId)) {
    document.getElementById('friendLink').value = '';
    document.getElementById('addFriendModal').classList.remove('active');
  }
});

// Friend Modal
document.getElementById('closeFriendModal')?.addEventListener('click', () => {
  document.getElementById('friendModal').classList.remove('active');
});

document.getElementById('friendModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'friendModal') {
    e.target.classList.remove('active');
  }
});

// ==========================================
// 10. HELPER FUNCTIONS
// ==========================================

function getFriendRequests() {
  return JSON.parse(localStorage.getItem('friend_requests') || '[]');
}

function getFriendships() {
  return JSON.parse(localStorage.getItem('friendships') || '[]');
}

function getUserById(id) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.find(u => u.id === id);
}

function formatDate(isoString) {
  if (!isoString) return 'hôm nay';
  const date = new Date(isoString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'hôm nay';
  if (diffDays === 1) return 'hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
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
// 11. INIT
// ==========================================

// Check for add parameter
const urlParams = new URLSearchParams(window.location.search);
const addFriendId = urlParams.get('add');

if (addFriendId) {
  const friendId = parseInt(addFriendId);
  if (sendFriendRequest(friendId)) {
    // Clear URL parameter
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

renderRequests();
renderFriends();

console.log('✅ Friends ready!');