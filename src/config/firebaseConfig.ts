import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC_wCv52S3BgJGoWot9HHD5t-jlO8mG360",
    authDomain: "ticketing-system-database.firebaseapp.com",
    projectId: "ticketing-system-database",
    storageBucket: "ticketing-system-database.firebasestorage.app",
    messagingSenderId: "286207445755",
    appId: "1:286207445755:web:e1b63e96631baa57eb3e5e",
    measurementId: "G-SBQ1G9DNWX"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);