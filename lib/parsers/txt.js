/**
 * Plain Text Parser
 * Handles TXT and Markdown files
 */

/**
 * Parse plain text file
 * @param {File} file - File object
 * @returns {Promise<string>} - Extracted text
 */
export async function parseTxt(file) {
    return await file.text();
}

/**
 * Parse Markdown file (strips formatting)
 * @param {File} file - File object
 * @returns {Promise<string>} - Extracted text without markdown syntax
 */
export async function parseMarkdown(file) {
    const text = await file.text();
    return stripMarkdown(text);
}

/**
 * Strip Markdown formatting from text
 * @param {string} md - Markdown text
 * @returns {string} - Plain text
 */
function stripMarkdown(md) {
    let text = md;

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`[^`]+`/g, '');

    // Remove headers
    text = text.replace(/^#{1,6}\s+/gm, '');

    // Remove emphasis
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/__([^_]+)__/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');

    // Remove links
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove images
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

    // Remove blockquotes
    text = text.replace(/^>\s+/gm, '');

    // Remove horizontal rules
    text = text.replace(/^[-*_]{3,}$/gm, '');

    // Remove list markers
    text = text.replace(/^[\s]*[-*+]\s+/gm, '');
    text = text.replace(/^[\s]*\d+\.\s+/gm, '');

    return text.trim();
}
