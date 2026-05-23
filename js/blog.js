// helper
const BASE_PATH = '/';

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
async function loadBlogPosts() {
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
                
                console.log('📝 Parsed post:', filename, metadata);

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
        
        // display first 3 posts
        displayBlogPosts(posts.slice(0, 3));
        
        console.log('blog posts loaded!', posts);
        
    } catch (error) {
        console.error('error loading blog posts:', error);
        const blogList = document.getElementById('blog-list');
        if (blogList) {
            blogList.innerHTML = '<li style="color: #2f53e8; padding: 20px;">No blog posts yet! Add a .md file to the posts folder.</li>';
        }
    }
}

// display posts in the blog list
function displayBlogPosts(posts) {
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;
    
    blogList.innerHTML = '';
    
    posts.forEach((post) => {
        const listItem = document.createElement('li');
        listItem.className = 'blog-list-item';
        
        listItem.innerHTML = `
            <div class="blog-list-content">
                <a href="post.html?id=${post.id}" class="blog-list-box">
                    
                    <div class="blog-list-head">
                        <div class="blog-list-head-num">Blog.${post.number}</div>
                        <div class="blog-list-head-deco">
                            <img src="img/kv/deco_pc.png" alt="">
                        </div>
                    </div>
                    
                    <div class="blog-list-inner">
                        <div class="blog-list-date">${post.date}</div>
                        <div class="blog-list-title">
                            ${post.title}
                        </div>
                    </div>
                    
                </a>
            </div>
        `;
        
        blogList.appendChild(listItem);
    });
}

// load posts when page loads
if (document.getElementById('blog-list')) {
    document.addEventListener('DOMContentLoaded', loadBlogPosts);
}
