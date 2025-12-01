/* ==========================================
   EMOTION.JS - AI Emotion Analysis
   Tạo file MỚI: js/emotion.js
   ========================================== */

console.log('🧠 Emotion Analysis loaded!');

// ==========================================
// 1. AI EMOTION ANALYSIS
// ==========================================

const GEMINI_KEY = localStorage.getItem('gemini_api_key') || 'your-api-key';

async function analyzeEmotion(content, mood) {
  // Nếu không có API key, dùng analysis đơn giản
  if (!GEMINI_KEY || GEMINI_KEY === 'your-api-key') {
    return simpleEmotionAnalysis(content, mood);
  }

  try {
    const prompt = `Phân tích cảm xúc của đoạn nhật ký sau và trả về JSON:
    
Nhật ký: "${content}"
Mood đã chọn: ${mood}

Trả về format:
{
  "emotion": "happy/sad/anxious/peaceful/angry/confused",
  "intensity": 1-10,
  "keywords": ["từ khóa 1", "từ khóa 2"],
  "summary": "Tóm tắt 1 câu",
  "suggestion": "Lời khuyên ngắn"
}

Chỉ trả về JSON, không thêm gì khác.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) throw new Error('API Error');

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response');

  } catch (error) {
    console.error('AI Analysis error:', error);
    return simpleEmotionAnalysis(content, mood);
  }
}


// ==========================================
// 2. SIMPLE ANALYSIS (Fallback)
// ==========================================

function simpleEmotionAnalysis(content, mood) {
  const lower = content.toLowerCase();
  
  // Keywords
  const keywords = [];
  if (lower.includes('vui') || lower.includes('happy')) keywords.push('vui vẻ');
  if (lower.includes('buồn') || lower.includes('sad')) keywords.push('buồn bã');
  if (lower.includes('lo') || lower.includes('sợ')) keywords.push('lo lắng');
  if (lower.includes('yêu') || lower.includes('thích')) keywords.push('yêu thương');
  if (lower.includes('mệt') || lower.includes('tired')) keywords.push('mệt mỏi');
  
  // Intensity
  let intensity = 5;
  if (content.length > 200) intensity += 2;
  if (mood === 'sad' || mood === 'angry') intensity += 1;
  if (mood === 'happy') intensity = Math.min(intensity, 7);
  
  const moodLabels = {
    happy: 'vui vẻ',
    peaceful: 'bình yên',
    neutral: 'bình thường',
    sad: 'buồn',
    angry: 'tức giận',
    anxious: 'lo lắng',
    tired: 'mệt mỏi'
  };
  
  const suggestions = {
    happy: 'Hãy tiếp tục lan tỏa năng lượng tích cực! 🌟',
    peaceful: 'Thật tuyệt khi bạn tìm được sự bình yên 🌿',
    sad: 'Hãy cho phép bản thân được buồn. Mọi thứ sẽ tốt hơn 💙',
    angry: 'Hít thở sâu và cho cảm xúc được giải tỏa nhé 🌊',
    anxious: 'Thử viết ra những lo lắng, chúng sẽ nhẹ hơn đấy 📝',
    neutral: 'Mỗi ngày đều có giá trị riêng của nó ✨'
  };

  return {
    emotion: mood,
    intensity: Math.min(intensity, 10),
    keywords: keywords.length > 0 ? keywords : ['cảm xúc thật'],
    summary: `Hôm nay bạn cảm thấy ${moodLabels[mood] || 'bình thường'}`,
    suggestion: suggestions[mood] || suggestions.neutral
  };
}


// ==========================================
// 3. HIỂN THỊ KẾT QUẢ
// ==========================================

function showAnalysisResult(analysis) {
  const resultHTML = `
    <div class="analysis-toast">
      <div class="analysis-header">
        <span class="analysis-emoji">${getEmotionEmoji(analysis.emotion)}</span>
        <span class="analysis-title">${analysis.summary}</span>
      </div>
      <div class="analysis-body">
        <div class="analysis-intensity">
          Cường độ: <strong>${analysis.intensity}/10</strong>
        </div>
        <div class="analysis-keywords">
          ${analysis.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}
        </div>
        <div class="analysis-suggestion">
          💡 ${analysis.suggestion}
        </div>
      </div>
    </div>
  `;
  
  const toastEl = document.createElement('div');
  toastEl.className = 'analysis-toast-container';
  toastEl.innerHTML = resultHTML;
  document.body.appendChild(toastEl);
  
  setTimeout(() => toastEl.classList.add('show'), 100);
  
  setTimeout(() => {
    toastEl.classList.remove('show');
    setTimeout(() => toastEl.remove(), 300);
  }, 5000);
}

function getEmotionEmoji(emotion) {
  const emojis = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    peaceful: '😌',
    angry: '😡',
    confused: '😕',
    neutral: '😐'
  };
  return emojis[emotion] || '💭';
}


// ==========================================
// 4. EXPORT FUNCTIONS
// ==========================================

// Để journal.js có thể dùng
window.analyzeEmotion = analyzeEmotion;
window.showAnalysisResult = showAnalysisResult;

console.log('✅ Emotion Analysis ready!');