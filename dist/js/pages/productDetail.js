const ProductDetailPage = {
  async render(id) {
    const c = document.getElementById('page-content');
    c.innerHTML = Components.loading();
    try {
      const [product, reviewData] = await Promise.all([
        API.getProduct(id),
        API.getReviews(id).catch(() => ({ reviews: [], avgRating: 0, total: 0 })),
      ]);
      this.renderDetail(product, reviewData);
    } catch (err) { c.innerHTML = Components.emptyState('⚠️', 'Product not found'); }
  },

  renderDetail(p, reviewData = { reviews: [], avgRating: 0, total: 0 }) {
    const c = document.getElementById('page-content');
    const catName = p.category ? p.category.name : '';
    const icon = Components.productIcon(catName);
    const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const specs = p.specifications || {};
    const { reviews, avgRating, total } = reviewData;

    c.innerHTML = `
      <button class="back-link" onclick="window.router.navigate('/products')">← Back to Products</button>
      
      <div class="product-detail">
        <div class="product-detail-hero-section">
          ${Components.productImageGallery(p.images, p.name, icon)}
        </div>
        <div class="product-detail-info">
          <div style="font-size:0.75rem;color:var(--blue-light);text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:8px">${Components.escapeHtml(catName)}</div>
          <h1>${Components.escapeHtml(p.name)}</h1>
          <div style="display:flex;align-items:center;gap:12px;margin:10px 0">
            <div style="color:var(--warning)">${Components.stars(avgRating || p.rating)}</div>
            <span style="color:var(--text-muted);font-size:0.85rem">${avgRating || p.rating}/5 · ${total} review${total !== 1 ? 's' : ''}</span>
          </div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">SKU: ${p.sku || '—'}</div>
          
          <div class="price-section">
            <span class="detail-price">${Components.formatPrice(p.price)}</span>
            ${p.originalPrice ? `<span class="detail-original">${Components.formatPrice(p.originalPrice)}</span>` : ''}
            ${discount > 0 ? `<span class="detail-discount">${discount}% OFF</span>` : ''}
          </div>

          <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;margin-bottom:24px">${Components.escapeHtml(p.description)}</p>

          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
            <span style="font-size:0.85rem;color:${p.stock>0?'var(--success)':'var(--danger)'}">
              ${p.stock > 0 ? `✓ ${p.stock} in stock` : '✗ Out of stock'}
            </span>
          </div>

          <div style="display:flex;gap:12px;margin-bottom:32px">
            <button class="btn btn-primary btn-lg" onclick="App.addToCart('${p.id}')" ${p.stock===0?'disabled':''}>🛒 Add to Cart</button>
            <button class="btn btn-secondary btn-lg" onclick="App.addToCart('${p.id}');window.router.navigate('/cart')" ${p.stock===0?'disabled':''}>Buy Now</button>
          </div>

          ${Object.keys(specs).length ? `
            <h3 style="margin-bottom:12px;font-size:1rem;text-transform:uppercase;letter-spacing:0.04em">Specifications</h3>
            <table class="specs-table">
              ${Object.entries(specs).map(([k, v]) => `
                <tr><td>${k.replace(/_/g,' ')}</td><td style="color:var(--text-primary);font-weight:600">${v}</td></tr>
              `).join('')}
            </table>
          ` : ''}
        </div>
      </div>

      <!-- ====== REVIEWS SECTION ====== -->
      <div class="reviews-section" id="reviews-section">
        <div class="section-header" style="margin-top:56px">
          <h2>⭐ Customer <span>Reviews</span></h2>
          <span style="font-size:0.85rem;color:var(--text-muted)">${total} review${total!==1?'s':''}</span>
        </div>

        <div class="reviews-layout">
          <!-- Submit Review Form -->
          <div class="review-form-card">
            <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.04em">Write a Review</h3>
            <div class="input-group">
              <label>Your Name *</label>
              <input class="input" id="rv-name" placeholder="e.g. Rajesh Kumar" maxlength="80">
            </div>
            <div class="input-group">
              <label>Rating *</label>
              <div class="star-rating" id="star-rating" data-rating="0">
                ${[1,2,3,4,5].map(n => `<span class="star-btn" data-val="${n}" onclick="ProductDetailPage.setRating(${n})">★</span>`).join('')}
              </div>
              <input type="hidden" id="rv-rating" value="0">
            </div>
            <div class="input-group">
              <label>Comment (optional)</label>
              <textarea class="textarea" id="rv-comment" placeholder="Share your experience with this product..." maxlength="500"></textarea>
            </div>
            <button class="btn btn-primary" style="width:100%" id="rv-submit-btn" onclick="ProductDetailPage.submitReview('${p.id}')">Submit Review</button>
          </div>

          <!-- Reviews List -->
          <div class="reviews-list" id="reviews-list">
            ${total === 0
              ? `<div class="empty-state" style="padding:40px 20px"><div class="empty-icon">💬</div><p>No reviews yet. Be the first!</p></div>`
              : reviews.map(r => this.reviewCard(r)).join('')
            }
          </div>
        </div>
      </div>
    `;
  },

  setRating(val) {
    document.getElementById('rv-rating').value = val;
    document.querySelectorAll('.star-btn').forEach((s, i) => {
      s.classList.toggle('active', i < val);
    });
  },

  reviewCard(r) {
    const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '';
    return `
      <div class="review-card fade-in-up">
        <div class="review-header">
          <div class="review-avatar">${(r.name || 'A')[0].toUpperCase()}</div>
          <div>
            <div class="review-name">${Components.escapeHtml(r.name)}</div>
            <div class="review-date">${date}</div>
          </div>
          <div class="review-stars">${Components.stars(r.rating)}</div>
        </div>
        ${r.comment ? `<p class="review-comment">${Components.escapeHtml(r.comment)}</p>` : ''}
      </div>
    `;
  },

  async submitReview(productId) {
    const name   = document.getElementById('rv-name').value.trim();
    const rating = parseInt(document.getElementById('rv-rating').value || '0');
    const comment = document.getElementById('rv-comment').value.trim();

    if (!name) { Components.toast('Please enter your name', 'error'); return; }
    if (!rating) { Components.toast('Please select a star rating', 'error'); return; }

    const btn = document.getElementById('rv-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
      const review = await API.postReview(productId, { name, rating, comment });
      Components.toast('Thank you for your review! ⭐', 'success');

      // Prepend new review to list
      const list = document.getElementById('reviews-list');
      const empty = list.querySelector('.empty-state');
      if (empty) empty.remove();
      list.insertAdjacentHTML('afterbegin', this.reviewCard(review));

      // Reset form
      document.getElementById('rv-name').value = '';
      document.getElementById('rv-comment').value = '';
      document.getElementById('rv-rating').value = '0';
      document.querySelectorAll('.star-btn').forEach(s => s.classList.remove('active'));
    } catch (err) {
      Components.toast(err.message || 'Failed to submit review', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Review';
    }
  },
};
