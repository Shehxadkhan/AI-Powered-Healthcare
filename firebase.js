/* ============================================
   FIREBASE CONFIGURATION
   ============================================ */

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyD7G-_HSf7Dea85JeAsSZH3867auba7cOk",
    authDomain: "ai-nutrition-6677a.firebaseapp.com",
    projectId: "ai-nutrition-6677a",
    storageBucket: "ai-nutrition-6677a.firebasestorage.app",
    messagingSenderId: "245537304832",
    appId: "1:245537304832:web:b9c7e6c37d6a747346c3e5",
    measurementId: "G-SL4XK3GCN7"
};

// Initialize Firebase
let db = null;
let isFirebaseInitialized = false;

// Initialize Firebase function
function initializeFirebase() {
    try {
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded. Please include Firebase scripts in index.html');
            return false;
        }

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore
        db = firebase.firestore();
        isFirebaseInitialized = true;
        
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        isFirebaseInitialized = false;
        return false;
    }
}

// Save user plan to Firebase
async function saveUserPlanToFirebase(userData, plan) {
    if (!isFirebaseInitialized || !db) {
        console.warn('Firebase not initialized. Data will not be saved.');
        return { success: false, error: 'Firebase not initialized' };
    }

    try {
        // Get current logged-in user email
        let userEmail = null;
        let userId = null;
        try {
            const authData = localStorage.getItem('nutritionAppAuth');
            if (authData) {
                const auth = JSON.parse(authData);
                if (auth.user && auth.user.email) {
                    userEmail = auth.user.email;
                    userId = auth.user.id || auth.user.firebaseId;
                }
            }
        } catch (e) {
            console.warn('Could not get user email from auth:', e);
        }

        const planData = {
            // User Information
            name: userData.name,
            age: userData.age,
            weight: userData.weight,
            healthCondition: userData.healthCondition,
            goal: userData.goal,
            
            // User identification
            userEmail: userEmail || userData.email || userData.name, // Use email if available, fallback to name
            userId: userId,
            
            // Generated Plan
            dailyCalories: plan.dailyCalories,
            macros: {
                protein: plan.macros.protein,
                carbs: plan.macros.carbs,
                fats: plan.macros.fats,
                proteinRatio: plan.macros.proteinRatio,
                carbRatio: plan.macros.carbRatio,
                fatRatio: plan.macros.fatRatio
            },
            
            // Meal Recommendations
            meals: {
                breakfast: plan.meals.breakfast,
                lunch: plan.meals.lunch,
                dinner: plan.meals.dinner,
                snacks: plan.meals.snacks
            },
            
            // Recommendations
            recommendations: plan.recommendations,
            healthTips: plan.healthTips,
            
            // Metadata
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            timestamp: new Date().toISOString()
        };

        // Save to Firestore collection 'nutritionPlans'
        const docRef = await db.collection('nutritionPlans').add(planData);
        
        console.log('Plan saved successfully with ID:', docRef.id);
        return { 
            success: true, 
            planId: docRef.id,
            data: planData
        };
    } catch (error) {
        console.error('Error saving plan to Firebase:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// Get user plans from Firebase
async function getUserPlans(userNameOrEmail) {
    if (!isFirebaseInitialized || !db) {
        console.warn('Firebase not initialized.');
        return [];
    }

    try {
        // Try to get current user email from auth first
        let userEmail = null;
        try {
            const authData = localStorage.getItem('nutritionAppAuth');
            if (authData) {
                const auth = JSON.parse(authData);
                if (auth.user && auth.user.email) {
                    userEmail = auth.user.email;
                }
            }
        } catch (e) {
            console.warn('Could not get user email from auth:', e);
        }

        // Use email if available, otherwise use name
        const searchValue = userEmail || userNameOrEmail;
        
        // Try to query by userEmail first, then fallback to name
        let snapshot;
        try {
            snapshot = await db.collection('nutritionPlans')
                .where('userEmail', '==', searchValue)
                .orderBy('createdAt', 'desc')
                .get();
        } catch (error) {
            // If orderBy fails, try without it
            console.warn('OrderBy failed, trying without:', error);
            snapshot = await db.collection('nutritionPlans')
                .where('userEmail', '==', searchValue)
                .get();
        }
        
        // If no results by email, try by name
        if (snapshot.empty && userNameOrEmail) {
            try {
                snapshot = await db.collection('nutritionPlans')
                    .where('name', '==', userNameOrEmail)
                    .orderBy('createdAt', 'desc')
                    .get();
            } catch (error) {
                snapshot = await db.collection('nutritionPlans')
                    .where('name', '==', userNameOrEmail)
                    .get();
            }
        }
        
        const plans = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            plans.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(data.timestamp || Date.now())
            });
        });
        
        return plans;
    } catch (error) {
        console.error('Error fetching plans:', error);
        return [];
    }
}

// Get all user plans for admin dashboard
async function getAllUserPlans() {
    if (!isFirebaseInitialized || !db) {
        console.warn('Firebase not initialized.');
        return [];
    }

    try {
        const snapshot = await db.collection('nutritionPlans')
            .orderBy('createdAt', 'desc')
            .get();
        
        const plans = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            plans.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(data.timestamp || Date.now())
            });
        });
        
        return plans;
    } catch (error) {
        console.error('Error fetching all plans:', error);
        return [];
    }
}

// Get plan by ID
async function getPlanById(planId) {
    if (!isFirebaseInitialized || !db) {
        console.warn('Firebase not initialized.');
        return null;
    }

    try {
        const doc = await db.collection('nutritionPlans').doc(planId).get();
        if (doc.exists) {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(data.timestamp || Date.now())
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching plan:', error);
        return null;
    }
}

// Get meal by ID
async function getMealById(mealId) {
    if (!isFirebaseInitialized || !db) {
        console.warn('Firebase not initialized.');
        return null;
    }

    try {
        const doc = await db.collection('customMeals').doc(mealId).get();
        if (doc.exists) {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(data.timestamp || Date.now())
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching meal:', error);
        return null;
    }
}

// Save custom meal to Firebase
async function saveCustomMealToFirebase(mealData) {
    if (!isFirebaseInitialized || !db) {
        console.warn('Firebase not initialized. Data will not be saved.');
        return { success: false, error: 'Firebase not initialized' };
    }

    try {
        // Get current logged-in user email
        let userEmail = null;
        let userId = null;
        try {
            const authData = localStorage.getItem('nutritionAppAuth');
            if (authData) {
                const auth = JSON.parse(authData);
                if (auth.user && auth.user.email) {
                    userEmail = auth.user.email;
                    userId = auth.user.id || auth.user.firebaseId;
                }
            }
        } catch (e) {
            console.warn('Could not get user email from auth:', e);
        }

        const mealDocument = {
            // Meal Information
            mealName: mealData.mealName || 'Custom Meal',
            ingredients: mealData.ingredients,
            
            // Nutrition Information
            totalCalories: mealData.totalCalories,
            totalProtein: mealData.totalProtein,
            totalCarbs: mealData.totalCarbs,
            totalFats: mealData.totalFats,
            
            // Macro Percentages
            carbsPercent: mealData.carbsPercent,
            proteinPercent: mealData.proteinPercent,
            fatPercent: mealData.fatPercent,
            
            // Serving Information
            servingSize: mealData.servingSize,
            totalWeight: mealData.totalWeight,
            
            // User identification
            userEmail: userEmail,
            userId: userId,
            
            // Metadata
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            timestamp: new Date().toISOString(),
            type: 'customMeal'
        };

        // Save to Firestore collection 'customMeals'
        const docRef = await db.collection('customMeals').add(mealDocument);
        
        console.log('Custom meal saved successfully with ID:', docRef.id);
        return { 
            success: true, 
            mealId: docRef.id,
            data: mealDocument
        };
    } catch (error) {
        console.error('Error saving custom meal to Firebase:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// Get user meals from Firebase
async function getUserMeals(userNameOrEmail) {
    if (!isFirebaseInitialized || !db) {
        console.warn('Firebase not initialized.');
        return [];
    }

    try {
        // Try to get current user email from auth first
        let userEmail = null;
        try {
            const authData = localStorage.getItem('nutritionAppAuth');
            if (authData) {
                const auth = JSON.parse(authData);
                if (auth.user && auth.user.email) {
                    userEmail = auth.user.email;
                }
            }
        } catch (e) {
            console.warn('Could not get user email from auth:', e);
        }

        // Use email if available, otherwise use name
        const searchValue = userEmail || userNameOrEmail;
        
        // Query by userEmail
        let snapshot;
        try {
            snapshot = await db.collection('customMeals')
                .where('userEmail', '==', searchValue)
                .orderBy('createdAt', 'desc')
                .get();
        } catch (error) {
            // If orderBy fails, try without it
            console.warn('OrderBy failed, trying without:', error);
            snapshot = await db.collection('customMeals')
                .where('userEmail', '==', searchValue)
                .get();
        }
        
        const meals = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            meals.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(data.timestamp || Date.now())
            });
        });
        
        return meals;
    } catch (error) {
        console.error('Error fetching meals:', error);
        return [];
    }
}

// Save user registration to Firebase
async function saveUserToFirebase(userData) {
    if (!isFirebaseInitialized || !db) {
        console.warn('Firebase not initialized. User will not be saved to database.');
        return { success: false, error: 'Firebase not initialized' };
    }

    try {
        // Check if user with this email already exists
        const existingUser = await checkUserExistsByEmail(userData.email);
        if (existingUser) {
            return { 
                success: false, 
                error: 'Email already registered',
                exists: true
            };
        }

        const userDocument = {
            // User Information
            name: userData.name,
            email: userData.email,
            // Note: In production, password should be hashed before saving
            // For now, we'll save it but recommend using Firebase Authentication
            password: userData.password,
            
            // Metadata
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            timestamp: new Date().toISOString(),
            userId: userData.id || 'user_' + Date.now()
        };

        // Save to Firestore collection 'users'
        const docRef = await db.collection('users').add(userDocument);
        
        console.log('User saved successfully to Firebase with ID:', docRef.id);
        return { 
            success: true, 
            userId: docRef.id,
            userDocId: docRef.id,
            data: userDocument
        };
    } catch (error) {
        console.error('Error saving user to Firebase:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// Check if user exists by email
async function checkUserExistsByEmail(email) {
    if (!isFirebaseInitialized || !db) {
        console.warn('Firebase not initialized.');
        return null;
    }

    try {
        const snapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error checking user existence:', error);
        return null;
    }
}

// Get user by email (for login)
async function getUserByEmail(email) {
    if (!isFirebaseInitialized || !db) {
        console.warn('Firebase not initialized.');
        return null;
    }

    try {
        const snapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                name: data.name,
                email: data.email,
                password: data.password, // In production, use Firebase Auth instead
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(data.timestamp || Date.now())
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

// Initialize Firebase when script loads
// Wait for Firebase SDK to be loaded
function waitForFirebase() {
    if (typeof firebase !== 'undefined') {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeFirebase);
        } else {
            initializeFirebase();
        }
    } else {
        // Retry after a short delay if Firebase SDK is not loaded yet
        setTimeout(waitForFirebase, 100);
    }
}

// Start waiting for Firebase
waitForFirebase();

