// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBwf-rkEWsNJRkh_TJeMSoNDc1iwO1c6tI",
    authDomain: "clutch-incorporated.firebaseapp.com",
    projectId: "clutch-incorporated",
    storageBucket: "clutch-incorporated.firebasestorage.app",
    messagingSenderId: "515595231583",
    appId: "1:515595231583:web:73ff8c3cdc123dcbce16ea",
    databaseURL: "https://clutch-incorporated-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log("Firebase initialized successfully");