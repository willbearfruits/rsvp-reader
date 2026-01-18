/**
 * Service Worker for RSVP Reader
 * Enables offline functionality
 */

const CACHE_NAME = 'rsvp-reader-v1';

const ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/app.js',
    '/lib/orp.js',
    '/lib/tokenizer.js',
    '/lib/timing.js',
    '/lib/parsers/index.js',
    '/lib/parsers/txt.js',
    '/lib/parsers/pdf.js',
    '/lib/parsers/docx.js',
    '/lib/parsers/epub.js',
    '/manifest.json'
];

const EXTERNAL_LIBS = [
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// Install - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Cache local assets
            cache.addAll(ASSETS);
            // Cache external libraries
            return Promise.all(
                EXTERNAL_LIBS.map(url =>
                    fetch(url)
                        .then(response => cache.put(url, response))
                        .catch(err => console.log('Failed to cache:', url))
                )
            );
        })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => {
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

// Fetch - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
