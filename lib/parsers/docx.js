/**
 * DOCX Parser
 * Uses mammoth.js to extract text from DOCX files
 */

/**
 * Parse DOCX file
 * @param {File} file - DOCX file object
 * @returns {Promise<string>} - Extracted text
 */
export async function parseDocx(file) {
    // mammoth is loaded globally via CDN
    const mammoth = window.mammoth;

    if (!mammoth) {
        throw new Error('Mammoth.js library not loaded');
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Extract raw text
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (result.messages.length > 0) {
        console.warn('DOCX parsing warnings:', result.messages);
    }

    return result.value;
}
