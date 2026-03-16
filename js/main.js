/* Main initialization */
document.addEventListener('DOMContentLoaded', function() {
    console.info('Dashboard loading...');
    
    // Initialize theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'light';
    setTheme(savedTheme);
    
    // Load thresholds
    loadThresholds();
    
    // Initialize UI events
    initUIEvents();
    
    // Initialize charts
    initCharts();
    
    // Initialize time display
    updateCurrentTime();
    
    // Start SSE connection
    connectSSE();
    
    // Load initial history data
    loadHistoryData();
    
    // Reconnect when tab becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !STATE.isConnected) {
            console.log('Tab active, reconnecting SSE...');
            connectSSE();
        }
    });
    
    console.info('Dashboard loaded - Connected to backend server');
});