importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// REMPLACER ces valeurs par votre configuration Firebase de production
const firebaseConfig = {
  apiKey: "AIzaSyDogMgRnfMlusqSvgHK0l2gSn6XErZADQY",
  authDomain: "navestats.firebaseapp.com",
  projectId: "navestats",
  storageBucket: "navestats.firebasestorage.app",
  messagingSenderId: "713218753127",
  appId: "1:713218753127:web:24041d3d1fd92d7fc84ac2"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png' // Ajoutez votre icône NavéStats ici
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
