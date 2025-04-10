// CUSTOM ELEMENTS: BLOG POST DETAIL (public/custom-elements/blog-post-detail.js)

class BlogPostDetail extends HTMLElement {
    static get observedAttributes() {
        return ['post-slug'];
    }
    
    constructor() {
        super();
        this.postSlug = '';
        this.post = null;
        this.relatedPosts = [];
        this.baseUrl = '';
    }
    
    connectedCallback() {
        this.baseUrl = window.location.origin;
        this.postSlug = this.getAttribute('post-slug');
        
        this.render();
        
        if (this.postSlug) {
            this.loadPost();
        }
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'post-slug' && oldValue !== newValue) {
            this.postSlug = newValue;
            this.loadPost();
        }
    }
    
    render() {
        this.innerHTML = `
            <div class="blog-post-container">
                <div id="post-content" class="post-content">
                    <div class="loading">Loading post...</div>
                </div>
                <div id="related-posts" class="related-posts"></div>
            </div>
        `;
        
        this.addStyles();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .blog-post-container {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .post-header {
                margin-bottom: 30px;
            }
            
            .post-categories {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .post-category {
                display: inline-block;
                font-size: 12px;
                font-weight: bold;
                color: #0078ff;
                text-transform: uppercase;
                padding: 4px 8px;
                background-color: rgba(0, 120, 255, 0.1);
                border-radius: 4px;
            }
            
            .post-title {
                font-size: 36px;
                line-height: 1.2;
                margin: 0 0 15px;
                color: #333;
            }
            
            .post-meta {
                display: flex;
                align-items: center;
                color: #666;
                font-size: 14px;
                margin-bottom: 20px;
            }
            
            .post-author {
                font-weight: 500;
                margin-right: 15px;
            }
            
            .post-date {
                color: #888;
            }
            
            .post-cover-image {
                width: 100%;
                max-height: 500px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            
            .post-body {
                font-size: 18px;
                line-height: 1.6;
                color: #444;
            }
            
            .post-body h2 {
                font-size: 28px;
                margin: 40px 0 20px;
            }
            
            .post-body h3 {
                font-size: 24px;
                margin: 30px 0 15px;
            }
            
            .post-body p {
                margin-bottom: 20px;
            }
            
            .post-body img {
                max-width: 100%;
                height: auto;
                border-radius: 4px;
                margin: 20px 0;
            }
            
            .post-body blockquote {
                border-left: 4px solid #0078ff;
                padding-left: 20px;
                margin: 30px 0;
                font-style: italic;
                color: #555;
            }
            
            .related-posts {
                margin-top: 60px;
                padding-top: 40px;
                border-top: 1px solid #eee;
            }
            
            .related-posts-title {
                font-size: 24px;
                margin-bottom: 20px;
            }
            
            .related-posts-list {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
            }
            
            .related-post-card {
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
                background: white;
            }
            
            .related-post-card:hover {
                transform: translateY(-5px);
            }
            
            .related-post-image {
                width: 100%;
                height: 150px;
                object-fit: cover;
            }
            
            .related-post-content {
                padding: 15px;
            }
            
            .related-post-title {
                font-size: 16px;
                margin: 0 0 10px;
                line-height: 1.3;
            }
            
            .related-post-link {
                text-decoration: none;
                color: inherit;
            }
            
            .loading, .error {
                padding: 20px;
                text-align: center;
                color: #666;
            }
            
            .error {
                color: #e74c3c;
            }
            
            @media (max-width: 768px) {
                .post-title {
                    font-size: 28px;
                }
                
                .post-body {
                    font-size: 16px;
                }
                
                .related-posts-list {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        this.appendChild(style);
    }
    
    async loadPost() {
        try {
            const postContainer = this.querySelector('#post-content');
            postContainer.innerHTML = '<div class="loading">Loading post...</div>';
            
            const url = new URL('/_functions/get_post', this.baseUrl);
            url.searchParams.append('slug', this.postSlug);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch post');
            }
            
            const data = await response.json();
            this.post = data.post;
            this.relatedPosts = data.relatedPosts;
            
            this.renderPost();
            this.renderRelatedPosts();
            
            // Update document title for SEO
            document.title = `${this.post.title} | Blog`;
            
            // Update meta description for SEO
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.content = this.post.excerpt || this.post.content.substring(0, 160);
            }
        } catch (error) {
            console.error('Error loading post:', error);
            const postContainer = this.querySelector('#post-content');
            postContainer.innerHTML = '<div class="error">Error loading post. Please try again later.</div>';
        }
    }
    
    renderPost() {
        if (!this.post) return;
        
        const postContainer = this.querySelector('#post-content');
        const date = new Date(this.post.publishedDate);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const categories = this.post.categories || [];
        const coverImage = this.post.coverImage || 'https://static.wixstatic.com/media/e4e6cc_91529499906b4a6792eaaa474099d76a~mv2.jpg';
        
        postContainer.innerHTML = `
            <div class="post-header">
                <div class="post-categories">
                    ${categories.map(category => `
                        <span class="post-category">${category.label}</span>
                    `).join('')}
                </div>
                <h1 class="post-title">${this.post.title}</h1>
                <div class="post-meta">
                    <span class="post-author">By ${this.post.owner?.name || 'Anonymous'}</span>
                    <span class="post-date">${formattedDate}</span>
                </div>
            </div>
            <img src="${coverImage}" alt="${this.post.title}" class="post-cover-image">
            <div class="post-body">${this.post.content}</div>
        `;
    }
    
    renderRelatedPosts() {
        const relatedPostsContainer = this.querySelector('#related-posts');
        
        if (!this.relatedPosts || this.relatedPosts.length === 0) {
            relatedPostsContainer.style.display = 'none';
            return;
        }
        
        relatedPostsContainer.innerHTML = `
            <h2 class="related-posts-title">Related Posts</h2>
            <div class="related-posts-list">
                ${this.relatedPosts.map(post => this.renderRelatedPostCard(post)).join('')}
            </div>
        `;
    }
    
    renderRelatedPostCard(post) {
        const coverImage = post.coverImage || 'https://static.wixstatic.com/media/e4e6cc_91529499906b4a6792eaaa474099d76a~mv2.jpg';
        
        return `
            <div class="related-post-card">
                <a href="/blog/${post.slug}" class="related-post-link">
                    <img src="${coverImage}" alt="${post.title}" class="related-post-image">
                    <div class="related-post-content">
                        <h3 class="related-post-title">${post.title}</h3>
                    </div>
                </a>
            </div>
        `;
    }
}

customElements.define('blog-post-detail', BlogPostDetail);
