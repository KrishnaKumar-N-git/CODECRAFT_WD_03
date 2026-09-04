/**
 * SMK Motor Spare Parts — Client API System
 * Features auto-fallback to local cache/mock data on static hosts (e.g. Netlify)
 */

const FALLBACK_CATEGORIES = [
  { _id: 'cat_motors', id: 'cat_motors', name: 'Submersible Motors', description: 'High-performance submersible pump motors', icon: '⚡' },
  { _id: 'cat_wires', id: 'cat_wires', name: 'Copper Winding Wire', description: 'Premium grade copper winding wires', icon: '🟤' },
  { _id: 'cat_capacitors', id: 'cat_capacitors', name: 'Capacitors', description: 'Motor start and run capacitors', icon: '🔋' },
  { _id: 'cat_acc', id: 'cat_acc', name: 'Pump Accessories', description: 'Impellers, seals, and mechanical parts', icon: '🔧' },
  { _id: 'cat_panels', id: 'cat_panels', name: 'Control Panels', description: 'Starter panels and protection devices', icon: '🎛️' },
  { _id: 'cat_pipes', id: 'cat_pipes', name: 'Pipes & Fittings', description: 'Drop pipes and connectors', icon: '🔩' }
];

const FALLBACK_PRODUCTS = JSON.parse(localStorage.getItem('smk_local_products') || 'null') || [
  {
    _id: '6a848960e70cde70f3b39418', id: '6a848960e70cde70f3b39418', sku: 'PF-NRV-2-BR',
    name: 'Non-Return Valve 2" Brass',
    description: 'Heavy-duty brass non-return valve to prevent water backflow in submersible installations.',
    price: 550, originalPrice: 650, stock: 69,
    categoryId: FALLBACK_CATEGORIES[5], category: FALLBACK_CATEGORIES[5],
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
    featured: true, rating: 5.0,
    specifications: { material: 'Brass', size: '2 inch' }
  },
  {
    _id: 'p_v4_15', id: 'p_v4_15', sku: 'SM-V4-15HP',
    name: 'V4 Submersible Motor 1.5 HP',
    description: 'High-efficiency V4 submersible motor designed for 4-inch borewells.',
    price: 4500, originalPrice: 5200, stock: 25,
    categoryId: FALLBACK_CATEGORIES[0], category: FALLBACK_CATEGORIES[0],
    image: 'https://images.unsplash.com/photo-1617469165786-8007eda3caa7?w=400&q=80',
    featured: true, rating: 4.5,
    specifications: { hp: '1.5 HP', voltage: '220V', phase: 'Single Phase', size: '4 inch (V4)' }
  },
  {
    _id: 'p_v4_3', id: 'p_v4_3', sku: 'SM-V4-3HP',
    name: 'V4 Submersible Motor 3 HP',
    description: 'Powerful 3 HP V4 submersible motor for deep borewell applications.',
    price: 7800, originalPrice: 8500, stock: 18,
    categoryId: FALLBACK_CATEGORIES[0], category: FALLBACK_CATEGORIES[0],
    image: 'https://images.unsplash.com/photo-1590483734731-155e9668469d?w=400&q=80',
    featured: true, rating: 4.7,
    specifications: { hp: '3 HP', voltage: '220V', phase: 'Single Phase', size: '4 inch (V4)' }
  },
  {
    _id: 'p_v6_5', id: 'p_v6_5', sku: 'SM-V6-5HP',
    name: 'V6 Submersible Motor 5 HP',
    description: 'Industrial-grade V6 submersible motor for commercial water supply.',
    price: 14500, originalPrice: 16000, stock: 10,
    categoryId: FALLBACK_CATEGORIES[0], category: FALLBACK_CATEGORIES[0],
    image: 'https://images.unsplash.com/photo-1621905252507-b35482cd84b0?w=400&q=80',
    featured: true, rating: 4.8,
    specifications: { hp: '5 HP', voltage: '415V', phase: 'Three Phase', size: '6 inch (V6)' }
  },
  {
    _id: 'p_cw_18', id: 'p_cw_18', sku: 'CW-18SWG-1KG',
    name: 'Copper Winding Wire 18 SWG — 1kg',
    description: 'Premium enamelled copper winding wire, 18 SWG gauge.',
    price: 950, originalPrice: 1100, stock: 100,
    categoryId: FALLBACK_CATEGORIES[1], category: FALLBACK_CATEGORIES[1],
    image: 'https://images.unsplash.com/photo-1558449028-b53a39d100dc?w=400&q=80',
    featured: true, rating: 4.4,
    specifications: { gauge: '18 SWG', weight: '1 kg', purity: '99.9% Copper' }
  },
  {
    _id: 'p_cap_150', id: 'p_cap_150', sku: 'CAP-START-150',
    name: 'Motor Start Capacitor 150µF',
    description: 'High-quality motor start capacitor for submersible motors.',
    price: 280, originalPrice: 350, stock: 200,
    categoryId: FALLBACK_CATEGORIES[2], category: FALLBACK_CATEGORIES[2],
    image: 'https://images.unsplash.com/photo-1590674872081-42021516ebcd?w=400&q=80',
    featured: false, rating: 4.1,
    specifications: { capacitance: '150 µF', voltage: '250V AC' }
  },
  {
    _id: 'p_acc_seal', id: 'p_acc_seal', sku: 'PA-SEAL-22',
    name: 'Mechanical Seal 22mm',
    description: 'Premium mechanical shaft seal for submersible pumps.',
    price: 380, originalPrice: 450, stock: 120,
    categoryId: FALLBACK_CATEGORIES[3], category: FALLBACK_CATEGORIES[3],
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80',
    featured: true, rating: 4.4,
    specifications: { size: '22mm', material: 'SiC/Carbon' }
  },
  {
    _id: 'p_pan_dol', id: 'p_pan_dol', sku: 'CP-DOL-3HP',
    name: 'DOL Starter Panel 3 HP',
    description: 'Direct On-Line starter panel with overload protection.',
    price: 2400, originalPrice: 2800, stock: 20,
    categoryId: FALLBACK_CATEGORIES[4], category: FALLBACK_CATEGORIES[4],
    image: 'https://images.unsplash.com/photo-1558449028-c44d7e10816a?w=400&q=80',
    featured: true, rating: 4.6,
    specifications: { type: 'DOL Starter', hp: '3 HP', phase: 'Single Phase' }
  }
];

const API = {
  base: '/api',
  token: localStorage.getItem('token') || null,

  async request(path, options = {}) {
    const config = { headers: { 'Content-Type': 'application/json' }, ...options };
    if (this.token) config.headers['Authorization'] = `Bearer ${this.token}`;
    if (config.body && typeof config.body === 'object') config.body = JSON.stringify(config.body);

    try {
      const res = await fetch(`${this.base}${path}`, config);
      if (res.status === 401) {
        this.clearToken();
        localStorage.removeItem('user');
        if (typeof App !== 'undefined' && App.syncUser) App.syncUser();
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API Error');
      return data;
    } catch (err) {
      console.warn(`⚠️ API Call failed for ${path}, using static mode fallback:`, err.message);
      return this.handleFallback(path, options);
    }
  },

  handleFallback(path, options = {}) {
    const cleanPath = path.split('?')[0];

    // Single Product GET /products/:id
    if (cleanPath.startsWith('/products/') && cleanPath.length > 10) {
      const id = cleanPath.replace('/products/', '');
      const p = FALLBACK_PRODUCTS.find(x => x._id === id || x.id === id) || FALLBACK_PRODUCTS[0];
      return Promise.resolve(p);
    }

    // Products List GET /products
    if (cleanPath === '/products') {
      let prods = [...FALLBACK_PRODUCTS];
      const params = new URLSearchParams(path.split('?')[1] || '');
      const search = params.get('search');
      const cat = params.get('category');
      if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      if (cat) prods = prods.filter(p => (p.categoryId?._id === cat || p.categoryId === cat || p.category?._id === cat));

      return Promise.resolve({
        products: prods,
        total: prods.length,
        page: 1,
        totalPages: 1
      });
    }

    // Categories GET /categories
    if (cleanPath === '/categories') {
      return Promise.resolve(FALLBACK_CATEGORIES);
    }

    // Cart GET /cart
    if (cleanPath === '/cart') {
      const cart = JSON.parse(localStorage.getItem('smk_cart') || '[]');
      return Promise.resolve({ items: cart, count: cart.length, total: cart.reduce((s,i)=>s+(i.price*i.quantity),0) });
    }

    // Reviews GET /reviews/:productId
    if (cleanPath.startsWith('/reviews/')) {
      const revs = JSON.parse(localStorage.getItem('smk_reviews') || '[]');
      return Promise.resolve({ reviews: revs, avgRating: 5.0, total: revs.length });
    }

    // Default fallback
    return Promise.resolve({ success: true, message: 'Static Mode Fallback' });
  },

  setToken(t) { this.token = t; localStorage.setItem('token', t); },
  clearToken() { this.token = null; localStorage.removeItem('token'); },

  // Products
  getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/products?${qs}`);
  },
  getProduct(id) { return this.request(`/products/${id}`); },
  createProduct(d) { return this.request('/products', { method: 'POST', body: d }); },
  updateProduct(id, d) { return this.request(`/products/${id}`, { method: 'PUT', body: d }); },
  deleteProduct(id) { return this.request(`/products/${id}`, { method: 'DELETE' }); },

  // Categories
  getCategories() { return this.request('/categories'); },

  // Cart
  getCart() { return this.request(`/cart?sessionId=${App.sessionId}`); },
  addToCart(productId, qty = 1) { return this.request('/cart', { method: 'POST', body: { sessionId: App.sessionId, productId, quantity: qty } }); },
  updateCartItem(id, qty) { return this.request(`/cart/${id}`, { method: 'PUT', body: { quantity: qty } }); },
  removeCartItem(id) { return this.request(`/cart/${id}`, { method: 'DELETE' }); },
  clearCart() { return this.request(`/cart/clear/${App.sessionId}`, { method: 'DELETE' }); },

  // Orders
  placeOrder(d) { return this.request('/orders', { method: 'POST', body: { ...d, sessionId: App.sessionId } }); },
  getOrders(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/orders?${qs}`); },
  getOrder(id) { return this.request(`/orders/${id}`); },
  updateOrder(id, d) { return this.request(`/orders/${id}`, { method: 'PUT', body: d }); },
  trackOrder(id) { return this.request(`/orders/track/${id}`); },
  updateOrderPublic(id, d) { return this.request(`/orders/track/${id}`, { method: 'PUT', body: d }); },

  // Auth
  login(d) { return this.request('/auth/login', { method: 'POST', body: d }); },
  register(d) { return this.request('/auth/register', { method: 'POST', body: d }); },
  getProfile() { return this.request('/auth/profile'); },
  updateProfile(d) { return this.request('/auth/profile', { method: 'PUT', body: d }); },

  // OTP
  sendOTP(phone) { return this.request('/otp/send', { method: 'POST', body: { phone } }); },
  verifyOTP(phone, code) { return this.request('/otp/verify', { method: 'POST', body: { phone, code } }); },

  // Reviews
  getReviews(productId) { return this.request(`/reviews/${productId}`); },
  postReview(productId, d) { return this.request(`/reviews/${productId}`, { method: 'POST', body: d }); },

  // Support
  submitEnquiry(d) { return this.request('/support', { method: 'POST', body: d }); },
};
