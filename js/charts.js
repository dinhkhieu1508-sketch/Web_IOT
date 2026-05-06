/* Smart Y-axis: tự động co giãn theo data thực tế, có padding 10% trên/dưới */
function smartYOptions({ min: hardMin, max: hardMax, unit }) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                suggestedMin: hardMin,
                suggestedMax: hardMax,
                afterDataLimits(scale) {
                    const range = scale.max - scale.min;
                    const pad = range * 0.12 || 1;
                    scale.min = Math.max(hardMin, scale.min - pad);
                    scale.max = Math.min(hardMax, scale.max + pad);
                    // Nếu data vượt hardMax (ví dụ CO₂ đột biến) thì cho phép mở rộng
                    if (scale.dataMax > hardMax) scale.max = scale.dataMax * 1.1;
                }
            }
        }
    };
}

/* Create line chart for sparklines */
function makeSparkline(ctx, label, color) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: color,
                backgroundColor: color,
                fill: false,
                pointRadius: 0,
                borderWidth: 2,
                tension: 0.35
            }]
        },
        options: {
            animation: false,
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { ticks: { maxTicksLimit: 4 }, display: false }
            },
            elements: {
                line: { capBezierPoints: true }
            }
        }
    });
}

/* Initialize all charts */
function initCharts() {
    // Main charts
    CHARTS.temp = new Chart(document.getElementById('chart-temp').getContext('2d'), {
        type: 'line',
        data: { 
            labels: [], 
            datasets: [{ 
                label: 'Nhiệt độ °C', 
                data: [], 
                borderColor: '#ff5a5f', 
                backgroundColor: 'rgba(255,90,95,0.06)', 
                fill: true, 
                tension: 0.35 
            }] 
        },
        options: smartYOptions({ min: 0, max: 60, unit: '°C' })
    });
    
    CHARTS.hum = new Chart(document.getElementById('chart-hum').getContext('2d'), {
        type: 'line',
        data: { 
            labels: [], 
            datasets: [{ 
                label: 'Độ ẩm %', 
                data: [], 
                borderColor: '#1e90ff', 
                backgroundColor: 'rgba(30,144,255,0.06)', 
                fill: true, 
                tension: 0.35 
            }] 
        },
        options: smartYOptions({ min: 0, max: 100, unit: '%' })
    });
    
    CHARTS.pm1 = new Chart(document.getElementById('chart-pm1').getContext('2d'), {
        type: 'line',
        data: { 
            labels: [], 
            datasets: [{ 
                label: 'PM1.0 µg/m³', 
                data: [], 
                borderColor: '#9c27b0', 
                backgroundColor: 'rgba(156,39,176,0.06)', 
                fill: true, 
                tension: 0.35 
            }] 
        },
        options: smartYOptions({ min: 0, max: 150, unit: 'µg/m³' })
    });
    
    CHARTS.pm25 = new Chart(document.getElementById('chart-pm25').getContext('2d'), {
        type: 'line',
        data: { 
            labels: [], 
            datasets: [{ 
                label: 'PM2.5 µg/m³', 
                data: [], 
                borderColor: '#8b5a2b', 
                backgroundColor: 'rgba(139,90,43,0.06)', 
                fill: true, 
                tension: 0.35 
            }] 
        },
        options: smartYOptions({ min: 0, max: 150, unit: 'µg/m³' })
    });
    
    CHARTS.pm10 = new Chart(document.getElementById('chart-pm10').getContext('2d'), {
        type: 'line',
        data: { 
            labels: [], 
            datasets: [{ 
                label: 'PM10 µg/m³', 
                data: [], 
                borderColor: '#ff9800', 
                backgroundColor: 'rgba(255,152,0,0.06)', 
                fill: true, 
                tension: 0.35 
            }] 
        },
        options: smartYOptions({ min: 0, max: 200, unit: 'µg/m³' })
    });
    
    CHARTS.co2 = new Chart(document.getElementById('chart-co2').getContext('2d'), {
        type: 'line',
        data: { 
            labels: [], 
            datasets: [{ 
                label: 'CO₂ ppm', 
                data: [], 
                borderColor: '#ffb703', 
                backgroundColor: 'rgba(255,183,3,0.06)', 
                fill: true, 
                tension: 0.35 
            }] 
        },
        options: smartYOptions({ min: 300, max: 5000, unit: 'ppm' })
    });
    
    // Sparklines
    CHARTS.sparkTemp = makeSparkline(document.getElementById('spark-temp').getContext('2d'), 't', '#ff5a5f');
    CHARTS.sparkHum = makeSparkline(document.getElementById('spark-hum').getContext('2d'), 'h', '#1e90ff');
    CHARTS.sparkPM1 = makeSparkline(document.getElementById('spark-pm1').getContext('2d'), 'pm1', '#9c27b0');
    CHARTS.sparkPM25 = makeSparkline(document.getElementById('spark-pm25').getContext('2d'), 'pm25', '#8b5a2b');
    CHARTS.sparkPM10 = makeSparkline(document.getElementById('spark-pm10').getContext('2d'), 'pm10', '#ff9800');
    CHARTS.sparkCO2 = makeSparkline(document.getElementById('spark-co2').getContext('2d'), 'c', '#ffb703');
}

/* Push new data point to all charts */
function pushChartPoint(t, valTemp, valHum, valPM1, valPM25, valPM10, valCO2) {
    STATE.labels.push(t);
    if (STATE.labels.length > CONFIG.MAX_POINTS) STATE.labels.shift();
    
    const s = STATE.series;
    s.temp.push(valTemp); if (s.temp.length > CONFIG.MAX_POINTS) s.temp.shift();
    s.hum.push(valHum); if (s.hum.length > CONFIG.MAX_POINTS) s.hum.shift();
    s.pm1.push(valPM1); if (s.pm1.length > CONFIG.MAX_POINTS) s.pm1.shift();
    s.pm25.push(valPM25); if (s.pm25.length > CONFIG.MAX_POINTS) s.pm25.shift();
    s.pm10.push(valPM10); if (s.pm10.length > CONFIG.MAX_POINTS) s.pm10.shift();
    s.co2.push(valCO2); if (s.co2.length > CONFIG.MAX_POINTS) s.co2.shift();
    
    updateAllCharts();
}

/* Update all charts with current data */
function updateAllCharts() {
    const { labels, series } = STATE;
    
    // Main charts
    CHARTS.temp.data.labels = labels;
    CHARTS.temp.data.datasets[0].data = series.temp;
    CHARTS.temp.update('none');
    
    CHARTS.hum.data.labels = labels;
    CHARTS.hum.data.datasets[0].data = series.hum;
    CHARTS.hum.update('none');
    
    CHARTS.pm1.data.labels = labels;
    CHARTS.pm1.data.datasets[0].data = series.pm1;
    CHARTS.pm1.update('none');
    
    CHARTS.pm25.data.labels = labels;
    CHARTS.pm25.data.datasets[0].data = series.pm25;
    CHARTS.pm25.update('none');
    
    CHARTS.pm10.data.labels = labels;
    CHARTS.pm10.data.datasets[0].data = series.pm10;
    CHARTS.pm10.update('none');
    
    CHARTS.co2.data.labels = labels;
    CHARTS.co2.data.datasets[0].data = series.co2;
    CHARTS.co2.update('none');
    
    // Sparklines
    CHARTS.sparkTemp.data.labels = labels;
    CHARTS.sparkTemp.data.datasets[0].data = series.temp;
    CHARTS.sparkTemp.update('none');
    
    CHARTS.sparkHum.data.labels = labels;
    CHARTS.sparkHum.data.datasets[0].data = series.hum;
    CHARTS.sparkHum.update('none');
    
    CHARTS.sparkPM1.data.labels = labels;
    CHARTS.sparkPM1.data.datasets[0].data = series.pm1;
    CHARTS.sparkPM1.update('none');
    
    CHARTS.sparkPM25.data.labels = labels;
    CHARTS.sparkPM25.data.datasets[0].data = series.pm25;
    CHARTS.sparkPM25.update('none');
    
    CHARTS.sparkPM10.data.labels = labels;
    CHARTS.sparkPM10.data.datasets[0].data = series.pm10;
    CHARTS.sparkPM10.update('none');
    
    CHARTS.sparkCO2.data.labels = labels;
    CHARTS.sparkCO2.data.datasets[0].data = series.co2;
    CHARTS.sparkCO2.update('none');
}
