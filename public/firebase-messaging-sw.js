importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCsekAt_2ulce6e5aIp2pjboQgAeieFl0o",
  authDomain: "appointme-51f8c.firebaseapp.com",
  projectId: "appointme-51f8c",
  storageBucket: "appointme-51f8c.firebasestorage.app",
  messagingSenderId: "895026251281",
  appId: "1:895026251281:web:05a174ba9cc507a4f153b0",
  measurementId: "G-YVG797HV2M"
});

const messaging = firebase.messaging();