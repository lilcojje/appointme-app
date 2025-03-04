import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDVAcy3SkN45XLgGNdfvubNc80eghBjpaU",
  authDomain: "kblapp-cc589.firebaseapp.com",
  projectId: "kblapp-cc589",
  storageBucket: "kblapp-cc589.appspot.com",
  messagingSenderId: "982363249873",
  appId: "1:982363249873:web:024d8d41b40283a52f39f0",
  measurementId: "G-0RYY6680B5"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase Messaging
const messaging = firebase.messaging();

export default messaging;