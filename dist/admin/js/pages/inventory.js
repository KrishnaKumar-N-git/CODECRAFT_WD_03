const InventoryPage = {
  async render() {
    if (!App.user || App.user.role !== 'admin') {
      document.getElementById('page-content').innerHTML = Components.emptyState('🔒', 'Admin access required', '<button class="btn btn-primary" onclick="window.router.navigate(\'/auth\')">Login as Admin</button>');
      return;
    }
    const c = document.getElementById('page-content');
    c.innerHTML = Components.loading();
    try {
      const [prodData, stats] = await Promise.all([
        API.getProducts({ limit: 500, sort: 'stock', order: 'ASC' }),
        API.getInventoryAnalytics()
      ]);
      this.renderDashboard(prodData.products, stats);
    } catch (err) { c.innerHTML = Components.emptyState('⚠️', 'Failed to load inventory'); }
  },

  renderDashboard(products, stats) {
    const c = document.getElementById('page-content');
    
    // Low stock warning banner
    let alertBanner = '';
    if (stats.lowStockCount > 0) {
      const outOfStockCount = products.filter(p => p.stock === 0).length;
      alertBanner = `
        <div style="background:var(--danger);color:#fff;padding:20px;border-radius:12px;margin-bottom:24px;display:flex;align-items:center;gap:16px;box-shadow:0 8px 24px rgba(239,68,68,0.3);border-left:8px solid #991b1b">
          <div style="font-size:2rem">⚠️</div>
          <div style="flex:1">
            <h3 style="margin:0;font-size:1.3rem;font-weight:800;letter-spacing:-0.01em">CRITICAL INVENTORY ALERT</h3>
            <p style="margin:4px 0 0;opacity:0.95;font-weight:500">
              There are <strong>${stats.lowStockCount}</strong> items requiring immediate attention. 
              ${outOfStockCount > 0 ? `<span style="background:#991b1b;padding:2px 8px;border-radius:4px;margin-left:8px">${outOfStockCount} ARE COMPLETELY OUT OF STOCK</span>` : ''}
            </p>
          </div>
          <button class="btn btn-primary" style="background:#fff;color:var(--danger);font-weight:700" onclick="document.querySelector('input[type=number]')?.focus()">Review Items</button>
        </div>
      `;
    }

    c.innerHTML = `
      <div class="section-header"><h2>📦 Inventory <span>Management</span></h2></div>
      
      ${alertBanner}

      <div class="stats-row">
        <div class="stat-card fade-in-up">
          <div class="stat-value">${products.length}</div>
          <div class="stat-label">Total SKUs</div>
        </div>
        <div class="stat-card fade-in-up" style="animation-delay:100ms">
          <div class="stat-value" style="color:var(--copper-light)">${Components.formatPrice(stats.totalValue)}</div>
          <div class="stat-label">Total Inventory Value</div>
        </div>
        <div class="stat-card fade-in-up" style="animation-delay:200ms; ${stats.lowStockCount > 0 ? 'border-bottom:3px solid var(--danger)' : ''}">
          <div class="stat-value" style="color:${stats.lowStockCount > 0 ? 'var(--danger)' : 'var(--text-primary)'}">${stats.lowStockCount}</div>
          <div class="stat-label">Critical Stock Items</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 300px;gap:24px;margin-top:16px">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
             <h3 style="margin:0">Stock Levels</h3>
             <div style="display:flex;gap:8px">
               <span class="badge" style="background:rgba(239,68,68,0.1);color:var(--danger)">Critcal: ≤ 1</span>
               <span class="badge" style="background:rgba(16,185,129,0.1);color:var(--success)">Healthy: > 1</span>
             </div>
          </div>
          <div class="table-container" style="max-height:600px;overflow-y:auto">
            <table>
              <thead style="position:sticky;top:0;background:var(--bg-lighter);z-index:10">
                <tr>
                  <th>Status</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => {
                  const isLow = p.stock <= 1;
                  const isEmpty = p.stock === 0;
                  return `
                  <tr style="${isEmpty ? 'background:rgba(239,68,68,0.1)' : (isLow ? 'background:rgba(239,68,68,0.05)' : '')}">
                    <td style="text-align:center">
                      ${isEmpty ? '<span class="badge badge-cancelled" style="font-size:0.7rem">OUT OF STOCK</span>' : (isLow ? '<span class="badge" style="background:var(--warning);color:#000;font-size:0.7rem">CRITICAL</span>' : '✅')}
                    </td>
                    <td style="font-weight:600;color:${isLow ? 'var(--danger)' : 'var(--text-primary)'}">${Components.escapeHtml(p.name)}</td>
                    <td style="color:var(--text-secondary)">${p.category ? p.category.name : '-'}</td>
                    <td>
                      <input type="number" id="stock-input-${p.id}" value="${p.stock}" min="0" class="input" style="width:80px;padding:4px 8px;text-align:center;border-color:${isLow ? 'var(--danger)' : 'var(--border-subtle)'}">
                    </td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="InventoryPage.updateStock('${p.id}')">Save</button>
                    </td>
                  </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card" style="align-self:start">
          <h3 style="margin-bottom:16px">Value by Category</h3>
          <canvas id="inventoryChart" width="300" height="300"></canvas>
          <div style="margin-top:24px;display:flex;flex-direction:column;gap:12px">
            ${stats.categoryDistribution.sort((a,b)=>b.value-a.value).map(cat => `
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem">
                <span style="color:var(--text-secondary)">${cat.name}</span>
                <span style="font-weight:600">${Components.formatPrice(cat.value)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.renderChart(stats.categoryDistribution);
  },

  renderChart(distribution) {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) return;
    
    const sorted = [...distribution].sort((a,b) => b.value - a.value);
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: sorted.map(i => i.name),
        datasets: [{
          data: sorted.map(i => i.value),
          backgroundColor: ['#c97d3c', '#3182ce', '#38a169', '#d69e2e', '#e53e3e', '#805ad5']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        cutout: '60%'
      }
    });
  },

  async updateStock(id) {
    const input = document.getElementById(`stock-input-${id}`);
    const newStock = parseInt(input.value);

    if (isNaN(newStock) || newStock < 0) {
      Components.toast('Please enter a valid stock number', 'error');
      return;
    }

    const btn = input.parentElement.nextElementSibling.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
      await API.updateProductStock(id, newStock);

      // Flash the row green on success
      const row = input.closest('tr');
      const origBg = row.style.background;
      row.style.background = 'rgba(16, 185, 129, 0.15)';
      setTimeout(() => row.style.background = origBg, 1200);

      Components.toast('✅ Stock updated successfully', 'success');

      // Refresh after a moment
      setTimeout(() => this.render(), 1200);
    } catch (err) {
      Components.toast(err.message || 'Failed to update stock', 'error');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }
};
