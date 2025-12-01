/* ==========================================
   DRAW.JS - Drawing Canvas với Fabric.js
   ========================================== */

console.log('🎨 Drawing loaded!');

// ==========================================
// 1. KHỞI TẠO CANVAS
// ==========================================

const canvas = new fabric.Canvas('drawingCanvas', {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff'
});

let currentTool = 'brush';
let currentColor = '#000000';
let brushSize = 5;
let isDrawing = false;
let currentShape = null;

// History for undo/redo
let history = [];
let historyStep = 0;

// ==========================================
// 2. SETUP DRAWING MODE
// ==========================================

function setupBrush() {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = currentColor;
  canvas.freeDrawingBrush.width = brushSize;
}

function setupEraser() {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = '#ffffff';
  canvas.freeDrawingBrush.width = brushSize * 2;
}

function setupShape(type) {
  canvas.isDrawingMode = false;
  canvas.selection = false;
}

// ==========================================
// 3. TOOL BUTTONS
// ==========================================

document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    currentTool = this.dataset.tool;
    
    switch(currentTool) {
      case 'brush':
        setupBrush();
        break;
      case 'eraser':
        setupEraser();
        break;
      case 'line':
      case 'circle':
      case 'rect':
        setupShape(currentTool);
        break;
    }
  });
});

// ==========================================
// 4. COLOR SELECTION
// ==========================================

document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    currentColor = this.dataset.color;
    
    if (currentTool === 'brush') {
      canvas.freeDrawingBrush.color = currentColor;
    }
  });
});

document.getElementById('customColor').addEventListener('input', function() {
  currentColor = this.value;
  
  if (currentTool === 'brush') {
    canvas.freeDrawingBrush.color = currentColor;
  }
});

// ==========================================
// 5. BRUSH SIZE
// ==========================================

const brushSlider = document.getElementById('brushSize');
const sizePreview = document.getElementById('sizePreview');

brushSlider.addEventListener('input', function() {
  brushSize = parseInt(this.value);
  
  // Update preview
  sizePreview.style.width = brushSize + 'px';
  sizePreview.style.height = brushSize + 'px';
  
  // Update brush
  if (canvas.isDrawingMode) {
    if (currentTool === 'eraser') {
      canvas.freeDrawingBrush.width = brushSize * 2;
    } else {
      canvas.freeDrawingBrush.width = brushSize;
    }
  }
});

// Init preview
sizePreview.style.width = brushSize + 'px';
sizePreview.style.height = brushSize + 'px';

// ==========================================
// 6. SHAPES (Line, Circle, Rect)
// ==========================================

let shapeStartX, shapeStartY;

canvas.on('mouse:down', function(options) {
  if (['line', 'circle', 'rect'].includes(currentTool)) {
    isDrawing = true;
    const pointer = canvas.getPointer(options.e);
    shapeStartX = pointer.x;
    shapeStartY = pointer.y;
    
    switch(currentTool) {
      case 'line':
        currentShape = new fabric.Line([shapeStartX, shapeStartY, shapeStartX, shapeStartY], {
          stroke: currentColor,
          strokeWidth: brushSize
        });
        break;
      case 'circle':
        currentShape = new fabric.Circle({
          left: shapeStartX,
          top: shapeStartY,
          radius: 0,
          fill: 'transparent',
          stroke: currentColor,
          strokeWidth: brushSize
        });
        break;
      case 'rect':
        currentShape = new fabric.Rect({
          left: shapeStartX,
          top: shapeStartY,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: currentColor,
          strokeWidth: brushSize
        });
        break;
    }
    
    canvas.add(currentShape);
  }
});

canvas.on('mouse:move', function(options) {
  if (!isDrawing || !currentShape) return;
  
  const pointer = canvas.getPointer(options.e);
  
  switch(currentTool) {
    case 'line':
      currentShape.set({ x2: pointer.x, y2: pointer.y });
      break;
    case 'circle':
      const radius = Math.sqrt(
        Math.pow(pointer.x - shapeStartX, 2) + 
        Math.pow(pointer.y - shapeStartY, 2)
      ) / 2;
      currentShape.set({ radius: Math.abs(radius) });
      break;
    case 'rect':
      currentShape.set({
        width: pointer.x - shapeStartX,
        height: pointer.y - shapeStartY
      });
      break;
  }
  
  canvas.renderAll();
});

canvas.on('mouse:up', function() {
  if (isDrawing) {
    isDrawing = false;
    currentShape = null;
    saveHistory();
  }
});

// ==========================================
// 7. HISTORY (Undo/Redo)
// ==========================================

function saveHistory() {
  // Remove history after current step
  history = history.slice(0, historyStep + 1);
  
  // Save current state
  history.push(canvas.toJSON());
  historyStep++;
  
  // Limit history to 20 states
  if (history.length > 20) {
    history.shift();
    historyStep--;
  }
}

// Save initial state
saveHistory();

// Undo
document.getElementById('btnUndo').addEventListener('click', function() {
  if (historyStep > 0) {
    historyStep--;
    canvas.loadFromJSON(history[historyStep], () => {
      canvas.renderAll();
    });
  } else {
    showToast('Không thể undo thêm!', 'error');
  }
});

// Redo
document.getElementById('btnRedo').addEventListener('click', function() {
  if (historyStep < history.length - 1) {
    historyStep++;
    canvas.loadFromJSON(history[historyStep], () => {
      canvas.renderAll();
    });
  } else {
    showToast('Không thể redo thêm!', 'error');
  }
});

// Save history after path is created
canvas.on('path:created', function() {
  saveHistory();
});

// ==========================================
// 8. CLEAR CANVAS
// ==========================================

document.getElementById('btnClear').addEventListener('click', function() {
  if (confirm('Bạn chắc chắn muốn xóa tất cả?')) {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    saveHistory();
  }
});

// ==========================================
// 9. SAVE DRAWING
// ==========================================

document.getElementById('btnSave').addEventListener('click', function() {
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1
  });
  
  const drawing = {
    id: Date.now(),
    dataURL: dataURL,
    createdAt: new Date().toISOString()
  };
  
  const drawings = getDrawings();
  drawings.unshift(drawing);
  
  // Limit to 20 drawings
  if (drawings.length > 20) {
    drawings.length = 20;
  }
  
  localStorage.setItem('drawings', JSON.stringify(drawings));
  
  showToast('✅ Đã lưu tranh!');
  renderGallery();
  
  // Clear canvas for new drawing
  canvas.clear();
  canvas.backgroundColor = '#ffffff';
  canvas.renderAll();
  saveHistory();
});

// ==========================================
// 10. GALLERY
// ==========================================

function getDrawings() {
  return JSON.parse(localStorage.getItem('drawings') || '[]');
}

function renderGallery() {
  const drawings = getDrawings();
  const galleryGrid = document.getElementById('galleryGrid');
  
  if (drawings.length === 0) {
    galleryGrid.innerHTML = `
      <div class="gallery-empty">
        <div class="gallery-empty-icon">🎨</div>
        <p>Chưa có tranh nào</p>
      </div>
    `;
    return;
  }
  
  galleryGrid.innerHTML = drawings.map(drawing => `
    <div class="gallery-item" data-id="${drawing.id}">
      <img src="${drawing.dataURL}" alt="Drawing">
    </div>
  `).join('');
  
  // Attach click events
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
      openViewModal(parseInt(this.dataset.id));
    });
  });
}

// ==========================================
// 11. VIEW MODAL
// ==========================================

let currentViewDrawingId = null;

function openViewModal(id) {
  const drawings = getDrawings();
  const drawing = drawings.find(d => d.id === id);
  
  if (!drawing) return;
  
  currentViewDrawingId = id;
  
  document.getElementById('viewImage').src = drawing.dataURL;
  document.getElementById('drawingDate').textContent = 
    `Vẽ lúc ${formatDate(drawing.createdAt)}`;
  
  document.getElementById('viewModal').classList.add('active');
}

document.getElementById('closeViewModal').addEventListener('click', () => {
  document.getElementById('viewModal').classList.remove('active');
});

document.getElementById('viewModal').addEventListener('click', (e) => {
  if (e.target.id === 'viewModal') {
    e.target.classList.remove('active');
  }
});

// Download
document.getElementById('btnDownload').addEventListener('click', function() {
  const drawings = getDrawings();
  const drawing = drawings.find(d => d.id === currentViewDrawingId);
  
  if (!drawing) return;
  
  const link = document.createElement('a');
  link.download = `drawing-${currentViewDrawingId}.png`;
  link.href = drawing.dataURL;
  link.click();
  
  showToast('⬇️ Đang tải xuống...');
});

// Delete
document.getElementById('btnDelete').addEventListener('click', function() {
  if (!confirm('Bạn chắc chắn muốn xóa tranh này?')) return;
  
  let drawings = getDrawings();
  drawings = drawings.filter(d => d.id !== currentViewDrawingId);
  localStorage.setItem('drawings', JSON.stringify(drawings));
  
  document.getElementById('viewModal').classList.remove('active');
  renderGallery();
  showToast('🗑️ Đã xóa tranh!');
});

// ==========================================
// 12. HELPER FUNCTIONS
// ==========================================

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('vi-VN');
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
// 13. INIT
// ==========================================

setupBrush();
renderGallery();

console.log('✅ Drawing ready!');