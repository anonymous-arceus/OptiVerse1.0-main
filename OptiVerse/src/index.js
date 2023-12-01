// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVhJuFsF8mtlZ2t2gOPB33dC9Ifds6gOQ",
  authDomain: "optiverse-c6081.firebaseapp.com",
  databaseURL: "https://optiverse-c6081-default-rtdb.firebaseio.com",
  projectId: "optiverse-c6081",
  storageBucket: "optiverse-c6081.appspot.com",
  messagingSenderId: "673047036358",
  appId: "1:673047036358:web:597c7270f3c3866465f2c7",
  measurementId: "G-B199MRFH61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);