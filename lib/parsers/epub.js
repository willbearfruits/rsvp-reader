/**
 * EPUB Parser
 * Extracts text from EPUB files using JSZip
 */

/**
 * Parse EPUB file
 * @param {File} file - EPUB file object
 * @returns {Promise<string>} - Extracted text
 */
export async function parseEpub(file) {
    // JSZip is loaded globally via CDN
    const JSZip = window.JSZip;

    if (!JSZip) {
        throw new Error('JSZip library not loaded');
    }

    // EPUB is a ZIP file
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Find the container.xml to get the content path
    const containerXml = await zip.file('META-INF/container.xml')?.async('string');
    if (!containerXml) {
        throw new Error('Invalid EPUB: missing container.xml');
    }

    // Parse container.xml to find the OPF file
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, 'application/xml');
    const rootfileEl = containerDoc.querySelector('rootfile');
    const opfPath = rootfileEl?.getAttribute('full-path');

    if (!opfPath) {
        throw new Error('Invalid EPUB: cannot find OPF path');
    }

    // Get the base directory
    const baseDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

    // Read the OPF file
    const opfContent = await zip.file(opfPath)?.async('string');
    if (!opfContent) {
        throw new Error('Invalid EPUB: cannot read OPF file');
    }

    const opfDoc = parser.parseFromString(opfContent, 'application/xml');

    // Get manifest items (HTML/XHTML files)
    const manifest = opfDoc.querySelector('manifest');
    const items = manifest?.querySelectorAll('item') || [];

    // Get spine order
    const spine = opfDoc.querySelector('spine');
    const spineItems = spine?.querySelectorAll('itemref') || [];
    const orderedIds = Array.from(spineItems).map(el => el.getAttribute('idref'));

    // Build map of id -> href
    const itemMap = {};
    items.forEach(item => {
        const id = item.getAttribute('id');
        const href = item.getAttribute('href');
        const mediaType = item.getAttribute('media-type');
        if (mediaType?.includes('html') || mediaType?.includes('xml')) {
            itemMap[id] = href;
        }
    });

    // Read content files in spine order
    const textParts = [];

    for (const id of orderedIds) {
        const href = itemMap[id];
        if (!href) continue;

        const fullPath = baseDir + href;
        const content = await zip.file(fullPath)?.async('string');

        if (content) {
            const text = extractTextFromHtml(content);
            if (text.trim()) {
                textParts.push(text);
            }
        }
    }

    return textParts.join('\n\n');
}

/**
 * Extract text from HTML content
 * @param {string} html - HTML string
 * @returns {string} - Plain text
 */
function extractTextFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove script and style elements
    doc.querySelectorAll('script, style').forEach(el => el.remove());

    // Get text content
    return doc.body?.textContent || '';
}
