# VoiceStream - Real-time Text-to-Speech Website

A modern, responsive text-to-speech web application built with vanilla HTML, CSS, and JavaScript. Features real-time speech synthesis, voice controls, and a beautiful user interface.

## Features

### 🎤 Core Speech Features
- **Instant Text-to-Speech**: Convert any text to speech instantly using the browser's built-in Speech Synthesis API
- **Multiple Voices**: Choose from all available system voices
- **Speed Control**: Adjust playback speed from 0.5x to 2.0x
- **Pitch Control**: Fine-tune pitch from 0.5 to 2.0
- **Real-time Feedback**: Visual indicators while speaking

### 🚀 Real-time Features
- **Live Connection Status**: Real-time connection monitoring with visual indicators
- **Toast Notifications**: Instant feedback for user actions
- **Session Tracking**: Track total requests and session statistics
- **Live Mode Toggle**: Enable/disable real-time notifications

### 📝 User Experience
- **Speech History**: View and replay previous text-to-speech requests
- **Quick Start Texts**: Pre-loaded sample texts for easy testing
- **Character Counter**: Track text length with visual feedback
- **Keyboard Shortcuts**: Control playback with keyboard shortcuts
- **Local Storage**: Persistent history and settings

### 🎨 Design & Interface
- **Modern UI**: Clean, gradient-based design with glassmorphism effects
- **Fully Responsive**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Polished animations and transitions
- **Accessibility**: Keyboard navigation and screen reader friendly

## Quick Start

1. **Download the files**: Save all three files to a folder on your computer
2. **Open in browser**: Double-click `index.html` or open it in any web browser
3. **Start speaking**: Enter text and click the "Speak" button

That's it! No installation, no dependencies, no build process required.

## File Structure

```
voicestream/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling and animations
├── script.js       # Full JavaScript functionality
└── README.md       # This documentation
```

## Usage

### Basic Operation
1. **Enter Text**: Type or paste text into the textarea (max 500 characters)
2. **Choose Voice**: Select from available system voices
3. **Adjust Settings**: Modify speed and pitch as needed
4. **Speak**: Click the "Speak" button or press Ctrl+Enter

### Keyboard Shortcuts
- `Ctrl+Enter` / `Cmd+Enter`: Start speaking
- `Ctrl+Space` / `Cmd+Space`: Toggle play/stop (when not focused on textarea)
- `Escape`: Stop current speech

### Quick Start
Use the pre-loaded sample texts in the sidebar to quickly test different types of content:
- Welcome messages
- News headlines
- Product demos
- Educational content
- Poetry samples

### Speech History
- View your last 10 speech requests
- Replay any previous text with original settings
- See voice, speed, and pitch information
- Track when each request was made

## Browser Compatibility

Works in all modern browsers that support the Web Speech API:
- ✅ Chrome 33+
- ✅ Firefox 49+
- ✅ Safari 14.1+
- ✅ Edge 14+

## Deployment Options

### Option 1: Simple File Hosting
Upload the three files to any web server or hosting service:
- GitHub Pages
- Netlify (drag & drop)
- Vercel
- Any shared hosting provider

### Option 2: Local Development
1. Use a local web server for development:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if you have http-server installed)
   npx http-server
   ```
2. Open `http://localhost:8000` in your browser

### Option 3: CDN Deployment
For production deployment, consider using a CDN for the external resources:
- Font Awesome icons
- Google Fonts
- Consider adding a service worker for offline functionality

## Customization

### Colors & Theming
Edit the CSS custom properties in `styles.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}
```

### Quick Start Texts
Modify the `quickTexts` array in `script.js`:
```javascript
const quickTexts = [
    {
        title: "Your Custom Title",
        text: "Your custom text here..."
    }
    // Add more items...
];
```

### Voice Settings
Adjust default settings in `script.js`:
```javascript
// Default values
speedSlider.value = "1.0";  // Speed
pitchSlider.value = "1.0";  // Pitch
```

## Technical Details

### Speech Synthesis API
Uses the browser's native Web Speech API for speech synthesis:
- No external dependencies
- Works offline
- Supports all system voices
- Real-time playback control

### Local Storage
Saves user data locally:
- Speech history (last 10 items)
- Total request count
- User preferences

### Performance
- Lightweight: ~30KB total (HTML + CSS + JS)
- Fast loading: No external JavaScript dependencies
- Efficient: Uses native browser APIs

## Features Roadmap

Potential future enhancements:
- [ ] Export speech to audio file
- [ ] Text import from file
- [ ] Custom voice profiles
- [ ] Speech rate visualization
- [ ] Batch text processing
- [ ] Theme customization
- [ ] Multi-language support
- [ ] Progressive Web App (PWA) features

## Troubleshooting

### No Voices Available
- Ensure your browser supports the Web Speech API
- Some browsers load voices asynchronously - refresh the page if needed
- Check browser permissions for speech synthesis

### Speech Not Working
- Verify your system has text-to-speech voices installed
- Check system audio settings
- Try a different browser

### Performance Issues
- Clear browser cache and localStorage
- Reduce text length
- Close other tabs that might be using audio

## Contributing

This is a standalone project built with vanilla web technologies. To contribute:

1. Fork or download the project
2. Make your changes to the HTML, CSS, or JavaScript files
3. Test in multiple browsers
4. Share your improvements!

## License

Free to use and modify. No attribution required, but appreciated!

---

**VoiceStream** - Transform your text into natural-sounding speech instantly with real-time processing.