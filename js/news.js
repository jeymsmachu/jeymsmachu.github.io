// helper for base path
const BASE_PATH = '/';

// pagination settings
const POSTS_PER_PAGE = 10;
let currentPage = 1;
let allPosts = [];

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

// load all blog posts
async function loadAllPosts() {
    try {
        // fetch the auto-generated posts list
        const response = await fetch(`${BASE_PATH}posts/posts-list.json`);
        const filenames = await response.json();
        
        // load each post's markdown
        const posts = await Promise.all(
            filenames.map(async (filename) => {
                const postResponse = await fetch(`${BASE_PATH}posts/${filename}`);
                const markdown = await postResponse.text();
                const { metadata, content } = parseFrontMatter(markdown);
                
                return {
                    filename,
                    id: filename.replace('.md', ''),
                    ...metadata,
                    content
                };
            })
        );
        
        // sort by date (newest first)
        posts.sort((a, b) => {
            const dateA = new Date(a.date.replace(/\./g, '-'));
            const dateB = new Date(b.date.replace(/\./g, '-'));
            return dateB - dateA;
        });
        
        allPosts = posts;
        displayPage(1);
        
        console.log('✅ All posts loaded!', posts);
        
    } catch (error) {
        console.error('❌ Error loading posts:', error);
        const newsList = document.getElementById('news-list');
        if (newsList) {
            newsList.innerHTML = '<li style="color: #2f53e8; padding: 20px;">No blog posts yet!</li>';
        }
    }
}

// display posts for a specific page
function displayPage(page) {
    currentPage = page;
    
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const postsToShow = allPosts.slice(startIndex, endIndex);
    
    displayNewsList(postsToShow);
    displayPagination();
}

// display the news list
function displayNewsList(posts) {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;
    
    newsList.innerHTML = '';
    
    posts.forEach((post) => {
        const listItem = document.createElement('li');
        listItem.className = 'news-list-item';
        
        listItem.innerHTML = `
            <a href="/post/?id=${post.id}" class="news-list-link">
                <div class="news-list-date">${post.date}</div>
                <div class="news-list-title">${post.title}</div>
            </a>
        `;
        
        newsList.appendChild(listItem);
    });
}

// display pagination
function displayPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<ul class="pagination-list">';
    
    // page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<li class="pagination-item is-current"><span>${i}</span></li>`;
        } else {
            html += `<li class="pagination-item"><a href="#" data-page="${i}">${i}</a></li>`;
        }
    }
    
    html += '</ul>';
    
    // navigation arrows
    html += '<div class="pagination-nav">';
    
    // previous arrow
    if (currentPage > 1) {
        html += `<a href="#" class="pagination-arrow pagination-prev" data-page="${currentPage - 1}">←</a>`;
    } else {
        html += `<span class="pagination-arrow pagination-prev disabled">←</span>`;
    }
    
    // next arrow
    if (currentPage < totalPages) {
        html += `<a href="#" class="pagination-arrow pagination-next" data-page="${currentPage + 1}">→</a>`;
    } else {
        html += `<span class="pagination-arrow pagination-next disabled">→</span>`;
    }
    
    html += '</div>';
    
    pagination.innerHTML = html;
    
    // add click handlers
    pagination.querySelectorAll('a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(link.dataset.page);
            displayPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// load posts when page loads
if (document.getElementById('news-list')) {
    document.addEventListener('DOMContentLoaded', loadAllPosts);
}