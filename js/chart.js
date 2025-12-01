/* ==========================================
   CHART.JS - Emotion Chart cho Dashboard
   ========================================== */

console.log('📊 Chart loaded!');

// ==========================================
// 1. LẤY DỮ LIỆU EMOTION
// ==========================================

function getEmotionData() {
  const entries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
  
  // Lấy 7 ngày gần nhất
  const days = 7;
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Lọc entries của ngày này
    const dayEntries = entries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= date && entryDate < nextDate;
    });
    
    // Tính intensity trung bình
    let avgIntensity = 0;
    if (dayEntries.length > 0) {
      const sum = dayEntries.reduce((acc, entry) => {
        return acc + (entry.analysis?.intensity || 5);
      }, 0);
      avgIntensity = Math.round(sum / dayEntries.length);
    }
    
    // Tính mood chủ đạo
    const moodCount = {};
    dayEntries.forEach(entry => {
      const mood = entry.mood || 'neutral';
      moodCount[mood] = (moodCount[mood] || 0) + 1;
    });
    
    const dominantMood = Object.keys(moodCount).reduce((a, b) => 
      moodCount[a] > moodCount[b] ? a : b, 'neutral'
    );
    
    data.push({
      day: getDayLabel(date),
      intensity: avgIntensity,
      mood: dominantMood,
      count: dayEntries.length
    });
  }
  
  return data;
}

function getDayLabel(date) {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[date.getDay()];
}


// ==========================================
// 2. VẼ CHART
// ==========================================

function drawEmotionChart() {
  const canvas = document.getElementById('emotionChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const data = getEmotionData();
  
  // Canvas size
  const width = canvas.width;
  const height = canvas.height;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Background
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--bg-card').trim();
  ctx.fillRect(0, 0, width, height);
  
  // Grid lines
  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--border-light').trim();
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= 10; i++) {
    const y = padding + (chartHeight / 10) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  // Y-axis labels (intensity)
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--text-muted').trim();
  ctx.font = '12px Inter';
  ctx.textAlign = 'right';
  
  for (let i = 0; i <= 10; i++) {
    const y = padding + (chartHeight / 10) * (10 - i);
    ctx.fillText(i.toString(), padding - 10, y + 4);
  }
  
  // Draw line chart
  if (data.length > 0) {
    const stepX = chartWidth / (data.length - 1 || 1);
    
    // Line
    ctx.strokeStyle = '#1CD8D2';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding + stepX * i;
      const y = padding + chartHeight - (point.intensity / 10) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(28, 216, 210, 0.3)');
    gradient.addColorStop(1, 'rgba(28, 216, 210, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding + stepX * i;
      const y = padding + chartHeight - (point.intensity / 10) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();
    
    // Points and emojis
    data.forEach((point, i) => {
      const x = padding + stepX * i;
      const y = padding + chartHeight - (point.intensity / 10) * chartHeight;
      
      // Point
      ctx.fillStyle = '#1CD8D2';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Emoji
      const emoji = getMoodEmoji(point.mood);
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, x, y - 15);
      
      // Day label
      ctx.font = '12px Inter';
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-secondary').trim();
      ctx.fillText(point.day, x, height - 10);
    });
  }
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


// ==========================================
// 3. RENDER STATS
// ==========================================

function renderEmotionStats() {
  const entries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
  
  // Tính toán stats
  const last7Days = entries.filter(e => {
    const entryDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });
  
  // Mood phổ biến nhất
  const moodCount = {};
  last7Days.forEach(entry => {
    const mood = entry.mood || 'neutral';
    moodCount[mood] = (moodCount[mood] || 0) + 1;
  });
  
  const topMood = Object.keys(moodCount).reduce((a, b) => 
    moodCount[a] > moodCount[b] ? a : b, 'neutral'
  );
  
  // Intensity trung bình
  const avgIntensity = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, e) => sum + (e.analysis?.intensity || 5), 0) / last7Days.length)
    : 5;
  
  // Update UI
  const statsContainer = document.querySelector('.emotion-stats');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Cảm xúc chủ đạo</span>
        <span class="stat-value">${getMoodEmoji(topMood)} ${getMoodLabel(topMood)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Cường độ TB</span>
        <span class="stat-value">${avgIntensity}/10</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Số bài viết</span>
        <span class="stat-value">${last7Days.length}</span>
      </div>
    `;
  }
}

function getMoodLabel(mood) {
  const labels = {
    happy: 'Vui vẻ',
    peaceful: 'Bình yên',
    neutral: 'Bình thường',
    sad: 'Buồn',
    angry: 'Tức giận',
    anxious: 'Lo lắng',
    tired: 'Mệt mỏi'
  };
  return labels[mood] || 'Bình thường';
}


// ==========================================
// 4. KHỞI TẠO
// ==========================================

function initChart() {
  drawEmotionChart();
  renderEmotionStats();
  
  // Redraw on resize
  window.addEventListener('resize', drawEmotionChart);
  
  // Redraw on theme change
  const observer = new MutationObserver(() => {
    drawEmotionChart();
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}

// Auto init khi load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChart);
} else {
  initChart();
}

console.log('✅ Chart ready!');