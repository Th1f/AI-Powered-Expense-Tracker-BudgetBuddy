import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyCapaafJ5rFWe6AmxzoFy_QIJhlDVRihBg",

  authDomain: "budgetbuddy-b9ba8.firebaseapp.com",

  projectId: "budgetbuddy-b9ba8",

  storageBucket: "budgetbuddy-b9ba8.firebasestorage.app",

  messagingSenderId: "981658591470",

  appId: "1:981658591470:web:204577ea8003a2b383d3ff",

  measurementId: "G-E97NJTF347"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);