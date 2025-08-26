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
        text: "Transform any written content into professional audio with our advanced text-to-speech technology."
    },
    {
        title: "Educational Content",
        text: "Did you know that text-to-speech technology helps millions of people access written content more easily?"
    },
    {
        title: "Simple Test",
        text: "Hello world! This is a test of the text to speech system."
    }
];

// DOM Elements
let textInput, speakBtn, stopBtn, clearBtn, testBtn, voiceSelect, speedSlider, pitchSlider;
let speedValue, pitchValue, charCount, speakingIndicator, quickTextsContainer;
let historyList, totalRequestsElement, liveToggle, liveStatus;
let connectionBadge, statusIndicator, statusText, toastContainer, browserSupport;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Wait a bit for the page to fully load
    setTimeout(() => {
        initializeDOMElements();
        checkBrowserSupport();
        initializeVoices();
        initializeQuickTexts();
        setupEventListeners();
        simulateConnection();
        updateDisplay();
        loadHistoryFromStorage();
        updateCharCount();
        console.log('App initialization complete');
    }, 100);
});

// Initialize DOM elements
function initializeDOMElements() {
    textInput = document.getElementById('textInput');
    speakBtn = document.getElementById('speakBtn');
    stopBtn = document.getElementById('stopBtn');
    clearBtn = document.getElementById('clearBtn');
    testBtn = document.getElementById('testBtn');
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
    if (!window.speechSynthesis) {
        console.error('Speech synthesis not supported');
        const warning = browserSupport?.querySelector('.support-warning');
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
        try {
            voices = window.speechSynthesis.getVoices();
            console.log('Available voices:', voices.length);
            
            if (!voiceSelect) {
                console.error('Voice select element not found');
                return;
            }
            
            voiceSelect.innerHTML = '';
            
            if (voices.length === 0) {
                voiceSelect.innerHTML = '<option value="">Loading voices...</option>';
                console.log('No voices available yet, will retry...');
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
                }
                voiceSelect.appendChild(option);
            });
            
            console.log('Voices loaded successfully:', voices.length);
        } catch (error) {
            console.error('Error loading voices:', error);
        }
    }
    
    // Load voices immediately
    loadVoices();
    
    // Listen for voice changes
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Multiple retry attempts for different browsers
    setTimeout(loadVoices, 100);
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1000);
    setTimeout(loadVoices, 2000);
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
                <button class="quick-text-btn" data-index="${index}">
                    Use Text
                </button>
            </div>
            <div class="quick-text-preview">${item.text}</div>
        `;
        quickTextsContainer.appendChild(quickTextDiv);
        
        // Add click event to the button
        const btn = quickTextDiv.querySelector('.quick-text-btn');
        btn.addEventListener('click', () => useQuickText(index));
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
        if (testBtn) {
            testBtn.addEventListener('click', testSpeech);
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
        showToast('Text loaded!', 'Quick text has been loaded into the input.', 'success');
    }
}

// Clear text
function clearText() {
    if (!textInput) return;
    
    textInput.value = '';
    updateCharCount();
    showToast('Text cleared!', 'The input has been cleared.', 'info');
}

// Test speech function
function testSpeech() {
    console.log('Testing speech synthesis...');
    
    if (!window.speechSynthesis) {
        showToast('Error', 'Speech synthesis not supported', 'error');
        return;
    }
    
    // Simple test with minimal configuration
    try {
        const testText = "Hello! This is a speech synthesis test.";
        const utterance = new SpeechSynthesisUtterance(testText);
        
        utterance.onstart = function() {
            console.log('Test speech started');
            showToast('Test Success', 'Speech synthesis is working!', 'success');
        };
        
        utterance.onerror = function(event) {
            console.error('Test speech error:', event);
            showToast('Test Failed', `Error: ${event.error}`, 'error');
        };
        
        utterance.onend = function() {
            console.log('Test speech completed');
        };
        
        window.speechSynthesis.speak(utterance);
        
    } catch (error) {
        console.error('Test speech exception:', error);
        showToast('Test Failed', 'Exception: ' + error.message, 'error');
    }
}

// Start speaking - FIXED VERSION
function startSpeaking() {
    console.log('Start speaking clicked');
    
    // Check if speech synthesis is available
    if (!window.speechSynthesis) {
        console.error('Speech synthesis not available');
        showToast('Error', 'Speech synthesis is not supported in your browser.', 'error');
        return;
    }
    
    const text = textInput ? textInput.value.trim() : '';
    if (!text) {
        showToast('No text', 'Please enter some text to speak.', 'info');
        return;
    }
    
    console.log('Speaking text:', text);
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    try {
        // Create utterance
        currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Set basic properties
        currentUtterance.rate = speedSlider ? parseFloat(speedSlider.value) : 1.0;
        currentUtterance.pitch = pitchSlider ? parseFloat(pitchSlider.value) : 1.0;
        currentUtterance.volume = 1.0;
        
        // Set voice if selected
        const selectedVoiceIndex = voiceSelect ? voiceSelect.value : '';
        if (selectedVoiceIndex && voices[selectedVoiceIndex]) {
            currentUtterance.voice = voices[selectedVoiceIndex];
            console.log('Using voice:', voices[selectedVoiceIndex].name);
        }
        
        console.log('Speech settings:', {
            rate: currentUtterance.rate,
            pitch: currentUtterance.pitch,
            volume: currentUtterance.volume,
            voice: currentUtterance.voice?.name || 'default'
        });
        
        // Set up event listeners
        currentUtterance.onstart = function() {
            console.log('Speech started');
            isPlaying = true;
            updatePlaybackState();
            showToast('Speaking', 'Text-to-speech started', 'success');
        };
        
        currentUtterance.onend = function() {
            console.log('Speech ended');
            isPlaying = false;
            currentUtterance = null;
            updatePlaybackState();
            showToast('Complete', 'Speech finished', 'info');
        };
        
        currentUtterance.onerror = function(event) {
            console.error('Speech error:', event);
            isPlaying = false;
            currentUtterance = null;
            updatePlaybackState();
            showToast('Error', `Speech failed: ${event.error}`, 'error');
        };
        
        // Start speaking
        window.speechSynthesis.speak(currentUtterance);
        console.log('Speech synthesis command sent');
        
        // Update UI immediately
        isPlaying = true;
        updatePlaybackState();
        
        // Add to history
        addToHistory(text, currentUtterance.voice?.name || 'Default', currentUtterance.rate, currentUtterance.pitch);
        
        // Update request count
        totalRequests++;
        updateDisplay();
        
    } catch (error) {
        console.error('Error in startSpeaking:', error);
        showToast('Error', 'Failed to start speech: ' + error.message, 'error');
        isPlaying = false;
        updatePlaybackState();
    }
}

// Stop speaking
function stopSpeaking() {
    console.log('Stop speaking');
    try {
        window.speechSynthesis.cancel();
        isPlaying = false;
        currentUtterance = null;
        updatePlaybackState();
        showToast('Stopped', 'Speech stopped', 'info');
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
        speakBtn.style.opacity = '0.6';
        stopBtn.style.display = 'flex';
        if (speakingIndicator) {
            speakingIndicator.classList.add('active');
        }
    } else {
        speakBtn.innerHTML = '<i class="fas fa-play"></i><span>Speak</span>';
        speakBtn.disabled = false;
        speakBtn.style.opacity = '1';
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
                <button class="history-replay" data-id="${item.id}">
                    <i class="fas fa-play"></i> Replay
                </button>
            </div>
        `;
        historyList.appendChild(historyDiv);
        
        // Add event listener to replay button
        const replayBtn = historyDiv.querySelector('.history-replay');
        replayBtn.addEventListener('click', () => replayHistory(item.id));
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
        
        showToast('Loaded', 'History item loaded', 'info');
        // Auto-start speaking
        setTimeout(startSpeaking, 500);
    }
}

// Format time for display
function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffMs / 86400000)}d ago`;
}

// Toggle live mode
function toggleLiveMode() {
    if (!liveToggle || !liveStatus) return;
    
    isLiveMode = liveToggle.checked;
    if (isLiveMode) {
        liveStatus.classList.remove('hidden');
        showToast('Live Mode On', 'Real-time notifications enabled', 'success');
    } else {
        liveStatus.classList.add('hidden');
        showToast('Live Mode Off', 'Notifications paused', 'info');
    }
}

// Simulate connection status
function simulateConnection() {
    updateConnectionStatus();
    
    setInterval(() => {
        if (Math.random() < 0.03) {
            connectionStatus = 'connecting';
            updateConnectionStatus();
            
            setTimeout(() => {
                connectionStatus = 'connected';
                updateConnectionStatus();
            }, 1000 + Math.random() * 1000);
        }
    }, 10000);
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

// Show toast notification - IMPROVED
function showToast(title, description, type = 'info') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fas fa-info-circle';
    if (type === 'success') iconClass = 'fas fa-check-circle';
    if (type === 'error') iconClass = 'fas fa-exclamation-circle';
    
    toast.innerHTML = `
        <div class="toast-header">
            <i class="${iconClass}"></i>
            <div class="toast-title">${title}</div>
        </div>
        <div class="toast-description">${description}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toastContainer.contains(toast)) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, 3000);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (!isPlaying) {
                startSpeaking();
            }
        }
    }
    
    if (event.key === 'Escape' && isPlaying) {
        event.preventDefault();
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

// Test speech synthesis on page load
setTimeout(() => {
    if (window.speechSynthesis) {
        console.log('Speech synthesis available');
        const testUtterance = new SpeechSynthesisUtterance('');
        testUtterance.volume = 0;
        window.speechSynthesis.speak(testUtterance);
    }
}, 1000);

console.log('Script loaded successfully');