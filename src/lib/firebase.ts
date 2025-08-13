
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9XCsWRDMYKi4jVakH2ZwwCh5XQZ6AiEs",
  authDomain: "pingly-b1de9.firebaseapp.com",
  projectId: "pingly-b1de9",
  storageBucket: "pingly-b1de9.appspot.com",
  messagingSenderId: "1753113792496",
  appId: "1:1753113792496:web:2f0e35320853724a955747",
  measurementId: "G-9XG99F2H9E",
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

const initialized = getFirebaseApp();
auth = initialized.auth;
db = initialized.db;

export { getFirebaseApp, app, auth, db };
