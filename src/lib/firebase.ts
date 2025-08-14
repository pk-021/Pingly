
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACiqz7i27Yu0h1A2yoFx6BOsrWqYeD4XI",
  authDomain: "pingly0.firebaseapp.com",
  projectId: "pingly0",
  storageBucket: "pingly0.firebasestorage.app",
  messagingSenderId: "898991883909",
  appId: "1:898991883909:web:9bfe8775f4cbc440ab4bec",
  measurementId: "G-38HQ6H5QCB"
};
// Initialize Firebase for client-side
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function getFirebaseApp() {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    return { app, auth, db };
}

// Initialize on load
const initialized = getFirebaseApp();
app = initialized.app;
auth = initialized.auth;
db = initialized.db;

export { getFirebaseApp, app, auth, db };
