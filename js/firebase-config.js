// Firebase Configuration
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyCAdYzdqaxIPTC849nZOnFbY_UMcGxD6rU",
  authDomain: "portfolio-c8fbe.firebaseapp.com",
  projectId: "portfolio-c8fbe",
  storageBucket: "portfolio-c8fbe.firebasestorage.app",
  messagingSenderId: "87911502892",
  appId: "1:87911502892:web:5db6d3be6dff70f1532d89",
  measurementId: "G-R4CYTS1NH6"
};

// Initialize Firebase (using compat version)
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Get Firestore instance
const db = firebase.firestore();
