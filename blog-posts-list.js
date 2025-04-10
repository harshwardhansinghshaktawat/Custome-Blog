// CUSTOM ELEMENTS: BLOG POSTS LIST (public/custom-elements/blog-posts-list.js)

class BlogPostsList extends HTMLElement {
    static get observedAttributes() {
        return ['category-id', 'posts-per-page'];
    }
    
    constructor() {
        super();
        this.posts = [];
        this.currentPage = 0;
        this.totalPosts = 0;
        this.hasNextPage = false;
        this.postsPerPage = 10;
        this.categoryId = null;
        this.baseUrl = '';
    }
    
    connectedCallback() {
        this.baseUrl = window.location.origin;
        this.postsPerPage = parseInt(this.getAttribute('posts-per-page') || '10');
        this.categoryId = this.getAttribute('category-id');
        
        this.render();
        this.loadPosts();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        if (name === 'category-id') {
            this.categoryId = newValue;
            this.currentPage = 0;
            this.loadPosts();
        } else if (name === 'posts-per-page') {
            this.postsPerPage = parseInt(newValue || '10');
            this.currentPage = 0;
            this.loadPosts();
        }
    }
    
    render() {
        this.innerHTML = `
            <div class="blog-posts-container">
                <div id="posts-list" class="posts-list"></div>
                <div id="pagination" class="pagination"></div>
            </div>
        `;
        
        this.addStyles();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .blog-posts-container {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .posts-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 30px;
                margin-bottom: 40px;
            }
            
            .post-card {
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
                background: white;
            }
            
            .post-card:hover {
                transform: translateY(-5px);
            }
            
            .post-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }
            
            .post-content {
                padding: 20px;
            }
            
            .post-category {
                display: inline-block;
                font-size: 12px;
                font-weight: bold;
                color: #0078ff;
                text-transform: uppercase;
                margin-bottom: 10px;
            }
            
            .post-title {
                font-size: 20px;
                margin: 0 0 10px;
                line-height: 1.3;
            }
            
            .post-excerpt {
                font-size: 14px;
                color: #666;
                margin-bottom: 15px;
                line-height: 1.5;
            }
            
            .post-meta {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: #999;
            }
            
            .post-date {
                margin-right: 15px;
            }
            
            .read-more {
                display: inline-block;
                padding: 8px 16px;
                background-color: #0078ff;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                transition: background-color 0.3s ease;
            }
            
            .read-more:hover {
                background-color: #0056b3;
            }
            
            .pagination {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 30px;
            }
            
            .pagination-button {
                padding: 8px 16px;
                background-color: #f0f0f0;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.3s ease;
            }
            
            .pagination-button:hover:not(:disabled) {
                background-color: #e0e0e0;
            }
            
            .pagination-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .pagination-info {
                display: flex;
                align-items: center;
                font-size: 14px;
                color: #666;
            }
            
            @media (max-width: 768px) {
                .posts-list {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        this.appendChild(style);
    }
    
    async loadPosts() {
        try {
            const postsContainer = this.querySelector('#posts-list');
            postsContainer.innerHTML = '<div class="loading">Loading posts...</div>';
            
            const skip = this.currentPage * this.postsPerPage;
            const url = new URL('/_functions/get_posts', this.baseUrl);
            
            url.searchParams.append('limit', this.postsPerPage.toString());
            url.searchParams.append('skip', skip.toString());
            
            if (this.categoryId) {
                url.searchParams.append('categoryId', this.categoryId);
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            
            const data = await response.json();
            this.posts = data.items;
            this.totalPosts = data.totalCount;
            this.hasNextPage = data.hasNext;
            
            this.renderPosts();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading posts:', error);
            const postsContainer = this.querySelector('#posts-list');
            postsContainer.innerHTML = '<div class="error">Error loading posts. Please try again later.</div>';
        }
    }
    
    renderPosts() {
        const postsContainer = this.querySelector('#posts-list');
        
        if (this.posts.length === 0) {
            postsContainer.innerHTML = '<div class="no-posts">No posts found</div>';
            return;
        }
        
        postsContainer.innerHTML = this.posts.map(post => this.renderPostCard(post)).join('');
    }
    
    renderPostCard(post) {
        const date = new Date(post.publishedDate);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const coverImage = post.coverImage || 'https://static.wixstatic.com/media/e4e6cc_91529499906b4a6792eaaa474099d76a~mv2.jpg';
        
        return `
            <div class="post-card">
                <img src="${coverImage}" alt="${post.title}" class="post-image">
                <div class="post-content">
                    <div class="post-category">${post.categories?.[0]?.label || 'Uncategorized'}</div>
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-excerpt">${post.excerpt || post.content?.substring(0, 150) + '...'}</p>
                    <div class="post-meta">
                        <span class="post-date">${formattedDate}</span>
                        <span class="post-author">${post.owner?.name || 'Anonymous'}</span>
                    </div>
                    <a href="/blog/${post.slug}" class="read-more">Read More</a>
                </div>
            </div>
        `;
    }
    
    renderPagination() {
        const paginationContainer = this.querySelector('#pagination');
        const totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        const prevDisabled = this.currentPage === 0;
        const nextDisabled = !this.hasNextPage;
        
        paginationContainer.innerHTML = `
            <button id="prev-page" class="pagination-button" ${prevDisabled ? 'disabled' : ''}>Previous</button>
            <div class="pagination-info">Page ${this.currentPage + 1} of ${totalPages}</div>
            <button id="next-page" class="pagination-button" ${nextDisabled ? 'disabled' : ''}>Next</button>
        `;
        
        const prevButton = paginationContainer.querySelector('#prev-page');
        const nextButton = paginationContainer.querySelector('#next-page');
        
        prevButton.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadPosts();
            }
        });
        
        nextButton.addEventListener('click', () => {
            if (this.hasNextPage) {
                this.currentPage++;
                this.loadPosts();
            }
        });
    }
}

customElements.define('blog-posts-list', BlogPostsList);
