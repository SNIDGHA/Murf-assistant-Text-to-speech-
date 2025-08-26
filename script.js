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
let textInput, speakBtn, stopBtn, clearBtn, voiceSelect, speedSlider, pitchSlider;
let speedValue, pitchValue, charCount, speakingIndicator, quickTextsContainer;
let historyList, totalRequestsElement, liveToggle, liveStatus;
let connectionBadge, statusIndicator, statusText, toastContainer, browserSupport;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeDOMElements();
    checkBrowserSupport();
    initializeVoices();
    initializeQuickTexts();
    setupEventListeners();
    simulateConnection();
    updateDisplay();
    loadHistoryFromStorage();
    updateCharCount(); // Initialize character count
    console.log('App initialization complete');
});

// Initialize DOM elements
function initializeDOMElements() {
    textInput = document.getElementById('textInput');
    speakBtn = document.getElementById('speakBtn');
    stopBtn = document.getElementById('stopBtn');
    clearBtn = document.getElementById('clearBtn');
    voiceSelect = document.getElementById('voiceSelect');
    speedSlider = document.getElementById('speedSlider');
    pitchSlider = document.getElementById('pitchSlider');
    speedValue = document.getElementById('speedValue');
    pitchValue = document.getElementById('pitchValue');
    charCount = document.getElementById('charCount');
    speakingIndicator = document.getElementById('speakingIndicator');
    quickTextsContainer = document.getElementById('quickTexts');
    historyList = document.getElementById('historyList');
    totalRequestsElement = document.getElementById('totalRequests');
    liveToggle = document.getElementById('liveToggle');
    liveStatus = document.getElementById('liveStatus');
    connectionBadge = document.getElementById('connectionBadge');
    statusIndicator = document.getElementById('statusIndicator');
    statusText = document.getElementById('statusText');
    toastContainer = document.getElementById('toastContainer');
    browserSupport = document.getElementById('browserSupport');
    
    console.log('DOM elements initialized');
}

// Check browser support
function checkBrowserSupport() {
    if (!('speechSynthesis' in window)) {
        console.error('Speech synthesis not supported');
        const warning = browserSupport.querySelector('.support-warning');
        if (warning) {
            warning.style.display = 'flex';
        }
        showToast('Browser Not Supported', 'Your browser does not support text-to-speech. Please use Chrome, Firefox, or Safari.', 'error');
        return false;
    }
    console.log('Speech synthesis supported');
    return true;
}

// Load voices with better error handling
function initializeVoices() {
    console.log('Initializing voices...');
    
    function loadVoices() {
        voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
        
        if (!voiceSelect) {
            console.error('Voice select element not found');
            return;
        }
        
        voiceSelect.innerHTML = '';
        
        if (voices.length === 0) {
            voiceSelect.innerHTML = '<option value="">Loading voices...</option>';
            console.log('No voices available yet, retrying...');
            return;
        }
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Default Voice';
        voiceSelect.appendChild(defaultOption);
        
        // Add all available voices
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
        
        console.log('Voices loaded successfully:', voices.length);
    }
    
    // Load voices immediately
    loadVoices();
    
    // Also listen for voice changes (some browsers load voices asynchronously)
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Fallback: retry loading voices after a delay
    setTimeout(loadVoices, 100);
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1000);
}

// Initialize quick start texts
function initializeQuickTexts() {
    if (!quickTextsContainer) {
        console.error('Quick texts container not found');
        return;
    }
    
    quickTextsContainer.innerHTML = '';
    quickTexts.forEach((item, index) => {
        const quickTextDiv = document.createElement('div');
        quickTextDiv.className = 'quick-text-item';
        quickTextDiv.innerHTML = `
            <div class="quick-text-header">
                <div class="quick-text-title">${item.title}</div>
                <button class="quick-text-btn" onclick="useQuickText(${index})">
                    Use Text
                </button>
            </div>
            <div class="quick-text-preview">${item.text}</div>
        `;
        quickTextsContainer.appendChild(quickTextDiv);
    });
    console.log('Quick texts initialized');
}

// Setup event listeners with error handling
function setupEventListeners() {
    try {
        // Text input
        if (textInput) {
            textInput.addEventListener('input', updateCharCount);
        }
        
        // Control buttons
        if (speakBtn) {
            speakBtn.addEventListener('click', startSpeaking);
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', stopSpeaking);
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', clearText);
        }
        
        // Sliders
        if (speedSlider) {
            speedSlider.addEventListener('input', updateSpeedValue);
        }
        if (pitchSlider) {
            pitchSlider.addEventListener('input', updatePitchValue);
        }
        
        // Live mode toggle
        if (liveToggle) {
            liveToggle.addEventListener('change', toggleLiveMode);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        console.log('Event listeners setup complete');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Update character count
function updateCharCount() {
    if (!textInput || !charCount) return;
    
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
    if (speedValue && speedSlider) {
        speedValue.textContent = `${speedSlider.value}x`;
    }
}

// Update pitch value display  
function updatePitchValue() {
    if (pitchValue && pitchSlider) {
        pitchValue.textContent = pitchSlider.value;
    }
}

// Use quick text
function useQuickText(index) {
    if (!textInput) return;
    
    const text = quickTexts[index]?.text;
    if (text) {
        textInput.value = text;
        updateCharCount();
        showToast('Text loaded!', 'Quick text has been loaded into the input.', 'info');
    }
}

// Clear text
function clearText() {
    if (!textInput) return;
    
    textInput.value = '';
    updateCharCount();
    showToast('Text cleared!', 'The input has been cleared.', 'info');
}

// Start speaking with comprehensive error handling
function startSpeaking() {
    console.log('Starting speech synthesis...');
    
    if (!checkBrowserSupport()) {
        return;
    }
    
    const text = textInput ? textInput.value.trim() : '';
    if (!text) {
        showToast('No text provided', 'Please enter some text to convert to speech.', 'info');
        return;
    }
    
    // Stop any current speech
    if (isPlaying) {
        stopSpeaking();
    }
    
    try {
        // Create new utterance
        currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Configure utterance
        const selectedVoiceIndex = voiceSelect ? voiceSelect.value : '';
        if (selectedVoiceIndex && voices[selectedVoiceIndex]) {
            currentUtterance.voice = voices[selectedVoiceIndex];
            console.log('Using voice:', voices[selectedVoiceIndex].name);
        } else {
            console.log('Using default voice');
        }
        
        currentUtterance.rate = speedSlider ? parseFloat(speedSlider.value) : 1.0;
        currentUtterance.pitch = pitchSlider ? parseFloat(pitchSlider.value) : 1.0;
        
        console.log('Speech settings:', {
            rate: currentUtterance.rate,
            pitch: currentUtterance.pitch,
            voice: currentUtterance.voice?.name || 'default'
        });
        
        // Event listeners
        currentUtterance.onstart = () => {
            console.log('Speech started');
            isPlaying = true;
            updatePlaybackState();
            if (isLiveMode) {
                showToast('Speech Started', 'Text-to-speech synthesis has begun.', 'success');
            }
        };
        
        currentUtterance.onend = () => {
            console.log('Speech ended');
            isPlaying = false;
            currentUtterance = null;
            updatePlaybackState();
            if (isLiveMode) {
                showToast('Speech Completed', 'Text-to-speech synthesis finished.', 'info');
            }
        };
        
        currentUtterance.onerror = (event) => {
            console.error('Speech error:', event);
            isPlaying = false;
            currentUtterance = null;
            updatePlaybackState();
            showToast('Speech Error', `An error occurred: ${event.error}`, 'error');
        };
        
        // Start speaking
        speechSynthesis.speak(currentUtterance);
        console.log('Speech synthesis started');
        
        // Add to history
        const voiceName = currentUtterance.voice?.name || 'Default';
        addToHistory(text, voiceName, currentUtterance.rate, currentUtterance.pitch);
        
        // Update request count
        totalRequests++;
        updateDisplay();
        
    } catch (error) {
        console.error('Error starting speech:', error);
        showToast('Speech Error', 'Failed to start speech synthesis.', 'error');
    }
}

// Stop speaking
function stopSpeaking() {
    console.log('Stopping speech...');
    try {
        speechSynthesis.cancel();
        isPlaying = false;
        currentUtterance = null;
        updatePlaybackState();
        console.log('Speech stopped');
    } catch (error) {
        console.error('Error stopping speech:', error);
    }
}

// Update playback state UI
function updatePlaybackState() {
    if (!speakBtn || !stopBtn) return;
    
    if (isPlaying) {
        speakBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Speaking...</span>';
        speakBtn.disabled = true;
        stopBtn.style.display = 'flex';
        if (speakingIndicator) {
            speakingIndicator.classList.add('active');
        }
    } else {
        speakBtn.innerHTML = '<i class="fas fa-play"></i><span>Speak</span>';
        speakBtn.disabled = false;
        stopBtn.style.display = 'none';
        if (speakingIndicator) {
            speakingIndicator.classList.remove('active');
        }
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
    if (!historyList) return;
    
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
    if (item && textInput && speedSlider && pitchSlider) {
        textInput.value = item.text;
        speedSlider.value = item.speed;
        pitchSlider.value = item.pitch;
        updateCharCount();
        updateSpeedValue();
        updatePitchValue();
        
        // Find and select the voice
        if (voiceSelect) {
            const voiceIndex = voices.findIndex(v => v.name === item.voice);
            if (voiceIndex !== -1) {
                voiceSelect.value = voiceIndex;
            }
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
    if (!liveToggle || !liveStatus) return;
    
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
    // Initial connection
    updateConnectionStatus();
    
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
    if (!connectionBadge || !statusIndicator || !statusText) return;
    
    switch (connectionStatus) {
        case 'connecting':
            connectionBadge.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Connecting</span>';
            connectionBadge.style.background = '#f59e0b';
            statusIndicator.style.background = '#f59e0b';
            statusText.textContent = 'CONNECTING';
            statusText.style.color = '#f59e0b';
            break;
        case 'connected':
            connectionBadge.innerHTML = '<i class="fas fa-wifi"></i><span>Connected</span>';
            connectionBadge.style.background = '#10b981';
            statusIndicator.style.background = '#10b981';
            statusText.textContent = 'LIVE';
            statusText.style.color = '#10b981';
            break;
        case 'disconnected':
            connectionBadge.innerHTML = '<i class="fas fa-wifi-slash"></i><span>Disconnected</span>';
            connectionBadge.style.background = '#ef4444';
            statusIndicator.style.background = '#ef4444';
            statusText.textContent = 'OFFLINE';
            statusText.style.color = '#ef4444';
            break;
    }
}

// Update display elements
function updateDisplay() {
    if (totalRequestsElement) {
        totalRequestsElement.textContent = totalRequests;
    }
}

// Show toast notification
function showToast(title, description, type = 'info') {
    if (!toastContainer) return;
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
        if (toastContainer.contains(toast)) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
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

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

console.log('Script loaded successfully');