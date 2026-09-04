const EnquiriesPage = {
  currentStatusFilter: '',

  async render() {
    const c = document.getElementById('page-content');
    c.innerHTML = `
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    `;

    try {
      const data = await API.getEnquiries(this.currentStatusFilter ? { status: this.currentStatusFilter } : {});
      const enquiries = data.enquiries || [];

      c.innerHTML = `
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; margin-bottom:24px;">
          <div>
            <h1 style="font-size:1.75rem; font-weight:700; color:var(--dark-navy);">💬 Customer Support Enquiries</h1>
            <p style="color:var(--slate-gray); font-size:0.9rem;">Manage messages and requests sent by customers via the support widget</p>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <select id="enquiry-status-filter" style="padding:8px 14px; border-radius:8px; border:1px solid #cbd5e1; background:white; font-size:0.9rem; outline:none;">
              <option value="" ${this.currentStatusFilter === '' ? 'selected' : ''}>All Statuses</option>
              <option value="new" ${this.currentStatusFilter === 'new' ? 'selected' : ''}>🆕 New (${enquiries.filter(e => e.status === 'new').length})</option>
              <option value="read" ${this.currentStatusFilter === 'read' ? 'selected' : ''}>👀 Read</option>
              <option value="replied" ${this.currentStatusFilter === 'replied' ? 'selected' : ''}>💬 Replied</option>
              <option value="resolved" ${this.currentStatusFilter === 'resolved' ? 'selected' : ''}>✅ Resolved</option>
            </select>
          </div>
        </div>

        ${enquiries.length === 0 ? `
          <div style="text-align:center; padding:60px 20px; background:white; border-radius:12px; border:1px solid #e2e8f0;">
            <div style="font-size:3rem; margin-bottom:12px;">📭</div>
            <h3 style="color:var(--dark-navy); margin-bottom:6px;">No Enquiries Found</h3>
            <p style="color:var(--slate-gray); font-size:0.9rem;">Customer questions submitted via the floating support widget will appear here.</p>
          </div>
        ` : `
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:20px;">
            ${enquiries.map(e => `
              <div style="background:white; border-radius:12px; border:1px solid #e2e8f0; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.04); display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s;" onmouseenter="this.style.boxShadow='0 6px 16px rgba(0,0,0,0.08)'" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <div>
                      <strong style="font-size:1.05rem; color:var(--dark-navy); font-weight:700;">${this.escapeHtml(e.name)}</strong>
                      <div style="font-size:0.8rem; color:var(--slate-gray); margin-top:2px;">📅 ${new Date(e.createdAt).toLocaleString()}</div>
                    </div>
                    <span style="font-size:0.75rem; padding:4px 10px; border-radius:20px; font-weight:600; text-transform:uppercase; ${this.getStatusBadgeStyle(e.status)}">
                      ${e.status}
                    </span>
                  </div>

                  <div style="background:#f8fafc; padding:12px; border-radius:8px; margin-bottom:14px; font-size:0.9rem; border-left:3px solid var(--electric-blue);">
                    <div style="display:flex; gap:15px; margin-bottom:8px; font-size:0.85rem; color:#475569;">
                      <span>📞 <a href="tel:${e.phone}" style="color:var(--electric-blue); font-weight:600;">${this.escapeHtml(e.phone)}</a></span>
                      ${e.email ? `<span>📧 ${this.escapeHtml(e.email)}</span>` : ''}
                    </div>
                    <div style="color:#1e293b; white-space:pre-wrap; word-break:break-word; font-size:0.92rem; line-height:1.4;">${this.escapeHtml(e.message)}</div>
                  </div>

                  ${e.adminNotes ? `
                    <div style="font-size:0.82rem; color:#64748b; background:#fffbeb; padding:8px 12px; border-radius:6px; margin-bottom:12px; border:1px solid #fef3c7;">
                      <strong>Note:</strong> ${this.escapeHtml(e.adminNotes)}
                    </div>
                  ` : ''}
                </div>

                <div style="display:flex; gap:8px; align-items:center; pt-3; border-top:1px solid #f1f5f9; margin-top:10px;">
                  <select onchange="EnquiriesPage.updateStatus('${e._id}', this.value)" style="flex:1; padding:6px 10px; border-radius:6px; border:1px solid #cbd5e1; font-size:0.85rem; background:white;">
                    <option value="new" ${e.status === 'new' ? 'selected' : ''}>🆕 New</option>
                    <option value="read" ${e.status === 'read' ? 'selected' : ''}>👀 Read</option>
                    <option value="replied" ${e.status === 'replied' ? 'selected' : ''}>💬 Replied</option>
                    <option value="resolved" ${e.status === 'resolved' ? 'selected' : ''}>✅ Resolved</option>
                  </select>
                  <a href="https://wa.me/${e.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${e.name}, regarding your inquiry with SMK Motor Spare Parts:`)}" target="_blank" style="background:#25D366; color:white; padding:6px 12px; border-radius:6px; text-decoration:none; font-size:0.85rem; font-weight:600; display:inline-flex; align-items:center; gap:4px;" title="Reply on WhatsApp">
                    💬 WhatsApp
                  </a>
                  <button onclick="EnquiriesPage.deleteEnquiry('${e._id}')" style="background:#fee2e2; color:#dc2626; border:none; padding:6px 10px; border-radius:6px; font-size:0.85rem; cursor:pointer;" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      `;

      document.getElementById('enquiry-status-filter')?.addEventListener('change', (evt) => {
        this.currentStatusFilter = evt.target.value;
        this.render();
      });

    } catch (err) {
      c.innerHTML = `<div style="color:red; padding:20px;">Failed to load enquiries: ${err.message}</div>`;
    }
  },

  async updateStatus(id, status) {
    try {
      await API.updateEnquiryStatus(id, status);
      Components.toast(`Status updated to ${status}`, 'success');
      this.render();
    } catch (err) {
      Components.toast(`Failed to update status: ${err.message}`, 'error');
    }
  },

  async deleteEnquiry(id) {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await API.deleteEnquiry(id);
      Components.toast('Enquiry deleted', 'info');
      this.render();
    } catch (err) {
      Components.toast(`Failed to delete: ${err.message}`, 'error');
    }
  },

  getStatusBadgeStyle(status) {
    switch (status) {
      case 'new': return 'background:#dbeafe; color:#1d4ed8;';
      case 'read': return 'background:#f1f5f9; color:#475569;';
      case 'replied': return 'background:#e0e7ff; color:#4338ca;';
      case 'resolved': return 'background:#dcfce7; color:#15803d;';
      default: return 'background:#f1f5f9; color:#475569;';
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
