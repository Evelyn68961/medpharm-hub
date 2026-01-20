const config = require('../config');

async function fetchPosts() {
    try {
        const url = `https://docs.google.com/document/d/${config.googleDocId}/export?format=txt`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const text = await response.text();
        const posts = parsePostsFromText(text);
        return posts;

    } catch (error) {
        console.error('Error fetching Google Doc:', error.message);
        return [];
    }
}

function parsePostsFromText(text) {
    const posts = [];
    
    const sections = text.split(/###\s+/);

    sections.forEach(section => {
        if (!section.trim()) return;

        // Match pattern: "20260121 [EN]" or "20260121 [ZH]" (title on next line)
        const headerMatch = section.match(/^(\d{8})\s+\[(EN|ZH)\]\s*[\n\r]+(.+?)[\n\r]/);
        
        if (headerMatch) {
            const id = headerMatch[1];
            const lang = headerMatch[2].toLowerCase();
            const title = headerMatch[3].trim();
            const rawContent = section.slice(headerMatch[0].length).trim().replace(/^[\s\n\r]+/, '');

            const content = rawContent
                .replace(/\r\n/g, '\n')           // Normalize Windows line endings
                .replace(/\r/g, '\n')             // Normalize old Mac line endings
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // Bold
                .replace(/\n{2,}/g, '<br><br>')   // Blank lines → paragraph break
                .replace(/\n/g, '<br>');          // Single newlines → line break
            
            const summary = content.slice(0, 150).replace(/\n/g, ' ') + '...';
            const date = `${id.slice(0,4)}/${id.slice(4,6)}/${id.slice(6,8)}`;

            // Only match hashtags at end of content (last 200 chars)
            const endSection = content.slice(-200);
            const tagMatches = endSection.match(/#([a-zA-Z]\w*)/g) || [];
            const tags = tagMatches.map(tag => tag.slice(1));

            posts.push({
                id: `${id}-${lang}`,
                date,
                title,
                summary,
                content,
                tags,
                lang
            });
        }
    });

    return posts;
}

module.exports = { fetchPosts };