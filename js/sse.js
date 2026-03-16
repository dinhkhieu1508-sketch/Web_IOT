/* SSE Connection Management */
function connectSSE() {
    try {
        // Close old connection if exists
        if (STATE.eventSource) {
            STATE.eventSource.close();
        }
        
        console.log(`🔗 Connecting to SSE: ${CONFIG.SSE_URL}`);
        STATE.eventSource = new EventSource(CONFIG.SSE_URL);
        
        STATE.eventSource.onopen = () => {
            STATE.isConnected = true;
            STATE.reconnectAttempts = 0;
            console.log('✅ SSE connected');
            showToast('✅ Kết nối realtime thành công');
            
            // Stop polling fallback if active
            stopPollingFallback();
            
            // Load history data when connected
            loadHistoryData();
        };
        
        STATE.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📩 SSE received:', data);
                
                // Process sensor data
                if (data.type === 'SENSOR_DATA' && data.data) {
                    processSensorData(data.data);
                }
                // Process connection success
                else if (data.type === 'CONNECTED') {
                    console.log('SSE connection established');
                }
            } catch (error) {
                console.error('Error parsing SSE message:', error);
            }
        };
        
        STATE.eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            STATE.isConnected = false;
            
            if (STATE.eventSource.readyState === EventSource.CLOSED) {
                console.log('SSE connection closed');
                
                // Try to reconnect
                if (STATE.reconnectAttempts < CONFIG.MAX_RECONNECT_ATTEMPTS) {
                    STATE.reconnectAttempts++;
                    const delay = Math.min(1000 * Math.pow(2, STATE.reconnectAttempts), 30000);
                    console.log(`Reconnecting in ${delay/1000} seconds... (attempt ${STATE.reconnectAttempts})`);
                    
                    showToast(`⚠️ Mất kết nối, đang thử lại... (${STATE.reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS})`);
                    
                    setTimeout(() => {
                        connectSSE();
                    }, delay);
                } else {
                    showToast('❌ Không thể kết nối đến server. Vui lòng làm mới trang.');
                    startPollingFallback();
                }
            }
        };
        
    } catch (error) {
        console.error('Error connecting SSE:', error);
    }
}

/* Fallback polling when SSE fails */
function startPollingFallback() {
    if (STATE.pollingInterval) clearInterval(STATE.pollingInterval);
    
    console.log('Starting polling fallback...');
    showToast('⚠️ Đang sử dụng polling fallback');
    
    // Poll every 5 seconds
    STATE.pollingInterval = setInterval(() => {
        fetchLatestData();
    }, 5000);
    
    // Call immediately
    fetchLatestData();
}

function stopPollingFallback() {
    if (STATE.pollingInterval) {
        clearInterval(STATE.pollingInterval);
        STATE.pollingInterval = null;
    }
}