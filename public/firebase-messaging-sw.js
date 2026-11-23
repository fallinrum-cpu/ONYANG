importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD3P1V9bvJq9Q2WZRL6EdwLuepn2EdoLG0",
  authDomain: "onyang-ea7b1.firebaseapp.com",
  projectId: "onyang-ea7b1",
  storageBucket: "onyang-ea7b1.firebasestorage.app",
  messagingSenderId: "789635766409",
  appId: "1:789635766409:web:fc1570c88716463ac7ce58",
  measurementId: "G-6F5QVQ18EG"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "온양이";
  const body = payload.notification?.body || "새로운 말씀과 소식이 도착했습니다.";
  const options = {
    body,
    icon: "/onyang-icon.png",
    badge: "/onyang-icon.png",
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});
