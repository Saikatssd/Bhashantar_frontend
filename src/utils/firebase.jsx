// import firebase from 'firebase/compat/app';
// import 'firebase/compat/auth';

// const firebaseConfig = {
// apiKey: "AIzaSyApdce8TMmnIUkamZiRmlNM409NJRZzs24",
// authDomain: "kyrotics.firebaseapp.com",
// projectId: "kyrotics",
// storageBucket: "kyrotics.appspot.com",
// messagingSenderId: "576941623096",
// appId: "1:576941623096:web:2452601bf4299a66c923cd",

// };

// if (!firebase.apps.length) {
//     firebase.initializeApp(firebaseConfig);
// }

// export const auth = firebase.auth();
// export default firebase;


// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth, setPersistence, browserSessionPersistence, onAuthStateChanged } from "firebase/auth";
// import { getFunctions } from "firebase/functions";
// import { getFirestore } from "firebase/firestore"; 
// import { getStorage } from 'firebase/storage';

// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyApdce8TMmnIUkamZiRmlNM409NJRZzs24",
//     authDomain: "kyrotics.firebaseapp.com",
//     projectId: "kyrotics",
//     storageBucket: "kyrotics.appspot.com",
//     messagingSenderId: "576941623096",
//     appId: "1:576941623096:web:2452601bf4299a66c923cd",
//     measurementId: "G-D1VEFYTFYR"

// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const analytics = getAnalytics(app);
// const functions = getFunctions(app);
// const db = getFirestore(app); 
// const storage = getStorage(app);



// // Set persistence to session only
// setPersistence(auth, browserSessionPersistence)
//   .then(() => {
//     console.log("Session persistence set successfully");
//   })
//   .catch((error) => {
//     console.error("Error setting session persistence:", error);
//   });

// export { app, auth, functions, db, storage };


import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


console.log(import.meta.env.VITE_FIREBASE_API_KEY)
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const functions = getFunctions(app);
const db = getFirestore(app); 
const storage = getStorage(app);

// Set persistence to session only
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Session persistence set successfully");
  })
  .catch((error) => {
    console.error("Error setting session persistence:", error);
  });

export { app, auth, functions, db, storage };
