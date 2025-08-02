// Initialize Firebase in the service worker and handle background notifications
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// TODO: Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: 'REPLACE_WITH_YOUR_API_KEY',
  authDomain: 'REPLACE_WITH_YOUR_AUTH_DOMAIN',
  projectId: 'REPLACE_WITH_YOUR_PROJECT_ID',
  storageBucket: 'REPLACE_WITH_YOUR_STORAGE_BUCKET',
  messagingSenderId: 'REPLACE_WITH_YOUR_MESSAGING_SENDER_ID',
  appId: 'REPLACE_WITH_YOUR_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title || 'New Notification', {
    body: body || '',
    icon: icon || '/icons/icon-192.png',
  });
});
// End of Firebase Messaging Service Worker
