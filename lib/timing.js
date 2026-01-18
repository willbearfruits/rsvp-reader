/**
 * Timing Engine
 * 
 * Controls the playback timing for RSVP display.
 */

/**
 * Convert WPM to base delay in milliseconds
 * @param {number} wpm - Words per minute
 * @returns {number} - Delay in milliseconds
 */
export function wpmToDelay(wpm) {
    return Math.round(60000 / wpm);
}

/**
 * Create a timing controller
 * @param {Object} options - Configuration options
 * @returns {Object} - Timing controller instance
 */
export function createTimingController(options = {}) {
    let wpm = options.wpm || 350;
    let isPlaying = false;
    let currentIndex = 0;
    let words = [];
    let timeoutId = null;
    let onWord = options.onWord || (() => { });
    let onComplete = options.onComplete || (() => { });
    let onProgress = options.onProgress || (() => { });
    let getDelayMultiplier = options.getDelayMultiplier || (() => 1);

    function getDelay(word) {
        const baseDelay = wpmToDelay(wpm);
        const multiplier = getDelayMultiplier(word);
        return Math.round(baseDelay * multiplier);
    }

    function tick() {
        if (!isPlaying || currentIndex >= words.length) {
            if (currentIndex >= words.length) {
                isPlaying = false;
                onComplete();
            }
            return;
        }

        const word = words[currentIndex];
        onWord(word, currentIndex);
        onProgress(currentIndex, words.length);

        currentIndex++;

        if (currentIndex < words.length) {
            const delay = getDelay(word);
            timeoutId = setTimeout(tick, delay);
        } else {
            isPlaying = false;
            onComplete();
        }
    }

    return {
        load(wordList) {
            words = wordList;
            currentIndex = 0;
            isPlaying = false;
            if (timeoutId) clearTimeout(timeoutId);
            onProgress(0, words.length);
        },

        play() {
            if (words.length === 0) return;
            if (currentIndex >= words.length) {
                currentIndex = 0;
            }
            isPlaying = true;
            tick();
        },

        pause() {
            isPlaying = false;
            if (timeoutId) clearTimeout(timeoutId);
        },

        toggle() {
            if (isPlaying) {
                this.pause();
            } else {
                this.play();
            }
            return isPlaying;
        },

        seek(index) {
            currentIndex = Math.max(0, Math.min(index, words.length - 1));
            onWord(words[currentIndex], currentIndex);
            onProgress(currentIndex, words.length);
        },

        seekPercent(percent) {
            const index = Math.floor((percent / 100) * words.length);
            this.seek(index);
        },

        back(count = 10) {
            this.seek(currentIndex - count);
        },

        forward(count = 10) {
            this.seek(currentIndex + count);
        },

        setWPM(newWPM) {
            wpm = Math.max(100, Math.min(1000, newWPM));
        },

        getWPM() {
            return wpm;
        },

        isPlaying() {
            return isPlaying;
        },

        getProgress() {
            if (words.length === 0) return 0;
            return (currentIndex / words.length) * 100;
        },

        getCurrentIndex() {
            return currentIndex;
        },

        getWordCount() {
            return words.length;
        }
    };
}
