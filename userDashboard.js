/* ============================================
   USER DASHBOARD APPLICATION
   ============================================ */
const UserDashboard = {
    userPlans: [],
    userMeals: [],
    currentUserName: '',
    currentUserEmail: '',

    /* ============================================
       INITIALIZATION
       ============================================ */
    init() {
        this.bindEvents();
        this.loadUserFromAuth();
        this.checkAndLoadPlans();
    },

    bindEvents() {
        const refreshBtn = document.getElementById('refreshDataBtn');
        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');
        const closePlanDetail = document.getElementById('closePlanDetail');
        const planDetailOverlay = document.getElementById('planDetailOverlay');
        const userNameInput = document.getElementById('userNameInput');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadUserPlans());
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterUserPlans());
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterUserPlans());
        }

        if (closePlanDetail) {
            closePlanDetail.addEventListener('click', () => {
                planDetailOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        if (planDetailOverlay) {
            planDetailOverlay.addEventListener('click', (e) => {
                if (e.target === planDetailOverlay) {
                    planDetailOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        if (userNameInput) {
            userNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.loadUserPlans();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && planDetailOverlay.classList.contains('active')) {
                planDetailOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    },

    loadUserFromAuth() {
        // Try to load from authentication first
        try {
            const authData = localStorage.getItem('nutritionAppAuth');
            if (authData) {
                const auth = JSON.parse(authData);
                if (auth.user) {
                    this.currentUserName = auth.user.name || '';
                    this.currentUserEmail = auth.user.email || '';
                    
                    const userNameInput = document.getElementById('userNameInput');
                    if (userNameInput) {
                        // Show email or name in input
                        userNameInput.value = this.currentUserEmail || this.currentUserName;
                        userNameInput.disabled = true; // Disable since user is logged in
                    }
                    
                    // Update welcome message
                    const welcomeEl = document.getElementById('userWelcome');
                    if (welcomeEl && this.currentUserName) {
                        welcomeEl.querySelector('h3').textContent = `Welcome, ${this.currentUserName}!`;
                    }
                    
                    return true;
                }
            }
        } catch (e) {
            console.warn('Could not load user from auth:', e);
        }
        
        // Fallback to localStorage userName
        const savedName = localStorage.getItem('userName');
        const userNameInput = document.getElementById('userNameInput');
        
        if (savedName && userNameInput) {
            userNameInput.value = savedName;
            this.currentUserName = savedName;
        }
        
        return false;
    },

    checkAndLoadPlans() {
        // If user is logged in, load automatically
        if (this.currentUserEmail || this.currentUserName) {
            this.loadUserPlans();
        } else {
            const userNameInput = document.getElementById('userNameInput');
            if (userNameInput && userNameInput.value.trim()) {
                this.loadUserPlans();
            } else {
                this.showWelcome();
            }
        }
    },

    /* ============================================
       DATA LOADING
       ============================================ */
    async loadUserPlans() {
        // Get user identifier (email preferred, fallback to name)
        let userIdentifier = this.currentUserEmail || this.currentUserName;
        
        const userNameInput = document.getElementById('userNameInput');
        if (userNameInput && userNameInput.value.trim()) {
            userIdentifier = userNameInput.value.trim();
        }
        
        if (!userIdentifier) {
            alert('Please enter your name or email to view your plans.');
            return;
        }

        // Update current user info
        if (!this.currentUserName && userIdentifier) {
            this.currentUserName = userIdentifier;
        }
        if (!this.currentUserEmail && userIdentifier.includes('@')) {
            this.currentUserEmail = userIdentifier;
        }
        
        localStorage.setItem('userName', userIdentifier);

        const loadingEl = document.getElementById('userLoading');
        const plansGrid = document.getElementById('userPlansGrid');
        const emptyEl = document.getElementById('userEmpty');
        const welcomeEl = document.getElementById('userWelcome');
        const refreshBtn = document.getElementById('refreshDataBtn');

        if (!loadingEl || !plansGrid) return;

        welcomeEl.style.display = 'none';
        loadingEl.style.display = 'block';
        plansGrid.style.display = 'none';
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
            // Load both plans and meals
            let plans = [];
            let meals = [];
            
            if (typeof getUserPlans === 'function') {
                plans = await getUserPlans(userIdentifier);
                this.userPlans = plans;
            } else {
                console.warn('getUserPlans function not available. Make sure firebase.js is loaded.');
            }
            
            if (typeof getUserMeals === 'function') {
                meals = await getUserMeals(userIdentifier);
                this.userMeals = meals;
            } else {
                console.warn('getUserMeals function not available. Make sure firebase.js is loaded.');
            }
            
            this.displayUserPlans(plans);
            this.displayUserMeals(meals);
            this.updateUserStats(plans, meals);
        } catch (error) {
            console.error('Error loading user data:', error);
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
                    Refresh
                `;
            }
        }
    },

    showWelcome() {
        const welcomeEl = document.getElementById('userWelcome');
        const loadingEl = document.getElementById('userLoading');
        const plansGrid = document.getElementById('userPlansGrid');
        const emptyEl = document.getElementById('userEmpty');

        if (welcomeEl) welcomeEl.style.display = 'block';
        if (loadingEl) loadingEl.style.display = 'none';
        if (plansGrid) plansGrid.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'none';
    },

    /* ============================================
       DISPLAY DATA
       ============================================ */
    displayUserPlans(plans) {
        const loadingEl = document.getElementById('userLoading');
        const plansGrid = document.getElementById('userPlansGrid');
        const emptyEl = document.getElementById('userEmpty');
        const welcomeEl = document.getElementById('userWelcome');

        if (!plansGrid) return;

        welcomeEl.style.display = 'none';
        loadingEl.style.display = 'none';

        if (plans.length === 0) {
            plansGrid.style.display = 'none';
            // Only show empty state if there are no meals either
            if (this.userMeals.length === 0) {
                emptyEl.style.display = 'block';
            } else {
                emptyEl.style.display = 'none';
            }
            return;
        }

        plansGrid.style.display = 'grid';
        emptyEl.style.display = 'none';

        // Sort plans by date (newest first)
        const sortedPlans = [...plans].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.timestamp || 0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.timestamp || 0);
            return dateB - dateA;
        });

        plansGrid.innerHTML = sortedPlans.map(plan => {
            const date = plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) : (plan.timestamp ? new Date(plan.timestamp).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) : 'N/A');
            
            const goal = plan.goal || 'N/A';
            const condition = plan.healthCondition || 'N/A';
            const calories = plan.dailyCalories || 'N/A';
            
            return `
                <div class="plan-card" onclick="UserDashboard.viewPlanDetail('${plan.id}')">
                    <div class="plan-card-header">
                        <h3 class="plan-card-title">${this.escapeHtml(plan.name || 'My Plan')}</h3>
                        <span class="plan-card-date">${date}</span>
                    </div>
                    <div class="plan-card-body">
                        <div class="plan-card-info">
                            <div class="plan-info-item">
                                <span class="plan-info-label">Age</span>
                                <span class="plan-info-value">${plan.age || 'N/A'} years</span>
                            </div>
                            <div class="plan-info-item">
                                <span class="plan-info-label">Weight</span>
                                <span class="plan-info-value">${plan.weight || 'N/A'} kg</span>
                            </div>
                            <div class="plan-info-item">
                                <span class="plan-info-label">Condition</span>
                                <span class="plan-info-value">${this.escapeHtml(condition)}</span>
                            </div>
                            <div class="plan-info-item">
                                <span class="plan-info-label">Goal</span>
                                <span class="plan-info-value">
                                    <span class="plan-card-goal">${this.escapeHtml(goal)}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="plan-card-footer">
                        <span class="plan-card-calories">${calories} kcal</span>
                        <button class="view-plan-btn" onclick="event.stopPropagation(); UserDashboard.viewPlanDetail('${plan.id}')">View Details</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    displayUserMeals(meals) {
        const mealsGrid = document.getElementById('userMealsGrid');
        if (!mealsGrid) return;

        if (meals.length === 0) {
            mealsGrid.style.display = 'none';
            return;
        }

        mealsGrid.style.display = 'grid';

        // Sort meals by date (newest first)
        const sortedMeals = [...meals].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.timestamp || 0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.timestamp || 0);
            return dateB - dateA;
        });

        mealsGrid.innerHTML = sortedMeals.map(meal => {
            const date = meal.createdAt ? new Date(meal.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) : (meal.timestamp ? new Date(meal.timestamp).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) : 'N/A');
            
            return `
                <div class="meal-card" onclick="UserDashboard.viewMealDetail('${meal.id}')">
                    <div class="meal-card-header">
                        <h3 class="meal-card-title">${this.escapeHtml(meal.mealName || 'Custom Meal')}</h3>
                        <span class="meal-card-date">${date}</span>
                    </div>
                    <div class="meal-card-body">
                        <div class="meal-card-info">
                            <div class="meal-info-item">
                                <span class="meal-info-label">Calories</span>
                                <span class="meal-info-value">${meal.totalCalories || 'N/A'} kcal</span>
                            </div>
                            <div class="meal-info-item">
                                <span class="meal-info-label">Protein</span>
                                <span class="meal-info-value">${meal.totalProtein || 'N/A'}g</span>
                            </div>
                            <div class="meal-info-item">
                                <span class="meal-info-label">Carbs</span>
                                <span class="meal-info-value">${meal.totalCarbs || 'N/A'}g</span>
                            </div>
                            <div class="meal-info-item">
                                <span class="meal-info-label">Fats</span>
                                <span class="meal-info-value">${meal.totalFats || 'N/A'}g</span>
                            </div>
                        </div>
                        ${meal.ingredients && meal.ingredients.length > 0 ? `
                        <div class="meal-ingredients">
                            <strong>Ingredients:</strong> ${meal.ingredients.slice(0, 3).map(i => this.escapeHtml(i.name || i)).join(', ')}${meal.ingredients.length > 3 ? '...' : ''}
                        </div>
                        ` : ''}
                    </div>
                    <div class="meal-card-footer">
                        <button class="view-meal-btn" onclick="event.stopPropagation(); UserDashboard.viewMealDetail('${meal.id}')">View Details</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    updateUserStats(plans, meals = []) {
        const totalPlans = plans.length;
        const totalMeals = meals.length;
        const avgCalories = plans.length > 0 
            ? Math.round(plans.reduce((sum, p) => sum + (parseInt(p.dailyCalories) || 0), 0) / plans.length)
            : 0;
        
        // Get latest plan date
        let latestPlanDate = '-';
        if (plans.length > 0) {
            const sortedPlans = [...plans].sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.timestamp || 0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.timestamp || 0);
                return dateB - dateA;
            });
            const latestPlan = sortedPlans[0];
            const latestDate = latestPlan.createdAt ? new Date(latestPlan.createdAt) : new Date(latestPlan.timestamp || Date.now());
            latestPlanDate = latestDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short'
            });
        }

        // Get most common goal
        let activeGoal = '-';
        if (plans.length > 0) {
            const goalCounts = {};
            plans.forEach(p => {
                const goal = p.goal || 'Unknown';
                goalCounts[goal] = (goalCounts[goal] || 0) + 1;
            });
            activeGoal = Object.keys(goalCounts).reduce((a, b) => goalCounts[a] > goalCounts[b] ? a : b);
        }

        const totalPlansEl = document.getElementById('totalPlans');
        const avgCaloriesEl = document.getElementById('avgCalories');
        const latestPlanDateEl = document.getElementById('latestPlanDate');
        const activeGoalEl = document.getElementById('activeGoal');
        const totalMealsEl = document.getElementById('totalMeals');

        if (totalPlansEl) totalPlansEl.textContent = totalPlans;
        if (avgCaloriesEl) avgCaloriesEl.textContent = avgCalories;
        if (latestPlanDateEl) latestPlanDateEl.textContent = latestPlanDate;
        if (activeGoalEl) activeGoalEl.textContent = activeGoal;
        if (totalMealsEl) totalMealsEl.textContent = totalMeals;
    },

    /* ============================================
       FILTER & SEARCH
       ============================================ */
    filterUserPlans() {
        if (!this.userPlans || this.userPlans.length === 0) return;

        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');
        
        const searchTerm = (searchInput?.value || '').toLowerCase();
        const filterValue = filterSelect?.value || 'all';

        const filtered = this.userPlans.filter(plan => {
            const matchesSearch = !searchTerm || 
                (plan.goal && plan.goal.toLowerCase().includes(searchTerm)) ||
                (plan.healthCondition && plan.healthCondition.toLowerCase().includes(searchTerm));
            
            const matchesFilter = filterValue === 'all' || plan.goal === filterValue;

            return matchesSearch && matchesFilter;
        });

        this.displayUserPlans(filtered);
        this.updateUserStats(filtered);
    },

    /* ============================================
       PLAN DETAIL VIEW
       ============================================ */
    async viewPlanDetail(planId) {
        const overlay = document.getElementById('planDetailOverlay');
        const content = document.getElementById('planDetailContent');

        if (!overlay || !content) return;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        content.innerHTML = '<div class="user-loading"><div class="loading-spinner"></div><p>Loading details...</p></div>';

        try {
            if (typeof getPlanById === 'function') {
                const plan = await getPlanById(planId);
                if (plan) {
                    this.displayPlanDetail(plan);
                } else {
                    content.innerHTML = '<div class="user-empty"><p>Plan not found</p></div>';
                }
            } else {
                content.innerHTML = '<div class="user-empty"><p>Function not available. Make sure firebase.js is loaded.</p></div>';
            }
        } catch (error) {
            console.error('Error loading plan details:', error);
            content.innerHTML = `<div class="user-empty"><p>Error loading plan details: ${error.message}</p></div>`;
        }
    },

    displayPlanDetail(plan) {
        const content = document.getElementById('planDetailContent');
        if (!content) return;

        const date = plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : (plan.timestamp ? new Date(plan.timestamp).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A');

        const html = `
            <div class="popup-header">
                <h2>My Nutrition Plan</h2>
                <p>Complete plan details and recommendations</p>
            </div>
            <div class="results-content">
                <div class="user-detail-section">
                    <h3>👤 My Information</h3>
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
                            <span class="detail-value">${plan.macros?.protein || 'N/A'}g ${plan.macros ? `(${Math.round(plan.macros.proteinRatio * 100)}%)` : ''}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Carbohydrates</span>
                            <span class="detail-value">${plan.macros?.carbs || 'N/A'}g ${plan.macros ? `(${Math.round(plan.macros.carbRatio * 100)}%)` : ''}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fats</span>
                            <span class="detail-value">${plan.macros?.fats || 'N/A'}g ${plan.macros ? `(${Math.round(plan.macros.fatRatio * 100)}%)` : ''}</span>
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
       MEAL DETAIL VIEW
       ============================================ */
    async viewMealDetail(mealId) {
        const overlay = document.getElementById('planDetailOverlay');
        const content = document.getElementById('planDetailContent');

        if (!overlay || !content) return;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        content.innerHTML = '<div class="user-loading"><div class="loading-spinner"></div><p>Loading details...</p></div>';

        try {
            if (typeof getMealById === 'function') {
                const meal = await getMealById(mealId);
                if (meal) {
                    this.displayMealDetail(meal);
                } else {
                    content.innerHTML = '<div class="user-empty"><p>Meal not found</p></div>';
                }
            } else {
                content.innerHTML = '<div class="user-empty"><p>Function not available. Make sure firebase.js is loaded.</p></div>';
            }
        } catch (error) {
            console.error('Error loading meal details:', error);
            content.innerHTML = `<div class="user-empty"><p>Error loading meal details: ${error.message}</p></div>`;
        }
    },

    displayMealDetail(meal) {
        const content = document.getElementById('planDetailContent');
        if (!content) return;

        const date = meal.createdAt ? new Date(meal.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : (meal.timestamp ? new Date(meal.timestamp).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A');

        const html = `
            <div class="popup-header">
                <h2>My Custom Meal</h2>
                <p>Complete meal details and nutrition information</p>
            </div>
            <div class="results-content">
                <div class="user-detail-section">
                    <h3>🍽️ Meal Information</h3>
                    <div class="user-detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Meal Name</span>
                            <span class="detail-value">${this.escapeHtml(meal.mealName || 'Custom Meal')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Created At</span>
                            <span class="detail-value">${date}</span>
                        </div>
                        ${meal.servingSize ? `
                        <div class="detail-item">
                            <span class="detail-label">Serving Size</span>
                            <span class="detail-value">${meal.servingSize}</span>
                        </div>
                        ` : ''}
                        ${meal.totalWeight ? `
                        <div class="detail-item">
                            <span class="detail-label">Total Weight</span>
                            <span class="detail-value">${meal.totalWeight}g</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="user-detail-section">
                    <h3>📊 Nutrition Information</h3>
                    <div class="user-detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Total Calories</span>
                            <span class="detail-value">${meal.totalCalories || 'N/A'} kcal</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Protein</span>
                            <span class="detail-value">${meal.totalProtein || 'N/A'}g ${meal.proteinPercent ? `(${meal.proteinPercent.toFixed(1)}%)` : ''}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Carbohydrates</span>
                            <span class="detail-value">${meal.totalCarbs || 'N/A'}g ${meal.carbsPercent ? `(${meal.carbsPercent.toFixed(1)}%)` : ''}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fats</span>
                            <span class="detail-value">${meal.totalFats || 'N/A'}g ${meal.fatPercent ? `(${meal.fatPercent.toFixed(1)}%)` : ''}</span>
                        </div>
                    </div>
                </div>

                ${meal.ingredients && meal.ingredients.length > 0 ? `
                <div class="user-detail-section">
                    <h3>🥘 Ingredients</h3>
                    <ul>
                        ${meal.ingredients.map(ing => {
                            const ingName = typeof ing === 'string' ? ing : (ing.name || 'Unknown');
                            const ingAmount = ing.amount ? ` - ${ing.amount}` : '';
                            return `<li>${this.escapeHtml(ingName)}${ingAmount}</li>`;
                        }).join('')}
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
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize user dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UserDashboard.init());
} else {
    UserDashboard.init();
}

