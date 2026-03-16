/* API Functions */
async function fetchLatestData() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/sensor-data/latest`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (data) {
            processSensorData(data);
        }
    } catch (error) {
        console.error('Error fetching latest data:', error);
    }
}

async function loadHistoryData() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/sensor-data/history?limit=50`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const historyData = await response.json();
        
        if (historyData && historyData.length > 0) {
            // Reset arrays
            STATE.labels.length = 0;
            STATE.series.temp.length = 0;
            STATE.series.hum.length = 0;
            STATE.series.pm1.length = 0;
            STATE.series.pm25.length = 0;
            STATE.series.pm10.length = 0;
            STATE.series.co2.length = 0;
            
            // Sort from old to new
            const reversed = [...historyData].reverse();
            
            reversed.forEach(item => {
                const ts = new Date(item.timestamp).toLocaleTimeString('vi-VN');
                STATE.labels.push(ts);
                STATE.series.temp.push(item.temperature || 0);
                STATE.series.hum.push(item.humidity || 0);
                STATE.series.pm1.push(item.pm1_0 || 0);
                STATE.series.pm25.push(item.pm2_5 || 0);
                STATE.series.pm10.push(item.pm10_0 || 0);
                STATE.series.co2.push(item.CO2 || 0);
            });
            
            // Update charts
            updateAllCharts();
        }
    } catch (error) {
        console.error('Error loading history data:', error);
    }
}

/* Process sensor data */
function processSensorData(data) {
    if (!data) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    
    // Reset ages when receiving new data
    STATE.ages.temp = 0; 
    STATE.ages.hum = 0; 
    STATE.ages.pm1 = 0; 
    STATE.ages.pm25 = 0; 
    STATE.ages.pm10 = 0; 
    STATE.ages.co2 = 0;
    
    // Update each sensor value with correct format
    if (data.temperature !== undefined && data.temperature !== null) {
        UI.temp.textContent = `${parseFloat(data.temperature).toFixed(1)} °C`;
        UI.tempTime.textContent = timeStr;
        UI.tempAge.textContent = '0';
        STATE.latest.temp = data.temperature;
    }
    
    if (data.humidity !== undefined && data.humidity !== null) {
        UI.hum.textContent = `${parseFloat(data.humidity).toFixed(1)} %`;
        UI.humTime.textContent = timeStr;
        UI.humAge.textContent = '0';
        STATE.latest.hum = data.humidity;
    }
    
    if (data.pm1_0 !== undefined && data.pm1_0 !== null) {
        UI.pm1.textContent = `${data.pm1_0} µg/m³`;
        UI.pm1Time.textContent = timeStr;
        UI.pm1Age.textContent = '0';
        STATE.latest.pm1 = data.pm1_0;
    }
    
    if (data.pm2_5 !== undefined && data.pm2_5 !== null) {
        UI.pm25.textContent = `${data.pm2_5} µg/m³`;
        UI.pm25Time.textContent = timeStr;
        UI.pm25Age.textContent = '0';
        STATE.latest.pm25 = data.pm2_5;
    }
    
    if (data.pm10_0 !== undefined && data.pm10_0 !== null) {
        UI.pm10.textContent = `${data.pm10_0} µg/m³`;
        UI.pm10Time.textContent = timeStr;
        UI.pm10Age.textContent = '0';
        STATE.latest.pm10 = data.pm10_0;
    }
    
    if (data.CO2 !== undefined && data.CO2 !== null) {
        UI.co2.textContent = `${data.CO2} ppm`;
        UI.co2Time.textContent = timeStr;
        UI.co2Age.textContent = '0';
        STATE.latest.co2 = data.CO2;
    }
    
    // Add to charts and history
    const ts = now.toLocaleString('vi-VN');
    const chartData = {
        temp: data.temperature,
        hum: data.humidity,
        pm1: data.pm1_0,
        pm25: data.pm2_5,
        pm10: data.pm10_0,
        co2: data.CO2
    };
    
    // Check thresholds
    checkThresholds(
        chartData.temp,
        chartData.hum,
        chartData.pm1,
        chartData.pm25,
        chartData.pm10,
        chartData.co2
    );
    
    // Add to chart if all data is available
    if (Object.values(chartData).every(v => v !== null && v !== undefined)) {
        pushChartPoint(
            ts,
            parseFloat(chartData.temp),
            parseFloat(chartData.hum),
            parseInt(chartData.pm1),
            parseInt(chartData.pm25),
            parseInt(chartData.pm10),
            parseInt(chartData.co2)
        );
    }
    
    // Add to history table
    const historyRow = {
        ts,
        t: chartData.temp !== undefined ? parseFloat(chartData.temp).toFixed(1) : '--',
        h: chartData.hum !== undefined ? parseFloat(chartData.hum).toFixed(1) : '--',
        pm1: chartData.pm1 !== undefined ? chartData.pm1 : '--',
        pm25: chartData.pm25 !== undefined ? chartData.pm25 : '--',
        pm10: chartData.pm10 !== undefined ? chartData.pm10 : '--',
        c: chartData.co2 !== undefined ? chartData.co2 : '--',
        ages: { ...STATE.ages }
    };
    
    pushHistory(
        historyRow.ts,
        historyRow.t,
        historyRow.h,
        historyRow.pm1,
        historyRow.pm25,
        historyRow.pm10,
        historyRow.c,
        historyRow.ages
    );
}

/* History table management */
function pushHistory(ts, t, h, pm1, pm25, pm10, c, agesSnap) {
    const row = { ts, t, h, pm1, pm25, pm10, c, ages: agesSnap };
    STATE.history.unshift(row);
    if (STATE.history.length > CONFIG.MAX_HISTORY) STATE.history.pop();
    renderHistory();
}

function renderHistory() {
    const tbody = UI.historyTable;
    tbody.innerHTML = '';
    const q = UI.searchInput.value.trim().toLowerCase();
    
    for (const r of STATE.history) {
        if (q && !r.ts.toLowerCase().includes(q)) continue;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.ts}</td>
            <td>${r.t}</td><td>${r.h}</td><td>${r.pm1}</td><td>${r.pm25}</td><td>${r.pm10}</td><td>${r.c}</td>
            <td>${r.ages.temp}</td><td>${r.ages.hum}</td><td>${r.ages.pm1}</td><td>${r.ages.pm25}</td><td>${r.ages.pm10}</td><td>${r.ages.co2}</td>`;
        tbody.appendChild(tr);
    }
}

/* Threshold checking */
function checkThresholds(t, h, pm1, pm25, pm10, c) {
    const pm1Thr = Number(localStorage.getItem(STORAGE_KEYS.pm1) || UI.thrPM1Input.value);
    const pm25Thr = Number(localStorage.getItem(STORAGE_KEYS.pm25) || UI.thrPM25Input.value);
    const pm10Thr = Number(localStorage.getItem(STORAGE_KEYS.pm10) || UI.thrPM10Input.value);
    const co2Thr = Number(localStorage.getItem(STORAGE_KEYS.co2) || UI.thrCO2Input.value);
    
    let alertMsg = '';
    let highlightCardId = '';
    const alerts = [];
    
    if (pm1 !== null && pm1 !== undefined && pm1 > pm1Thr) {
        alerts.push(`PM1.0: ${pm1} > ${pm1Thr} µg/m³`);
        highlightCardId = highlightCardId || 'card-pm1';
    }
    
    if (pm25 !== null && pm25 !== undefined && pm25 > pm25Thr) {
        alerts.push(`PM2.5: ${pm25} > ${pm25Thr} µg/m³`);
        highlightCardId = highlightCardId || 'card-pm25';
    }
    
    if (pm10 !== null && pm10 !== undefined && pm10 > pm10Thr) {
        alerts.push(`PM10: ${pm10} > ${pm10Thr} µg/m³`);
        highlightCardId = highlightCardId || 'card-pm10';
    }
    
    if (c !== null && c !== undefined && c > co2Thr) {
        alerts.push(`CO₂: ${c} > ${co2Thr} ppm`);
        highlightCardId = highlightCardId || 'card-co2';
    }
    
    if (alerts.length > 0) {
        alertMsg = alerts.join(' | ');
        showCritical(`⚠️ CẢNH BÁO: ${alertMsg}`);
        
        if (highlightCardId) highlightCard(highlightCardId, true);
        
        if (pm1 > pm1Thr) highlightCard('card-pm1', true);
        if (pm25 > pm25Thr) highlightCard('card-pm25', true);
        if (pm10 > pm10Thr) highlightCard('card-pm10', true);
        if (c > co2Thr) highlightCard('card-co2', true);
    } else {
        highlightCard('card-pm1', false);
        highlightCard('card-pm25', false);
        highlightCard('card-pm10', false);
        highlightCard('card-co2', false);
    }
}