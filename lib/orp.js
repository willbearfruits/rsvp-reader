/**
 * Optimal Recognition Point (ORP) Calculator
 * 
 * Calculates the optimal fixation point for each word based on its length.
 * The ORP is where the eye naturally wants to land for fastest recognition.
 * Punctuation is ignored for ORP calculation but preserved in display.
 */

// Characters that are considered punctuation (not letters)
const PUNCTUATION = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;
const LEADING_PUNCT = /^[^\p{L}\p{N}]+/u;
const TRAILING_PUNCT = /[^\p{L}\p{N}]+$/u;

/**
 * Strip punctuation from word, returning core letters only
 * @param {string} word - The word to clean
 * @returns {{leading: string, core: string, trailing: string}}
 */
function extractParts(word) {
    const leadingMatch = word.match(LEADING_PUNCT);
    const trailingMatch = word.match(TRAILING_PUNCT);

    const leading = leadingMatch ? leadingMatch[0] : '';
    const trailing = trailingMatch ? trailingMatch[0] : '';

    // Get the core without leading/trailing punctuation
    let core = word;
    if (leading) core = core.slice(leading.length);
    if (trailing) core = core.slice(0, -trailing.length || undefined);

    return { leading, core, trailing };
}

/**
 * Get the ORP index for a word (based on letter count only)
 * @param {string} word - The word to analyze
 * @returns {number} - Zero-based index of the ORP character (start of highlight)
 */
export function getORPIndex(word) {
    const { core } = extractParts(word);
    const len = core.length;

    if (len <= 1) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
}

/**
 * Split a word into three parts: before ORP, ORP char(s), after ORP
 * Punctuation is preserved but doesn't affect ORP position
 * For even-length cores, ORP contains 2 characters
 * @param {string} word - The word to split
 * @returns {{before: string, orp: string, after: string}}
 */
export function splitAtORP(word) {
    if (!word || word.length === 0) {
        return { before: '', orp: '', after: '' };
    }

    const { leading, core, trailing } = extractParts(word);
    const len = core.length;

    if (len === 0) {
        // Word is all punctuation
        return { before: word, orp: '', after: '' };
    }

    let orpStart, orpLen;

    // For even-length words, highlight both middle letters
    if (len % 2 === 0) {
        orpStart = Math.floor(len / 2) - 1;
        orpLen = 2;
    } else {
        // For odd-length words, highlight the true middle letter
        orpStart = Math.floor(len / 2);
        orpLen = 1;
    }

    return {
        before: leading + core.slice(0, orpStart),
        orp: core.slice(orpStart, orpStart + orpLen),
        after: core.slice(orpStart + orpLen) + trailing
    };
}

/**
 * Calculate delay multiplier based on token type
 * Punctuation tokens (now separate) get appropriate pause times
 * @param {string} token - The token to check
 * @returns {number} - Multiplier for display duration
 */
export function getDelayMultiplier(token) {
    // Check if this is a punctuation-only token
    const isPunctOnly = /^[.!?,;:'"()[\]{}—–\-…]+$/.test(token);

    if (isPunctOnly) {
        // End of sentence - longer pause
        if (/[.!?]/.test(token)) return 2.0;

        // Clause break - medium pause
        if (/[,;:]/.test(token)) return 1.2;

        // Other punctuation - brief pause
        return 0.8;
    }

    // Normal word
    return 1.0;
}
