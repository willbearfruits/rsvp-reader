/**
 * Text Tokenizer
 * 
 * Splits raw text into words suitable for RSVP display.
 * Punctuation is separated into its own tokens for perfect centering.
 */

// Punctuation that should be its own token
const PUNCT_PATTERN = /([.!?,;:'"()[\]{}—–\-…]+)/g;

/**
 * Tokenize text into words, with punctuation as separate tokens
 * @param {string} text - Raw text to tokenize
 * @returns {string[]} - Array of words and punctuation tokens
 */
export function tokenize(text) {
    if (!text || typeof text !== 'string') return [];

    // Normalize whitespace and line breaks
    let normalized = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive line breaks
        .replace(/[ \t]+/g, ' ')      // Collapse spaces
        .trim();

    // Split on whitespace first
    const rawTokens = normalized.split(/\s+/);

    // Process each token to separate punctuation
    const tokens = [];

    for (const token of rawTokens) {
        if (!token) continue;

        // Split token into words and punctuation
        const parts = splitPunctuation(token);
        tokens.push(...parts);
    }

    return tokens.filter(t => t.length > 0);
}

/**
 * Split a token into words and punctuation parts
 * "hello," becomes ["hello", ","]
 * "(test)" becomes ["(", "test", ")"]
 * @param {string} token - Raw token
 * @returns {string[]} - Array of parts
 */
function splitPunctuation(token) {
    const parts = [];

    // Split by punctuation, keeping the punctuation as separate items
    const segments = token.split(PUNCT_PATTERN);

    for (const seg of segments) {
        if (seg && seg.length > 0) {
            parts.push(seg);
        }
    }

    return parts;
}

/**
 * Get word count
 * @param {string} text - Raw text
 * @returns {number} - Word count
 */
export function wordCount(text) {
    return tokenize(text).length;
}

/**
 * Estimate reading time
 * @param {string} text - Raw text
 * @param {number} wpm - Words per minute
 * @returns {number} - Estimated minutes
 */
export function estimateReadingTime(text, wpm = 350) {
    const count = wordCount(text);
    return Math.ceil(count / wpm);
}
