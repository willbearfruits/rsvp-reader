/**
 * PDF Parser
 * Uses pdf.js to extract text from PDF files
 */

/**
 * Parse PDF file
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Extracted text
 */
export async function parsePdf(file) {
    // pdf.js is loaded globally via CDN
    const pdfjsLib = window.pdfjsLib;

    if (!pdfjsLib) {
        throw new Error('PDF.js library not loaded');
    }

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const textParts = [];

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Concatenate text items
        const pageText = textContent.items
            .map(item => item.str)
            .join(' ');

        textParts.push(pageText);
    }

    return textParts.join('\n\n');
}
