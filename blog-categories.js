// CUSTOM ELEMENTS: BLOG CATEGORIES (public/custom-elements/blog-categories.js)

class BlogCategories extends HTMLElement {
    constructor() {
        super();
        this.categories = [];
        this.baseUrl = '';
    }
    
    connectedCallback() {
        this.baseUrl = window.location.origin;
        this.render();
        this.loadCategories();
    }
    
    render() {
        this.innerHTML = `
            <div class="blog-categories-container">
                <div id="categories-list" class="categories-list">
                    <div class="loading">Loading categories...</div>
                </div>
            </div>
        `;
        
        this.addStyles();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .blog-categories-container {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                margin-bottom: 30px;
            }
            
            .categories-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .category-link {
                display: inline-block;
                padding: 8px 16px;
                background-color: #f0f0f0;
                border-radius: 30px;
                text-decoration: none;
                color: #333;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .category-link:hover {
                background-color: #0078ff;
                color: white;
            }
            
            .category-link.active {
                background-color: #0078ff;
                color: white;
            }
            
            .loading, .error {
                padding: 10px;
                color: #666;
            }
            
            .error {
                color: #e74c3c;
            }
        `;
        
        this.appendChild(style);
    }
    
    async loadCategories() {
        try {
            const url = new URL('/_functions/get_categories', this.baseUrl);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            
            this.categories = await response.json();
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            const categoriesContainer = this.querySelector('#categories-list');
            categoriesContainer.innerHTML = '<div class="error">Error loading categories</div>';
        }
    }
    
    renderCategories() {
        const categoriesContainer = this.querySelector('#categories-list');
        
        if (this.categories.length === 0) {
            categoriesContainer.innerHTML = '<div>No categories found</div>';
            return;
        }
        
        // Get current category from URL if any
        const urlParams = new URLSearchParams(window.location.search);
        const currentCategoryId = urlParams.get('category');
        
        categoriesContainer.innerHTML = `
            <a href="/blog" class="category-link ${!currentCategoryId ? 'active' : ''}">All Posts</a>
            ${this.categories.map(category => `
                <a href="/blog?category=${category._id}" 
                   class="category-link ${currentCategoryId === category._id ? 'active' : ''}">
                    ${category.label}
                </a>
            `).join('')}
        `;
    }
}

customElements.define('blog-categories', BlogCategories);
