// helper for base path
const BASE_PATH = '/';

// get post ID from URL
function getPostIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// parse front matter from markdown
function parseFrontMatter(markdown) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontMatterRegex);
    
    if (!match) {
        return { metadata: {}, content: markdown };
    }
    
    const frontMatter = match[1];
    const content = match[2];
    
    // parse YAML-like front matter
    const metadata = {};
    frontMatter.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;
        
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // handle arrays [tag1, tag2]
        if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(v => v.trim());
        }
        
        metadata[key] = value;
    });
    
    return { metadata, content };
}

// load and display the post
async function loadPost() {
    const postId = getPostIdFromURL();
    
    if (!postId) {
        displayError('No post ID provided');
        return;
    }
    
    try {
        // fetch the markdown file
        const response = await fetch(`${BASE_PATH}posts/${postId}.md`);
        
        if (!response.ok) {
            throw new Error('Post not found');
        }
        
        const markdown = await response.text();
        const { metadata, content } = parseFrontMatter(markdown);
        
        // render markdown to HTML using marked.js
        const htmlContent = marked.parse(content);
        
        displayPost(metadata, htmlContent);
        
        console.log('post loaded!', metadata);
        
    } catch (error) {
        console.error('error loading post:', error);
        displayError('Post not found');
    }
}

// display the post
function displayPost(metadata, htmlContent) {
    const postDetail = document.getElementById('post-detail');
    if (!postDetail) return;
    
    postDetail.innerHTML = `
        <div class="post-detail-header">
            <div class="post-detail-header-title">
                Blog.${metadata.number || '??'}
            </div>
            <div class="post-detail-header-icons">
                <div class="post-detail-header-icon">
                    <img src="img/icon/tab_deco2.png" alt="">
                </div>
                <div class="post-detail-header-icon">
                    <img src="img/icon/tab_deco1.png" alt="">
                </div>
                <div class="post-detail-header-icon">
                    <a href="/news.html">
                        <img src="img/icon/tab_close.png" alt="close">
                    </a>
                </div>
            </div>
        </div>
        
        <div class="post-detail-content">
            <div class="post-detail-head">
                <div class="post-detail-date">${metadata.date || 'No date'}</div>
                <div class="post-detail-title">${metadata.title || 'Untitled'}</div>
            </div>
            
            <div class="post-detail-body">
                ${htmlContent}
            </div>
        </div>
    `;
}

// display error message
function displayError(message) {
    const postDetail = document.getElementById('post-detail');
    if (!postDetail) return;
    
    postDetail.innerHTML = `
        <div class="post-detail-content" style="padding: 40px; text-align: center;">
            <p style="color: #2f53e8; font-size: 18px;">${message}</p>
            <p style="margin-top: 20px;">
                <a href="/news.html" style="color: #ff88f1;">← Back to list</a>
            </p>
        </div>
    `;
}

// load post when page loads
if (document.getElementById('post-detail')) {
    document.addEventListener('DOMContentLoaded', loadPost);
}