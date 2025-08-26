// Global Variables
let currentUtterance = null;
let isPlaying = false;
let voices = [];
let speechHistory = [];
let totalRequests = 0;
let isLiveMode = true;
let connectionStatus = 'connected';

// Sample texts for quick start
const quickTexts = [
    {
        title: "Welcome Message",
        text: "Welcome to VoiceStream, the ultimate text-to-speech platform. Experience natural-sounding voices with real-time processing."
    },
    {
        title: "News Headline", 
        text: "Breaking: Scientists discover a new method for converting text to speech with unprecedented clarity and naturalness."
    },
    {
        title: "Product Demo",
        text: "Transform any written content into professional audio with our advanced text-to-speech technology. Choose from multiple voices and adjust speed to suit your needs."
    },
    {
        title: "Educational Content",
        text: "Did you know that text-to-speech technology helps millions of people with reading difficulties access written content more easily?"
    },
    {
        title: "Poetry Sample",
        text: "Roses are red, violets are blue, VoiceStream makes voices that sound just like you!"
    }
];

// DOM Elements
const textInput = document.getElementById('textInput');
const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');
const pauseBtn = document.getElementById('pauseBtn');
const voiceSelect = document.getElementById('voiceSelect');
const speedSlider = document.getElementById('speedSlider');
const pitchSlider = document.getElementById('pitchSlider');
const speedValue = document.getElementById('speedValue');
const pitchValue = document.getElementById('pitchValue');
const charCount = document.getElementById('charCount');
const speakingIndicator = document.getElementById('speakingIndicator');
const quickTextsContainer = document.getElementById('quickTexts');
const historyList = document.getElementById('historyList');
const totalRequestsElement = document.getElementById('totalRequests');
const liveToggle = document.getElementById('liveToggle');
const liveStatus = document.getElementById('liveStatus');
const connectionBadge = document.getElementById('connectionBadge');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const toastContainer = document.getElementById('toastContainer');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeVoices();
    initializeQuickTexts();
    setupEventListeners();
    simulateConnection();
    updateDisplay();
    loadHistoryFromStorage();
});

// Load voices
function initializeVoices() {
    function loadVoices() {
        voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        
        if (voices.length === 0) {
            voiceSelect.innerHTML = '<option value="">Loading voices...</option>';
            return;
        }
        
        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) {
                option.textContent += ' - Default';
                option.selected = true;
            }
            voiceSelect.appendChild(option);
        });
    }
    
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Initialize quick start texts
function initializeQuickTexts() {
    quickTextsContainer.innerHTML = '';
    quickTexts.forEach(item => {
        const quickTextDiv = document.createElement('div');
        quickTextDiv.className = 'quick-text-item';
        quickTextDiv.innerHTML = `
            <div class="quick-text-header">
                <div class="quick-text-title">${item.title}</div>
                <button class="quick-text-btn" onclick="useQuickText('${item.text.replace(/'/g, "\\'")}')">
                    Use Text
                </button>
            </div>
            <div class="quick-text-preview">${item.text}</div>
        `;
        quickTextsContainer.appendChild(quickTextDiv);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Text input
    textInput.addEventListener('input', updateCharCount);
    
    // Control buttons
    speakBtn.addEventListener('click', startSpeaking);
    stopBtn.addEventListener('click', stopSpeaking);
    pauseBtn.addEventListener('click', pauseSpeaking);
    
    // Sliders
    speedSlider.addEventListener('input', updateSpeedValue);
    pitchSlider.addEventListener('input', updatePitchValue);
    
    // Live mode toggle
    liveToggle.addEventListener('change', toggleLiveMode);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Update character count
function updateCharCount() {
    const count = textInput.value.length;
    charCount.textContent = `${count}/500 characters`;
    
    if (count > 450) {
        charCount.style.color = '#ef4444';
    } else if (count > 350) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = '#666';
    }
}

// Update speed value display
function updateSpeedValue() {
    speedValue.textContent = `${speedSlider.value}x`;
}

// Update pitch value display  
function updatePitchValue() {
    pitchValue.textContent = pitchSlider.value;
}

// Use quick text
function useQuickText(text) {
    textInput.value = text;
    updateCharCount();
    showToast('Text loaded!', 'Quick text has been loaded into the input.', 'info');
}

// Start speaking
function startSpeaking() {
    const text = textInput.value.trim();
    if (!text) {
        showToast('No text provided', 'Please enter some text to convert to speech.', 'info');
        return;
    }
    
    // Stop any current speech
    if (isPlaying) {
        stopSpeaking();
    }
    
    // Create new utterance
    currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Configure utterance
    const selectedVoiceIndex = voiceSelect.value;
    if (selectedVoiceIndex && voices[selectedVoiceIndex]) {
        currentUtterance.voice = voices[selectedVoiceIndex];
    }
    
    currentUtterance.rate = parseFloat(speedSlider.value);
    currentUtterance.pitch = parseFloat(pitchSlider.value);
    
    // Event listeners
    currentUtterance.onstart = () => {
        isPlaying = true;
        updatePlaybackState();
        if (isLiveMode) {
            showToast('Speech Started', 'Text-to-speech synthesis has begun.', 'success');
        }
    };
    
    currentUtterance.onend = () => {
        isPlaying = false;
        currentUtterance = null;
        updatePlaybackState();
        if (isLiveMode) {
            showToast('Speech Completed', 'Text-to-speech synthesis finished.', 'info');
        }
    };
    
    currentUtterance.onerror = (event) => {
        isPlaying = false;
        currentUtterance = null;
        updatePlaybackState();
        showToast('Speech Error', `An error occurred: ${event.error}`, 'error');
    };
    
    // Start speaking
    speechSynthesis.speak(currentUtterance);
    
    // Add to history
    addToHistory(text, voices[selectedVoiceIndex]?.name || 'Default', speedSlider.value, pitchSlider.value);
    
    // Update request count
    totalRequests++;
    updateDisplay();
}

// Stop speaking
function stopSpeaking() {
    speechSynthesis.cancel();
    isPlaying = false;
    currentUtterance = null;
    updatePlaybackState();
}

// Pause speaking (actually stops and restarts from beginning due to API limitations)
function pauseSpeaking() {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
    } else if (speechSynthesis.paused) {
        speechSynthesis.resume();
    }
}

// Update playback state UI
function updatePlaybackState() {
    if (isPlaying) {
        speakBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Speaking...</span>';
        speakBtn.disabled = true;
        stopBtn.style.display = 'flex';
        pauseBtn.style.display = 'flex';
        speakingIndicator.classList.add('active');
    } else {
        speakBtn.innerHTML = '<i class="fas fa-play"></i><span>Speak</span>';
        speakBtn.disabled = false;
        stopBtn.style.display = 'none';
        pauseBtn.style.display = 'none';
        speakingIndicator.classList.remove('active');
    }
}

// Add to history
function addToHistory(text, voice, speed, pitch) {
    const historyItem = {
        id: Date.now(),
        text: text,
        voice: voice,
        speed: speed,
        pitch: pitch,
        timestamp: new Date(),
        status: 'completed'
    };
    
    speechHistory.unshift(historyItem);
    
    // Limit history to 10 items
    if (speechHistory.length > 10) {
        speechHistory.pop();
    }
    
    updateHistoryDisplay();
    saveHistoryToStorage();
}

// Update history display
function updateHistoryDisplay() {
    if (speechHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <p>No speech history yet</p>
                <small>Your requests will appear here</small>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = '';
    speechHistory.forEach(item => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'history-item';
        historyDiv.innerHTML = `
            <div class="history-header">
                <div class="history-status completed">completed</div>
                <div class="history-time">${formatTime(item.timestamp)}</div>
            </div>
            <div class="history-text">${item.text}</div>
            <div class="history-controls">
                <div class="history-details">
                    Voice: ${item.voice} | Speed: ${item.speed}x | Pitch: ${item.pitch}
                </div>
                <button class="history-replay" onclick="replayHistory('${item.id}')">
                    <i class="fas fa-play"></i> Replay
                </button>
            </div>
        `;
        historyList.appendChild(historyDiv);
    });
}

// Replay from history
function replayHistory(itemId) {
    const item = speechHistory.find(h => h.id == itemId);
    if (item) {
        textInput.value = item.text;
        speedSlider.value = item.speed;
        pitchSlider.value = item.pitch;
        updateCharCount();
        updateSpeedValue();
        updatePitchValue();
        
        // Find and select the voice
        const voiceIndex = voices.findIndex(v => v.name === item.voice);
        if (voiceIndex !== -1) {
            voiceSelect.value = voiceIndex;
        }
        
        startSpeaking();
    }
}

// Format time for display
function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

// Toggle live mode
function toggleLiveMode() {
    isLiveMode = liveToggle.checked;
    if (isLiveMode) {
        liveStatus.classList.remove('hidden');
        showToast('Live Mode Enabled', 'You will now receive real-time notifications.', 'success');
    } else {
        liveStatus.classList.add('hidden');
        showToast('Live Mode Disabled', 'Real-time notifications are now paused.', 'info');
    }
}

// Simulate connection status
function simulateConnection() {
    // Simulate occasional connection status changes
    setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance every 5 seconds
            connectionStatus = 'connecting';
            updateConnectionStatus();
            
            setTimeout(() => {
                connectionStatus = 'connected';
                updateConnectionStatus();
            }, 1000 + Math.random() * 2000);
        }
    }, 5000);
}

// Update connection status display
function updateConnectionStatus() {
    const badge = connectionBadge;
    const indicator = statusIndicator;
    const text = statusText;
    
    switch (connectionStatus) {
        case 'connecting':
            badge.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Connecting</span>';
            badge.className = 'status-badge connecting';
            badge.style.background = '#f59e0b';
            indicator.style.background = '#f59e0b';
            text.textContent = 'CONNECTING';
            text.style.color = '#f59e0b';
            break;
        case 'connected':
            badge.innerHTML = '<i class="fas fa-wifi"></i><span>Connected</span>';
            badge.className = 'status-badge connected';
            badge.style.background = '#10b981';
            indicator.style.background = '#10b981';
            text.textContent = 'LIVE';
            text.style.color = '#10b981';
            break;
        case 'disconnected':
            badge.innerHTML = '<i class="fas fa-wifi-slash"></i><span>Disconnected</span>';
            badge.className = 'status-badge disconnected';
            badge.style.background = '#ef4444';
            indicator.style.background = '#ef4444';
            text.textContent = 'OFFLINE';
            text.style.color = '#ef4444';
            break;
    }
}

// Update display elements
function updateDisplay() {
    totalRequestsElement.textContent = totalRequests;
}

// Show toast notification
function showToast(title, description, type = 'info') {
    if (!isLiveMode && type !== 'error') return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <div class="toast-title">${title}</div>
        </div>
        <div class="toast-description">${description}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                if (!isPlaying) {
                    startSpeaking();
                }
                break;
            case ' ':
                if (event.target !== textInput) {
                    event.preventDefault();
                    if (isPlaying) {
                        stopSpeaking();
                    } else {
                        startSpeaking();
                    }
                }
                break;
        }
    }
    
    if (event.key === 'Escape' && isPlaying) {
        stopSpeaking();
    }
}

// Local storage functions
function saveHistoryToStorage() {
    try {
        localStorage.setItem('voicestream_history', JSON.stringify(speechHistory));
        localStorage.setItem('voicestream_total_requests', totalRequests.toString());
    } catch (error) {
        console.warn('Could not save to localStorage:', error);
    }
}

function loadHistoryFromStorage() {
    try {
        const savedHistory = localStorage.getItem('voicestream_history');
        const savedRequests = localStorage.getItem('voicestream_total_requests');
        
        if (savedHistory) {
            speechHistory = JSON.parse(savedHistory).map(item => ({
                ...item,
                timestamp: new Date(item.timestamp)
            }));
            updateHistoryDisplay();
        }
        
        if (savedRequests) {
            totalRequests = parseInt(savedRequests) || 0;
            updateDisplay();
        }
    } catch (error) {
        console.warn('Could not load from localStorage:', error);
    }
}

// Add CSS animation for slideOut
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);