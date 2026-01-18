# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSVP Reader is a Spritz-style speed reading web application with Optimal Recognition Point (ORP) highlighting. It's built as a Progressive Web App (PWA) that can be packaged as an Android APK using Capacitor.

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Run local development server
npm start
# OR
python3 -m http.server 8080
# Open http://localhost:8080
```

### Capacitor (Android APK)
```bash
# Add Android platform (first time only)
npm run cap:add

# Sync web files to native project
npm run cap:sync

# Open in Android Studio
npm run cap:open
```

Note: There is no build step for the web app - it uses vanilla JavaScript modules.

## Architecture

### Core Data Flow

1. **File Upload** → **Parser** → **Tokenizer** → **Timing Controller** → **Display**

The app follows a pipeline architecture:
- User uploads a file (PDF, DOCX, EPUB, TXT, MD)
- Appropriate parser extracts raw text
- Tokenizer splits text into words and punctuation tokens
- Timing controller manages playback with WPM-based delays
- ORP calculator determines word highlighting for display

### Key Modules

**lib/parsers/index.js** - Router that delegates to format-specific parsers
- Each parser (pdf.js, docx.js, epub.js, txt.js) returns raw text string
- PDF uses pdf.js CDN library (loaded globally in index.html)
- DOCX and EPUB use browser-side zip/xml parsing

**lib/tokenizer.js** - Text → Token Array
- Splits text on whitespace
- Separates punctuation into standalone tokens (e.g., "hello," → ["hello", ","])
- This separation ensures proper centering and delay timing

**lib/orp.js** - Optimal Recognition Point calculation
- `splitAtORP(word)` returns `{before, orp, after}` parts
- ORP logic: even-length words highlight 2 middle chars, odd-length highlight 1 center char
- Punctuation is preserved but doesn't affect ORP calculation
- `getDelayMultiplier(token)` adjusts pause times: sentence-ending punctuation (2.0x), commas/semicolons (1.2x), other punct (0.8x), words (1.0x)

**lib/timing.js** - Playback engine
- `createTimingController()` returns stateful controller object
- Manages word-by-word iteration with setTimeout-based scheduling
- WPM → base delay, multiplied by token-specific delay from `getDelayMultiplier()`
- Methods: play(), pause(), toggle(), seek(), back(), forward(), setWPM()

**app.js** - Main application controller
- DOM manipulation and event handling
- Orchestrates file upload → parsing → tokenization → playback
- Keyboard shortcuts: Space (play/pause), arrows (navigation/speed), Esc (close)

### Display Architecture

The word display uses a three-part DOM structure for perfect centering:
```html
<span id="word-before">hel</span>
<span id="word-orp">lo</span>  <!-- highlighted -->
<span id="word-after"></span>
```

This ensures the ORP character(s) stay perfectly centered as words change length.

### PWA Structure

- **manifest.json** - PWA manifest for installability
- **sw.js** - Service worker for offline caching
- **index.html** - Single-page app shell with CDN dependencies

## External Dependencies

Loaded via CDN in index.html:
- **pdf.js** (3.11.174) - PDF parsing
- **mammoth.js** (1.6.0) - DOCX parsing
- **JSZip** (3.10.1) - ZIP file handling for DOCX/EPUB
- **DOMParser** (built-in) - XML parsing for EPUB

Note: These are loaded globally, not via npm imports.

## Capacitor Configuration

- **capacitor.config.ts** - App ID: `com.seriousshit.rsvpreader`
- **webDir: '.'** - Capacitor serves from root directory (no build step)
- APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

## Testing Approach

This app has no automated tests. Manual testing focuses on:
1. File format support (PDF, DOCX, EPUB, TXT, MD)
2. ORP highlighting accuracy (even vs odd length words)
3. Timing accuracy at various WPM settings
4. Keyboard shortcuts functionality
5. Progress bar seeking
