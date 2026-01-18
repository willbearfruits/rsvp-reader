/**
 * Document Parser Index
 * Routes files to appropriate parsers based on type
 */

import { parseTxt, parseMarkdown } from './txt.js';
import { parsePdf } from './pdf.js';
import { parseDocx } from './docx.js';
import { parseEpub } from './epub.js';

/**
 * Parse a file and extract text
 * @param {File} file - File to parse
 * @returns {Promise<string>} - Extracted text
 */
export async function parseFile(file) {
    const extension = getExtension(file.name);

    switch (extension) {
        case 'pdf':
            return await parsePdf(file);

        case 'docx':
            return await parseDocx(file);

        case 'epub':
            return await parseEpub(file);

        case 'md':
        case 'markdown':
            return await parseMarkdown(file);

        case 'txt':
        case 'text':
        default:
            return await parseTxt(file);
    }
}

/**
 * Get file extension (lowercase)
 * @param {string} filename - Filename
 * @returns {string} - Extension without dot
 */
function getExtension(filename) {
    const parts = filename.toLowerCase().split('.');
    return parts.length > 1 ? parts.pop() : 'txt';
}

/**
 * Check if file type is supported
 * @param {File} file - File to check
 * @returns {boolean}
 */
export function isSupported(file) {
    const extension = getExtension(file.name);
    return ['pdf', 'docx', 'epub', 'txt', 'text', 'md', 'markdown'].includes(extension);
}
