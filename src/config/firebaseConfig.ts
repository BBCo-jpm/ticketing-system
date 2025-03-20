// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_wCv52S3BgJGoWot9HHD5t-jlO8mG360",
  authDomain: "ticketing-system-database.firebaseapp.com",
  projectId: "ticketing-system-database",
  storageBucket: "ticketing-system-database.firebasestorage.app",
  messagingSenderId: "286207445755",
  appId: "1:286207445755:web:e1b63e96631baa57eb3e5e",
  measurementId: "G-SBQ1G9DNWX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);