import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCsekAt_2ulce6e5aIp2pjboQgAeieFl0o",
  authDomain: "appointme-51f8c.firebaseapp.com",
  projectId: "appointme-51f8c",
  storageBucket: "appointme-51f8c.firebasestorage.app",
  messagingSenderId: "895026251281",
  appId: "1:895026251281:web:05a174ba9cc507a4f153b0",
  measurementId: "G-YVG797HV2M"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase Messaging
const messaging = firebase.messaging();

export default messaging;