// Firebase Configuration
// Replace these values with your Firebase project config
// Get them from: Firebase Console → Project Settings → General → Your apps

const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// This will be overridden by settings in admin dashboard
window.FIREBASE_CONFIG = FIREBASE_CONFIG;

