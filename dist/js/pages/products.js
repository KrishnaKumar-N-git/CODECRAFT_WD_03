const ProductsPage = {
  categories: [],
  activeCategory: '',
  searchQuery: '',
  sortBy: 'createdAt',
  sortOrder: 'DESC',
  minPrice: '',
  maxPrice: '',
  inStockOnly: false,

  async render(params = {}) {
    const c = document.getElementById('page-content');
    c.innerHTML = Components.loading();
    this.activeCategory = params.category || this.activeCategory || '';
    this.searchQuery    = params.search   || this.searchQuery    || '';
    try {
      this.categories = await API.getCategories();
      await this.loadProducts();
    } catch (err) {
      c.innerHTML = Components.emptyState('⚠️', 'Failed to load products');
    }
  },

  async loadProducts() {
    const queryParams = { limit: 60, sort: this.sortBy, order: this.sortOrder };
    if (this.activeCategory) queryParams.category = this.activeCategory;
    if (this.searchQuery)    queryParams.search   = this.searchQuery;
    if (this.minPrice)       queryParams.minPrice = this.minPrice;
    if (this.maxPrice)       queryParams.maxPrice = this.maxPrice;
    if (this.inStockOnly)    queryParams.inStock  = 'true';

    const data = await API.getProducts(queryParams);
    this.renderPage(data);
  },

  renderPage(data) {
    const c = document.getElementById('page-content');
    const { products, total } = data;
    const activeCat = this.categories.find(cat => (cat._id || cat.id) === this.activeCategory);

    c.innerHTML = `
      <div class="fade-in-up">
        <!-- Page Header -->
        <div style="margin-bottom:32px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap">
          <div>
            <h1 style="font-size:2rem;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.03em">
              ${activeCat ? Components.escapeHtml(activeCat.name) : 'Our <span style="color:var(--amber-light)">Catalog</span>'}
            </h1>
            <p style="color:var(--text-secondary);font-size:0.9rem">Showing <strong>${total}</strong> product${total!==1?'s':''}</p>
          </div>
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <!-- Search -->
            <div class="search-bar" style="max-width:300px;width:100%">
              <span class="search-icon">🔍</span>
              <input class="input" id="product-search" type="text" placeholder="Search parts..." value="${Components.escapeHtml(this.searchQuery)}" style="border-radius:var(--radius-full);padding-left:44px">
            </div>
            <!-- Sort -->
            <select class="select" id="sort-select" style="max-width:180px;border-radius:var(--radius-full)" onchange="ProductsPage.onSortChange(this.value)">
              <option value="createdAt|DESC" ${this.sortBy==='createdAt'&&this.sortOrder==='DESC'?'selected':''}>🕐 Newest First</option>
              <option value="price|ASC"      ${this.sortBy==='price'&&this.sortOrder==='ASC'?'selected':''}>💰 Price: Low–High</option>
              <option value="price|DESC"     ${this.sortBy==='price'&&this.sortOrder==='DESC'?'selected':''}>💰 Price: High–Low</option>
              <option value="rating|DESC"    ${this.sortBy==='rating'&&this.sortOrder==='DESC'?'selected':''}>⭐ Top Rated</option>
              <option value="name|ASC"       ${this.sortBy==='name'&&this.sortOrder==='ASC'?'selected':''}>🔤 Name A–Z</option>
            </select>
          </div>
        </div>

        <div class="products-layout">
          <!-- ===== FILTER SIDEBAR ===== -->
          <aside class="filter-sidebar">
            <div class="card" style="padding:20px">
              <h4 style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--amber-light);margin-bottom:14px;font-weight:800">Categories</h4>
              <div class="filter-option ${!this.activeCategory?'active':''}" onclick="ProductsPage.filterByCategory('')" style="padding:8px 10px;border-radius:var(--radius-sm);margin-bottom:4px">
                📦 All Products
              </div>
              ${this.categories.map(cat => `
                <div class="filter-option ${this.activeCategory===(cat._id||cat.id)?'active':''}" onclick="ProductsPage.filterByCategory('${cat._id||cat.id}')" style="padding:8px 10px;border-radius:var(--radius-sm);margin-bottom:4px">
                  ${cat.icon || '⚙️'} ${Components.escapeHtml(cat.name)}
                </div>
              `).join('')}
            </div>

            <!-- Price Range Filter -->
            <div class="card" style="margin-top:16px;padding:20px">
              <h4 style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--amber-light);margin-bottom:14px;font-weight:800">Price Range (₹)</h4>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
                <input class="input" id="min-price" type="number" placeholder="Min" min="0" value="${this.minPrice}" style="font-size:0.85rem">
                <input class="input" id="max-price" type="number" placeholder="Max" min="0" value="${this.maxPrice}" style="font-size:0.85rem">
              </div>
              <button class="btn btn-secondary btn-sm" style="width:100%" onclick="ProductsPage.applyPriceFilter()">Apply Filter</button>
            </div>

            <!-- Availability Filter -->
            <div class="card" style="margin-top:16px;padding:20px">
              <h4 style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--amber-light);margin-bottom:14px;font-weight:800">Availability</h4>
              <label class="filter-option" style="cursor:pointer;padding:6px 0;gap:10px">
                <input type="checkbox" id="in-stock-cb" ${this.inStockOnly?'checked':''} onchange="ProductsPage.onInStockChange(this.checked)" style="accent-color:var(--amber);width:16px;height:16px">
                <span>In Stock Only</span>
              </label>
            </div>

            <!-- Active Filters & Clear -->
            ${(this.activeCategory || this.minPrice || this.maxPrice || this.inStockOnly || this.searchQuery) ? `
              <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:12px;border:1px dashed var(--border-amber);color:var(--amber-light)" onclick="ProductsPage.clearFilters()">
                ✕ Clear All Filters
              </button>
            ` : ''}

            <!-- Enquiry CTA -->
            <div class="card" style="margin-top:16px;padding:20px;border:1px dashed var(--border-amber);background:rgba(245,156,26,0.04)">
              <h4 style="font-size:0.78rem;margin-bottom:6px">Need custom parts?</h4>
              <p style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:12px">Contact our technical team for bulk orders.</p>
              <button class="btn btn-primary btn-sm" style="width:100%" onclick="document.getElementById('support-widget-btn').click()">Enquire Now →</button>
            </div>
          </aside>

          <!-- ===== PRODUCT GRID ===== -->
          <main>
            <div class="product-grid" id="product-grid">
              ${products.length
                ? products.map((p, i) => Components.productCard(p, i)).join('')
                : `<div style="grid-column:1/-1;padding:80px 0">
                     ${Components.emptyState('🔍', `No products found`, `<button class="btn btn-secondary" onclick="ProductsPage.clearFilters()">Clear Filters</button>`)}
                   </div>`
              }
            </div>
          </main>
        </div>
      </div>
    `;

    // Search input handler
    let searchTimeout;
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        this.searchQuery = e.target.value;
        searchTimeout = setTimeout(() => this.loadProducts(), 500);
      });
    }
  },

  onSortChange(val) {
    const [field, order] = val.split('|');
    this.sortBy    = field;
    this.sortOrder = order;
    this.loadProducts();
  },

  applyPriceFilter() {
    this.minPrice = document.getElementById('min-price').value.trim();
    this.maxPrice = document.getElementById('max-price').value.trim();
    this.loadProducts();
  },

  onInStockChange(checked) {
    this.inStockOnly = checked;
    this.loadProducts();
  },

  filterByCategory(catId) {
    this.activeCategory = catId;
    this.loadProducts();
  },

  clearFilters() {
    this.activeCategory = '';
    this.searchQuery    = '';
    this.minPrice       = '';
    this.maxPrice       = '';
    this.inStockOnly    = false;
    this.sortBy         = 'createdAt';
    this.sortOrder      = 'DESC';
    this.render();
  },
};
