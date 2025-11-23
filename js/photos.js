/* ==========================================
   PHOTOS.JS - Upload & Replay
   ========================================== */

console.log('📸 Photos loaded!');

// ==========================================
// 1. LẤY ELEMENTS
// ==========================================

const btnUpload = document.getElementById('btnUpload');
const btnReplay = document.getElementById('btnReplay');
const uploadSection = document.getElementById('uploadSection');
const fileInput = document.getElementById('fileInput');
const uploadContent = document.getElementById('uploadContent');
const previewImage = document.getElementById('previewImage');
const captionInput = document.getElementById('captionInput');
const btnCancel = document.getElementById('btnCancel');
const btnSavePhoto = document.getElementById('btnSavePhoto');
const photosGrid = document.getElementById('photosGrid');
const emptyState = document.getElementById('emptyState');
const photoCount = document.getElementById('photoCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const toast = document.getElementById('toast');

// Replay modal
const replayModal = document.getElementById('replayModal');
const replayClose = document.getElementById('replayClose');
const replayImage = document.getElementById('replayImage');
const replayCaption = document.getElementById('replayCaption');
const replayDate = document.getElementById('replayDate');
const replayPrev = document.getElementById('replayPrev');
const replayPlay = document.getElementById('replayPlay');
const replayNext = document.getElementById('replayNext');
const replayProgressBar = document.getElementById('replayProgressBar');

// View modal
const viewModal = document.getElementById('viewModal');
const viewClose = document.getElementById('viewClose');
const viewImage = document.getElementById('viewImage');
const viewCaption = document.getElementById('viewCaption');
const viewDate = document.getElementById('viewDate');
const btnDeletePhoto = document.getElementById('btnDeletePhoto');

// State
let selectedFile = null;
let currentFilter = 'all';
let replayIndex = 0;
let replayTimer = null;
let isPlaying = false;
let currentViewPhotoId = null;


// ==========================================
// 2. UPLOAD SECTION
// ==========================================

btnUpload.addEventListener('click', () => {
  uploadSection.classList.add('active');
  uploadSection.scrollIntoView({ behavior: 'smooth' });
});

// Click upload box
document.querySelector('.upload-box').addEventListener('click', () => {
  fileInput.click();
});

// Chọn file
fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    selectedFile = file;
    previewFile(file);
  }
});

// Preview ảnh
function previewFile(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    uploadContent.style.display = 'none';
    previewImage.src = e.target.result;
    previewImage.style.display = 'block';
  };
  
  reader.readAsDataURL(file);
}

// Drag & Drop
const uploadBox = document.querySelector('.upload-box');

uploadBox.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBox.style.borderColor = 'var(--primary)';
});

uploadBox.addEventListener('dragleave', () => {
  uploadBox.style.borderColor = 'var(--border-light)';
});

uploadBox.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadBox.style.borderColor = 'var(--border-light)';
  
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    selectedFile = file;
    previewFile(file);
  }
});


// ==========================================
// 3. SAVE PHOTO
// ==========================================

btnSavePhoto.addEventListener('click', savePhoto);

function savePhoto() {
  if (!selectedFile) {
    showToast('Vui lòng chọn ảnh!', 'error');
    return;
  }
  
  const caption = captionInput.value.trim();
  
  // Convert file to base64
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const photo = {
      id: Date.now(),
      dataUrl: e.target.result,
      caption: caption,
      date: new Date().toISOString()
    };
    
    // Lấy photos từ localStorage
    const photos = getPhotos();
    photos.unshift(photo);
    
    // Lưu (giới hạn 50 ảnh)
    if (photos.length > 50) {
      photos.length = 50;
    }
    
    localStorage.setItem('photos', JSON.stringify(photos));
    
    // Reset form
    resetUploadForm();
    
    // Render lại
    renderPhotos();
    
    showToast('✅ Đã lưu ảnh!');
  };
  
  reader.readAsDataURL(selectedFile);
}

// Reset form
function resetUploadForm() {
  uploadSection.classList.remove('active');
  uploadContent.style.display = 'block';
  previewImage.style.display = 'none';
  previewImage.src = '';
  captionInput.value = '';
  selectedFile = null;
  fileInput.value = '';
}

btnCancel.addEventListener('click', resetUploadForm);


// ==========================================
// 4. GET PHOTOS
// ==========================================

function getPhotos() {
  const data = localStorage.getItem('photos');
  return data ? JSON.parse(data) : [];
}


// ==========================================
// 5. RENDER PHOTOS
// ==========================================

function renderPhotos() {
  let photos = getPhotos();
  
  // Filter
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  if (currentFilter === 'today') {
    photos = photos.filter(p => new Date(p.date) >= today);
  } else if (currentFilter === 'week') {
    photos = photos.filter(p => new Date(p.date) >= weekAgo);
  }
  
  // Update count
  photoCount.textContent = getPhotos().length;
  
  // Empty state
  if (photos.length === 0) {
    photosGrid.innerHTML = '';
    emptyState.classList.add('show');
    return;
  }
  
  emptyState.classList.remove('show');
  
  // Render
  photosGrid.innerHTML = photos.map(photo => `
    <div class="photo-card" data-id="${photo.id}">
      <img src="${photo.dataUrl}" alt="${photo.caption || 'Photo'}">
      <div class="photo-info">
        <p class="photo-caption">${photo.caption || 'Không có caption'}</p>
        <p class="photo-date">${formatDate(photo.date)}</p>
      </div>
    </div>
  `).join('');
  
  // Attach events
  attachPhotoEvents();
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return diffDays + ' ngày trước';
  return date.toLocaleDateString('vi-VN');
}


// ==========================================
// 6. PHOTO EVENTS
// ==========================================

function attachPhotoEvents() {
  document.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', function() {
      const id = parseInt(this.dataset.id);
      openViewModal(id);
    });
  });
}


// ==========================================
// 7. VIEW MODAL
// ==========================================

function openViewModal(id) {
  const photos = getPhotos();
  const photo = photos.find(p => p.id === id);
  
  if (!photo) return;
  
  currentViewPhotoId = id;
  viewImage.src = photo.dataUrl;
  viewCaption.textContent = photo.caption || 'Không có caption';
  viewDate.textContent = formatDate(photo.date);
  viewModal.classList.add('active');
}

viewClose.addEventListener('click', () => {
  viewModal.classList.remove('active');
});

viewModal.addEventListener('click', (e) => {
  if (e.target === viewModal) {
    viewModal.classList.remove('active');
  }
});

// Delete photo
btnDeletePhoto.addEventListener('click', () => {
  if (!confirm('Bạn chắc chắn muốn xóa ảnh này?')) return;
  
  let photos = getPhotos();
  photos = photos.filter(p => p.id !== currentViewPhotoId);
  localStorage.setItem('photos', JSON.stringify(photos));
  
  viewModal.classList.remove('active');
  renderPhotos();
  showToast('🗑️ Đã xóa ảnh!');
});


// ==========================================
// 8. FILTER
// ==========================================

filterBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.filter;
    renderPhotos();
  });
});


// ==========================================
// 9. REPLAY MODAL
// ==========================================

btnReplay.addEventListener('click', () => {
  const photos = getPhotos();
  
  if (photos.length === 0) {
    showToast('Chưa có ảnh để replay!', 'error');
    return;
  }
  
  replayIndex = 0;
  showReplayPhoto();
  replayModal.classList.add('active');
});

function showReplayPhoto() {
  const photos = getPhotos();
  if (photos.length === 0) return;
  
  const photo = photos[replayIndex];
  replayImage.src = photo.dataUrl;
  replayCaption.textContent = photo.caption || '';
  replayDate.textContent = formatDate(photo.date);
  
  // Update progress
  const progress = ((replayIndex + 1) / photos.length) * 100;
  replayProgressBar.style.width = progress + '%';
}

// Đóng replay
replayClose.addEventListener('click', () => {
  stopReplay();
  replayModal.classList.remove('active');
});

replayModal.addEventListener('click', (e) => {
  if (e.target === replayModal) {
    stopReplay();
    replayModal.classList.remove('active');
  }
});

// Previous
replayPrev.addEventListener('click', () => {
  const photos = getPhotos();
  replayIndex = (replayIndex - 1 + photos.length) % photos.length;
  showReplayPhoto();
});

// Next
replayNext.addEventListener('click', () => {
  const photos = getPhotos();
  replayIndex = (replayIndex + 1) % photos.length;
  showReplayPhoto();
});

// Play/Pause
replayPlay.addEventListener('click', () => {
  if (isPlaying) {
    stopReplay();
  } else {
    startReplay();
  }
});

function startReplay() {
  isPlaying = true;
  replayPlay.textContent = '⏸️';
  
  replayTimer = setInterval(() => {
    const photos = getPhotos();
    replayIndex = (replayIndex + 1) % photos.length;
    showReplayPhoto();
  }, 3000); // 3 giây mỗi ảnh
}

function stopReplay() {
  isPlaying = false;
  replayPlay.textContent = '▶️';
  if (replayTimer) {
    clearInterval(replayTimer);
    replayTimer = null;
  }
}


// ==========================================
// 10. TOAST
// ==========================================

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}


// ==========================================
// 11. INIT
// ==========================================

renderPhotos();

console.log('✅ Photos ready!');