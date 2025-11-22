
# AI-Powered Healthcare Platform System

A modern, AI-powered web application that generates personalized nutrition plans using machine learning. Built with vanilla HTML, CSS, and JavaScript, featuring TensorFlow.js for intelligent meal recommendations.

![AI Nutrition](https://img.shields.io/badge/AI-ML%20Powered-blue)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.15.0-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Overview

This application provides personalized nutrition and health recommendations based on user input including age, weight, health conditions, and wellness goals. The system uses a neural network model powered by TensorFlow.js to analyze user data and generate customized meal plans, macro distributions, and health tips.

## ✨ Features

- **🤖 AI-Powered Recommendations**: Neural network model analyzes user profile to generate personalized nutrition plans
- **🍽️ Personalized Meal Plans**: Custom breakfast, lunch, dinner, and snack recommendations
- **📊 Macro Calculations**: Intelligent protein, carbohydrate, and fat distribution based on goals
- **💡 Health-Specific Guidance**: Recommendations tailored for diabetes, high blood pressure, heart issues, and general wellness
- **📱 Fully Responsive**: Beautiful, modern UI that works on all devices
- **🎨 Modern Design**: Clean, professional healthcare-inspired interface
- **⚡ Real-time Processing**: Instant ML-powered plan generation

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with CSS variables, flexbox, and grid
- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript

### Machine Learning
- **TensorFlow.js v4.15.0**: Browser-based neural network for nutrition recommendations
  - Sequential model with 4 layers
  - ReLU and Sigmoid activations
  - Adam optimizer
  - Trained on synthetic nutrition data

### External Libraries
- **Google Fonts (Inter)**: Professional typography
- **TensorFlow.js CDN**: ML library loaded via CDN
- **Firebase SDK**: Cloud database for storing user plans

## 📁 Project Structure

```
AI Nutrition & Health/
│
├── index.html          # Main HTML structure
├── style.css           # All CSS styles and responsive design
├── app.js              # JavaScript application logic and ML model
├── firebase.js         # Firebase configuration and database functions
├── README.md           # Project documentation
└── FIREBASE_SETUP.md   # Firebase setup guide
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Firebase account (for database functionality)
- No build tools or package managers required!

### Installation

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd "AI Nutrition & Health"
   ```

2. **Set up Firebase** (Required for saving plans)
   - Follow the detailed guide in `FIREBASE_SETUP.md`
   - Create a Firebase project
   - Enable Firestore Database
   - Update `firebase.js` with your Firebase configuration

3. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

4. **Access the application**
   - Navigate to `http://localhost:8000` (or the port you specified)
   - Or double-click `index.html` to open directly

### Firebase Setup Quick Start

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Copy your Firebase config
5. Update `firebase.js` with your credentials

See `FIREBASE_SETUP.md` for detailed instructions.

## 💻 Usage

1. **Start Your Nutrition Check**
   - Click the "Start My Nutrition Check" button on the homepage

2. **Fill in Your Details**
   - **Name**: Your full name (required for saving your plan)
   - **Age**: Your current age
   - **Weight**: Your weight in kilograms
   - **Health Condition**: Select from:
     - Diabetes
     - High BP
     - Heart Issue
     - None
   - **Goal**: Choose your wellness goal:
     - Weight Loss
     - Weight Gain
     - Fitness
     - Healthy Diet

3. **Generate Your Plan**
   - Click "Generate My Plan"
   - The AI will analyze your profile and generate a personalized nutrition plan
   - Your plan will be automatically saved to Firebase database

4. **View Your Results**
   - Daily calorie target
   - Macro breakdown (protein, carbs, fats)
   - Recommended meals for breakfast, lunch, dinner, and snacks
   - Health-specific recommendations
   - Daily tips and insights

## 🤖 Machine Learning Implementation

### Model Architecture

The application uses a **Sequential Neural Network** with the following structure:

```
Input Layer:  4 features (age, weight, health condition, goal)
    ↓
Dense Layer 1: 16 units, ReLU activation
    ↓
Dense Layer 2: 32 units, ReLU activation
    ↓
Dense Layer 3: 16 units, ReLU activation
    ↓
Output Layer:  8 units, Sigmoid activation
```

### Input Features

1. **Age** (normalized: age / 100)
2. **Weight** (normalized: weight / 150)
3. **Health Condition** (encoded: 0-3, normalized)
4. **Goal** (encoded: 0-3, normalized)

### Output Predictions

The model predicts 8 values:
1. Calorie multiplier
2. Protein ratio
3. Carbohydrate ratio
4. Fat ratio
5. Meal frequency
6. Snack frequency
7. Health priority
8. Goal priority

### Training Data

- **200 synthetic training samples**
- Generated based on realistic nutrition patterns
- Adjusted for different goals (weight loss, gain, fitness, healthy diet)
- Trained for 50 epochs with batch size of 32

### ML Features

- **Real-time Inference**: Predictions made in the browser
- **No Server Required**: All ML processing happens client-side
- **Privacy-First**: User data never leaves the browser
- **Fast Performance**: Optimized TensorFlow.js model

## 📊 How It Works

### 1. Data Collection
User inputs are collected through a clean, user-friendly form.

### 2. Data Normalization
Inputs are normalized to values between 0-1 for optimal ML performance.

### 3. ML Prediction
The trained neural network processes the normalized inputs and generates predictions.

### 4. Plan Generation
Based on ML predictions and user data:
- Daily calories are calculated using BMR (Basal Metabolic Rate)
- Macros are distributed according to goals and ML insights
- Meals are selected based on health conditions and preferences
- Recommendations are tailored to specific health needs

### 5. Results Display
A comprehensive nutrition plan is displayed with:
- Daily nutrition goals
- Meal recommendations
- Health-specific guidance
- Actionable tips

## 🎨 Design Features

- **Healthcare-Inspired Colors**: Professional blue (#0066CC) and green (#00A86B) palette
- **Modern UI Components**: Rounded cards, smooth shadows, clean typography
- **Smooth Animations**: Fade-in, slide-up transitions
- **Responsive Breakpoints**: Optimized for mobile, tablet, and desktop
- **Accessibility**: Semantic HTML, proper contrast ratios

## 🔧 Customization

### Adding New Meals

Edit `app.js` and add to the `nutritionData.meals` object:

```javascript
nutritionData: {
    meals: {
        breakfast: [
            { name: 'Your Meal', calories: 300, protein: 12, carbs: 45, fats: 8 },
            // Add more meals...
        ],
        // Other meal types...
    }
}
```

### Modifying ML Model

Adjust the model architecture in `app.js`:

```javascript
this.model = tf.sequential({
    layers: [
        tf.layers.dense({ inputShape: [4], units: 16, activation: 'relu' }),
        // Modify layers here...
    ]
});
```

### Styling Changes

All styles are in `style.css`. Modify CSS variables for quick theme changes:

```css
:root {
    --primary-blue: #0066CC;
    --primary-green: #00A86B;
    /* Change colors here... */
}
```

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Privacy & Security

- **Client-Side Processing**: ML model runs entirely in the browser
- **Firebase Storage**: User plans are saved to Firebase Firestore
- **Secure Database**: Firebase provides enterprise-grade security
- **No Cookies**: No tracking or analytics cookies
- **User Control**: Users can view and manage their saved plans

### Data Storage

- User plans are automatically saved to Firebase Firestore
- Data includes: name, age, weight, health condition, goal, and generated plan
- Plans are stored with timestamps for tracking
- See `FIREBASE_SETUP.md` for security configuration

## 🚧 Future Enhancements

- [x] Save nutrition plans to database (Firebase)
- [ ] View saved plans history
- [ ] Export plans as PDF
- [ ] Weekly meal planning
- [ ] Progress tracking
- [ ] Integration with fitness trackers
- [ ] More health conditions support
- [ ] Recipe suggestions
- [ ] Shopping list generation
- [ ] Model training on real user data (with consent)
- [ ] User authentication for personalized dashboards

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Development

### Code Structure

- **index.html**: Semantic HTML structure, no inline styles or scripts
- **style.css**: Organized CSS with clear sections and comments
- **app.js**: Modular JavaScript with namespace pattern, organized functions

### Best Practices

- ✅ Clean, readable code
- ✅ Comprehensive comments
- ✅ Modular architecture
- ✅ No global namespace pollution
- ✅ Responsive design
- ✅ Accessibility considerations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or suggestions, please open an issue on the repository.

## 🙏 Acknowledgments

- **TensorFlow.js Team**: For the amazing browser-based ML library
- **Google Fonts**: For the Inter font family
- **MyHealth1st.com.au**: Design inspiration

---

**Built with ❤️ using AI and Machine Learning**

*This application is for educational and informational purposes only. Always consult with a healthcare professional before making significant changes to your diet or nutrition plan.*


