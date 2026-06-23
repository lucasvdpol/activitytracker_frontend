importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js')

// These values come from the Firebase Console (Project settings > General > Your apps)
// and are safe to expose client-side, but the service worker can't read import.meta.env,
// so they're hardcoded here separately from src/firebase.js.
firebase.initializeApp({
  apiKey: 'AIzaSyD9muWB0CbprJ8GrePUGPVYXOik6Atdgdw',
  authDomain: 'activity-tracker-17a8b.firebaseapp.com',
  projectId: 'activity-tracker-17a8b',
  storageBucket: 'activity-tracker-17a8b.firebasestorage.app',
  messagingSenderId: '520461609102',
  appId: '1:520461609102:web:ca80919bd0bc0dd8f781df',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {}
  self.registration.showNotification(title || 'ActivityTracker', {
    body,
    icon: icon || '/icon-192.png',
  })
})
