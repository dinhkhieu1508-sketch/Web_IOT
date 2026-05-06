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
    toggleThemeBtn: document.getElementById('toggle-theme'),
    // Trạng thái thiết bị
    statusDot: document.getElementById('status-dot'),
    statusLabel: document.getElementById('status-label'),
    // AQI
    aqiBanner: document.getElementById('aqi-banner'),
    aqiIcon: document.getElementById('aqi-icon'),
    aqiLabel: document.getElementById('aqi-label'),
    aqiDetail: document.getElementById('aqi-detail'),
    // Easy badges (thân thiện với trẻ em)
    badgeTemp: document.getElementById('badge-temp'),
    badgeHum:  document.getElementById('badge-hum'),
    badgeCo2:  document.getElementById('badge-co2'),
    badgePm1:  document.getElementById('badge-pm1'),
    badgePm25: document.getElementById('badge-pm25'),
    badgePm10: document.getElementById('badge-pm10')
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

    // Cập nhật trạng thái thiết bị dựa vào age
    updateDeviceStatus(STATE.ages.temp);
}

/* =====================================================
   BADGE DỄ HIỂU — dành cho trẻ em & người không rành
   ===================================================== */

/* Hàm gán badge vào 1 element */
function setBadge(el, emoji, text, color) {
    if (!el) return;
    el.textContent = emoji + ' ' + text;
    el.style.background = color + '22';   // 13% opacity
    el.style.color = color;
    el.style.borderColor = color + '55';
}

/* NHIỆT ĐỘ */
function updateBadgeTemp(val) {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    if (v < 10)       setBadge(UI.badgeTemp, '🥶', 'Rất lạnh',      '#60a5fa');
    else if (v < 20)  setBadge(UI.badgeTemp, '❄️', 'Lạnh',           '#38bdf8');
    else if (v < 26)  setBadge(UI.badgeTemp, '😊', 'Dễ chịu',        '#22c55e');
    else if (v < 32)  setBadge(UI.badgeTemp, '🌤️', 'Hơi nóng',       '#f59e0b');
    else if (v < 38)  setBadge(UI.badgeTemp, '🥵', 'Nóng',           '#f97316');
    else              setBadge(UI.badgeTemp, '🔥', 'Rất nóng!',      '#ef4444');
}

/* ĐỘ ẨM */
function updateBadgeHum(val) {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    if (v < 30)       setBadge(UI.badgeHum, '🏜️', 'Khô hanh',        '#f97316');
    else if (v < 45)  setBadge(UI.badgeHum, '🌵', 'Hơi khô',         '#fbbf24');
    else if (v < 65)  setBadge(UI.badgeHum, '😊', 'Thoải mái',       '#22c55e');
    else if (v < 80)  setBadge(UI.badgeHum, '💦', 'Hơi ẩm',          '#f59e0b');
    else              setBadge(UI.badgeHum, '🌧️', 'Rất ẩm ướt',      '#ef4444');
}

/* CO₂ */
function updateBadgeCo2(val) {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    if (v <= 800)      setBadge(UI.badgeCo2, '😊', 'Không khí tốt',   '#22c55e');
    else if (v <= 1200) setBadge(UI.badgeCo2, '🪟', 'Nên mở cửa sổ',  '#f59e0b');
    else if (v <= 2000) setBadge(UI.badgeCo2, '😮', 'Không khí ngột',  '#f97316');
    else                setBadge(UI.badgeCo2, '🚨', 'Nguy hiểm!',      '#ef4444');
}

/* PM1.0 */
function updateBadgePm1(val) {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    if (v <= 15)       setBadge(UI.badgePm1, '✅', 'Không khí sạch',  '#22c55e');
    else if (v <= 35)  setBadge(UI.badgePm1, '😐', 'Chấp nhận được',  '#f59e0b');
    else if (v <= 55)  setBadge(UI.badgePm1, '😷', 'Nên đeo khẩu trang','#f97316');
    else               setBadge(UI.badgePm1, '🚨', 'Ô nhiễm nặng!',   '#ef4444');
}

/* PM2.5 */
function updateBadgePm25(val) {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    if (v <= 12)       setBadge(UI.badgePm25, '✅', 'Không khí sạch',  '#22c55e');
    else if (v <= 35)  setBadge(UI.badgePm25, '😐', 'Chấp nhận được',  '#f59e0b');
    else if (v <= 55)  setBadge(UI.badgePm25, '😷', 'Nên đeo khẩu trang','#f97316');
    else if (v <= 150) setBadge(UI.badgePm25, '🚨', 'Ô nhiễm — ở trong nhà','#ef4444');
    else               setBadge(UI.badgePm25, '☠️', 'Rất nguy hiểm!', '#7f1d1d');
}

/* PM10 */
function updateBadgePm10(val) {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    if (v <= 25)       setBadge(UI.badgePm10, '✅', 'Không khí sạch',  '#22c55e');
    else if (v <= 50)  setBadge(UI.badgePm10, '😐', 'Chấp nhận được',  '#f59e0b');
    else if (v <= 90)  setBadge(UI.badgePm10, '😷', 'Nên đeo khẩu trang','#f97316');
    else               setBadge(UI.badgePm10, '🚨', 'Ô nhiễm nặng!',   '#ef4444');
}
function updateDeviceStatus(age) {
    if (!UI.statusDot || !UI.statusLabel) return;
    if (age <= 60) {
        UI.statusDot.className = 'status-dot online';
        UI.statusLabel.textContent = 'ESP32 Online';
    } else {
        UI.statusDot.className = 'status-dot offline';
        UI.statusLabel.textContent = `Mất kết nối (${age}s)`;
    }
}

/* ---- AQI theo chuẩn WHO / Bộ TNMT Việt Nam (dựa vào PM2.5 µg/m³) ---- */
function getAQI(pm25) {
    if (pm25 === null || pm25 === undefined || isNaN(pm25)) return null;
    if (pm25 <= 12)  return { level: 1, icon: '🟢', label: 'Tốt',              color: '#22c55e', detail: 'Không khí trong lành, an toàn cho mọi người.' };
    if (pm25 <= 35)  return { level: 2, icon: '🟡', label: 'Trung bình',       color: '#eab308', detail: 'Chấp nhận được. Người nhạy cảm nên hạn chế ra ngoài lâu.' };
    if (pm25 <= 55)  return { level: 3, icon: '🟠', label: 'Không tốt cho nhóm nhạy cảm', color: '#f97316', detail: 'Trẻ em, người già, bệnh hô hấp nên ở trong nhà.' };
    if (pm25 <= 150) return { level: 4, icon: '🔴', label: 'Xấu',              color: '#ef4444', detail: 'Mọi người nên hạn chế hoạt động ngoài trời.' };
    if (pm25 <= 250) return { level: 5, icon: '🟣', label: 'Rất xấu',          color: '#a855f7', detail: 'Tránh ra ngoài, đeo khẩu trang N95 nếu cần.' };
    return             { level: 6, icon: '⚫', label: 'Nguy hại',           color: '#7f1d1d', detail: 'Khẩn cấp! Ở trong nhà, đóng cửa sổ.' };
}

function updateAQIBanner(pm25) {
    if (!UI.aqiBanner) return;
    const aqi = getAQI(pm25);
    if (!aqi) return;
    UI.aqiIcon.textContent  = aqi.icon;
    UI.aqiLabel.textContent = `Chất lượng không khí: ${aqi.label}`;
    UI.aqiDetail.textContent = aqi.detail;
    UI.aqiBanner.style.borderLeftColor = aqi.color;
    UI.aqiBanner.style.background = aqi.color + '18'; // 10% opacity
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
