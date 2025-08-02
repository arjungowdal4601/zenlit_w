import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Initialize Firebase using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
};

const firebaseApp = initializeApp(firebaseConfig);

/**
 * Custom hook to handle Firebase Cloud Messaging in the browser.
 * It requests notification permission, registers the service worker,
 * retrieves the FCM token, listens for foreground messages, and
 * returns the token so it can be sent to your backend.
 */
export function useFirebaseMessaging() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const messaging = getMessaging(firebaseApp);

    async function setupFCM() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission not granted');
          return;
        }
        // Register the service worker for Firebase Messaging
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        // Retrieve the current registration token
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        if (currentToken) {
          setToken(currentToken);
          console.log('FCM token:', currentToken);
          // TODO: Send this token to your server and associate it with the signed-in user
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    }

    setupFCM();

    // Handle messages when the app is in the foreground
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      // You can display custom UI or notifications here
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return token;
}
