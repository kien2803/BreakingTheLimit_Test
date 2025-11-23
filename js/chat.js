/* ==========================================
   CHAT.JS - AI Chatbot với Google Gemini (MIỄN PHÍ)
   ========================================== */

console.log('💬 Chat loaded!');

// ==========================================
// ⚠️ GEMINI API KEY (Miễn phí!)
// Lấy tại: https://aistudio.google.com/apikey
// ==========================================

const GEMINI_API_KEY = 'AIzaSyBbhV0_v6rYq4oeW5KG_PbbUShi0ybCf6k';

// Kiểm tra đã có API key chưa
const hasApiKey = GEMINI_API_KEY !== 'your-api-key' && GEMINI_API_KEY.startsWith('AIza');


// ==========================================
// 1. LẤY ELEMENTS
// ==========================================

const messagesArea = document.getElementById('messagesArea');
const chatInput = document.getElementById('chatInput');
const btnSend = document.getElementById('btnSend');
const botAvatar = document.getElementById('botAvatar');
const botNameDisplay = document.getElementById('botName');

const customizeModal = document.getElementById('customizeModal');
const btnCustomize = document.getElementById('btnCustomize');
const closeCustomize = document.getElementById('closeCustomize');
const botNameInput = document.getElementById('botNameInput');
const btnSaveSettings = document.getElementById('btnSaveSettings');


// ==========================================
// 2. BOT SETTINGS
// ==========================================

let botSettings = {
  avatar: '🐱',
  name: 'Mèo Healing',
  personality: 'caring'
};

const personalityPrompts = {
  caring: 'Bạn là một người bạn ấm áp, quan tâm, luôn lắng nghe và động viên. Trả lời ngắn gọn 1-2 câu, dùng emoji.',
  cheerful: 'Bạn là một người vui vẻ, năng lượng, hay dùng từ ngữ hào hứng. Trả lời ngắn gọn 1-2 câu, dùng nhiều emoji.',
  calm: 'Bạn là một người điềm tĩnh, thông thái. Trả lời ngắn gọn 1-2 câu, sâu sắc.',
  funny: 'Bạn là một người hài hước, hay đùa. Trả lời ngắn gọn 1-2 câu, vui nhộn.'
};

function loadSettings() {
  const saved = localStorage.getItem('bot_settings');
  if (saved) botSettings = JSON.parse(saved);
  applySettings();
}

function applySettings() {
  botAvatar.textContent = botSettings.avatar;
  botNameDisplay.textContent = botSettings.name;
  botNameInput.value = botSettings.name;
}


// ==========================================
// 3. CHAT HISTORY
// ==========================================

let conversationHistory = [];

function loadConversationHistory() {
  const saved = localStorage.getItem('gemini_history');
  if (saved) {
    conversationHistory = JSON.parse(saved);
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
  }
}

function saveConversationHistory() {
  localStorage.setItem('gemini_history', JSON.stringify(conversationHistory));
}


// ==========================================
// 4. GỌI GEMINI API (MIỄN PHÍ!)
// ==========================================

async function callGemini(userMessage) {
  const systemPrompt = `Bạn tên là ${botSettings.name}. ${personalityPrompts[botSettings.personality]} Trả lời bằng tiếng Việt.`;
  
  // Tạo history cho Gemini
  const contents = [];
  
  // Thêm conversation history
  conversationHistory.forEach(function(msg) {
    contents.push({
      role: msg.role,
      parts: [{ text: msg.text }]
    });
  });
  
  // Thêm tin nhắn mới
  const fullMessage = conversationHistory.length === 0 
    ? `${systemPrompt}\n\nUser: ${userMessage}`
    : userMessage;
  
  contents.push({
    role: 'user',
    parts: [{ text: fullMessage }]
  });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini Error:', error);
      throw new Error('API Error');
    }

    const data = await response.json();
    const botReply = data.candidates[0].content.parts[0].text;

    // Lưu history
    conversationHistory.push({ role: 'user', text: userMessage });
    conversationHistory.push({ role: 'model', text: botReply });
    saveConversationHistory();

    return botReply;

  } catch (error) {
    console.error('Error:', error);
    return getFallbackResponse(userMessage);
  }
}


// ==========================================
// 5. FALLBACK RESPONSES
// ==========================================

const fallbackResponses = {
  caring: {
    greetings: ['Chào bạn! Mình ở đây lắng nghe 💙', 'Xin chào! Hôm nay thế nào? 🌸'],
    positive: ['Tuyệt vời! Mình vui vì bạn 🎉', 'Thật tốt! ✨'],
    negative: ['Mình hiểu. Bạn không đơn độc 💙', 'Ôm bạn! Sẽ ổn thôi 🤗'],
    default: ['Cảm ơn bạn đã chia sẻ 💙', 'Mình đang lắng nghe 🌸']
  },
  cheerful: {
    greetings: ['Yooo! Chào bạn! 🎉', 'Hello! Ngày tuyệt vời! ☀️'],
    positive: ['YAAAY! Quá đỉnh! 🚀', 'Woohoo! 💪✨'],
    negative: ['Đừng lo! Sẽ ổn mà! 🌈', 'Fighting! 💪'],
    default: ['Hay ghê! Kể thêm! 👀', 'Cool! 😄']
  },
  calm: {
    greetings: ['Xin chào. Chúc bạn an yên 🌿', 'Chào bạn 🍃'],
    positive: ['Thật tốt lành 🌸', 'Trân trọng khoảnh khắc này 🍃'],
    negative: ['Mình hiểu. Rồi sẽ qua 🌸', 'Bình tĩnh nhé 🌿'],
    default: ['Mình lắng nghe 🌿', 'Chia sẻ thêm nhé 🍃']
  },
  funny: {
    greetings: ['Ê! Để tui kể chuyện cười! 😆', 'Hello! Đói chưa? Mình cũng đói 🤣'],
    positive: ['Quá đã! *nhảy múa* 🎉💃', 'Yay! High five! ✋🤣'],
    negative: ['Ôm bạn qua màn hình 🤗📱', 'Buồn thì buồn nhưng bạn cute! 😘'],
    default: ['Hmm interesting... 🤔', 'Okay nghe nè! 👂']
  }
};

function analyzeMessage(text) {
  const lower = text.toLowerCase();
  if (['chào', 'hello', 'hi', 'hey'].some(w => lower.includes(w))) return 'greetings';
  if (['vui', 'tốt', 'tuyệt', 'hạnh phúc'].some(w => lower.includes(w))) return 'positive';
  if (['buồn', 'chán', 'mệt', 'lo', 'sợ'].some(w => lower.includes(w))) return 'negative';
  return 'default';
}

function getFallbackResponse(userMessage) {
  const type = analyzeMessage(userMessage);
  const responses = fallbackResponses[botSettings.personality][type];
  return responses[Math.floor(Math.random() * responses.length)];
}


// ==========================================
// 6. HIỂN THỊ TIN NHẮN
// ==========================================

function addMessage(text, isUser) {
  const welcome = document.querySelector('.welcome-message');
  if (welcome) welcome.remove();

  const div = document.createElement('div');

  if (isUser) {
    div.className = 'message user';
    div.textContent = text;
  } else {
    div.className = 'message-with-avatar';
    div.innerHTML = `
      <div class="message-avatar">${botSettings.avatar}</div>
      <div class="message bot">${text}</div>
    `;
  }

  messagesArea.appendChild(div);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}


// ==========================================
// 7. TYPING INDICATOR
// ==========================================

function showTyping() {
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  messagesArea.appendChild(div);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}


// ==========================================
// 8. GỬI TIN NHẮN
// ==========================================

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, true);
  chatInput.value = '';
  showTyping();

  let botReply;

  if (hasApiKey) {
    botReply = await callGemini(text);
  } else {
    await new Promise(r => setTimeout(r, 1000));
    botReply = getFallbackResponse(text);
  }

  hideTyping();
  addMessage(botReply, false);
  saveChatDisplay(text, botReply);
}

btnSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });


// ==========================================
// 9. LƯU CHAT DISPLAY
// ==========================================

function saveChatDisplay(user, bot) {
  let history = JSON.parse(localStorage.getItem('chat_display') || '[]');
  history.push({ user, bot, time: new Date().toISOString() });
  if (history.length > 50) history = history.slice(-50);
  localStorage.setItem('chat_display', JSON.stringify(history));
}

function loadChatDisplay() {
  const history = JSON.parse(localStorage.getItem('chat_display') || '[]');

  if (history.length === 0) {
    messagesArea.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-emoji">${botSettings.avatar}</div>
        <p class="welcome-text">Xin chào! Mình là ${botSettings.name}</p>
        <p class="welcome-subtext">${hasApiKey ? '🟢 Đã kết nối Gemini AI' : '🟡 Chưa có API key'}</p>
      </div>
    `;
    return;
  }

  history.slice(-10).forEach(chat => {
    addMessage(chat.user, true);
    addMessage(chat.bot, false);
  });
}


// ==========================================
// 10. CUSTOMIZE MODAL
// ==========================================

btnCustomize.addEventListener('click', function() {
  customizeModal.classList.add('active');
  document.querySelectorAll('.avatar-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.avatar === botSettings.avatar);
  });
  document.querySelectorAll('.personality-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.personality === botSettings.personality);
  });
});

closeCustomize.addEventListener('click', () => customizeModal.classList.remove('active'));
customizeModal.addEventListener('click', e => { if (e.target === customizeModal) customizeModal.classList.remove('active'); });

document.querySelectorAll('.avatar-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
  });
});

document.querySelectorAll('.personality-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.personality-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
  });
});

btnSaveSettings.addEventListener('click', function() {
  const avatar = document.querySelector('.avatar-btn.selected');
  const personality = document.querySelector('.personality-btn.selected');
  const name = botNameInput.value.trim();

  if (avatar) botSettings.avatar = avatar.dataset.avatar;
  if (personality) botSettings.personality = personality.dataset.personality;
  if (name) botSettings.name = name;

  localStorage.setItem('bot_settings', JSON.stringify(botSettings));
  applySettings();
  customizeModal.classList.remove('active');

  // Reset history
  conversationHistory = [];
  saveConversationHistory();

  alert('✅ Đã lưu!');
});


// ==========================================
// 11. KHỞI TẠO
// ==========================================

loadSettings();
loadConversationHistory();
loadChatDisplay();

if (hasApiKey) {
  console.log('✅ Gemini API đã kết nối (MIỄN PHÍ!)');
} else {
  console.log('⚠️ Chưa có API key');
  console.log('💡 Lấy FREE key tại: https://aistudio.google.com/apikey');
}