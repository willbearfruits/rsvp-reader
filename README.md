# RSVP Reader

Spritz-style speed reading app with Optimal Recognition Point (ORP) highlighting.

![Screenshot](docs/screenshot.png)

## Features

- **RSVP Display**: Words shown one at a time, perfectly centered
- **ORP Highlighting**: 
  - Odd-length words: center letter highlighted
  - Even-length words: both middle letters highlighted
- **Multi-format**: PDF, DOCX, EPUB, TXT, Markdown
- **PWA**: Installable, works offline
- **Keyboard shortcuts**: Space (play/pause), arrows (navigate/speed)

## Usage

### Web (Development)

```bash
# Serve locally
python3 -m http.server 8080
# Open http://localhost:8080
```

### Android APK

See [Building APK](#building-apk) below.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| ← | Back 5 words |
| → | Forward 5 words |
| ↑ | Increase WPM |
| ↓ | Decrease WPM |
| Esc | Close reader |

## Building APK

This project uses [Capacitor](https://capacitorjs.com/) to build native Android APKs.

### Prerequisites

1. Node.js 18+
2. Android Studio with SDK
3. Java 17+

### Setup

```bash
# Install dependencies
npm install

# Add Android platform
npx cap add android

# Build and sync
npm run build
npx cap sync
```

### Build APK

```bash
# Open in Android Studio
npx cap open android

# Or build from command line
cd android
./gradlew assembleDebug
```

APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`

## Project Structure

```
rsvp-reader/
├── index.html          # App shell
├── index.css           # Styling
├── app.js              # Main logic
├── manifest.json       # PWA manifest
├── sw.js               # Service worker
├── capacitor.config.ts # Capacitor config
├── package.json        # Dependencies
└── lib/
    ├── orp.js          # ORP calculation
    ├── tokenizer.js    # Text tokenization
    ├── timing.js       # Playback timing
    └── parsers/        # Document parsers
```

## License

MIT
