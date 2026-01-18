const { google } = require('googleapis');
const config = require('../config');

const docs = google.docs({ version: 'v1', auth: config.googleApiKey });

async function fetchPosts() {
    try {
        // Fetch the document
        const response = await docs.documents.get({
            documentId: config.googleDocId
        });

        const document = response.data;
        const content = document.body.content;

        // Extract text from document
        let fullText = '';
        content.forEach(element => {
            if (element.paragraph) {
                element.paragraph.elements.forEach(el => {
                    if (el.textRun) {
                        fullText += el.textRun.content;
                    }
                });
            }
        });

        // Parse posts by heading pattern (### 20260101 Title)
        const posts = parsePostsFromText(fullText);
        return posts;

    } catch (error) {
        console.error('Error fetching Google Doc:', error.message);
        return [];
    }
}

function parsePostsFromText(text) {
    const posts = [];
    
    // Split by ### headings (your post format)
    const sections = text.split(/###\s+/);

    sections.forEach(section => {
        if (!section.trim()) return;

        // Match pattern: "20260121 Title"
        const headerMatch = section.match(/^(\d{8})\s+(.+?)[\n\r]/);
        
        if (headerMatch) {
            const id = headerMatch[1];
            const title = headerMatch[2].trim();
            const content = section.slice(headerMatch[0].length).trim();
            
            // Create summary (first 150 chars)
            const summary = content.slice(0, 150).replace(/\n/g, ' ') + '...';

            // Format date: 20260121 → 2026/01/21
            const date = `${id.slice(0,4)}/${id.slice(4,6)}/${id.slice(6,8)}`;

            // Extract hashtags as tags
            const tagMatches = content.match(/#\w+/g) || [];
            const tags = tagMatches.map(tag => tag.slice(1));

            posts.push({
                id,
                date,
                title,
                summary,
                content,
                tags
            });
        }
    });

    return posts;
}

module.exports = { fetchPosts };