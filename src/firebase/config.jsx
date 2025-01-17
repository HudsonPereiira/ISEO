
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
import { getAuth } from "firebase/auth"


const firebaseConfig = {
  apiKey: "AIzaSyDpd-nanR1QbXPCTZOaNW_cJAEBciuof74",
  authDomain: "iseo-2cbad.firebaseapp.com",
  projectId: "iseo-2cbad",
  storageBucket: "iseo-2cbad.firebasestorage.app",
  messagingSenderId: "716245166257",
  appId: "1:716245166257:web:1b432260659dd9e3165a90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

const auth = getAuth(app)

export {db, app, auth}

