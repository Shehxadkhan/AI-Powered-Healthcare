/* ============================================
   NAMESPACE & CONFIGURATION
   ============================================ */
const NutritionApp = {
    // DOM Elements
    elements: {
        startCheckBtn: null,
        popupOverlay: null,
        closePopup: null,
        nutritionForm: null,
        submitBtn: null,
        resultsOverlay: null,
        closeResults: null,
        resultsContent: null
    },

    // ML Model
    model: null,
    isModelReady: false,

    // Admin Dashboard
    allPlans: [],

    // Authentication
    auth: {
        currentUser: null,
        userType: null, // 'admin', 'user', or 'guest'
        isAuthenticated: false
    },

    // Chatbot
    chatbot: {
        isOpen: false,
        messages: [],
        apiKey: null, // Set your OpenAI API key here or via environment
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4', // or 'gpt-3.5-turbo' for faster/cheaper
        systemPrompt: `You are a helpful AI Nutrition Assistant. Your role is to assist users in filling out their nutrition plan form and answer questions about nutrition, health conditions, goals, and meal planning. Be friendly, professional, and provide accurate, evidence-based information. Help users understand:
- What information they need to provide in the form
- How different health conditions affect nutrition needs
- What different goals mean (weight loss, weight gain, fitness, healthy diet)
- General nutrition advice and meal planning tips
- Answer questions about the form fields (age, weight, health conditions, goals)

Keep responses concise but informative. If asked about medical advice, remind users to consult healthcare professionals.`
    },

    // Nutrition Data
    nutritionData: {
        meals: {
            breakfast: [
                { name: 'Oatmeal with berries', calories: 300, protein: 12, carbs: 45, fats: 8 },
                { name: 'Greek yogurt with nuts', calories: 250, protein: 20, carbs: 15, fats: 12 },
                { name: 'Whole grain toast with avocado', calories: 280, protein: 10, carbs: 35, fats: 14 },
                { name: 'Scrambled eggs with vegetables', calories: 320, protein: 22, carbs: 8, fats: 20 },
                { name: 'Smoothie bowl', calories: 290, protein: 15, carbs: 40, fats: 10 }
            ],
            lunch: [
                { name: 'Grilled chicken salad', calories: 400, protein: 35, carbs: 20, fats: 18 },
                { name: 'Quinoa bowl with vegetables', calories: 450, protein: 18, carbs: 60, fats: 12 },
                { name: 'Salmon with sweet potato', calories: 500, protein: 30, carbs: 45, fats: 22 },
                { name: 'Lentil soup with whole grain bread', calories: 380, protein: 20, carbs: 55, fats: 8 },
                { name: 'Turkey wrap with vegetables', calories: 420, protein: 28, carbs: 40, fats: 16 }
            ],
            dinner: [
                { name: 'Baked fish with vegetables', calories: 450, protein: 35, carbs: 30, fats: 20 },
                { name: 'Lean beef stir-fry', calories: 480, protein: 40, carbs: 35, fats: 18 },
                { name: 'Vegetable curry with brown rice', calories: 420, protein: 15, carbs: 65, fats: 10 },
                { name: 'Chicken and vegetable skewers', calories: 460, protein: 38, carbs: 25, fats: 22 },
                { name: 'Tofu stir-fry with quinoa', calories: 440, protein: 25, carbs: 50, fats: 14 }
            ],
            snacks: [
                { name: 'Apple with almond butter', calories: 200, protein: 6, carbs: 25, fats: 10 },
                { name: 'Mixed nuts', calories: 180, protein: 6, carbs: 6, fats: 16 },
                { name: 'Greek yogurt', calories: 150, protein: 15, carbs: 10, fats: 5 },
                { name: 'Carrot sticks with hummus', calories: 120, protein: 4, carbs: 15, fats: 5 }
            ]
        },
        recommendations: {
            'weight-loss': {
                dailyCalories: '1200-1500',
                focus: 'Calorie deficit, high protein, low processed foods',
                tips: ['Eat protein with every meal', 'Stay hydrated', 'Include fiber-rich foods', 'Limit sugar intake']
            },
            'weight-gain': {
                dailyCalories: '2500-3000',
                focus: 'Calorie surplus, balanced macros, nutrient-dense foods',
                tips: ['Eat frequent meals', 'Include healthy fats', 'Post-workout nutrition', 'Stay consistent']
            },
            'fitness': {
                dailyCalories: '2000-2500',
                focus: 'Optimal protein intake, complex carbs, recovery nutrition',
                tips: ['Pre and post-workout meals', 'Adequate protein', 'Stay hydrated', 'Balance macros']
            },
            'healthy-diet': {
                dailyCalories: '1800-2200',
                focus: 'Balanced nutrition, whole foods, variety',
                tips: ['Eat colorful vegetables', 'Include whole grains', 'Moderate portions', 'Regular meal times']
            }
        },
        healthConditions: {
            'diabetes': {
                focus: 'Low glycemic index foods, controlled carbs, regular meals',
                avoid: ['High sugar foods', 'Refined carbs', 'Sugary drinks'],
                include: ['Whole grains', 'Lean proteins', 'Non-starchy vegetables', 'Healthy fats']
            },
            'high-bp': {
                focus: 'Low sodium, potassium-rich foods, heart-healthy',
                avoid: ['High sodium foods', 'Processed foods', 'Excessive alcohol'],
                include: ['Leafy greens', 'Berries', 'Oatmeal', 'Fatty fish', 'Bananas']
            },
            'heart-issue': {
                focus: 'Heart-healthy fats, fiber, antioxidants',
                avoid: ['Trans fats', 'Saturated fats', 'High sodium'],
                include: ['Omega-3 rich foods', 'Whole grains', 'Fruits and vegetables', 'Nuts and seeds']
            },
            'none': {
                focus: 'Balanced nutrition, variety, moderation',
                avoid: ['Excessive processed foods'],
                include: ['All food groups in moderation']
            }
        }
    },

    /* ============================================
       INITIALIZATION
       ============================================ */
    init() {
        console.log('Initializing NutritionApp...');
        this.cacheElements();
        this.initAuth();
        this.bindEvents();
        this.initializeMLModel();
        this.initChatbot();
        // Delay checkAuthStatus to ensure DOM is ready
        setTimeout(() => {
            this.checkAuthStatus();
        }, 500);
    },

    cacheElements() {
        this.elements.startCheckBtn = document.getElementById('startCheckBtn');
        this.elements.popupOverlay = document.getElementById('popupOverlay');
        this.elements.closePopup = document.getElementById('closePopup');
        this.elements.nutritionForm = document.getElementById('nutritionForm');
        this.elements.submitBtn = document.getElementById('submitBtn');
        this.elements.resultsOverlay = document.getElementById('resultsOverlay');
        this.elements.closeResults = document.getElementById('closeResults');
        this.elements.resultsContent = document.getElementById('resultsContent');
    },

    bindEvents() {
        // Open input popup - check if button exists
        if (this.elements.startCheckBtn) {
            this.elements.startCheckBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Start My Nutrition Check clicked');
                this.openInputPopup();
            });
        } else {
            console.warn('startCheckBtn not found');
        }
        
        // Hero meal builder button
        const heroMealBuilderBtn = document.getElementById('heroMealBuilderBtn');
        if (heroMealBuilderBtn) {
            heroMealBuilderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Build Your Meal clicked');
                this.openMealBuilder();
            });
        } else {
            console.warn('heroMealBuilderBtn not found');
        }
        
        // Floating chatbot button (right side)
        const floatingChatbotBtn = document.getElementById('floatingChatbotBtn');
        if (floatingChatbotBtn) {
            floatingChatbotBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openChatbot();
            });
        }

        // Hero chatbot button - opens only chatbot
        const heroChatbotBtn = document.getElementById('heroChatbotBtn');
        if (heroChatbotBtn) {
            heroChatbotBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openChatbot();
            });
        }
        
        // Close input popup
        if (this.elements.closePopup) {
            this.elements.closePopup.addEventListener('click', () => this.closeInputPopup());
        }
        if (this.elements.popupOverlay) {
            this.elements.popupOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.popupOverlay) this.closeInputPopup();
            });
        }

        // Close results popup
        if (this.elements.closeResults) {
            this.elements.closeResults.addEventListener('click', () => this.closeResultsPopup());
        }
        if (this.elements.resultsOverlay) {
            this.elements.resultsOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.resultsOverlay) this.closeResultsPopup();
            });
        }

        // Form submission
        if (this.elements.nutritionForm) {
            this.elements.nutritionForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Login and Register buttons in header - now link to separate pages
        // No need for click handlers since they're regular links now
        
        // Also handle any other Get Started links
        setTimeout(() => {
            const getStartedLinks = document.querySelectorAll('a.service-btn[href="#contact"]');
            getStartedLinks.forEach(link => {
                if (link.textContent.trim().toLowerCase().includes('get started')) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.openLogin();
                    });
                }
            });
        }, 100);

        // Login/Register modals
        this.initAuthModals();

        // Meal builder close button
        const closeMealBuilder = document.getElementById('closeMealBuilder');
        const mealBuilderOverlay = document.getElementById('mealBuilderOverlay');
        if (closeMealBuilder) {
            closeMealBuilder.addEventListener('click', () => this.closeMealBuilder());
        }
        if (mealBuilderOverlay) {
            mealBuilderOverlay.addEventListener('click', (e) => {
                if (e.target === mealBuilderOverlay) this.closeMealBuilder();
            });
        }

        // Escape key handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.elements.popupOverlay.classList.contains('active')) {
                    this.closeInputPopup();
                }
                if (this.elements.resultsOverlay.classList.contains('active')) {
                    this.closeResultsPopup();
                }
                if (mealBuilderOverlay && mealBuilderOverlay.classList.contains('active')) {
                    this.closeMealBuilder();
                }
                if (this.chatbot.isOpen) {
                    this.closeChatbot();
                }
            }
        });

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    },

    /* ============================================
       ML MODEL INITIALIZATION
       ============================================ */
    async initializeMLModel() {
        try {
            // Create a simple neural network model for nutrition recommendations
            this.model = tf.sequential({
                layers: [
                    tf.layers.dense({ inputShape: [4], units: 16, activation: 'relu' }),
                    tf.layers.dense({ units: 32, activation: 'relu' }),
                    tf.layers.dense({ units: 16, activation: 'relu' }),
                    tf.layers.dense({ units: 8, activation: 'sigmoid' })
                ]
            });

            // Compile the model
            this.model.compile({
                optimizer: 'adam',
                loss: 'meanSquaredError',
                metrics: ['accuracy']
            });

            // Train with sample data (in production, this would be trained on real data)
            await this.trainModel();
            
            this.isModelReady = true;
            console.log('ML Model initialized and ready');
        } catch (error) {
            console.error('Error initializing ML model:', error);
            this.isModelReady = false;
        }
    },

    async trainModel() {
        // Generate synthetic training data
        const trainingData = this.generateTrainingData();
        const xs = tf.tensor2d(trainingData.inputs);
        const ys = tf.tensor2d(trainingData.outputs);

        // Train the model
        await this.model.fit(xs, ys, {
            epochs: 50,
            batchSize: 32,
            verbose: 0
        });

        // Clean up tensors
        xs.dispose();
        ys.dispose();
    },

    generateTrainingData() {
        const inputs = [];
        const outputs = [];

        // Generate 200 training samples
        for (let i = 0; i < 200; i++) {
            const age = Math.random() * 60 + 20; // 20-80
            const weight = Math.random() * 50 + 50; // 50-100 kg
            const healthCondition = Math.floor(Math.random() * 4); // 0-3
            const goal = Math.floor(Math.random() * 4); // 0-3

            // Normalize inputs
            inputs.push([
                age / 100,        // Normalize age
                weight / 150,    // Normalize weight
                healthCondition / 3, // Normalize condition
                goal / 3         // Normalize goal
            ]);

            // Output: [calorie_multiplier, protein_ratio, carb_ratio, fat_ratio, meal_frequency, snack_frequency, health_priority, goal_priority]
            const baseCalories = 2000;
            let calorieMultiplier = 1.0;
            let proteinRatio = 0.3;
            let carbRatio = 0.4;
            let fatRatio = 0.3;

            // Adjust based on goal
            if (goal === 0) { // weight-loss
                calorieMultiplier = 0.7;
                proteinRatio = 0.35;
                carbRatio = 0.35;
                fatRatio = 0.3;
            } else if (goal === 1) { // weight-gain
                calorieMultiplier = 1.3;
                proteinRatio = 0.3;
                carbRatio = 0.45;
                fatRatio = 0.25;
            } else if (goal === 2) { // fitness
                calorieMultiplier = 1.1;
                proteinRatio = 0.35;
                carbRatio = 0.4;
                fatRatio = 0.25;
            }

            outputs.push([
                calorieMultiplier,
                proteinRatio,
                carbRatio,
                fatRatio,
                0.8, // meal frequency
                0.6, // snack frequency
                healthCondition / 3,
                goal / 3
            ]);
        }

        return { inputs, outputs };
    },

    /* ============================================
       POPUP MANAGEMENT
       ============================================ */
    openInputPopup() {
        this.elements.popupOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeInputPopup() {
        this.elements.popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    openResultsPopup() {
        this.elements.resultsOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeResultsPopup() {
        this.elements.resultsOverlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    /* ============================================
       FORM HANDLING
       ============================================ */
    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value.trim(),
            age: parseInt(document.getElementById('age').value),
            weight: parseFloat(document.getElementById('weight').value),
            height: parseFloat(document.getElementById('height').value) || 170,
            healthCondition: document.getElementById('healthCondition').value,
            goal: document.getElementById('goal').value
        };

        // Enhanced Validation
        const errors = [];
        
        if (!formData.name || formData.name.trim().length < 2) {
            errors.push('Please enter a valid name (at least 2 characters)');
        }
        
        if (!formData.age || formData.age < 1 || formData.age > 120) {
            errors.push('Please enter a valid age (1-120 years)');
        }
        
        if (!formData.weight || formData.weight < 1 || formData.weight > 500) {
            errors.push('Please enter a valid weight (1-500 kg)');
        }
        
        if (!formData.healthCondition) {
            errors.push('Please select a health condition');
        }
        
        if (!formData.goal) {
            errors.push('Please select your goal');
        }
        
        if (errors.length > 0) {
            alert('Please fix the following errors:\n\n' + errors.join('\n'));
            return;
        }

        // Disable submit button
        this.elements.submitBtn.disabled = true;
        this.elements.submitBtn.textContent = 'Generating Plan...';

        // Close input popup and show loading
        this.closeInputPopup();
        this.showLoadingResults();

        // Generate plan using ML
        try {
            const plan = await this.generateNutritionPlan(formData);
            
            // Save to Firebase
            let saveSuccess = false;
            let planId = null;
            if (typeof saveUserPlanToFirebase === 'function') {
                try {
                    const saveResult = await saveUserPlanToFirebase(formData, plan);
                    if (saveResult.success) {
                        saveSuccess = true;
                        planId = saveResult.planId;
                        console.log('✅ Plan saved to Firebase successfully:', saveResult.planId);
                    } else {
                        console.warn('⚠️ Failed to save plan to Firebase:', saveResult.error);
                    }
                } catch (firebaseError) {
                    console.error('❌ Firebase save error:', firebaseError);
                    // Continue even if Firebase save fails
                }
            }
            
            // Show results after a short delay for better UX
            setTimeout(() => {
                this.displayResults(formData, plan, saveSuccess, planId);
            }, 1000);
        } catch (error) {
            console.error('Error generating plan:', error);
            alert('Error generating plan. Please try again.');
            this.closeResultsPopup();
        } finally {
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.textContent = 'Generate My Plan';
            this.elements.nutritionForm.reset();
        }
    },

    /* ============================================
       ML PLAN GENERATION
       ============================================ */
    async generateNutritionPlan(userData) {
        // Normalize input data
        const normalizedInput = tf.tensor2d([[
            userData.age / 100,
            userData.weight / 150,
            this.encodeHealthCondition(userData.healthCondition) / 3,
            this.encodeGoal(userData.goal) / 3
        ]]);

        // Get ML prediction
        let prediction = null;
        if (this.isModelReady && this.model) {
            try {
                prediction = this.model.predict(normalizedInput);
                const predictionData = await prediction.data();
                prediction.dispose();
                normalizedInput.dispose();
            } catch (error) {
                console.error('ML prediction error:', error);
            }
        }

        // Generate plan based on user data and ML insights
        const plan = {
            dailyCalories: this.calculateDailyCalories(userData, prediction),
            macros: this.calculateMacros(userData, prediction),
            meals: this.generateMealPlan(userData),
            recommendations: this.getRecommendations(userData),
            healthTips: this.getHealthTips(userData)
        };

        return plan;
    },

    encodeHealthCondition(condition) {
        const mapping = { 'diabetes': 0, 'high-bp': 1, 'heart-issue': 2, 'none': 3 };
        return mapping[condition] || 3;
    },

    encodeGoal(goal) {
        const mapping = { 'weight-loss': 0, 'weight-gain': 1, 'fitness': 2, 'healthy-diet': 3 };
        return mapping[goal] || 3;
    },

    calculateDailyCalories(userData, mlPrediction) {
        // Base BMR calculation (Mifflin-St Jeor Equation)
        const bmr = 10 * userData.weight + 6.25 * (170 - userData.age) + 5; // Simplified
        const baseCalories = bmr * 1.5; // Activity factor

        // Adjust based on goal
        let multiplier = 1.0;
        if (userData.goal === 'weight-loss') multiplier = 0.8;
        else if (userData.goal === 'weight-gain') multiplier = 1.2;
        else if (userData.goal === 'fitness') multiplier = 1.1;

        // Use ML prediction if available
        if (mlPrediction && mlPrediction.length > 0) {
            multiplier = mlPrediction[0] * 1.2; // Scale ML output
        }

        return Math.round(baseCalories * multiplier);
    },

    calculateMacros(userData, mlPrediction) {
        let proteinRatio = 0.3;
        let carbRatio = 0.4;
        let fatRatio = 0.3;

        // Adjust based on goal
        if (userData.goal === 'weight-loss') {
            proteinRatio = 0.35;
            carbRatio = 0.35;
            fatRatio = 0.3;
        } else if (userData.goal === 'weight-gain') {
            proteinRatio = 0.25;
            carbRatio = 0.45;
            fatRatio = 0.3;
        } else if (userData.goal === 'fitness') {
            proteinRatio = 0.35;
            carbRatio = 0.4;
            fatRatio = 0.25;
        }

        // Use ML prediction if available
        if (mlPrediction && mlPrediction.length >= 4) {
            proteinRatio = mlPrediction[1];
            carbRatio = mlPrediction[2];
            fatRatio = mlPrediction[3];
        }

        const calories = this.calculateDailyCalories(userData, mlPrediction);
        const protein = Math.round((calories * proteinRatio) / 4); // 4 cal per gram
        const carbs = Math.round((calories * carbRatio) / 4); // 4 cal per gram
        const fats = Math.round((calories * fatRatio) / 9); // 9 cal per gram

        return { protein, carbs, fats, proteinRatio, carbRatio, fatRatio };
    },

    generateMealPlan(userData) {
        const meals = {
            breakfast: this.selectMeal('breakfast', userData),
            lunch: this.selectMeal('lunch', userData),
            dinner: this.selectMeal('dinner', userData),
            snacks: this.selectMeal('snacks', userData)
        };

        return meals;
    },

    selectMeal(type, userData) {
        const availableMeals = this.nutritionData.meals[type];
        let selected = [];

        // Select meals based on health condition and goal
        if (userData.healthCondition === 'diabetes') {
            // Prefer low-carb options
            selected = availableMeals.filter(m => m.carbs < 40);
        } else if (userData.healthCondition === 'high-bp') {
            // Prefer heart-healthy options
            selected = availableMeals.filter(m => m.fats < 20);
        } else {
            selected = availableMeals;
        }

        // Select 1-2 items based on type
        const count = type === 'snacks' ? 2 : 1;
        const shuffled = [...selected].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    },

    getRecommendations(userData) {
        const goalRec = this.nutritionData.recommendations[userData.goal];
        const healthRec = this.nutritionData.healthConditions[userData.healthCondition];
        
        return {
            goal: goalRec,
            health: healthRec
        };
    },

    getHealthTips(userData) {
        const tips = [];
        const goalTips = this.nutritionData.recommendations[userData.goal].tips;
        const healthTips = this.nutritionData.healthConditions[userData.healthCondition];

        tips.push(...goalTips);
        tips.push(`Focus on: ${healthTips.focus}`);
        
        return tips;
    },

    /* ============================================
       HEALTH METRICS CALCULATIONS
       ============================================ */
    calculateHealthMetrics(userData) {
        // Use provided height or default to 170cm
        const height = userData.height || 170; // in cm
        const heightInMeters = height / 100;
        
        // Calculate BMI
        const bmi = userData.weight / (heightInMeters * heightInMeters);
        
        // Determine BMI category
        let bmiCategory = 'Normal';
        if (bmi < 18.5) bmiCategory = 'Underweight';
        else if (bmi >= 18.5 && bmi < 25) bmiCategory = 'Normal';
        else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
        else bmiCategory = 'Obese';
        
        // Calculate BMR using Mifflin-St Jeor Equation
        // For men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
        // For women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
        // Using average (assuming male for calculation)
        const bmr = 10 * userData.weight + 6.25 * height - 5 * userData.age + 5;
        
        // Calculate TDEE (Total Daily Energy Expenditure)
        // Using moderate activity level (1.55 multiplier)
        const tdee = bmr * 1.55;
        
        // Calculate water intake goal (ml per kg body weight, then convert to glasses)
        const waterGoal = Math.ceil((userData.weight * 35) / 250); // 35ml per kg, 250ml per glass
        
        return {
            bmi: bmi,
            bmiCategory: bmiCategory,
            bmr: bmr,
            tdee: tdee,
            waterGoal: waterGoal
        };
    },

    calculateHealthScore(userData, plan) {
        let score = 50; // Base score
        
        // Age factor (younger = better)
        if (userData.age < 30) score += 15;
        else if (userData.age < 50) score += 10;
        else if (userData.age < 70) score += 5;
        
        // BMI factor
        const metrics = this.calculateHealthMetrics(userData);
        if (metrics.bmiCategory === 'Normal') score += 20;
        else if (metrics.bmiCategory === 'Underweight' || metrics.bmiCategory === 'Overweight') score += 10;
        else score += 5;
        
        // Goal alignment
        if (plan.dailyCalories >= metrics.bmr * 0.9 && plan.dailyCalories <= metrics.tdee * 1.1) {
            score += 15;
        }
        
        // Health condition factor
        if (userData.healthCondition === 'none') score += 10;
        else score += 5; // Still good if managing condition
        
        // Cap at 100
        score = Math.min(100, score);
        
        let status = 'Good';
        if (score >= 80) status = 'Excellent';
        else if (score >= 60) status = 'Good';
        else if (score >= 40) status = 'Fair';
        else status = 'Needs Improvement';
        
        return { score: Math.round(score), status: status };
    },

    /* ============================================
       CHARTS & VISUALIZATIONS
       ============================================ */
    initializeCharts(plan, healthMetrics) {
        // Macro Distribution Chart
        const macroCtx = document.getElementById('macroChart');
        if (macroCtx && typeof Chart !== 'undefined') {
            new Chart(macroCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Protein', 'Carbohydrates', 'Fats'],
                    datasets: [{
                        data: [
                            plan.macros.protein,
                            plan.macros.carbs,
                            plan.macros.fats
                        ],
                        backgroundColor: [
                            '#7B2CBF',
                            '#00A86B',
                            '#6366F1'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value}g (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Progress Chart (weight tracking)
        this.initializeProgressChart();
    },

    initializeProgressChart() {
        const progressCtx = document.getElementById('progressChart');
        if (!progressCtx || typeof Chart === 'undefined') return;
        
        // Get stored weight data
        const weightData = this.getStoredWeightData();
        
        if (weightData.length === 0) {
            progressCtx.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-gray); padding: 2rem;">Log your weight to see progress chart</p>';
            return;
        }
        
        new Chart(progressCtx, {
            type: 'line',
            data: {
                labels: weightData.map(d => d.date),
                datasets: [{
                    label: 'Weight (kg)',
                    data: weightData.map(d => d.weight),
                    borderColor: '#7B2CBF',
                    backgroundColor: 'rgba(123, 44, 191, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        }
                    }
                }
            }
        });
    },

    getStoredWeightData() {
        const stored = localStorage.getItem('weightTracking');
        if (!stored) return [];
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    },

    initializeProgressTracking(userData) {
        // Initialize water tracking
        const waterData = this.getStoredWaterData();
        this.updateWaterDisplay(waterData.consumed, userData);
    },

    getStoredWaterData() {
        const today = new Date().toDateString();
        const stored = localStorage.getItem(`waterTracking_${today}`);
        if (!stored) return { consumed: 0, date: today };
        try {
            return JSON.parse(stored);
        } catch {
            return { consumed: 0, date: today };
        }
    },

    updateWaterDisplay(consumed, userData) {
        const metrics = this.calculateHealthMetrics(userData);
        const progressBar = document.getElementById('waterProgressBar');
        const waterConsumed = document.getElementById('waterConsumed');
        
        if (progressBar) {
            const percentage = (consumed / metrics.waterGoal) * 100;
            progressBar.style.width = `${Math.min(100, percentage)}%`;
        }
        
        if (waterConsumed) {
            waterConsumed.textContent = consumed;
        }
        
        // Update cup states
        document.querySelectorAll('.water-cup').forEach((cup, index) => {
            if (index < consumed) {
                cup.classList.add('consumed');
            } else {
                cup.classList.remove('consumed');
            }
        });
    },

    trackWater(cupNumber) {
        const today = new Date().toDateString();
        const waterData = this.getStoredWaterData();
        
        if (waterData.date !== today) {
            waterData.consumed = 0;
            waterData.date = today;
        }
        
        waterData.consumed = cupNumber;
        localStorage.setItem(`waterTracking_${today}`, JSON.stringify(waterData));
        
        if (this.currentUserData) {
            this.updateWaterDisplay(cupNumber, this.currentUserData);
        }
    },

    logWeight() {
        const weightInput = document.getElementById('weightInput');
        if (!weightInput || !weightInput.value) {
            alert('Please enter your weight');
            return;
        }
        
        const weight = parseFloat(weightInput.value);
        if (weight < 1 || weight > 500) {
            alert('Please enter a valid weight (1-500 kg)');
            return;
        }
        
        const weightData = this.getStoredWeightData();
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        
        // Check if entry exists for today
        const todayIndex = weightData.findIndex(d => d.date === today);
        if (todayIndex >= 0) {
            weightData[todayIndex].weight = weight;
        } else {
            weightData.push({ date: today, weight: weight });
        }
        
        // Keep only last 30 days
        if (weightData.length > 30) {
            weightData.shift();
        }
        
        localStorage.setItem('weightTracking', JSON.stringify(weightData));
        
        // Update chart
        this.initializeProgressChart();
        
        // Clear input
        weightInput.value = '';
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = '✅ Weight logged successfully!';
        successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--success); color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; animation: slideIn 0.3s ease;';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
    },

    showRecipe(mealType, meals) {
        const meal = Array.isArray(meals) ? meals[0] : meals;
        const mealName = meal.name || 'Meal';
        
        // Create recipe modal
        const modal = document.createElement('div');
        modal.className = 'recipe-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;';
        
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.style.cssText = 'background: white; padding: 2rem; border-radius: 12px; max-width: 500px; max-height: 80vh; overflow-y: auto; position: relative;';
        
        const recipes = this.getRecipeDetails(mealName);
        
        recipeCard.innerHTML = `
            <button onclick="this.closest('.recipe-modal').remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            <h2 style="margin-bottom: 1rem; color: var(--primary-color);">${mealName}</h2>
            <div style="margin-bottom: 1rem;">
                <strong>Nutrition per serving:</strong>
                <ul style="margin-top: 0.5rem;">
                    <li>Calories: ${meal.calories || 'N/A'} kcal</li>
                    <li>Protein: ${meal.protein || 'N/A'}g</li>
                    <li>Carbs: ${meal.carbs || 'N/A'}g</li>
                    <li>Fats: ${meal.fats || 'N/A'}g</li>
                </ul>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Ingredients:</strong>
                <ul style="margin-top: 0.5rem;">
                    ${recipes.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
            </div>
            <div>
                <strong>Instructions:</strong>
                <ol style="margin-top: 0.5rem;">
                    ${recipes.instructions.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        `;
        
        modal.appendChild(recipeCard);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    /* ============================================
       MEAL BUILDER MODAL MANAGEMENT
       ============================================ */
    openMealBuilder() {
        const overlay = document.getElementById('mealBuilderOverlay');
        const content = document.getElementById('mealBuilderContent');
        
        if (!overlay || !content) return;
        
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Generate meal builder content
        content.innerHTML = this.generateMealBuilderHTML();
        
        // Initialize drag and drop and click handlers
        setTimeout(() => {
            this.initializeIngredientDrag();
            this.initializeIngredientClicks();
            
            // Load saved session if exists
            this.loadMealSession();
        }, 150);
    },

    closeMealBuilder() {
        const overlay = document.getElementById('mealBuilderOverlay');
        if (!overlay) return;
        
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    generateMealBuilderHTML() {
        return `
            <div class="elementbars-builder">
                <!-- Header -->
                <div class="builder-header">
                    <h1>BUILD YOUR OWN MEAL</h1>
                    <p>Simply click or drag-and-drop ingredients to the table below.</p>
                </div>

                <!-- Category Selection (Horizontal with arrows) -->
                <div class="category-selector">
                    <button class="category-btn active" data-category="proteins" onclick="NutritionApp.selectCategory('proteins')">
                        🥩 Proteins
                    </button>
                    <span class="category-arrow">→</span>
                    <button class="category-btn" data-category="carbs" onclick="NutritionApp.selectCategory('carbs')">
                        🍞 Carbs
                    </button>
                    <span class="category-arrow">→</span>
                    <button class="category-btn" data-category="vegetables" onclick="NutritionApp.selectCategory('vegetables')">
                        🥬 Vegetables
                    </button>
                    <span class="category-arrow">→</span>
                    <button class="category-btn" data-category="fats" onclick="NutritionApp.selectCategory('fats')">
                        🥑 Fats & Oils
                    </button>
                </div>

                <!-- Active Category Items Display -->
                <div class="ingredient-selection-area">
                    <div class="ingredient-grid" id="ingredientGrid">
                        ${(() => {
                            const defaultCategory = 'proteins';
                            return this.getIngredientList(defaultCategory).map((ing, index) => {
                                // Use index-based approach to avoid JSON escaping issues
                                const ingredientId = `ing_${defaultCategory}_${index}`;
                                // Store in a global map
                                if (!window._ingredientMap) window._ingredientMap = {};
                                window._ingredientMap[ingredientId] = ing;
                                
                                return `
                                    <div class="ingredient-card" draggable="true" data-ingredient-id="${ingredientId}" data-ingredient='${JSON.stringify(ing)}' title="Click or drag to add">
                                        <div class="ingredient-card-icon">${ing.icon}</div>
                                        <div class="ingredient-card-name">${ing.name}</div>
                                        <div class="ingredient-card-calories">${ing.calories} kcal</div>
                                    </div>
                                `;
                            }).join('');
                        })()}
                    </div>
                </div>

                <!-- Main Builder Area -->
                <div class="builder-main-area">
                    <!-- Drag and Drop Zone (Center) -->
                    <div class="drop-zone-container">
                        <div class="drop-zone" id="mealDropZone" ondrop="NutritionApp.dropIngredient(event)" ondragover="NutritionApp.allowDrop(event)">
                            <div class="drop-zone-instructions">
                                <p>Please click and drag ingredients from above into this box to create your custom meal.</p>
                                <p class="drop-zone-empty" id="dropZoneEmpty">You currently don't have any ingredients in your meal.</p>
                            </div>
                            <div class="drop-zone-ingredients" id="dropZoneIngredients"></div>
                        </div>
                    </div>

                    <!-- Nutrition Panel (Right Side) -->
                    <div class="nutrition-panel">
                        <button class="save-meal-btn" onclick="NutritionApp.saveMeal()">
                            + SAVE MEAL
                        </button>
                        
                        <!-- Macro Breakdown Bar -->
                        <div class="macro-breakdown-bar">
                            <div class="macro-segment carbs-segment" id="carbs-segment" style="width: 0%">
                                <span>Carbs <strong id="carbs-percent">0%</strong></span>
                            </div>
                            <div class="macro-segment protein-segment" id="protein-segment" style="width: 0%">
                                <span>Protein <strong id="protein-percent">0%</strong></span>
                            </div>
                            <div class="macro-segment fat-segment" id="fat-segment" style="width: 0%">
                                <span>Fat <strong id="fat-percent">0%</strong></span>
                            </div>
                        </div>

                        <!-- Nutrition Facts -->
                        <div class="nutrition-facts">
                            <div class="nutrition-facts-label">Nutrition Facts</div>
                            <div class="nutrition-facts-content">
                                <div class="nutrition-line">
                                    <span>Serving Size</span>
                                    <span id="serving-size">1 Meal (0g)</span>
                                </div>
                                <div class="nutrition-line bold">
                                    <span>Amount Per Serving</span>
                                </div>
                                <div class="nutrition-line large">
                                    <span>Calories</span>
                                    <span id="nutrition-calories">0</span>
                                </div>
                                <div class="nutrition-line">
                                    <span>Total Fat</span>
                                    <span id="nutrition-fat">0g <span class="daily-value">0%</span></span>
                                </div>
                                <div class="nutrition-line indent">
                                    <span>Saturated Fat</span>
                                    <span id="nutrition-sat-fat">0g <span class="daily-value">0%</span></span>
                                </div>
                                <div class="nutrition-line">
                                    <span>Cholesterol</span>
                                    <span id="nutrition-cholesterol">0mg <span class="daily-value">0%</span></span>
                                </div>
                                <div class="nutrition-line">
                                    <span>Sodium</span>
                                    <span id="nutrition-sodium">0mg <span class="daily-value">0%</span></span>
                                </div>
                                <div class="nutrition-line">
                                    <span>Total Carbohydrate</span>
                                    <span id="nutrition-carbs">0g <span class="daily-value">0%</span></span>
                                </div>
                                <div class="nutrition-line indent">
                                    <span>Dietary Fiber</span>
                                    <span id="nutrition-fiber">0g <span class="daily-value">0%</span></span>
                                </div>
                                <div class="nutrition-line">
                                    <span>Total Sugars</span>
                                    <span id="nutrition-sugars">0g</span>
                                </div>
                                <div class="nutrition-line large">
                                    <span>Protein</span>
                                    <span id="nutrition-protein">0g</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    selectCategory(category) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Update ingredient grid
        const grid = document.getElementById('ingredientGrid');
        if (grid) {
            const ingredients = this.getIngredientList(category);
            grid.innerHTML = ingredients.map((ing, index) => {
                // Use index-based approach to avoid JSON escaping issues
                const ingredientId = `ing_${category}_${index}`;
                // Store in a global map
                if (!window._ingredientMap) window._ingredientMap = {};
                window._ingredientMap[ingredientId] = ing;
                
                return `
                    <div class="ingredient-card" draggable="true" data-ingredient-id="${ingredientId}" data-ingredient='${JSON.stringify(ing)}' title="Click or drag to add">
                        <div class="ingredient-card-icon">${ing.icon}</div>
                        <div class="ingredient-card-name">${ing.name}</div>
                        <div class="ingredient-card-calories">${ing.calories} kcal</div>
                    </div>
                `;
            }).join('');
        }

        // Re-initialize drag handlers
        setTimeout(() => {
            this.initializeIngredientDrag();
            console.log(`Drag handlers re-initialized for category: ${category}`);
        }, 50);
        // Click handler uses event delegation on parent, so it persists
        // No need to re-initialize
    },

    initializeIngredientClicks() {
        // Use event delegation on document to catch all clicks
        // This ensures it works even when content is dynamically updated
        if (document._mealBuilderClickHandler) {
            document.removeEventListener('click', document._mealBuilderClickHandler);
        }
        
        const clickHandler = (e) => {
            // Only handle clicks inside meal builder
            const mealBuilder = document.getElementById('mealBuilderOverlay');
            if (!mealBuilder || !mealBuilder.classList.contains('active')) {
                return;
            }
            
            const card = e.target.closest('.ingredient-card');
            if (!card) return;
            
            // Prevent default
            e.preventDefault();
            e.stopPropagation();
            
            try {
                // Try to get ingredient from map first (more reliable)
                const ingredientId = card.dataset.ingredientId;
                let ingredient = null;
                
                if (ingredientId && window._ingredientMap && window._ingredientMap[ingredientId]) {
                    ingredient = window._ingredientMap[ingredientId];
                } else {
                    // Fallback to parsing data attribute
                    const ingredientData = card.dataset.ingredient;
                    if (ingredientData) {
                        ingredient = JSON.parse(ingredientData);
                    }
                }
                
                if (ingredient && ingredient.name) {
                    console.log('Adding ingredient:', ingredient.name);
                    this.addIngredientToMeal(ingredient);
                    
                    // Visual feedback
                    card.style.transform = 'scale(0.95)';
                    card.style.opacity = '0.8';
                    setTimeout(() => {
                        card.style.transform = '';
                        card.style.opacity = '';
                    }, 150);
                } else {
                    console.error('Invalid ingredient data:', ingredient);
                }
            } catch (err) {
                console.error('Error parsing ingredient on click:', err);
                console.error('Card data:', {
                    ingredientId: card.dataset.ingredientId,
                    ingredient: card.dataset.ingredient
                });
            }
        };
        
        // Store handler reference
        document._mealBuilderClickHandler = clickHandler;
        
        // Add event listener to document
        document.addEventListener('click', clickHandler, true);
        
        console.log('Ingredient click handler initialized on document');
    },


    allowDrop(ev) {
        ev.preventDefault();
        if (ev.currentTarget) {
            ev.currentTarget.classList.add('drag-over');
        }
    },

    dropIngredient(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        
        console.log('dropIngredient called (inline handler)');
        
        const dropZone = ev.currentTarget || document.getElementById('mealDropZone');
        if (!dropZone) {
            console.error('Drop zone not found');
            return;
        }
        
        dropZone.classList.remove('drag-over');
        
        const ingredientData = ev.dataTransfer.getData('text/plain');
        console.log('Drop data (inline):', ingredientData);
        
        if (ingredientData) {
            try {
                const ingredient = JSON.parse(ingredientData);
                console.log('Dropped ingredient (inline):', ingredient.name);
                this.addIngredientToMeal(ingredient);
            } catch (err) {
                console.error('Error parsing ingredient on drop (inline):', err);
                console.error('Raw data:', ingredientData);
            }
        } else {
            console.warn('No ingredient data in drop event (inline)');
        }
    },

    addIngredientToMeal(ingredient) {
        if (!ingredient) {
            console.error('No ingredient provided to addIngredientToMeal');
            return;
        }
        
        console.log('Adding ingredient to meal:', ingredient);
        
        const dropZone = document.getElementById('mealDropZone');
        const emptyMsg = document.getElementById('dropZoneEmpty');
        const ingredientsContainer = document.getElementById('dropZoneIngredients');
        
        if (!dropZone || !ingredientsContainer) {
            console.error('Drop zone elements not found:', {
                dropZone: !!dropZone,
                ingredientsContainer: !!ingredientsContainer,
                dropZoneId: 'mealDropZone',
                containerId: 'dropZoneIngredients'
            });
            return;
        }
        
        if (emptyMsg) emptyMsg.style.display = 'none';
        
        // Create ingredient chip
        const chip = document.createElement('div');
        chip.className = 'ingredient-chip';
        chip.innerHTML = `
            <span class="chip-icon">${ingredient.icon || '🍽️'}</span>
            <span class="chip-name">${ingredient.name || 'Unknown'}</span>
            <button class="chip-remove" onclick="NutritionApp.removeIngredientFromMeal(this)">×</button>
        `;
        chip.dataset.ingredient = JSON.stringify(ingredient);
        
        ingredientsContainer.appendChild(chip);
        
        // Save to session (localStorage)
        this.saveMealSession();
        
        // Update nutrition
        this.updateMealNutrition();
        
        console.log('Ingredient successfully added:', ingredient.name);
    },

    saveMealSession() {
        // Save current meal to session storage
        const ingredientsContainer = document.getElementById('dropZoneIngredients');
        if (!ingredientsContainer) return;
        
        const chips = ingredientsContainer.querySelectorAll('.ingredient-chip');
        const ingredients = Array.from(chips).map(chip => {
            try {
                return JSON.parse(chip.dataset.ingredient);
            } catch (e) {
                return null;
            }
        }).filter(ing => ing !== null);
        
        const sessionData = {
            ingredients: ingredients,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('currentMealSession', JSON.stringify(sessionData));
    },

    loadMealSession() {
        // Load meal from session
        const sessionData = localStorage.getItem('currentMealSession');
        if (!sessionData) return;
        
        try {
            const data = JSON.parse(sessionData);
            const ingredientsContainer = document.getElementById('dropZoneIngredients');
            const emptyMsg = document.getElementById('dropZoneEmpty');
            
            if (!ingredientsContainer) return;
            
            // Clear existing
            ingredientsContainer.innerHTML = '';
            
            if (data.ingredients && data.ingredients.length > 0) {
                if (emptyMsg) emptyMsg.style.display = 'none';
                
                data.ingredients.forEach(ingredient => {
                    const chip = document.createElement('div');
                    chip.className = 'ingredient-chip';
                    chip.innerHTML = `
                        <span class="chip-icon">${ingredient.icon || '🍽️'}</span>
                        <span class="chip-name">${ingredient.name || 'Unknown'}</span>
                        <button class="chip-remove" onclick="NutritionApp.removeIngredientFromMeal(this)">×</button>
                    `;
                    chip.dataset.ingredient = JSON.stringify(ingredient);
                    ingredientsContainer.appendChild(chip);
                });
                
                this.updateMealNutrition();
                console.log('Meal session loaded:', data.ingredients.length, 'ingredients');
            }
        } catch (e) {
            console.error('Error loading meal session:', e);
        }
    },

    removeIngredientFromMeal(button) {
        const chip = button.closest('.ingredient-chip');
        chip.remove();
        
        const ingredientsContainer = document.getElementById('dropZoneIngredients');
        const emptyMsg = document.getElementById('dropZoneEmpty');
        
        if (ingredientsContainer.children.length === 0 && emptyMsg) {
            emptyMsg.style.display = 'block';
        }
        
        // Update session
        this.saveMealSession();
        
        // Update nutrition
        this.updateMealNutrition();
    },

    updateMealNutrition() {
        const ingredientsContainer = document.getElementById('dropZoneIngredients');
        if (!ingredientsContainer) {
            console.warn('dropZoneIngredients not found');
            return;
        }
        
        const chips = ingredientsContainer.querySelectorAll('.ingredient-chip');
        
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        
        chips.forEach(chip => {
            try {
                const ingredient = JSON.parse(chip.dataset.ingredient);
                totalCalories += ingredient.calories;
                totalProtein += ingredient.protein;
                totalCarbs += ingredient.carbs;
                totalFats += ingredient.fats;
            } catch (e) {
                console.error('Error parsing ingredient:', e);
            }
        });
        
        // Update nutrition facts (with null checks)
        const caloriesEl = document.getElementById('nutrition-calories');
        const proteinEl = document.getElementById('nutrition-protein');
        const carbsEl = document.getElementById('nutrition-carbs');
        const fatEl = document.getElementById('nutrition-fat');
        const satFatEl = document.getElementById('nutrition-sat-fat');
        const fiberEl = document.getElementById('nutrition-fiber');
        const cholesterolEl = document.getElementById('nutrition-cholesterol');
        const sodiumEl = document.getElementById('nutrition-sodium');
        const sugarsEl = document.getElementById('nutrition-sugars');
        const servingSizeEl = document.getElementById('serving-size');
        
        // Calculate derived values
        const estimatedCholesterol = totalProtein * 5; // Rough estimate: 5mg per gram of protein
        const estimatedSodium = totalCalories * 0.5; // Rough estimate: 0.5mg per calorie
        const estimatedSugars = totalCarbs * 0.1; // Rough estimate: 10% of carbs are sugars
        
        if (caloriesEl) caloriesEl.textContent = totalCalories;
        if (proteinEl) proteinEl.textContent = `${totalProtein.toFixed(1)}g`;
        if (carbsEl) carbsEl.innerHTML = `${totalCarbs.toFixed(1)}g <span class="daily-value">${Math.round((totalCarbs / 300) * 100)}%</span>`;
        if (fatEl) fatEl.innerHTML = `${totalFats.toFixed(1)}g <span class="daily-value">${Math.round((totalFats / 65) * 100)}%</span>`;
        if (satFatEl) satFatEl.innerHTML = `${(totalFats * 0.3).toFixed(1)}g <span class="daily-value">${Math.round((totalFats * 0.3 / 20) * 100)}%</span>`;
        if (fiberEl) fiberEl.innerHTML = `${(totalCarbs * 0.1).toFixed(1)}g <span class="daily-value">${Math.round((totalCarbs * 0.1 / 28) * 100)}%</span>`;
        if (cholesterolEl) cholesterolEl.innerHTML = `${Math.round(estimatedCholesterol)}mg <span class="daily-value">${Math.round((estimatedCholesterol / 300) * 100)}%</span>`;
        if (sodiumEl) sodiumEl.innerHTML = `${Math.round(estimatedSodium)}mg <span class="daily-value">${Math.round((estimatedSodium / 2300) * 100)}%</span>`;
        if (sugarsEl) sugarsEl.textContent = `${estimatedSugars.toFixed(1)}g`;
        
        // Calculate percentages for macro bar
        const totalMacros = totalCarbs + totalProtein + totalFats;
        const carbsSegment = document.getElementById('carbs-segment');
        const proteinSegment = document.getElementById('protein-segment');
        const fatSegment = document.getElementById('fat-segment');
        const carbsPercentEl = document.getElementById('carbs-percent');
        const proteinPercentEl = document.getElementById('protein-percent');
        const fatPercentEl = document.getElementById('fat-percent');
        
        if (totalMacros > 0) {
            const carbsPercent = (totalCarbs / totalMacros) * 100;
            const proteinPercent = (totalProtein / totalMacros) * 100;
            const fatPercent = (totalFats / totalMacros) * 100;
            
            if (carbsSegment) carbsSegment.style.width = `${carbsPercent}%`;
            if (proteinSegment) proteinSegment.style.width = `${proteinPercent}%`;
            if (fatSegment) fatSegment.style.width = `${fatPercent}%`;
            
            if (carbsPercentEl) carbsPercentEl.textContent = `${Math.round(carbsPercent)}%`;
            if (proteinPercentEl) proteinPercentEl.textContent = `${Math.round(proteinPercent)}%`;
            if (fatPercentEl) fatPercentEl.textContent = `${Math.round(fatPercent)}%`;
        } else {
            if (carbsSegment) carbsSegment.style.width = '0%';
            if (proteinSegment) proteinSegment.style.width = '0%';
            if (fatSegment) fatSegment.style.width = '0%';
        }
        
        // Update serving size
        const totalWeight = totalCalories / 4; // Rough estimate
        if (servingSizeEl) servingSizeEl.textContent = `1 Meal (${totalWeight.toFixed(0)}g)`;
        
        console.log('Nutrition updated:', {
            calories: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fats: totalFats
        });
    },

    async saveMeal() {
        const ingredientsContainer = document.getElementById('dropZoneIngredients');
        const chips = ingredientsContainer.querySelectorAll('.ingredient-chip');
        
        if (chips.length === 0) {
            alert('Please add ingredients to your meal first!');
            return;
        }
        
        const ingredients = Array.from(chips).map(chip => JSON.parse(chip.dataset.ingredient));
        
        // Calculate totals
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        
        ingredients.forEach(ing => {
            totalCalories += ing.calories;
            totalProtein += ing.protein;
            totalCarbs += ing.carbs;
            totalFats += ing.fats;
        });
        
        // Calculate percentages
        const totalMacros = totalCarbs + totalProtein + totalFats;
        const carbsPercent = totalMacros > 0 ? (totalCarbs / totalMacros) * 100 : 0;
        const proteinPercent = totalMacros > 0 ? (totalProtein / totalMacros) * 100 : 0;
        const fatPercent = totalMacros > 0 ? (totalFats / totalMacros) * 100 : 0;
        
        const totalWeight = totalCalories / 4; // Rough estimate
        
        // Prepare meal data
        const mealData = {
            mealName: `Custom Meal - ${new Date().toLocaleDateString()}`,
            ingredients: ingredients,
            totalCalories: totalCalories,
            totalProtein: totalProtein,
            totalCarbs: totalCarbs,
            totalFats: totalFats,
            carbsPercent: carbsPercent,
            proteinPercent: proteinPercent,
            fatPercent: fatPercent,
            servingSize: `1 Meal (${totalWeight.toFixed(0)}g)`,
            totalWeight: totalWeight,
            userId: this.auth.currentUser?.id || null,
            savedAt: new Date().toISOString()
        };
        
        // Show loading state
        const saveBtn = document.querySelector('.save-meal-btn');
        if (!saveBtn) {
            console.error('Save button not found');
            return;
        }
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        try {
            // Save to Firebase
            if (typeof saveCustomMealToFirebase === 'function') {
                const result = await saveCustomMealToFirebase(mealData);
                
                if (result.success) {
                    // Show success message
                    saveBtn.textContent = '✓ Saved!';
                    saveBtn.style.background = '#10B981';
                    
                    // Show success notification
                    this.showMealSaveNotification(true, result.mealId);
                    
                    // Clear session after successful save (optional - comment out if you want to keep it)
                    // localStorage.removeItem('currentMealSession');
                    
                    // Reset button after 2 seconds
                    setTimeout(() => {
                        saveBtn.textContent = originalText;
                        saveBtn.style.background = '';
                        saveBtn.disabled = false;
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Failed to save meal');
                }
                } else {
                    // Fallback to localStorage if Firebase not available
                    const savedMeals = JSON.parse(localStorage.getItem('savedMeals') || '[]');
                    savedMeals.push({
                        ...mealData,
                        id: 'meal_' + Date.now()
                    });
                    localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
                    
                    // Show success notification
                    this.showMealSaveNotification(true, 'local');
                
                saveBtn.textContent = '✓ Saved!';
                saveBtn.style.background = '#10B981';
                this.showMealSaveNotification(true, 'local');
                
                setTimeout(() => {
                    saveBtn.textContent = originalText;
                    saveBtn.style.background = '';
                    saveBtn.disabled = false;
                }, 2000);
            }
        } catch (error) {
            console.error('Error saving meal:', error);
            saveBtn.textContent = '✗ Error';
            saveBtn.style.background = '#EF4444';
            this.showMealSaveNotification(false, error.message);
            
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '';
                saveBtn.disabled = false;
            }, 2000);
        }
    },

    showMealSaveNotification(success, mealId) {
        const notification = document.createElement('div');
        notification.className = 'meal-save-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${success ? '#10B981' : '#EF4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.5rem;">${success ? '✓' : '✗'}</span>
                <div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">
                        ${success ? 'Meal Saved Successfully!' : 'Failed to Save Meal'}
                    </div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">
                        ${success ? `Meal ID: ${mealId.substring(0, 8)}...` : mealId}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /* ============================================
       INTERACTIVE MEAL BUILDER (Element Bars Style)
       ============================================ */
    ingredientDatabase: {
        proteins: [
            { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fats: 3.6, icon: '🍗' },
            { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fats: 12, icon: '🐟' },
            { name: 'Eggs (2 large)', calories: 140, protein: 12, carbs: 1, fats: 10, icon: '🥚' },
            { name: 'Greek Yogurt (100g)', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, icon: '🥛' },
            { name: 'Tofu (100g)', calories: 76, protein: 8, carbs: 1.9, fats: 4.8, icon: '🧈' },
            { name: 'Turkey Breast (100g)', calories: 135, protein: 30, carbs: 0, fats: 1, icon: '🦃' },
            { name: 'Lean Beef (100g)', calories: 250, protein: 26, carbs: 0, fats: 17, icon: '🥩' },
            { name: 'Tuna (100g)', calories: 132, protein: 28, carbs: 0, fats: 1, icon: '🐟' }
        ],
        carbs: [
            { name: 'Brown Rice (100g cooked)', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, icon: '🍚' },
            { name: 'Quinoa (100g cooked)', calories: 120, protein: 4.4, carbs: 22, fats: 1.9, icon: '🌾' },
            { name: 'Sweet Potato (100g)', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, icon: '🍠' },
            { name: 'Oats (50g dry)', calories: 194, protein: 6.9, carbs: 33, fats: 3.6, icon: '🌾' },
            { name: 'Whole Wheat Bread (1 slice)', calories: 81, protein: 4, carbs: 13, fats: 1.2, icon: '🍞' },
            { name: 'Pasta (100g cooked)', calories: 131, protein: 5, carbs: 25, fats: 1.1, icon: '🍝' },
            { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, icon: '🍌' }
        ],
        vegetables: [
            { name: 'Spinach (100g)', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, icon: '🥬' },
            { name: 'Broccoli (100g)', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, icon: '🥦' },
            { name: 'Carrots (100g)', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, icon: '🥕' },
            { name: 'Bell Peppers (100g)', calories: 31, protein: 1, carbs: 7, fats: 0.3, icon: '🫑' },
            { name: 'Tomatoes (100g)', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, icon: '🍅' },
            { name: 'Cucumber (100g)', calories: 16, protein: 0.7, carbs: 4, fats: 0.1, icon: '🥒' },
            { name: 'Avocado (100g)', calories: 160, protein: 2, carbs: 9, fats: 15, icon: '🥑' },
            { name: 'Mushrooms (100g)', calories: 22, protein: 3.1, carbs: 3.3, fats: 0.3, icon: '🍄' }
        ],
        fats: [
            { name: 'Almonds (30g)', calories: 172, protein: 6.3, carbs: 6.1, fats: 15, icon: '🥜' },
            { name: 'Olive Oil (1 tbsp)', calories: 119, protein: 0, carbs: 0, fats: 14, icon: '🫒' },
            { name: 'Peanut Butter (1 tbsp)', calories: 94, protein: 4, carbs: 3, fats: 8, icon: '🥜' },
            { name: 'Walnuts (30g)', calories: 196, protein: 4.6, carbs: 4, fats: 20, icon: '🌰' },
            { name: 'Chia Seeds (1 tbsp)', calories: 60, protein: 2, carbs: 5, fats: 4, icon: '🌱' },
            { name: 'Flax Seeds (1 tbsp)', calories: 37, protein: 1.3, carbs: 2, fats: 3, icon: '🌾' }
        ]
    },

    getIngredientList(category) {
        return this.ingredientDatabase[category] || [];
    },

    toggleCategory(header) {
        const category = header.closest('.ingredient-category');
        const list = category.querySelector('.ingredient-list');
        const icon = header.querySelector('.toggle-icon');
        
        if (list.style.display === 'none') {
            list.style.display = 'flex';
            icon.textContent = '▼';
        } else {
            list.style.display = 'none';
            icon.textContent = '▶';
        }
    },


    addIngredientToDailyMeal(ingredient, mealType) {
        const dropzone = document.querySelector(`[data-meal="${mealType}"] .slot-dropzone`);
        const ingredientsContainer = dropzone.querySelector('.slot-ingredients');
        const placeholder = dropzone.querySelector('.slot-placeholder');
        
        if (placeholder) placeholder.style.display = 'none';
        
        // Create ingredient chip
        const chip = document.createElement('div');
        chip.className = 'ingredient-chip';
        chip.innerHTML = `
            <span class="chip-icon">${ingredient.icon}</span>
            <span class="chip-name">${ingredient.name}</span>
            <button class="chip-remove" onclick="NutritionApp.removeIngredient(this, '${mealType}')">×</button>
        `;
        chip.dataset.ingredient = JSON.stringify(ingredient);
        
        ingredientsContainer.appendChild(chip);
        
        // Initialize drag for ingredient items
        this.initializeIngredientDrag();
        
        // Update nutrition
        this.updateDailyMealNutrition(mealType);
        this.updateDailyTotals();
    },

    removeIngredient(button, mealType) {
        const chip = button.closest('.ingredient-chip');
        chip.remove();
        
        const dropzone = document.querySelector(`[data-meal="${mealType}"] .slot-dropzone`);
        const ingredientsContainer = dropzone.querySelector('.slot-ingredients');
        const placeholder = dropzone.querySelector('.slot-placeholder');
        
        if (ingredientsContainer.children.length === 0 && placeholder) {
            placeholder.style.display = 'block';
        }
        
        this.updateMealNutrition(mealType);
        this.updateDailyTotals();
    },

    updateDailyMealNutrition(mealType) {
        const dropzone = document.querySelector(`[data-meal="${mealType}"] .slot-dropzone`);
        if (!dropzone) return;
        
        const chips = dropzone.querySelectorAll('.ingredient-chip');
        
        let totalCalories = 0;
        let totalProtein = 0;
        
        chips.forEach(chip => {
            try {
                const ingredient = JSON.parse(chip.dataset.ingredient);
                totalCalories += ingredient.calories;
                totalProtein += ingredient.protein;
            } catch (e) {
                console.error('Error parsing ingredient:', e);
            }
        });
        
        const caloriesEl = document.getElementById(`${mealType}-calories`);
        const proteinEl = document.getElementById(`${mealType}-protein`);
        if (caloriesEl) caloriesEl.textContent = totalCalories;
        if (proteinEl) proteinEl.textContent = `${totalProtein.toFixed(1)}g`;
    },

    updateDailyTotals() {
        const meals = ['breakfast', 'lunch', 'dinner'];
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        
        meals.forEach(mealType => {
            const dropzone = document.querySelector(`[data-meal="${mealType}"] .slot-dropzone`);
            const chips = dropzone.querySelectorAll('.ingredient-chip');
            
            chips.forEach(chip => {
                try {
                    const ingredient = JSON.parse(chip.dataset.ingredient);
                    totalCalories += ingredient.calories;
                    totalProtein += ingredient.protein;
                    totalCarbs += ingredient.carbs;
                    totalFats += ingredient.fats;
                } catch (e) {
                    console.error('Error parsing ingredient:', e);
                }
            });
        });
        
        document.getElementById('total-calories').textContent = totalCalories;
        document.getElementById('total-protein').textContent = `${totalProtein.toFixed(1)}g`;
        document.getElementById('total-carbs').textContent = `${totalCarbs.toFixed(1)}g`;
        document.getElementById('total-fats').textContent = `${totalFats.toFixed(1)}g`;
        
        // Update progress bar (use 2000 as default goal if no plan)
        const goalCalories = this.currentPlan ? this.currentPlan.dailyCalories : 2000;
        const progress = Math.min(100, (totalCalories / goalCalories) * 100);
        const progressBar = document.getElementById('calorie-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.style.backgroundColor = progress > 100 ? '#EF4444' : progress > 90 ? '#F59E0B' : '#10B981';
            progressBar.textContent = `${Math.round(progress)}%`;
        }
    },

    initializeIngredientDrag() {
        // Set up drag for ingredient cards using event delegation
        const selectionArea = document.querySelector('.ingredient-selection-area');
        if (!selectionArea) return;
        
        // Remove old drag handlers
        if (selectionArea._dragStartHandler) {
            selectionArea.removeEventListener('dragstart', selectionArea._dragStartHandler, true);
            selectionArea.removeEventListener('dragend', selectionArea._dragEndHandler, true);
        }
        
        // Drag start handler
        const dragStartHandler = (e) => {
            const card = e.target.closest('.ingredient-card');
            if (!card) {
                console.log('No ingredient card found in drag start');
                return;
            }
            
            console.log('Drag started on card:', card);
            
            // Try to get ingredient from map first
            const ingredientId = card.dataset.ingredientId;
            let ingredient = null;
            
            if (ingredientId && window._ingredientMap && window._ingredientMap[ingredientId]) {
                ingredient = window._ingredientMap[ingredientId];
                console.log('Got ingredient from map:', ingredient.name);
            } else {
                // Fallback to parsing data attribute
                const ingredientData = card.dataset.ingredient;
                if (ingredientData) {
                    try {
                        ingredient = JSON.parse(ingredientData);
                        console.log('Got ingredient from data attribute:', ingredient.name);
                    } catch (err) {
                        console.error('Error parsing ingredient data:', err);
                    }
                }
            }
            
            if (ingredient) {
                const ingredientJson = JSON.stringify(ingredient);
                e.dataTransfer.setData('text/plain', ingredientJson);
                e.dataTransfer.effectAllowed = 'move';
                card.style.opacity = '0.5';
                console.log('Drag data set:', ingredient.name);
            } else {
                console.error('No ingredient found for drag');
            }
        };
        
        // Drag end handler
        const dragEndHandler = (e) => {
            const card = e.target.closest('.ingredient-card');
            if (card) {
                card.style.opacity = '1';
            }
        };
        
        // Store handlers
        selectionArea._dragStartHandler = dragStartHandler;
        selectionArea._dragEndHandler = dragEndHandler;
        
        // Add event listeners with capture phase
        selectionArea.addEventListener('dragstart', dragStartHandler, true);
        selectionArea.addEventListener('dragend', dragEndHandler, true);
        
        console.log('Drag handlers initialized on selection area');
        
        // Set up drop zone
        const dropZone = document.getElementById('mealDropZone');
        if (dropZone) {
            // Remove old handlers
            if (dropZone._dropHandlers) {
                dropZone.removeEventListener('dragover', dropZone._dropHandlers.dragover);
                dropZone.removeEventListener('dragleave', dropZone._dropHandlers.dragleave);
                dropZone.removeEventListener('drop', dropZone._dropHandlers.drop);
            }
            
            const dragoverHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('drag-over');
            };
            
            const dragleaveHandler = (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
            };
            
            const dropHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
                
                console.log('Drop event triggered');
                const ingredientData = e.dataTransfer.getData('text/plain');
                console.log('Drop data received:', ingredientData);
                
                if (ingredientData) {
                    try {
                        const ingredient = JSON.parse(ingredientData);
                        console.log('Parsed ingredient:', ingredient);
                        this.addIngredientToMeal(ingredient);
                    } catch (err) {
                        console.error('Error parsing ingredient on drop:', err);
                        console.error('Raw data:', ingredientData);
                    }
                } else {
                    console.warn('No ingredient data in drop event');
                }
            };
            
            // Store handlers
            dropZone._dropHandlers = {
                dragover: dragoverHandler,
                dragleave: dragleaveHandler,
                drop: dropHandler
            };
            
            // Add event listeners
            dropZone.addEventListener('dragover', dragoverHandler);
            dropZone.addEventListener('dragleave', dragleaveHandler);
            dropZone.addEventListener('drop', dropHandler);
            
            console.log('Drop zone handlers initialized');
        }
    },

    getRecipeDetails(mealName) {
        // Recipe database
        const recipes = {
            'Oatmeal with berries': {
                ingredients: ['1 cup rolled oats', '1 cup water or milk', '1/2 cup mixed berries', '1 tbsp honey', '1/4 cup nuts'],
                instructions: [
                    'Cook oats with water/milk for 5 minutes',
                    'Add berries and mix well',
                    'Drizzle with honey',
                    'Top with nuts and serve'
                ]
            },
            'Greek yogurt with nuts': {
                ingredients: ['1 cup Greek yogurt', '1/4 cup mixed nuts', '1 tbsp honey', 'Fresh fruits'],
                instructions: [
                    'Scoop Greek yogurt into a bowl',
                    'Add mixed nuts on top',
                    'Drizzle with honey',
                    'Garnish with fresh fruits'
                ]
            },
            'Grilled chicken salad': {
                ingredients: ['200g chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Olive oil dressing'],
                instructions: [
                    'Grill chicken breast until cooked',
                    'Slice and place on bed of greens',
                    'Add chopped vegetables',
                    'Drizzle with olive oil dressing'
                ]
            },
            'Salmon with sweet potato': {
                ingredients: ['200g salmon fillet', '1 medium sweet potato', 'Broccoli', 'Lemon', 'Herbs'],
                instructions: [
                    'Bake sweet potato at 200°C for 45 minutes',
                    'Pan-sear salmon for 4-5 minutes each side',
                    'Steam broccoli',
                    'Serve with lemon and herbs'
                ]
            }
        };
        
        // Default recipe if not found
        const defaultRecipe = {
            ingredients: ['Fresh ingredients', 'Herbs and spices', 'Healthy oils'],
            instructions: [
                'Prepare fresh ingredients',
                'Cook using healthy methods (steaming, grilling, baking)',
                'Season with herbs and spices',
                'Serve hot and enjoy'
            ]
        };
        
        return recipes[mealName] || defaultRecipe;
    },

    /* ============================================
       UI DISPLAY
       ============================================ */
    showLoadingResults() {
        this.openResultsPopup();
        this.elements.resultsContent.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>AI is analyzing your profile and generating your personalized nutrition plan...</p>
            </div>
        `;
    },

    displayResults(userData, plan, saveSuccess = false, planId = null) {
        const saveStatus = saveSuccess 
            ? '<p style="color: var(--success); margin-top: 0.5rem; font-weight: 600;">✅ Your plan has been saved successfully!</p>'
            : '<p style="color: var(--text-gray); margin-top: 0.5rem; font-size: 0.9rem;">Note: Plan could not be saved to database</p>';
        
        // Calculate health metrics
        const healthMetrics = this.calculateHealthMetrics(userData);
        const healthScore = this.calculateHealthScore(userData, plan);
        
        // Show tabs if user is logged in
        const resultsTabs = document.getElementById('resultsTabs');
        let resultsTabContent = document.getElementById('resultsTabContent');
        if (this.auth.isAuthenticated && this.auth.userType === 'user') {
            if (resultsTabs) resultsTabs.style.display = 'flex';
        } else {
            if (resultsTabs) resultsTabs.style.display = 'none';
        }
        
        const html = `
            <div class="results-header">
                <h2>Your Personalized Nutrition Plan</h2>
                <p>Generated using AI based on your profile</p>
                ${saveStatus}
            </div>
            <div class="results-content">
                <!-- Health Metrics Dashboard -->
                <div class="health-metrics-dashboard">
                    <h3>📈 Your Health Metrics</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-icon">⚖️</div>
                            <div class="metric-value">${healthMetrics.bmi.toFixed(1)}</div>
                            <div class="metric-label">BMI</div>
                            <div class="metric-status ${healthMetrics.bmiCategory.toLowerCase().replace(' ', '-')}">${healthMetrics.bmiCategory}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">🔥</div>
                            <div class="metric-value">${healthMetrics.bmr.toFixed(0)}</div>
                            <div class="metric-label">BMR (kcal/day)</div>
                            <div class="metric-desc">Basal Metabolic Rate</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">💪</div>
                            <div class="metric-value">${healthMetrics.tdee.toFixed(0)}</div>
                            <div class="metric-label">TDEE (kcal/day)</div>
                            <div class="metric-desc">Total Daily Energy Expenditure</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">⭐</div>
                            <div class="metric-value">${healthScore.score}/100</div>
                            <div class="metric-label">Health Score</div>
                            <div class="metric-status ${healthScore.status}">${healthScore.status}</div>
                        </div>
                    </div>
                </div>

                <!-- Macro Distribution Chart -->
                <div class="result-section chart-section">
                    <h3>📊 Macro Distribution</h3>
                    <div class="chart-container">
                        <canvas id="macroChart"></canvas>
                    </div>
                    <div class="macro-breakdown">
                        <div class="macro-item">
                            <div class="macro-color" style="background: #7B2CBF;"></div>
                            <span><strong>Protein:</strong> ${plan.macros.protein}g (${Math.round(plan.macros.proteinRatio * 100)}%)</span>
                        </div>
                        <div class="macro-item">
                            <div class="macro-color" style="background: #00A86B;"></div>
                            <span><strong>Carbs:</strong> ${plan.macros.carbs}g (${Math.round(plan.macros.carbRatio * 100)}%)</span>
                        </div>
                        <div class="macro-item">
                            <div class="macro-color" style="background: #6366F1;"></div>
                            <span><strong>Fats:</strong> ${plan.macros.fats}g (${Math.round(plan.macros.fatRatio * 100)}%)</span>
                        </div>
                    </div>
                </div>

                <!-- Daily Nutrition Goals -->
                <div class="result-section">
                    <h3>🎯 Daily Nutrition Goals</h3>
                    <div class="nutrition-goals-grid">
                        <div class="goal-card">
                            <div class="goal-icon">🔥</div>
                            <div class="goal-value">${plan.dailyCalories}</div>
                            <div class="goal-label">Calories</div>
                        </div>
                        <div class="goal-card">
                            <div class="goal-icon">🥩</div>
                            <div class="goal-value">${plan.macros.protein}g</div>
                            <div class="goal-label">Protein</div>
                        </div>
                        <div class="goal-card">
                            <div class="goal-icon">🍞</div>
                            <div class="goal-value">${plan.macros.carbs}g</div>
                            <div class="goal-label">Carbs</div>
                        </div>
                        <div class="goal-card">
                            <div class="goal-icon">🥑</div>
                            <div class="goal-value">${plan.macros.fats}g</div>
                            <div class="goal-label">Fats</div>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Meal Plan with Recipes -->
                <div class="result-section">
                    <h3>🍽️ Your AI-Generated Meal Plan</h3>
                    <div class="meal-plan-grid">
                        <div class="meal-card">
                            <div class="meal-time">🌅 Breakfast</div>
                            <div class="meal-name">${plan.meals.breakfast.map(m => m.name).join(', ')}</div>
                            <div class="meal-nutrition">
                                <span>${plan.meals.breakfast.reduce((sum, m) => sum + m.calories, 0)} kcal</span>
                                <span>P: ${plan.meals.breakfast.reduce((sum, m) => sum + m.protein, 0)}g</span>
                            </div>
                            <button class="recipe-btn" onclick="NutritionApp.showRecipe('breakfast', ${JSON.stringify(plan.meals.breakfast).replace(/"/g, '&quot;')})">View Recipe</button>
                        </div>
                        <div class="meal-card">
                            <div class="meal-time">☀️ Lunch</div>
                            <div class="meal-name">${plan.meals.lunch.map(m => m.name).join(', ')}</div>
                            <div class="meal-nutrition">
                                <span>${plan.meals.lunch.reduce((sum, m) => sum + m.calories, 0)} kcal</span>
                                <span>P: ${plan.meals.lunch.reduce((sum, m) => sum + m.protein, 0)}g</span>
                            </div>
                            <button class="recipe-btn" onclick="NutritionApp.showRecipe('lunch', ${JSON.stringify(plan.meals.lunch).replace(/"/g, '&quot;')})">View Recipe</button>
                        </div>
                        <div class="meal-card">
                            <div class="meal-time">🌙 Dinner</div>
                            <div class="meal-name">${plan.meals.dinner.map(m => m.name).join(', ')}</div>
                            <div class="meal-nutrition">
                                <span>${plan.meals.dinner.reduce((sum, m) => sum + m.calories, 0)} kcal</span>
                                <span>P: ${plan.meals.dinner.reduce((sum, m) => sum + m.protein, 0)}g</span>
                            </div>
                            <button class="recipe-btn" onclick="NutritionApp.showRecipe('dinner', ${JSON.stringify(plan.meals.dinner).replace(/"/g, '&quot;')})">View Recipe</button>
                        </div>
                        <div class="meal-card">
                            <div class="meal-time">🍎 Snacks</div>
                            <div class="meal-name">${plan.meals.snacks.map(m => m.name).join(', ')}</div>
                            <div class="meal-nutrition">
                                <span>${plan.meals.snacks.reduce((sum, m) => sum + m.calories, 0)} kcal</span>
                                <span>P: ${plan.meals.snacks.reduce((sum, m) => sum + m.protein, 0)}g</span>
                            </div>
                            <button class="recipe-btn" onclick="NutritionApp.showRecipe('snacks', ${JSON.stringify(plan.meals.snacks).replace(/"/g, '&quot;')})">View Recipe</button>
                        </div>
                    </div>
                </div>

                <!-- Water Intake Tracker -->
                <div class="result-section">
                    <h3>💧 Daily Water Intake Goal</h3>
                    <div class="water-tracker">
                        <div class="water-goal">${healthMetrics.waterGoal} glasses (${(healthMetrics.waterGoal * 0.25).toFixed(1)}L)</div>
                        <div class="water-cups">
                            ${Array.from({length: healthMetrics.waterGoal}, (_, i) => 
                                `<div class="water-cup" data-cup="${i + 1}" onclick="NutritionApp.trackWater(${i + 1})">
                                    <span class="cup-icon">🥤</span>
                                </div>`
                            ).join('')}
                        </div>
                        <div class="water-progress">
                            <div class="water-progress-bar" id="waterProgressBar" style="width: 0%"></div>
                        </div>
                        <div class="water-stats">
                            <span id="waterConsumed">0</span> / ${healthMetrics.waterGoal} glasses
                        </div>
                    </div>
                </div>

                <!-- Health Recommendations -->
                <div class="result-section">
                    <h3>💡 Health Recommendations</h3>
                    <div class="recommendations-grid">
                        <div class="recommendation-card">
                            <div class="rec-icon">🎯</div>
                            <div class="rec-title">Goal Focus</div>
                            <div class="rec-text">${plan.recommendations.goal.focus}</div>
                        </div>
                        <div class="recommendation-card">
                            <div class="rec-icon">❤️</div>
                            <div class="rec-title">Health Focus</div>
                            <div class="rec-text">${plan.recommendations.health.focus}</div>
                        </div>
                        <div class="recommendation-card">
                            <div class="rec-icon">✅</div>
                            <div class="rec-title">Include</div>
                            <div class="rec-text">${plan.recommendations.health.include.join(', ')}</div>
                        </div>
                        ${plan.recommendations.health.avoid ? `
                        <div class="recommendation-card">
                            <div class="rec-icon">❌</div>
                            <div class="rec-title">Avoid</div>
                            <div class="rec-text">${plan.recommendations.health.avoid.join(', ')}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Daily Tips -->
                <div class="result-section">
                    <h3>✨ Daily Tips</h3>
                    <div class="tips-list">
                        ${plan.healthTips.map(tip => `
                            <div class="tip-item">
                                <span class="tip-icon">💡</span>
                                <span class="tip-text">${tip}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Progress Tracking Section -->
                <div class="result-section">
                    <h3>📈 Track Your Progress</h3>
                    <div class="progress-tracker">
                        <div class="tracker-form">
                            <input type="number" id="weightInput" placeholder="Enter current weight (kg)" step="0.1" min="1" max="500">
                            <button class="track-btn" onclick="NutritionApp.logWeight()">Log Weight</button>
                        </div>
                        <div class="progress-chart-container">
                            <canvas id="progressChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Download & Share Section -->
                <div class="download-section">
                    <h3>📥 Download Your Plan</h3>
                    <div class="download-buttons">
                        <button class="download-btn download-btn-pdf" data-download="pdf">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download PDF
                        </button>
                        <button class="download-btn download-btn-text" data-download="text">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download Text
                        </button>
                    </div>
                </div>
                
                <div class="share-section">
                    <h3>📤 Share Your Plan</h3>
                    <div class="share-buttons">
                        <button class="share-btn" onclick="NutritionApp.sharePlan('facebook')" aria-label="Share on Facebook">📘 Facebook</button>
                        <button class="share-btn" onclick="NutritionApp.sharePlan('twitter')" aria-label="Share on Twitter">🐦 Twitter</button>
                        <button class="share-btn" onclick="NutritionApp.sharePlan('linkedin')" aria-label="Share on LinkedIn">💼 LinkedIn</button>
                        <button class="share-btn" onclick="NutritionApp.sharePlan('whatsapp')" aria-label="Share on WhatsApp">💬 WhatsApp</button>
                    </div>
                </div>
            </div>
        `;

        // Update tab content or main content
        // Reuse resultsTabContent variable declared above
        if (!resultsTabContent) {
            resultsTabContent = document.getElementById('resultsTabContent');
        }
        if (resultsTabContent) {
            resultsTabContent.innerHTML = html;
        } else {
            this.elements.resultsContent.innerHTML = html;
        }
        
        // Store data for download functions
        this.currentUserData = userData;
        this.currentPlan = plan;
        this.currentHealthMetrics = healthMetrics;
        
        // Initialize charts and visualizations
        this.initializeCharts(plan, healthMetrics);
        
        // Initialize tab switching for logged-in users
        if (this.auth.isAuthenticated && this.auth.userType === 'user') {
            setTimeout(() => this.initResultsTabs(), 100);
        }
        this.initializeProgressTracking(userData);
        
        // Attach download button event listeners
        this.attachDownloadListeners();
    },

    attachDownloadListeners() {
        const downloadButtons = this.elements.resultsContent.querySelectorAll('[data-download]');
        downloadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.currentTarget.getAttribute('data-download');
                if (this.currentUserData && this.currentPlan) {
                    if (type === 'pdf') {
                        this.downloadPDF(this.currentUserData, this.currentPlan);
                    } else if (type === 'json') {
                        this.downloadJSON(this.currentUserData, this.currentPlan);
                    } else if (type === 'text') {
                        this.downloadText(this.currentUserData, this.currentPlan);
                    }
                }
            });
        });
    },

    /* ============================================
       DOWNLOAD FUNCTIONS
       ============================================ */
    downloadPDF(userData, plan) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Colors
            const primaryPurple = [123, 44, 191];
            const primaryGreen = [0, 168, 107];
            const textDark = [26, 26, 26];
            const textGray = [102, 102, 102];
            
            let yPos = 20;
            
            // Header
            doc.setFillColor(...primaryPurple);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('AI Nutrition & Health Plan', 105, 20, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            
            // Format name and date properly
            const userName = String(userData.name || 'User').trim().substring(0, 50);
            const currentDate = new Date().toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
            
            // Ensure user name is not empty
            const displayName = userName && userName !== 'User' ? userName : (userData.name || 'User');
            
            doc.text(`Generated for: ${displayName}`, 105, 30, { align: 'center' });
            doc.text(`Date: ${currentDate}`, 105, 37, { align: 'center' });
            
            yPos = 50;
            doc.setTextColor(...textDark);
            
            // User Information Section
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Your Profile', 10, yPos);
            yPos += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textGray);
            doc.text(`Age: ${userData.age} years`, 15, yPos);
            yPos += 6;
            doc.text(`Weight: ${userData.weight} kg`, 15, yPos);
            yPos += 6;
            doc.text(`Health Condition: ${userData.healthCondition}`, 15, yPos);
            yPos += 6;
            doc.text(`Goal: ${userData.goal}`, 15, yPos);
            yPos += 12;
            
            // Daily Nutrition Goals
            doc.setTextColor(...textDark);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Daily Nutrition Goals', 10, yPos);
            yPos += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textGray);
            doc.text(`Daily Calories: ${plan.dailyCalories} kcal`, 15, yPos);
            yPos += 6;
            doc.text(`Protein: ${plan.macros.protein}g (${Math.round(plan.macros.proteinRatio * 100)}%)`, 15, yPos);
            yPos += 6;
            doc.text(`Carbohydrates: ${plan.macros.carbs}g (${Math.round(plan.macros.carbRatio * 100)}%)`, 15, yPos);
            yPos += 6;
            doc.text(`Fats: ${plan.macros.fats}g (${Math.round(plan.macros.fatRatio * 100)}%)`, 15, yPos);
            yPos += 12;
            
            // Recommended Meals
            doc.setTextColor(...textDark);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Recommended Meals', 10, yPos);
            yPos += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textGray);
            
            const meals = [
                `Breakfast: ${plan.meals.breakfast.map(m => m.name).join(', ')}`,
                `Lunch: ${plan.meals.lunch.map(m => m.name).join(', ')}`,
                `Dinner: ${plan.meals.dinner.map(m => m.name).join(', ')}`,
                `Snacks: ${plan.meals.snacks.map(m => m.name).join(', ')}`
            ];
            
            meals.forEach(meal => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                const lines = doc.splitTextToSize(meal, 180);
                doc.text(lines, 15, yPos);
                yPos += lines.length * 6 + 2;
            });
            yPos += 6;
            
            // Health Recommendations
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(...textDark);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Health Recommendations', 10, yPos);
            yPos += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textGray);
            
            const recommendations = [
                `Focus: ${plan.recommendations.goal.focus}`,
                `Health Focus: ${plan.recommendations.health.focus}`,
                `Include: ${plan.recommendations.health.include.join(', ')}`
            ];
            
            if (plan.recommendations.health.avoid) {
                recommendations.push(`Avoid: ${plan.recommendations.health.avoid.join(', ')}`);
            }
            
            recommendations.forEach(rec => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                const lines = doc.splitTextToSize(rec, 180);
                doc.text(lines, 15, yPos);
                yPos += lines.length * 6 + 2;
            });
            yPos += 6;
            
            // Daily Tips
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(...textDark);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Daily Tips', 10, yPos);
            yPos += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textGray);
            
            plan.healthTips.forEach(tip => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                const lines = doc.splitTextToSize(`• ${tip}`, 180);
                doc.text(lines, 15, yPos);
                yPos += lines.length * 6 + 2;
            });
            
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(...textGray);
                doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
                doc.setFillColor(...primaryGreen);
                doc.rect(0, 285, 210, 5, 'F');
            }
            
            // Re-draw header on first page with user details
            doc.setPage(1);
            doc.setFillColor(...primaryPurple);
            doc.rect(0, 0, 210, 40, 'F');
            // Re-add header text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('AI Nutrition & Health Plan', 105, 20, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated for: ${userName}`, 105, 30, { align: 'center' });
            doc.text(`Date: ${currentDate}`, 105, 37, { align: 'center' });
            
            // Save PDF
            const fileName = `Nutrition_Plan_${userData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            console.log('PDF downloaded successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    },

    downloadJSON(userData, plan) {
        try {
            const data = {
                user: {
                    name: userData.name,
                    age: userData.age,
                    weight: userData.weight,
                    healthCondition: userData.healthCondition,
                    goal: userData.goal
                },
                plan: {
                    dailyCalories: plan.dailyCalories,
                    macros: plan.macros,
                    meals: plan.meals,
                    recommendations: plan.recommendations,
                    healthTips: plan.healthTips
                },
                metadata: {
                    generatedAt: new Date().toISOString(),
                    version: '1.0'
                }
            };
            
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Nutrition_Plan_${userData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('JSON downloaded successfully');
        } catch (error) {
            console.error('Error downloading JSON:', error);
            alert('Error downloading JSON. Please try again.');
        }
    },

    downloadText(userData, plan) {
        try {
            let text = `═══════════════════════════════════════════════════════
    AI NUTRITION & HEALTH PLAN
═══════════════════════════════════════════════════════

Generated for: ${userData.name}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

───────────────────────────────────────────────────────
👤 YOUR PROFILE
───────────────────────────────────────────────────────
Age: ${userData.age} years
Weight: ${userData.weight} kg
Health Condition: ${userData.healthCondition}
Goal: ${userData.goal}

───────────────────────────────────────────────────────
📊 DAILY NUTRITION GOALS
───────────────────────────────────────────────────────
Daily Calories: ${plan.dailyCalories} kcal
Protein: ${plan.macros.protein}g (${Math.round(plan.macros.proteinRatio * 100)}%)
Carbohydrates: ${plan.macros.carbs}g (${Math.round(plan.macros.carbRatio * 100)}%)
Fats: ${plan.macros.fats}g (${Math.round(plan.macros.fatRatio * 100)}%)

───────────────────────────────────────────────────────
🍽️ RECOMMENDED MEALS
───────────────────────────────────────────────────────
Breakfast: ${plan.meals.breakfast.map(m => m.name).join(', ')}
Lunch: ${plan.meals.lunch.map(m => m.name).join(', ')}
Dinner: ${plan.meals.dinner.map(m => m.name).join(', ')}
Snacks: ${plan.meals.snacks.map(m => m.name).join(', ')}

───────────────────────────────────────────────────────
💡 HEALTH RECOMMENDATIONS
───────────────────────────────────────────────────────
Focus: ${plan.recommendations.goal.focus}
Health Focus: ${plan.recommendations.health.focus}
Include: ${plan.recommendations.health.include.join(', ')}
${plan.recommendations.health.avoid ? `Avoid: ${plan.recommendations.health.avoid.join(', ')}` : ''}

───────────────────────────────────────────────────────
✨ DAILY TIPS
───────────────────────────────────────────────────────
${plan.healthTips.map(tip => `• ${tip}`).join('\n')}

═══════════════════════════════════════════════════════
Generated by AI Nutrition & Health Recommendation System
═══════════════════════════════════════════════════════
`;
            
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Nutrition_Plan_${userData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('Text file downloaded successfully');
        } catch (error) {
            console.error('Error downloading text file:', error);
            alert('Error downloading text file. Please try again.');
        }
    },

    /* ============================================
       ADMIN DASHBOARD FUNCTIONS
       ============================================ */
    initAdminDashboard() {
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

        // Load data if on admin page (only for adminDashboard.html)
        if (document.getElementById('adminLoading')) {
            this.loadAdminData();
        }
    },

    async loadAdminData() {
        const loadingEl = document.getElementById('adminLoading');
        const tableContainer = document.getElementById('adminTableContainer');
        const emptyEl = document.getElementById('adminEmpty');
        const tableBody = document.getElementById('adminTableBody');

        if (!loadingEl || !tableContainer) return;

        loadingEl.style.display = 'block';
        tableContainer.style.display = 'none';
        emptyEl.style.display = 'none';

        try {
            if (typeof getAllUserPlans === 'function') {
                const plans = await getAllUserPlans();
                this.allPlans = plans;
                this.displayAdminData(plans);
                this.updateAdminStats(plans);
            } else {
                console.warn('getAllUserPlans function not available');
                loadingEl.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
            loadingEl.style.display = 'none';
        }
    },

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
            const date = plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-GB') : 'N/A';
            const goal = plan.goal || 'N/A';
            const condition = plan.healthCondition || 'N/A';
            
            return `
                <tr>
                    <td><strong>${plan.name || 'N/A'}</strong></td>
                    <td>${plan.age || 'N/A'}</td>
                    <td>${plan.weight ? plan.weight + ' kg' : 'N/A'}</td>
                    <td><span class="badge badge-condition">${condition}</span></td>
                    <td><span class="badge badge-goal">${goal}</span></td>
                    <td>${plan.dailyCalories || 'N/A'} kcal</td>
                    <td>${date}</td>
                    <td>
                        <button class="view-btn" onclick="NutritionApp.viewUserDetail('${plan.id}')">View Details</button>
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

    filterAdminData() {
        if (!this.allPlans) return;

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

    async viewUserDetail(planId) {
        const overlay = document.getElementById('userDetailOverlay');
        const content = document.getElementById('userDetailContent');

        if (!overlay || !content) return;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        content.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading details...</p></div>';

        try {
            if (typeof getPlanById === 'function') {
                const plan = await getPlanById(planId);
                if (plan) {
                    this.displayUserDetail(plan);
                } else {
                    content.innerHTML = '<p>Plan not found</p>';
                }
            } else {
                content.innerHTML = '<p>Function not available</p>';
            }
        } catch (error) {
            console.error('Error loading plan details:', error);
            content.innerHTML = '<p>Error loading plan details</p>';
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
                            <span class="detail-value">${plan.name || 'N/A'}</span>
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
                            <span class="detail-value">${plan.healthCondition || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Goal</span>
                            <span class="detail-value">${plan.goal || 'N/A'}</span>
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
                            <span class="detail-value">${plan.meals?.breakfast?.map(m => m.name).join(', ') || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Lunch</span>
                            <span class="detail-value">${plan.meals?.lunch?.map(m => m.name).join(', ') || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Dinner</span>
                            <span class="detail-value">${plan.meals?.dinner?.map(m => m.name).join(', ') || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Snacks</span>
                            <span class="detail-value">${plan.meals?.snacks?.map(m => m.name).join(', ') || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div class="user-detail-section">
                    <h3>💡 Recommendations</h3>
                    <p><strong>Focus:</strong> ${plan.recommendations?.goal?.focus || 'N/A'}</p>
                    <p><strong>Health Focus:</strong> ${plan.recommendations?.health?.focus || 'N/A'}</p>
                    <p><strong>Include:</strong> ${plan.recommendations?.health?.include?.join(', ') || 'N/A'}</p>
                    ${plan.recommendations?.health?.avoid ? `<p><strong>Avoid:</strong> ${plan.recommendations.health.avoid.join(', ')}</p>` : ''}
                </div>

                ${plan.healthTips ? `
                <div class="user-detail-section">
                    <h3>✨ Daily Tips</h3>
                    <ul>
                        ${plan.healthTips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;

        content.innerHTML = html;
    },

    /* ============================================
       FAQ ACCORDION
       ============================================ */
    initFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                const answer = question.nextElementSibling;
                
                // Close all other FAQs
                faqQuestions.forEach(q => {
                    if (q !== question) {
                        q.setAttribute('aria-expanded', 'false');
                        q.nextElementSibling.style.maxHeight = '0';
                    }
                });
                
                // Toggle current FAQ
                question.setAttribute('aria-expanded', !isExpanded);
                if (!isExpanded) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = '0';
                }
            });
        });
    },

    /* ============================================
       CONTACT FORM
       ============================================ */
    initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = {
                    name: document.getElementById('contactName').value,
                    email: document.getElementById('contactEmail').value,
                    subject: document.getElementById('contactSubject').value,
                    message: document.getElementById('contactMessage').value
                };
                
                // Here you would typically send to a backend
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            });
        }
    },

    /* ============================================
       NEWSLETTER FORM
       ============================================ */
    initNewsletter() {
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                // Here you would typically send to a backend
                alert('Thank you for subscribing to our newsletter!');
                newsletterForm.reset();
            });
        }
    },

    /* ============================================
       COOKIE CONSENT
       ============================================ */
    initCookieConsent() {
        const cookieBanner = document.getElementById('cookieBanner');
        const acceptBtn = document.getElementById('acceptCookies');
        const declineBtn = document.getElementById('declineCookies');
        
        if (!cookieBanner) return;
        
        // Check if user has already made a choice
        const cookieChoice = localStorage.getItem('cookieConsent');
        if (!cookieChoice) {
            cookieBanner.style.display = 'block';
        }
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('cookieConsent', 'accepted');
                cookieBanner.style.display = 'none';
            });
        }
        
        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                localStorage.setItem('cookieConsent', 'declined');
                cookieBanner.style.display = 'none';
            });
        }
    },

    /* ============================================
       SOCIAL SHARING
       ============================================ */
    sharePlan(platform) {
        const text = 'Check out my personalized AI Nutrition Plan!';
        const url = window.location.href;
        
        let shareUrl = '';
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    },

    /* ============================================
       CHATBOT FUNCTIONS
       ============================================ */
    initChatbot() {
        const toggleBtn = document.getElementById('chatbotToggleBtn');
        const closeBtn = document.getElementById('chatbotCloseBtn');
        const sendBtn = document.getElementById('chatbotSendBtn');
        const input = document.getElementById('chatbotInput');
        const panel = document.getElementById('chatbotPanel');

        // Check for essential elements (toggleBtn is optional since it's commented out)
        if (!closeBtn || !sendBtn || !input || !panel) {
            console.warn('Chatbot elements not found. Some elements may be missing.');
            return;
        }

        // Toggle chatbot (only if toggle button exists)
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (this.chatbot.isOpen) {
                    this.closeChatbot();
                } else {
                    this.openChatbot();
                }
            });
        }

        // Close chatbot
        closeBtn.addEventListener('click', () => this.closeChatbot());

        // Send message
        sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.sendChatbotMessage();
        });
        
        // Enter key to send
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatbotMessage();
            }
        });
        
        console.log('Chatbot initialized successfully');

        // Load API key from environment or localStorage
        this.loadChatbotAPIKey();
    },

    loadChatbotAPIKey() {
        // Try to get API key from environment variable or localStorage
        // For production, set this via environment variable or secure config
        if (typeof process !== 'undefined' && process.env && process.env.OPENAI_API_KEY) {
            this.chatbot.apiKey = process.env.OPENAI_API_KEY;
        } else if (localStorage.getItem('openai_api_key')) {
            this.chatbot.apiKey = localStorage.getItem('openai_api_key');
        }
        // If no API key is set, the chatbot will use fallback responses
    },

    openChatbot() {
        const panel = document.getElementById('chatbotPanel');
        const toggleBtn = document.getElementById('chatbotToggleBtn');
        
        if (!panel) {
            console.error('Chatbot panel not found');
            return;
        }

        console.log('Opening chatbot...', panel); // Debug log

        // Create or get overlay
        let overlay = document.getElementById('chatbotOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'chatbotOverlay';
            overlay.className = 'chatbot-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', () => this.closeChatbot());
        }

        this.chatbot.isOpen = true;
        
        // Show panel immediately with visibility
        panel.style.visibility = 'visible';
        panel.classList.add('active');
        
        // Show overlay with slight delay
        setTimeout(() => {
            overlay.classList.add('active');
        }, 100);
        
        if (toggleBtn) {
            toggleBtn.classList.add('active');
        }
        
        // Update floating button state
        const floatingBtn = document.getElementById('floatingChatbotBtn');
        if (floatingBtn) {
            floatingBtn.classList.add('active');
        }
        
        // Prevent body scroll when chatbot is open
        document.body.style.overflow = 'hidden';
        
        // Focus input
        setTimeout(() => {
            const input = document.getElementById('chatbotInput');
            if (input) input.focus();
        }, 400);
    },

    closeChatbot() {
        const panel = document.getElementById('chatbotPanel');
        const toggleBtn = document.getElementById('chatbotToggleBtn');
        const overlay = document.getElementById('chatbotOverlay');
        
        if (!panel) return;

        this.chatbot.isOpen = false;
        panel.classList.remove('active');
        panel.style.visibility = 'hidden';
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        if (toggleBtn) {
            toggleBtn.classList.remove('active');
        }
        
        // Update floating button state
        const floatingBtn = document.getElementById('floatingChatbotBtn');
        if (floatingBtn) {
            floatingBtn.classList.remove('active');
        }
        
        // Restore body scroll if popup is not open
        if (!this.elements.popupOverlay.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    },

    async sendChatbotMessage() {
        const input = document.getElementById('chatbotInput');
        const messagesContainer = document.getElementById('chatbotMessages');
        const sendBtn = document.getElementById('chatbotSendBtn');

        if (!input || !messagesContainer) return;

        const message = input.value.trim();
        if (!message) return;

        // Disable input
        input.disabled = true;
        if (sendBtn) sendBtn.disabled = true;

        // Add user message
        this.addChatbotMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        const typingId = this.showChatbotTyping();

        try {
            // Get AI response
            const response = await this.getChatbotResponse(message);
            this.removeChatbotTyping(typingId);
            this.addChatbotMessage(response, 'bot');
        } catch (error) {
            console.error('Chatbot error:', error);
            this.removeChatbotTyping(typingId);
            this.addChatbotMessage(
                'I apologize, but I encountered an error. Please try again or check your API configuration.',
                'bot'
            );
        }

        // Re-enable input
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
    },

    addChatbotMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'bot' ? '🤖' : 'You';

        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Format message (support basic markdown-like formatting)
        const formattedText = this.formatChatbotMessage(text);
        content.innerHTML = formattedText;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save to history
        this.chatbot.messages.push({ role: sender === 'bot' ? 'assistant' : 'user', content: text });
    },

    formatChatbotMessage(text) {
        // Convert text to HTML with basic formatting
        let html = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Convert numbered lists
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
        if (html.includes('<li>')) {
            html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        }

        return html;
    },

    showChatbotTyping() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return null;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message';
        typingDiv.id = 'chatbot-typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';

        const content = document.createElement('div');
        content.className = 'chatbot-typing';
        content.innerHTML = '<span></span><span></span><span></span>';

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        messagesContainer.appendChild(typingDiv);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return 'chatbot-typing-indicator';
    },

    removeChatbotTyping(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    },

    async getChatbotResponse(userMessage) {
        // Get form context for better responses
        const formContext = this.getFormContext();

        // If API key is available, use ChatGPT API
        if (this.chatbot.apiKey) {
            return await this.callChatGPTAPI(userMessage, formContext);
        } else {
            // Fallback to local intelligent responses
            return this.getLocalChatbotResponse(userMessage, formContext);
        }
    },

    getFormContext() {
        // Get current form values to provide context-aware responses
        const name = document.getElementById('name')?.value || '';
        const age = document.getElementById('age')?.value || '';
        const weight = document.getElementById('weight')?.value || '';
        const healthCondition = document.getElementById('healthCondition')?.value || '';
        const goal = document.getElementById('goal')?.value || '';

        return {
            name,
            age,
            weight,
            healthCondition,
            goal,
            hasData: !!(name || age || weight || healthCondition || goal)
        };
    },

    async callChatGPTAPI(userMessage, formContext) {
        if (!this.chatbot.apiKey) {
            throw new Error('API key not configured');
        }

        // Build messages array with system prompt and conversation history
        const messages = [
            {
                role: 'system',
                content: this.chatbot.systemPrompt + (formContext.hasData ? 
                    `\n\nCurrent form context: User is filling out a nutrition plan form. Current values: ${JSON.stringify(formContext)}. Use this context to provide relevant advice.` : 
                    '')
            },
            ...this.chatbot.messages.slice(-10), // Keep last 10 messages for context
            { role: 'user', content: userMessage }
        ];

        try {
            const response = await fetch(this.chatbot.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.chatbot.apiKey}`
                },
                body: JSON.stringify({
                    model: this.chatbot.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('ChatGPT API Error:', error);
            throw error;
        }
    },

    getLocalChatbotResponse(userMessage, formContext) {
        const lowerMessage = userMessage.toLowerCase();

        // Form-related questions
        if (this.matchesPattern(lowerMessage, ['what', 'how', 'form', 'field', 'enter', 'fill'])) {
            if (this.matchesPattern(lowerMessage, ['age'])) {
                return 'Age helps us calculate your daily calorie needs and metabolic rate. Please enter your current age in years.';
            }
            if (this.matchesPattern(lowerMessage, ['weight'])) {
                return 'Weight (in kilograms) is used to calculate your BMI and determine appropriate calorie intake. Enter your current weight accurately.';
            }
            if (this.matchesPattern(lowerMessage, ['health condition', 'condition', 'diabetes', 'blood pressure', 'heart'])) {
                return 'Health conditions help us customize your meal plan. Select the condition that applies to you, or "None" if you don\'t have any of the listed conditions. This ensures we provide safe and appropriate nutrition recommendations.';
            }
            if (this.matchesPattern(lowerMessage, ['goal', 'objective', 'target'])) {
                return 'Your goal determines the focus of your nutrition plan:\n\n• **Weight Loss**: Calorie deficit, high protein, low processed foods\n• **Weight Gain**: Calorie surplus, balanced macros, nutrient-dense foods\n• **Fitness**: Optimal protein, complex carbs, recovery nutrition\n• **Healthy Diet**: Balanced nutrition, whole foods, variety\n\nChoose the goal that best matches what you want to achieve.';
            }
            return 'I can help you understand any field in the form. Just ask me about age, weight, health conditions, or goals!';
        }

        // Health condition questions
        if (this.matchesPattern(lowerMessage, ['diabetes'])) {
            return 'For diabetes, the nutrition plan focuses on:\n\n• Low glycemic index foods\n• Controlled carbohydrate intake\n• Regular meal timing\n• Whole grains, lean proteins, and non-starchy vegetables\n• Avoiding high sugar foods and refined carbs\n\nAlways consult with your healthcare provider for personalized diabetes management.';
        }
        if (this.matchesPattern(lowerMessage, ['blood pressure', 'high bp', 'hypertension'])) {
            return 'For high blood pressure, the plan emphasizes:\n\n• Low sodium foods\n• Potassium-rich foods (bananas, leafy greens)\n• Heart-healthy options (oats, berries, fatty fish)\n• Avoiding processed and high-sodium foods\n• Limiting alcohol intake\n\nRegular monitoring and medical consultation are important.';
        }
        if (this.matchesPattern(lowerMessage, ['heart', 'cardiovascular'])) {
            return 'For heart health, the plan includes:\n\n• Heart-healthy fats (omega-3s)\n• High fiber foods (whole grains, fruits, vegetables)\n• Antioxidant-rich foods\n• Nuts and seeds\n• Avoiding trans fats and excessive saturated fats\n\nAlways work with your cardiologist for heart condition management.';
        }

        // Goal-related questions
        if (this.matchesPattern(lowerMessage, ['weight loss', 'lose weight', 'slim down'])) {
            return 'For weight loss, your plan will include:\n\n• Daily calories: 1200-1500 (calorie deficit)\n• High protein with every meal\n• Fiber-rich foods to keep you full\n• Limited processed foods and sugars\n• Regular hydration\n\nRemember, sustainable weight loss is gradual. Aim for 0.5-1kg per week.';
        }
        if (this.matchesPattern(lowerMessage, ['weight gain', 'gain weight', 'bulk'])) {
            return 'For weight gain, your plan will focus on:\n\n• Daily calories: 2500-3000 (calorie surplus)\n• Frequent, nutrient-dense meals\n• Healthy fats and proteins\n• Post-workout nutrition\n• Consistency is key\n\nAim for gradual, healthy weight gain with muscle building.';
        }
        if (this.matchesPattern(lowerMessage, ['fitness', 'exercise', 'workout'])) {
            return 'For fitness goals, your plan emphasizes:\n\n• Daily calories: 2000-2500 (depending on activity)\n• Optimal protein intake for muscle recovery\n• Complex carbohydrates for energy\n• Pre and post-workout nutrition\n• Adequate hydration\n\nTiming your meals around workouts can enhance performance and recovery.';
        }

        // General nutrition questions
        if (this.matchesPattern(lowerMessage, ['calorie', 'calories', 'how many'])) {
            return 'Daily calorie needs vary based on:\n\n• Your age, weight, and activity level\n• Your goal (weight loss, gain, or maintenance)\n• Your health conditions\n\nOur AI will calculate personalized calorie recommendations based on your form inputs. Generally:\n• Weight loss: 1200-1500 calories\n• Weight gain: 2500-3000 calories\n• Fitness: 2000-2500 calories\n• Healthy diet: 1800-2200 calories';
        }
        if (this.matchesPattern(lowerMessage, ['meal', 'food', 'eat', 'diet'])) {
            return 'A balanced nutrition plan includes:\n\n• **Breakfast**: Protein + complex carbs (e.g., oatmeal with berries, eggs with whole grain toast)\n• **Lunch**: Lean protein + vegetables + whole grains (e.g., grilled chicken salad, quinoa bowl)\n• **Dinner**: Protein + vegetables (e.g., baked fish with vegetables)\n• **Snacks**: Nuts, fruits, yogurt\n\nOur AI will generate specific meal recommendations based on your profile!';
        }

        // Greeting
        if (this.matchesPattern(lowerMessage, ['hello', 'hi', 'hey', 'greetings'])) {
            return 'Hello! I\'m here to help you with your nutrition plan. I can answer questions about:\n\n• Form fields and what information to provide\n• Health conditions and their nutrition needs\n• Different goals and what they mean\n• General nutrition and meal planning advice\n\nWhat would you like to know?';
        }

        // Default response
        return 'I understand you\'re asking about nutrition planning. I can help with:\n\n• Understanding form fields\n• Health conditions and dietary needs\n• Nutrition goals\n• Meal planning tips\n\nCould you rephrase your question, or ask about something specific?';
    },

    matchesPattern(text, patterns) {
        return patterns.some(pattern => text.includes(pattern));
    },

    /* ============================================
       AUTHENTICATION SYSTEM
       ============================================ */
    initAuth() {
        // Check if user is already logged in
        const savedAuth = localStorage.getItem('nutritionAppAuth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                this.auth.currentUser = authData.user;
                this.auth.userType = authData.userType;
                this.auth.isAuthenticated = true;
            } catch (e) {
                console.error('Error parsing auth data:', e);
            }
        }
    },

    checkAuthStatus() {
        console.log('Checking auth status:', this.auth.isAuthenticated);
        if (!this.auth.isAuthenticated) {
            // Show guest alert
            this.showGuestAlert();
            // Show login/register buttons
            this.showAuthButtons();
        } else {
            // Update UI for logged-in user
            this.updateUIForUser();
            // Hide login/register buttons, show user menu
            this.hideAuthButtons();
        }
    },

    showGuestAlert() {
        // Show alert after a short delay
        setTimeout(() => {
            const alertShown = sessionStorage.getItem('guestAlertShown');
            if (!alertShown) {
                alert('If you want to see your Plans and Meals and more features, please register yourself.\n\nNow you are using as guest.');
                sessionStorage.setItem('guestAlertShown', 'true');
            }
        }, 1500);
    },

    showAuthButtons() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const getStartedBtn = document.getElementById('getStartedBtn');
        const authMenuItems = document.getElementById('authMenuItems');
        
        // Show all navigation items when user is not logged in
        const navItems = document.querySelectorAll('nav ul li:not(#authMenuItems)');
        navItems.forEach(item => {
            item.style.display = '';
        });
        
        if (loginBtn) {
            loginBtn.style.display = 'inline-block';
            loginBtn.style.visibility = 'visible';
        }
        if (registerBtn) {
            registerBtn.style.display = 'inline-block';
            registerBtn.style.visibility = 'visible';
        }
        if (getStartedBtn) {
            getStartedBtn.style.display = 'inline-block';
            getStartedBtn.style.visibility = 'visible';
        }
        if (authMenuItems) {
            authMenuItems.style.display = 'flex';
        }
    },

    hideAuthButtons() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const getStartedBtn = document.getElementById('getStartedBtn');
        const authMenuItems = document.getElementById('authMenuItems');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (getStartedBtn) getStartedBtn.style.display = 'none';
        
        // Hide other navigation items when user is logged in
        const navItems = document.querySelectorAll('nav ul li:not(#authMenuItems)');
        navItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // Show user menu instead
        if (authMenuItems && this.auth.currentUser) {
            // Determine dashboard link based on user type
            const dashboardLink = this.auth.userType === 'admin' ? 'adminDashboard.html' : 'userDashboard.html';
            const dashboardText = this.auth.userType === 'admin' ? 'Admin Dashboard' : 'My Dashboard';
            
            authMenuItems.innerHTML = `
                <a href="${dashboardLink}" class="nav-cta" id="dashboardBtn">📊 ${dashboardText}</a>
                <a href="#" id="userMenuBtn" class="nav-cta">👤 ${this.auth.currentUser.name}</a>
                <a href="#" id="logoutBtn" class="nav-cta">Logout</a>
            `;
            
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        }
    },

    initAuthModals() {
        // Login modal
        const loginOverlay = document.getElementById('loginOverlay');
        const closeLogin = document.getElementById('closeLogin');
        const loginForm = document.getElementById('loginForm');
        const showRegister = document.getElementById('showRegister');

        // Register modal
        const registerOverlay = document.getElementById('registerOverlay');
        const closeRegister = document.getElementById('closeRegister');
        const registerForm = document.getElementById('registerForm');
        const showLogin = document.getElementById('showLogin');

        // Login tabs
        const loginTabs = document.querySelectorAll('.login-tab');
        loginTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                loginTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Open/close login
        if (closeLogin) {
            closeLogin.addEventListener('click', () => this.closeLogin());
        }
        if (loginOverlay) {
            loginOverlay.addEventListener('click', (e) => {
                if (e.target === loginOverlay) this.closeLogin();
            });
        }

        // Open/close register
        if (closeRegister) {
            closeRegister.addEventListener('click', () => this.closeRegister());
        }
        if (registerOverlay) {
            registerOverlay.addEventListener('click', (e) => {
                if (e.target === registerOverlay) this.closeRegister();
            });
        }

        // Switch between login and register
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeLogin();
                setTimeout(() => this.openRegister(), 300);
            });
        }
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeRegister();
                setTimeout(() => this.openLogin(), 300);
            });
        }

        // Form submissions
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    },

    openLogin() {
        console.log('openLogin called');
        const overlay = document.getElementById('loginOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('Login overlay opened');
        } else {
            console.error('Login overlay not found');
        }
    },

    closeLogin() {
        const overlay = document.getElementById('loginOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    openRegister() {
        const overlay = document.getElementById('registerOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeRegister() {
        const overlay = document.getElementById('registerOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const activeTab = document.querySelector('.login-tab.active')?.dataset.tab || 'user';

        // Simple authentication (in production, use Firebase Auth)
        const users = JSON.parse(localStorage.getItem('nutritionAppUsers') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (activeTab === 'admin') {
            // Admin login
            if (email === 'admin@nutrition.com' && password === 'admin123') {
                this.auth.currentUser = { email, name: 'Admin' };
                this.auth.userType = 'admin';
                this.auth.isAuthenticated = true;
                localStorage.setItem('nutritionAppAuth', JSON.stringify({
                    user: this.auth.currentUser,
                    userType: 'admin'
                }));
                this.closeLogin();
                window.location.href = 'adminDashboard.html';
                return;
            } else {
                alert('Invalid admin credentials');
                return;
            }
        } else {
            // User login - try Firebase first, then localStorage
            let foundUser = user;
            
            // Try Firebase if available
            if (typeof getUserByEmail === 'function') {
                try {
                    const firebaseUser = await getUserByEmail(email);
                    if (firebaseUser && firebaseUser.password === password) {
                        foundUser = {
                            id: firebaseUser.userId || firebaseUser.id,
                            name: firebaseUser.name,
                            email: firebaseUser.email,
                            password: firebaseUser.password,
                            firebaseId: firebaseUser.id,
                            createdAt: firebaseUser.createdAt ? firebaseUser.createdAt.toISOString() : new Date().toISOString()
                        };
                    }
                } catch (error) {
                    console.warn('Firebase login check failed, using localStorage:', error);
                }
            }
            
            if (foundUser) {
                this.auth.currentUser = foundUser;
                this.auth.userType = 'user';
                this.auth.isAuthenticated = true;
                localStorage.setItem('nutritionAppAuth', JSON.stringify({
                    user: this.auth.currentUser,
                    userType: 'user'
                }));
                this.closeLogin();
                this.updateUIForUser();
                this.checkAuthStatus(); // Refresh UI
                // Redirect to user dashboard
                window.location.href = 'userDashboard.html';
            } else {
                alert('Invalid email or password');
            }
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        // Create new user object
        const newUser = {
            id: 'user_' + Date.now(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        try {
            // Try to save to Firebase first
            if (typeof saveUserToFirebase === 'function') {
                const result = await saveUserToFirebase(newUser);
                
                if (!result.success) {
                    if (result.exists) {
                        alert('Email already registered. Please login instead.');
                        return;
                    } else {
                        console.warn('Failed to save to Firebase, saving to localStorage as fallback:', result.error);
                        // Fallback to localStorage if Firebase fails
                    }
                } else {
                    console.log('User saved to Firebase successfully');
                    // Update user ID with Firebase document ID if available
                    if (result.userDocId) {
                        newUser.firebaseId = result.userDocId;
                    }
                }
            }

            // Also save to localStorage as backup and for quick access
            const users = JSON.parse(localStorage.getItem('nutritionAppUsers') || '[]');
            // Check localStorage for duplicates
            if (!users.find(u => u.email === email)) {
                users.push(newUser);
                localStorage.setItem('nutritionAppUsers', JSON.stringify(users));
            }

            // Auto login
            this.auth.currentUser = newUser;
            this.auth.userType = 'user';
            this.auth.isAuthenticated = true;
            localStorage.setItem('nutritionAppAuth', JSON.stringify({
                user: this.auth.currentUser,
                userType: 'user'
            }));

            this.closeRegister();
            this.updateUIForUser();
            this.checkAuthStatus(); // Refresh UI
            alert('Registration successful! Welcome, ' + name);
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
        }
    },

    updateUIForUser() {
        if (this.auth.isAuthenticated && this.auth.userType === 'user') {
            this.hideAuthButtons();
        }
    },

    logout() {
        this.auth.currentUser = null;
        this.auth.userType = null;
        this.auth.isAuthenticated = false;
        localStorage.removeItem('nutritionAppAuth');
        window.location.reload();
    },

    initResultsTabs() {
        const tabs = document.querySelectorAll('.result-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabType = tab.dataset.tab;
                if (tabType === 'meals') {
                    this.showMyMeals();
                } else {
                    // Show plan (default content is already shown)
                    const resultsTabContent = document.getElementById('resultsTabContent');
                    if (resultsTabContent) {
                        // Plan content is already there, just ensure it's visible
                        resultsTabContent.style.display = 'block';
                    }
                }
            });
        });
    },

    async showMyMeals() {
        const resultsTabContent = document.getElementById('resultsTabContent');
        if (!resultsTabContent) return;

        // Get user's saved meals and plans
        const userId = this.auth.currentUser?.id;
        if (!userId) return;

        // Get saved meals from localStorage
        const savedMeals = JSON.parse(localStorage.getItem('savedMeals') || '[]');
        const userMeals = savedMeals.filter(meal => meal.userId === userId);

        // Get saved plans from Firebase or localStorage
        let userPlans = [];
        try {
            if (typeof db !== 'undefined' && db) {
                const plansSnapshot = await db.collection('nutritionPlans')
                    .where('userId', '==', userId)
                    .get();
                userPlans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        } catch (e) {
            console.error('Error fetching plans:', e);
        }

        let html = '<div class="my-meals-container">';
        html += '<h3>My Saved Meals</h3>';
        
        if (userMeals.length === 0) {
            html += '<p class="no-data">No saved meals yet. Build and save your first meal!</p>';
        } else {
            html += '<div class="meals-grid">';
            userMeals.forEach(meal => {
                html += `
                    <div class="meal-card">
                        <h4>${meal.mealName || 'Custom Meal'}</h4>
                        <div class="meal-info">
                            <p><strong>Calories:</strong> ${meal.totalCalories}</p>
                            <p><strong>Protein:</strong> ${meal.totalProtein.toFixed(1)}g</p>
                            <p><strong>Carbs:</strong> ${meal.totalCarbs.toFixed(1)}g</p>
                            <p><strong>Fats:</strong> ${meal.totalFats.toFixed(1)}g</p>
                        </div>
                        <div class="meal-ingredients">
                            <strong>Ingredients:</strong>
                            <ul>
                                ${meal.ingredients.map(ing => `<li>${ing.name}</li>`).join('')}
                            </ul>
                        </div>
                        <p class="meal-date">Saved: ${new Date(meal.savedAt || meal.createdAt).toLocaleDateString()}</p>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '<h3 style="margin-top: 2rem;">My Nutrition Plans</h3>';
        if (userPlans.length === 0) {
            html += '<p class="no-data">No saved plans yet. Generate your first plan!</p>';
        } else {
            html += '<div class="plans-grid">';
            userPlans.forEach(plan => {
                html += `
                    <div class="plan-card">
                        <h4>Plan from ${new Date(plan.createdAt?.toDate?.() || plan.timestamp).toLocaleDateString()}</h4>
                        <div class="plan-info">
                            <p><strong>Daily Calories:</strong> ${plan.dailyCalories}</p>
                            <p><strong>Goal:</strong> ${plan.goal}</p>
                            <p><strong>Health Condition:</strong> ${plan.healthCondition}</p>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        resultsTabContent.innerHTML = html;
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        NutritionApp.init();
        NutritionApp.initFAQ();
        NutritionApp.initContactForm();
        NutritionApp.initNewsletter();
        NutritionApp.initCookieConsent();
        // Only initialize admin dashboard if on admin page
        if (document.getElementById('adminLoading')) {
            NutritionApp.initAdminDashboard();
        }
    });
} else {
    NutritionApp.init();
    NutritionApp.initFAQ();
    NutritionApp.initContactForm();
    NutritionApp.initNewsletter();
    NutritionApp.initCookieConsent();
    // Only initialize admin dashboard if on admin page
    if (document.getElementById('adminLoading')) {
        NutritionApp.initAdminDashboard();
    }
}


