/* ===========================
   CONFIGURATION - KẾT NỐI ĐẾN SERVER
   =========================== */
const CONFIG = {
    SSE_URL: 'https://webquantrac.onrender.com/sse',
    API_BASE_URL: 'https://webquantrac.onrender.com/api',
    MAX_RECONNECT_ATTEMPTS: 10,
    MAX_POINTS: 40,
    MAX_HISTORY: 200
};

/* Storage keys */
const STORAGE_KEYS = { 
    pm1: 'threshold_pm1',
    pm25: 'threshold_pm25', 
    pm10: 'threshold_pm10', 
    co2: 'threshold_co2', 
    theme: 'theme_pref' 
};

/* Global state */
let STATE = {
    eventSource: null,
    isConnected: false,
    reconnectAttempts: 0,
    pollingInterval: null,
    alertTimeout: null,
    history: [],
    ages: { temp:0, hum:0, pm1:0, pm25:0, pm10:0, co2:0 },
    latest: { temp:null, hum:null, pm1:null, pm25:null, pm10:null, co2:null },
    labels: [],
    series: { temp:[], hum:[], pm1:[], pm25:[], pm10:[], co2:[] }
};

/* Chart instances (will be initialized later) */
let CHARTS = {
    temp: null, hum: null, pm1: null, pm25: null, pm10: null, co2: null, combined: null,
    sparkTemp: null, sparkHum: null, sparkPM1: null, sparkPM25: null, sparkPM10: null, sparkCO2: null
};