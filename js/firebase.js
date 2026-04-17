import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKm3mDTCSaYt_cUeSSbP-RDQv5ZiSe5G4",
  authDomain: "icelink-5ef20.firebaseapp.com",
  databaseURL: "https://icelink-5ef20-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "icelink-5ef20",
  storageBucket: "icelink-5ef20.firebasestorage.app",
  messagingSenderId: "563699738768",
  appId: "1:563699738768:web:7102e2b51a26317de95015"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);