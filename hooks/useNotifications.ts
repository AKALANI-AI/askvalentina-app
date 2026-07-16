// Powered by OnSpace.AI
// ASK VALENTINA — Push Notifications Hook

import { useEffect, useRef, useState, useCallback } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
} from '@/services/notificationService';

export function useNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    if (data?.readingId) {
      // Navigate to the reading detail screen
      setTimeout(() => {
        router.push(`/reading/${data.readingId}`);
      }, 500);
    }
  }, []);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications().then((token) => {
      setPushToken(token);
      setTokenReady(true);
    });

    // Listen for notifications received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener((notification) => {
      // Notification received in foreground — the handler will show it automatically
      console.log('Notification received:', notification.request.content.title);
    });

    // Listen for user tapping on notifications
    responseListener.current = addNotificationResponseListener(handleNotificationResponse);

    // Handle notification that opened the app from killed state
    getLastNotificationResponse().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [handleNotificationResponse]);

  return { pushToken, tokenReady };
}
