/* ============================================
   ADMIN DASHBOARD APPLICATION
   ============================================ */
const AdminDashboard = {
    allPlans: [],

    /* ============================================
       INITIALIZATION
       ============================================ */
    init() {
        this.bindEvents();
        this.loadAdminData();
    },

    bindEvents() {
        const refreshBtn = document.getElementById('refreshDataBtn');
        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');
        const closeUserDetail = document.getElementById('closeUserDetail');
        const userDetailOverlay = document.getElementById('userDetailOverlay');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAdminData());
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterAdminData());
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterAdminData());
        }

        if (closeUserDetail) {
            closeUserDetail.addEventListener('click', () => {
                userDetailOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        if (userDetailOverlay) {
            userDetailOverlay.addEventListener('click', (e) => {
                if (e.target === userDetailOverlay) {
                    userDetailOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && userDetailOverlay.classList.contains('active')) {
                userDetailOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    },

    /* ============================================
       DATA LOADING
       ============================================ */
    async loadAdminData() {
        const loadingEl = document.getElementById('adminLoading');
        const tableContainer = document.getElementById('adminTableContainer');
        const emptyEl = document.getElementById('adminEmpty');
        const refreshBtn = document.getElementById('refreshDataBtn');

        if (!loadingEl || !tableContainer) return;

        loadingEl.style.display = 'block';
        tableContainer.style.display = 'none';
        emptyEl.style.display = 'none';

        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.48L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Loading...
            `;
        }

        try {
            if (typeof getAllUserPlans === 'function') {
                const plans = await getAllUserPlans();
                this.allPlans = plans;
                this.displayAdminData(plans);
                this.updateAdminStats(plans);
            } else {
                console.warn('getAllUserPlans function not available. Make sure firebase.js is loaded.');
                loadingEl.innerHTML = '<p style="color: var(--error);">Firebase not initialized. Please check your Firebase configuration.</p>';
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
            loadingEl.innerHTML = `<p style="color: var(--error);">Error loading data: ${error.message}</p>`;
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.48L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    Refresh Data
                `;
            }
        }
    },

    /* ============================================
       DISPLAY DATA
       ============================================ */
    displayAdminData(plans) {
        const loadingEl = document.getElementById('adminLoading');
        const tableContainer = document.getElementById('adminTableContainer');
        const emptyEl = document.getElementById('adminEmpty');
        const tableBody = document.getElementById('adminTableBody');

        if (!tableBody) return;

        loadingEl.style.display = 'none';

        if (plans.length === 0) {
            tableContainer.style.display = 'none';
            emptyEl.style.display = 'block';
            return;
        }

        tableContainer.style.display = 'block';
        emptyEl.style.display = 'none';

        tableBody.innerHTML = plans.map(plan => {
            const date = plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) : 'N/A';
            const goal = plan.goal || 'N/A';
            const condition = plan.healthCondition || 'N/A';
            
            return `
                <tr>
                    <td><strong>${this.escapeHtml(plan.name || 'N/A')}</strong></td>
                    <td>${plan.age || 'N/A'}</td>
                    <td>${plan.weight ? plan.weight + ' kg' : 'N/A'}</td>
                    <td><span class="badge badge-condition">${this.escapeHtml(condition)}</span></td>
                    <td><span class="badge badge-goal">${this.escapeHtml(goal)}</span></td>
                    <td>${plan.dailyCalories || 'N/A'} kcal</td>
                    <td>${date}</td>
                    <td>
                        <button class="view-btn" onclick="AdminDashboard.viewUserDetail('${plan.id}')">View Details</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    updateAdminStats(plans) {
        const totalUsers = new Set(plans.map(p => p.name)).size;
        const totalPlans = plans.length;
        const avgCalories = plans.length > 0 
            ? Math.round(plans.reduce((sum, p) => sum + (p.dailyCalories || 0), 0) / plans.length)
            : 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayPlans = plans.filter(p => {
            const planDate = p.createdAt ? new Date(p.createdAt) : null;
            return planDate && planDate >= today;
        }).length;

        const totalUsersEl = document.getElementById('totalUsers');
        const totalPlansEl = document.getElementById('totalPlans');
        const avgCaloriesEl = document.getElementById('avgCalories');
        const todayPlansEl = document.getElementById('todayPlans');

        if (totalUsersEl) totalUsersEl.textContent = totalUsers;
        if (totalPlansEl) totalPlansEl.textContent = totalPlans;
        if (avgCaloriesEl) avgCaloriesEl.textContent = avgCalories;
        if (todayPlansEl) todayPlansEl.textContent = todayPlans;
    },

    /* ============================================
       FILTER & SEARCH
       ============================================ */
    filterAdminData() {
        if (!this.allPlans || this.allPlans.length === 0) return;

        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');
        
        const searchTerm = (searchInput?.value || '').toLowerCase();
        const filterValue = filterSelect?.value || 'all';

        const filtered = this.allPlans.filter(plan => {
            const matchesSearch = !searchTerm || 
                (plan.name && plan.name.toLowerCase().includes(searchTerm)) ||
                (plan.goal && plan.goal.toLowerCase().includes(searchTerm)) ||
                (plan.healthCondition && plan.healthCondition.toLowerCase().includes(searchTerm));
            
            const matchesFilter = filterValue === 'all' || plan.goal === filterValue;

            return matchesSearch && matchesFilter;
        });

        this.displayAdminData(filtered);
    },

    /* ============================================
       USER DETAIL VIEW
       ============================================ */
    async viewUserDetail(planId) {
        const overlay = document.getElementById('userDetailOverlay');
        const content = document.getElementById('userDetailContent');

        if (!overlay || !content) return;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        content.innerHTML = '<div class="admin-loading"><div class="loading-spinner"></div><p>Loading details...</p></div>';

        try {
            if (typeof getPlanById === 'function') {
                const plan = await getPlanById(planId);
                if (plan) {
                    this.displayUserDetail(plan);
                } else {
                    content.innerHTML = '<div class="admin-empty"><p>Plan not found</p></div>';
                }
            } else {
                content.innerHTML = '<div class="admin-empty"><p>Function not available. Make sure firebase.js is loaded.</p></div>';
            }
        } catch (error) {
            console.error('Error loading plan details:', error);
            content.innerHTML = `<div class="admin-empty"><p>Error loading plan details: ${error.message}</p></div>`;
        }
    },

    displayUserDetail(plan) {
        const content = document.getElementById('userDetailContent');
        if (!content) return;

        const date = plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A';

        const html = `
            <div class="popup-header">
                <h2>User Plan Details</h2>
                <p>Complete nutrition plan information</p>
            </div>
            <div class="results-content">
                <div class="user-detail-section">
                    <h3>👤 User Information</h3>
                    <div class="user-detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Name</span>
                            <span class="detail-value">${this.escapeHtml(plan.name || 'N/A')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Age</span>
                            <span class="detail-value">${plan.age || 'N/A'} years</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Weight</span>
                            <span class="detail-value">${plan.weight || 'N/A'} kg</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Health Condition</span>
                            <span class="detail-value">${this.escapeHtml(plan.healthCondition || 'N/A')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Goal</span>
                            <span class="detail-value">${this.escapeHtml(plan.goal || 'N/A')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Created At</span>
                            <span class="detail-value">${date}</span>
                        </div>
                    </div>
                </div>

                <div class="user-detail-section">
                    <h3>📊 Nutrition Goals</h3>
                    <div class="user-detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Daily Calories</span>
                            <span class="detail-value">${plan.dailyCalories || 'N/A'} kcal</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Protein</span>
                            <span class="detail-value">${plan.macros?.protein || 'N/A'}g (${plan.macros ? Math.round(plan.macros.proteinRatio * 100) : 'N/A'}%)</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Carbohydrates</span>
                            <span class="detail-value">${plan.macros?.carbs || 'N/A'}g (${plan.macros ? Math.round(plan.macros.carbRatio * 100) : 'N/A'}%)</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fats</span>
                            <span class="detail-value">${plan.macros?.fats || 'N/A'}g (${plan.macros ? Math.round(plan.macros.fatRatio * 100) : 'N/A'}%)</span>
                        </div>
                    </div>
                </div>

                <div class="user-detail-section">
                    <h3>🍽️ Recommended Meals</h3>
                    <div class="user-detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Breakfast</span>
                            <span class="detail-value">${plan.meals?.breakfast?.map(m => this.escapeHtml(m.name)).join(', ') || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Lunch</span>
                            <span class="detail-value">${plan.meals?.lunch?.map(m => this.escapeHtml(m.name)).join(', ') || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Dinner</span>
                            <span class="detail-value">${plan.meals?.dinner?.map(m => this.escapeHtml(m.name)).join(', ') || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Snacks</span>
                            <span class="detail-value">${plan.meals?.snacks?.map(m => this.escapeHtml(m.name)).join(', ') || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div class="user-detail-section">
                    <h3>💡 Recommendations</h3>
                    <p><strong>Focus:</strong> ${this.escapeHtml(plan.recommendations?.goal?.focus || 'N/A')}</p>
                    <p><strong>Health Focus:</strong> ${this.escapeHtml(plan.recommendations?.health?.focus || 'N/A')}</p>
                    <p><strong>Include:</strong> ${plan.recommendations?.health?.include?.map(i => this.escapeHtml(i)).join(', ') || 'N/A'}</p>
                    ${plan.recommendations?.health?.avoid ? `<p><strong>Avoid:</strong> ${plan.recommendations.health.avoid.map(a => this.escapeHtml(a)).join(', ')}</p>` : ''}
                </div>

                ${plan.healthTips ? `
                <div class="user-detail-section">
                    <h3>✨ Daily Tips</h3>
                    <ul>
                        ${plan.healthTips.map(tip => `<li>${this.escapeHtml(tip)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;

        content.innerHTML = html;
    },

    /* ============================================
       UTILITY FUNCTIONS
       ============================================ */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize admin dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminDashboard.init());
} else {
    AdminDashboard.init();
}

