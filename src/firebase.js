// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔐 YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyB3qWrXl_jgFj_Tn4ltMRkUXC59fr_RIfo",
  authDomain: "codex-185bc.firebaseapp.com",
  projectId: "codex-185bc",
  storageBucket: "codex-185bc.appspot.com",
  messagingSenderId: "163844343405",
  appId: "1:163844343405:web:623c183fa3bd5dfe1de164",
  measurementId: "G-RK9R58Y9P9",
};

// 🚀 INIT
const app = initializeApp(firebaseConfig);

// 🔥 SERVICES
export const auth = getAuth(app);
export const db = getFirestore(app);