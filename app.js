/**
 * RSVP Reader - Main Application
 */

import { parseFile, isSupported } from './lib/parsers/index.js';
import { tokenize } from './lib/tokenizer.js';
import { splitAtORP, getDelayMultiplier } from './lib/orp.js';
import { createTimingController } from './lib/timing.js';

// DOM Elements
const uploadScreen = document.getElementById('upload-screen');
const readerScreen = document.getElementById('reader-screen');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const loading = document.getElementById('loading');

const wordBefore = document.getElementById('word-before');
const wordOrp = document.getElementById('word-orp');
const wordAfter = document.getElementById('word-after');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

const playBtn = document.getElementById('play-btn');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const closeBtn = document.getElementById('close-btn');
const wpmSlider = document.getElementById('wpm-slider');
const wpmDisplay = document.getElementById('wpm-display');

// Timing Controller
const timer = createTimingController({
    wpm: 150,
    getDelayMultiplier,
    onWord: displayWord,
    onProgress: updateProgress,
    onComplete: onReadingComplete
});

// ============================================
// File Handling
// ============================================

browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
});

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

async function processFile(file) {
    // File size validation (50MB max)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
        alert('File too large. Maximum size is 50MB.');
        return;
    }

    // MIME type validation
    const validMimeTypes = {
        'application/pdf': true,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
        'application/epub+zip': true,
        'text/plain': true,
        'text/markdown': true,
        '': true // Empty MIME type allowed (some systems don't set it)
    };

    if (!validMimeTypes[file.type]) {
        alert('Invalid file type detected. Please use PDF, DOCX, EPUB, TXT, or MD files.');
        return;
    }

    if (!isSupported(file)) {
        alert('Unsupported file type. Please use PDF, DOCX, EPUB, TXT, or MD files.');
        return;
    }

    showLoading(true);

    try {
        const text = await parseFile(file);
        const words = tokenize(text);

        if (words.length === 0) {
            throw new Error('No text content found in file');
        }

        timer.load(words);
        showReader();
        displayWord(words[0], 0);
        updateProgress(0, words.length);

    } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ============================================
// Display
// ============================================

function displayWord(word, index) {
    const parts = splitAtORP(word);
    wordBefore.textContent = parts.before;
    wordOrp.textContent = parts.orp;
    wordAfter.textContent = parts.after;
}

function updateProgress(current, total) {
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    progressBar.style.setProperty('--progress', `${percent}%`);
    progressText.textContent = `${percent}%`;
}

function onReadingComplete() {
    playBtn.classList.remove('playing');
    playBtn.textContent = '▶';
}

// ============================================
// Controls
// ============================================

playBtn.addEventListener('click', () => {
    const isPlaying = timer.toggle();
    playBtn.classList.toggle('playing', isPlaying);
    playBtn.textContent = isPlaying ? '⏸' : '▶';
});

backBtn.addEventListener('click', () => {
    timer.back(10);
});

forwardBtn.addEventListener('click', () => {
    timer.forward(10);
});

closeBtn.addEventListener('click', () => {
    timer.pause();
    showUpload();
});

wpmSlider.addEventListener('input', () => {
    const wpm = parseInt(wpmSlider.value);
    timer.setWPM(wpm);
    wpmDisplay.textContent = `${wpm} WPM`;
});

// Progress bar click to seek
progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    timer.seekPercent(percent);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!readerScreen.classList.contains('active')) return;

    switch (e.code) {
        case 'Space':
            e.preventDefault();
            playBtn.click();
            break;
        case 'ArrowLeft':
            timer.back(5);
            break;
        case 'ArrowRight':
            timer.forward(5);
            break;
        case 'ArrowUp':
            wpmSlider.value = Math.min(1000, parseInt(wpmSlider.value) + 25);
            wpmSlider.dispatchEvent(new Event('input'));
            break;
        case 'ArrowDown':
            wpmSlider.value = Math.max(100, parseInt(wpmSlider.value) - 25);
            wpmSlider.dispatchEvent(new Event('input'));
            break;
        case 'Escape':
            closeBtn.click();
            break;
    }
});

// ============================================
// Screen Navigation
// ============================================

function showUpload() {
    uploadScreen.classList.add('active');
    readerScreen.classList.remove('active');
    fileInput.value = '';
}

function showReader() {
    uploadScreen.classList.remove('active');
    readerScreen.classList.add('active');
}

function showLoading(show) {
    if (show) {
        dropZone.classList.add('hidden');
        loading.classList.remove('hidden');
    } else {
        dropZone.classList.remove('hidden');
        loading.classList.add('hidden');
    }
}

// ============================================
// PWA Service Worker
// ============================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW registered'))
        .catch(err => console.log('SW registration failed:', err));
}
