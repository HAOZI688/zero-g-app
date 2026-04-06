// ── Server Config ───────────────────────────────────────────
const SERVER_URL = 'http://118.31.223.120:5000';

// 登录检查
const AUTH_TOKEN = localStorage.getItem('authToken');
const LOGGED_USER = localStorage.getItem('userId');

if (!AUTH_TOKEN || !LOGGED_USER) {
  window.location.href = 'login.html';
}

async function uploadData(type, data) {
  if (!AUTH_TOKEN) return { error: 'Not logged in' };
  try {
    const res = await fetch(SERVER_URL + '/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + AUTH_TOKEN
      },
      body: JSON.stringify({ type, ...data })
    });
    if (res.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      window.location.href = 'login.html';
      return { error: 'Session expired' };
    }
    return await res.json();
  } catch (err) {
    console.error('Upload failed:', err);
    return { error: err.message };
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  window.location.href = 'login.html';
}

function showToast(msg, success = true) {
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 24px;background:${success?'#22c55e':'#ef4444'};color:white;border-radius:8px;z-index:9999;font-size:14px`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Tab navigation ──────────────────────────────────────────
function switchTab(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  document.querySelector('[data-tab="' + id + '"]').classList.add('active');
}

// ── AI Chat ──────────────────────────────────────────────────
const API_URL = 'https://api.dify.ai/v1/chat-messages';
const API_KEY = 'app-wixxb3EFRJk8ctBSTKKvb3ak';
let conversationId = '';
let isLoading = false;

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatBtn = document.getElementById('chat-btn');

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function addMsg(text, role) {
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  if (role === 'ai') div.innerHTML = renderMarkdown(text);
  else div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

async function sendChat(query) {
  if (!query || isLoading) return;
  isLoading = true;
  chatBtn.disabled = true;
  chatInput.value = '';
  chatInput.style.height = 'auto';

  addMsg(query, 'user');
  const aiDiv = addMsg('', 'ai loading');

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: {}, query, response_mode: 'streaming', conversation_id: conversationId, user: 'user-001' })
    });
    if (!res.ok) throw new Error('请求失败: ' + res.status);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '', fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.event === 'message' && data.answer) {
            fullText += data.answer;
            aiDiv.innerHTML = renderMarkdown(fullText);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
          if (data.conversation_id) conversationId = data.conversation_id;
        } catch {}
      }
    }
  } catch (err) {
    aiDiv.textContent = '出错了：' + err.message;
  }

  aiDiv.classList.remove('loading');
  isLoading = false;
  chatBtn.disabled = false;
}

chatBtn.addEventListener('click', () => sendChat(chatInput.value.trim()));
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(chatInput.value.trim()); } });
chatInput.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 100) + 'px'; });

document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => sendChat(btn.dataset.q));
});

// ── Calorie Calculator ───────────────────────────────────────
const DAILY_GOAL = 2000;
let foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
let selectedFood = null;

function filterFoods(q) {
  return FOODS.filter(f => f.name.includes(q)).slice(0, 6);
}

const foodSearch = document.getElementById('food-search');
const foodGrams = document.getElementById('food-grams');
const suggestions = document.getElementById('food-suggestions');
const macroKcal = document.getElementById('macro-kcal');
const macroProtein = document.getElementById('macro-protein');
const macroCarbs = document.getElementById('macro-carbs');
const macroFat = document.getElementById('macro-fat');

foodSearch.addEventListener('input', () => {
  const q = foodSearch.value.trim();
  if (!q) { suggestions.style.display = 'none'; return; }
  const results = filterFoods(q);
  if (!results.length) { suggestions.style.display = 'none'; return; }
  suggestions.innerHTML = results.map(f =>
    `<div class="suggestion-item" data-name="${f.name}">${f.name} — ${f.kcal}kcal/100g</div>`
  ).join('');
  suggestions.style.display = 'block';
});

suggestions.addEventListener('click', e => {
  const item = e.target.closest('.suggestion-item');
  if (!item) return;
  selectedFood = FOODS.find(f => f.name === item.dataset.name);
  foodSearch.value = selectedFood.name;
  suggestions.style.display = 'none';
  updateMacroPreview();
});

foodGrams.addEventListener('input', updateMacroPreview);

function updateMacroPreview() {
  if (!selectedFood) return;
  const g = parseFloat(foodGrams.value) || 0;
  const r = g / 100;
  macroKcal.textContent = Math.round(selectedFood.kcal * r);
  macroProtein.textContent = (selectedFood.protein * r).toFixed(1) + 'g';
  macroCarbs.textContent = (selectedFood.carbs * r).toFixed(1) + 'g';
  macroFat.textContent = (selectedFood.fat * r).toFixed(1) + 'g';
}

document.getElementById('add-food-btn').addEventListener('click', () => {
  if (!selectedFood) return;
  const g = parseFloat(foodGrams.value);
  if (!g || g <= 0) return;
  const r = g / 100;
  foodLog.push({
    id: Date.now(),
    name: selectedFood.name,
    grams: g,
    kcal: Math.round(selectedFood.kcal * r),
    protein: +(selectedFood.protein * r).toFixed(1),
    carbs: +(selectedFood.carbs * r).toFixed(1),
    fat: +(selectedFood.fat * r).toFixed(1),
  });
  saveFoodLog();
  renderFoodLog();
  foodSearch.value = '';
  foodGrams.value = '';
  selectedFood = null;
  macroKcal.textContent = '0'; macroProtein.textContent = '0g'; macroCarbs.textContent = '0g'; macroFat.textContent = '0g';
});

function saveFoodLog() {
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  uploadData('food_log', { foodLog });
}

function renderFoodLog() {
  const list = document.getElementById('food-log-list');
  const totalKcal = foodLog.reduce((s, f) => s + f.kcal, 0);
  document.getElementById('total-kcal').textContent = totalKcal + ' / ' + DAILY_GOAL + ' kcal';
  const pct = Math.min(totalKcal / DAILY_GOAL * 100, 100);
  document.getElementById('calorie-bar').style.width = pct + '%';

  list.innerHTML = foodLog.map(f =>
    `<div class="food-log-item">
      <span>${f.name} ${f.grams}g</span>
      <span style="color:#a78bfa">${f.kcal}kcal</span>
      <span class="del" data-id="${f.id}">✕</span>
    </div>`
  ).join('') || '<div style="opacity:0.4;font-size:0.82rem;text-align:center;padding:12px">暂无记录</div>';
}

document.getElementById('food-log-list').addEventListener('click', e => {
  const del = e.target.closest('.del');
  if (!del) return;
  foodLog = foodLog.filter(f => f.id !== +del.dataset.id);
  saveFoodLog();
  renderFoodLog();
});

document.addEventListener('click', e => {
  if (!suggestions.contains(e.target) && e.target !== foodSearch) suggestions.style.display = 'none';
});

renderFoodLog();

// ── Workout Plan ─────────────────────────────────────────────
let currentPlan = 'muscle';
let checkedExercises = JSON.parse(localStorage.getItem('checkedExercises') || '{}');

function renderPlan(planKey) {
  currentPlan = planKey;
  document.querySelectorAll('.plan-tab').forEach(t => t.classList.toggle('active', t.dataset.plan === planKey));
  const plan = PLANS[planKey];
  const container = document.getElementById('workout-days');
  container.innerHTML = plan.days.map(day => {
    if (!day.exercises.length) {
      return `<div class="workout-day"><div class="workout-day-title">${day.title}</div>
        <div style="opacity:0.4;font-size:0.82rem;padding:8px">休息日 — 可进行轻度拉伸或散步</div></div>`;
    }
    return `<div class="workout-day">
      <div class="workout-day-title">${day.title}</div>
      ${day.exercises.map(key => {
        const ex = EXERCISES[key];
        if (!ex) return '';
        const ckId = planKey + '-' + key;
        const checked = checkedExercises[ckId] ? 'checked' : '';
        return `<div class="exercise-item" data-key="${key}">
          <div class="exercise-header">
            <span class="exercise-name">${ex.name}</span>
            <span class="exercise-sets">${ex.sets}</span>
          </div>
          <div class="exercise-detail">
            <div><strong>目标肌群：</strong>${ex.muscle}</div>
            <div style="margin-top:4px"><strong>动作要领：</strong>${ex.tip}</div>
            <div class="exercise-check">
              <input type="checkbox" id="ck-${ckId}" data-ckid="${ckId}" ${checked}>
              <label for="ck-${ckId}" style="font-size:0.8rem;cursor:pointer">今日已完成</label>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

document.getElementById('workout-days').addEventListener('click', e => {
  const item = e.target.closest('.exercise-item');
  if (!item) return;
  if (e.target.type === 'checkbox') {
    checkedExercises[e.target.dataset.ckid] = e.target.checked;
    localStorage.setItem('checkedExercises', JSON.stringify(checkedExercises));
    uploadData('checked_exercises', { checkedExercises });
    return;
  }
  item.classList.toggle('open');
});

document.querySelectorAll('.plan-tab').forEach(t => {
  t.addEventListener('click', () => renderPlan(t.dataset.plan));
});

renderPlan('muscle');

// ── Rest & Recovery ──────────────────────────────────────────
const sleepSlider = document.getElementById('sleep-slider');
const sleepVal = document.getElementById('sleep-val');
const intensitySlider = document.getElementById('intensity-slider');
const intensityVal = document.getElementById('intensity-val');
let soreParts = new Set();
let weekScores = JSON.parse(localStorage.getItem('weekScores') || '[]');

sleepSlider.addEventListener('input', () => { sleepVal.textContent = sleepSlider.value; });
intensitySlider.addEventListener('input', () => { intensityVal.textContent = intensitySlider.value; });

document.querySelectorAll('.sore-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('selected');
    if (btn.classList.contains('selected')) soreParts.add(btn.dataset.part);
    else soreParts.delete(btn.dataset.part);
  });
});

function calculateRest(intensityScore) {
  if (intensityScore >= 7) {
    return `🔴 高强度训练日\n\n建议睡眠 8.5 小时以上，让肌肉充分修复。\n\n恢复建议：\n• 训练后进行 10-15 分钟静态拉伸\n• 补充足够蛋白质（体重 × 2g）\n• 避免第二天训练相同肌群\n• 可使用泡沫轴放松酸痛部位`;
  } else if (intensityScore >= 4) {
    return `🟡 中等强度训练日\n\n建议睡眠 7.5-8 小时，保持规律作息。\n\n恢复建议：\n• 训练后进行动态拉伸 5-10 分钟\n• 保持充足水分摄入（2-3L/天）\n• 可进行轻量有氧活动（散步、骑车）\n• 注意营养补充，尤其是碳水化合物`;
  } else {
    return `🟢 低强度 / 休息日\n\n建议睡眠 7-8 小时，维持正常节律。\n\n恢复建议：\n• 可进行 20-30 分钟轻度有氧（如快走）\n• 做全身拉伸或瑜伽，改善柔韧性\n• 这是肌肉超量恢复的关键时期\n• 保持良好饮食，不要因休息日而暴食`;
  }
}

document.getElementById('gen-rest-btn').addEventListener('click', () => {
  const intensity = +intensitySlider.value;
  const sleep = +sleepSlider.value;
  const advice = document.getElementById('rest-advice');
  let text = calculateRest(intensity);

  if (soreParts.size > 0) {
    text += `\n\n酸痛部位（${[...soreParts].join('、')}）专项建议：\n• 针对酸痛肌群进行轻度拉伸，促进血液循环\n• 避免在酸痛未消退前进行高强度训练\n• 可使用热敷（训练后24h）缓解延迟性肌肉酸痛`;
  }

  if (sleep < 6) {
    text += `\n\n⚠️ 睡眠不足警告：睡眠评分 ${sleep}/10，睡眠不足会严重影响肌肉恢复和激素分泌，建议优先改善睡眠质量。`;
  }

  advice.textContent = text;
  advice.classList.add('show');

  // Save today's score
  const today = new Date().getDay();
  weekScores[today] = intensity;
  localStorage.setItem('weekScores', JSON.stringify(weekScores));
  renderWeekBars();
});

function renderWeekBars() {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const container = document.getElementById('week-bars');
  container.innerHTML = days.map((d, i) => {
    const score = weekScores[i] || 0;
    const pct = score * 10;
    return `<div class="week-bar-wrap">
      <div class="week-bar-bg"><div class="week-bar-fill" style="height:${pct}%"></div></div>
      <div class="week-bar-lbl">${d}</div>
    </div>`;
  }).join('');
}

renderWeekBars();

// ── Cloud Sync ──────────────────────────────────────────────
document.getElementById('sync-btn').addEventListener('click', async () => {
  const btn = document.getElementById('sync-btn');
  btn.disabled = true;
  btn.textContent = '同步中...';

  const results = await Promise.all([
    uploadData('food_log', { foodLog }),
    uploadData('checked_exercises', { checkedExercises }),
    uploadData('week_scores', { weekScores })
  ]);

  const allSuccess = results.every(r => r.success);
  if (allSuccess) {
    showToast('☁️ 数据已同步到云端！', true);
  } else {
    showToast('⚠️ 部分数据同步失败', false);
  }

  btn.disabled = false;
  btn.textContent = '☁️ 同步';
});

// ── Logout ──────────────────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', logout);
