/* UI elements */
const UI = {
    // Sensor values
    temp: document.getElementById('temp'),
    hum: document.getElementById('hum'),
    pm1: document.getElementById('pm1'),
    pm25: document.getElementById('pm25'),
    pm10: document.getElementById('pm10'),
    co2: document.getElementById('CO2'),
    
    // Update times
    tempTime: document.getElementById('temp-time'),
    humTime: document.getElementById('hum-time'),
    pm1Time: document.getElementById('pm1-time'),
    pm25Time: document.getElementById('pm25-time'),
    pm10Time: document.getElementById('pm10-time'),
    co2Time: document.getElementById('CO2-time'),
    
    // Age indicators
    tempAge: document.getElementById('temp-age'),
    humAge: document.getElementById('hum-age'),
    pm1Age: document.getElementById('pm1-age'),
    pm25Age: document.getElementById('pm25-age'),
    pm10Age: document.getElementById('pm10-age'),
    co2Age: document.getElementById('CO2-age'),
    
    // Controls
    alertBar: document.getElementById('alert-bar'),
    alertSound: document.getElementById('alert-sound'),
    historyTable: document.querySelector('#history-table tbody'),
    searchInput: document.getElementById('search'),
    clearHistoryBtn: document.getElementById('clear-history'),
    currentTime: document.getElementById('current-time'),
    thrPM1Input: document.getElementById('thr-pm1'),
    thrPM25Input: document.getElementById('thr-pm25'),
    thrPM10Input: document.getElementById('thr-pm10'),
    thrCO2Input: document.getElementById('thr-co2'),
    saveThrBtn: document.getElementById('save-thr'),
    toggleThemeBtn: document.getElementById('toggle-theme')
};

/* Load thresholds from localStorage */
function loadThresholds() {
    const t1 = localStorage.getItem(STORAGE_KEYS.pm1);
    const t25 = localStorage.getItem(STORAGE_KEYS.pm25);
    const t10 = localStorage.getItem(STORAGE_KEYS.pm10);
    const tc = localStorage.getItem(STORAGE_KEYS.co2);
    
    if (t1) UI.thrPM1Input.value = t1;
    if (t25) UI.thrPM25Input.value = t25;
    if (t10) UI.thrPM10Input.value = t10;
    if (tc) UI.thrCO2Input.value = tc;
}

/* Save thresholds to localStorage */
function saveThresholds() {
    localStorage.setItem(STORAGE_KEYS.pm1, UI.thrPM1Input.value);
    localStorage.setItem(STORAGE_KEYS.pm25, UI.thrPM25Input.value);
    localStorage.setItem(STORAGE_KEYS.pm10, UI.thrPM10Input.value);
    localStorage.setItem(STORAGE_KEYS.co2, UI.thrCO2Input.value);
    showToast('✅ Ngưỡng đã lưu');
}

/* Theme management */
function setTheme(t) {
    document.body.setAttribute('data-theme', t);
    localStorage.setItem(STORAGE_KEYS.theme, t);
    UI.toggleThemeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
}

/* Update current time display */
function updateCurrentTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    UI.currentTime.textContent = timeStr;
}

/* Update ages every second */
function updateAges() {
    STATE.ages.temp += 1; 
    STATE.ages.hum += 1; 
    STATE.ages.pm1 += 1; 
    STATE.ages.pm25 += 1; 
    STATE.ages.pm10 += 1; 
    STATE.ages.co2 += 1;
    
    UI.tempAge.textContent = STATE.ages.temp.toFixed(0);
    UI.humAge.textContent = STATE.ages.hum.toFixed(0);
    UI.pm1Age.textContent = STATE.ages.pm1.toFixed(0);
    UI.pm25Age.textContent = STATE.ages.pm25.toFixed(0);
    UI.pm10Age.textContent = STATE.ages.pm10.toFixed(0);
    UI.co2Age.textContent = STATE.ages.co2.toFixed(0);
}

/* Toast notification */
function showToast(msg, time = 1200) {
    UI.alertBar.style.display = 'block';
    UI.alertBar.style.background = 'linear-gradient(90deg,#007bff,#0056d6)';
    UI.alertBar.textContent = msg;
    setTimeout(() => { 
        UI.alertBar.style.display = 'none'; 
    }, time);
}

/* Critical alert */
function showCritical(msg) {
    UI.alertBar.style.display = 'block';
    UI.alertBar.style.background = 'linear-gradient(90deg,var(--danger), #ff6b6b)';
    UI.alertBar.textContent = msg;
    
    try { 
        UI.alertSound.currentTime = 0; 
        UI.alertSound.play(); 
    } catch(e) {}
    
    if (STATE.alertTimeout) clearTimeout(STATE.alertTimeout);
    STATE.alertTimeout = setTimeout(() => { 
        UI.alertBar.style.display = 'none'; 
    }, 8000);
}

/* Highlight card for alerts */
function highlightCard(id, flag) {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (flag) {
        el.style.boxShadow = '0 10px 30px rgba(229,29,72,0.12)';
        el.querySelector('.value').style.color = getComputedStyle(document.body).getPropertyValue('--danger') || '#e11d48';
    } else {
        el.style.boxShadow = '';
        el.querySelector('.value').style.color = getComputedStyle(document.body).getPropertyValue('--accent') || '#007bff';
    }
}

/* Initialize UI event listeners */
function initUIEvents() {
    // Threshold controls
    UI.saveThrBtn.addEventListener('click', saveThresholds);
    UI.toggleThemeBtn.addEventListener('click', toggleTheme);
    
    // History controls
    UI.searchInput.addEventListener('input', renderHistory);
    UI.clearHistoryBtn.addEventListener('click', () => {
        STATE.history = [];
        renderHistory();
    });
    
    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.key === 't') {
            toggleTheme();
        }
    });
    
    // Update time every second
    setInterval(updateCurrentTime, 1000);
    setInterval(updateAges, 1000);
}