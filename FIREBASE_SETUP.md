# Firebase Setup Guide

This guide will help you set up Firebase for the AI Nutrition & Health Recommendation System.

## 📋 Prerequisites

- A Google account
- Access to Firebase Console

## 🚀 Step-by-Step Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "ai-nutrition-health")
4. Click **"Continue"**
5. (Optional) Enable Google Analytics
6. Click **"Create project"**
7. Wait for the project to be created, then click **"Continue"**

### 2. Enable Firestore Database

1. In your Firebase project, click on **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
   - ⚠️ **Note**: For production, you'll need to set up proper security rules
4. Choose a location for your database (select the closest to your users)
5. Click **"Enable"**

### 3. Get Your Firebase Configuration

1. In your Firebase project, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to the **"Your apps"** section
4. Click the **Web icon** `</>` to add a web app
5. Register your app with a nickname (e.g., "AI Nutrition Web App")
6. (Optional) Check "Also set up Firebase Hosting"
7. Click **"Register app"**
8. Copy the `firebaseConfig` object that appears

### 4. Update firebase.js

Open `firebase.js` and replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

### 5. Set Up Firestore Security Rules (Important!)

1. Go to **Firestore Database** → **Rules** tab
2. For development, you can use these rules (⚠️ **NOT for production**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /nutritionPlans/{document=**} {
      allow read, write: if true; // Allow all for development
    }
  }
}
```

3. Click **"Publish"**

### 6. Production Security Rules (Recommended)

For production, use more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /nutritionPlans/{planId} {
      // Allow users to read their own plans
      allow read: if request.auth != null && 
                     resource.data.name == request.auth.token.name;
      
      // Allow users to create their own plans
      allow create: if request.auth != null;
      
      // Allow users to update their own plans
      allow update: if request.auth != null && 
                       resource.data.name == request.auth.token.name;
      
      // Allow users to delete their own plans
      allow delete: if request.auth != null && 
                       resource.data.name == request.auth.token.name;
    }
  }
}
```

## 📊 Database Structure

The application saves data to Firestore with the following structure:

### Collection: `nutritionPlans`

Each document contains:

```javascript
{
  // User Information
  name: "John Doe",
  age: 30,
  weight: 75.5,
  healthCondition: "diabetes",
  goal: "weight-loss",
  
  // Generated Plan
  dailyCalories: 1800,
  macros: {
    protein: 157,
    carbs: 157,
    fats: 60,
    proteinRatio: 0.35,
    carbRatio: 0.35,
    fatRatio: 0.3
  },
  
  // Meal Recommendations
  meals: {
    breakfast: [{ name: "Oatmeal with berries", calories: 300, ... }],
    lunch: [{ name: "Grilled chicken salad", calories: 400, ... }],
    dinner: [{ name: "Baked fish with vegetables", calories: 450, ... }],
    snacks: [{ name: "Apple with almond butter", calories: 200, ... }]
  },
  
  // Recommendations
  recommendations: {
    goal: { ... },
    health: { ... }
  },
  healthTips: ["Eat protein with every meal", ...],
  
  // Metadata
  createdAt: Timestamp,
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

## 🔍 Viewing Saved Data

1. Go to **Firestore Database** in Firebase Console
2. Click on the **`nutritionPlans`** collection
3. You'll see all saved user plans with their data

## 🛡️ Security Best Practices

1. **Never commit your Firebase config with real credentials to public repositories**
2. **Use environment variables** for production
3. **Set up proper Firestore security rules**
4. **Enable Firebase Authentication** for user-specific data
5. **Regularly review and update security rules**

## 🧪 Testing

1. Open your application in a browser
2. Fill out the form with test data
3. Submit the form
4. Check the browser console for success messages
5. Verify data appears in Firestore Database

## ❓ Troubleshooting

### Issue: "Firebase not initialized"
- **Solution**: Make sure Firebase SDK scripts are loaded before `firebase.js`

### Issue: "Permission denied"
- **Solution**: Check your Firestore security rules

### Issue: "Network request failed"
- **Solution**: Check your internet connection and Firebase project status

### Issue: Data not saving
- **Solution**: 
  1. Check browser console for errors
  2. Verify Firebase config is correct
  3. Check Firestore rules allow writes
  4. Ensure Firestore is enabled in your project

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## 🔐 Environment Variables (Optional)

For better security, you can use environment variables:

1. Create a `.env` file (don't commit this):
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

2. Update `firebase.js` to read from environment variables (requires a build process)

---

**Note**: This setup is for development. For production, implement proper authentication and security rules.

