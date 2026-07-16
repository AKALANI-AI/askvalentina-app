// Powered by OnSpace.AI
// ASK VALENTINA — Root Layout

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/contexts/AppContext';
import { AdminProvider } from '@/contexts/AdminContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AppProvider>
          <AdminProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="submit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="payment" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="success" options={{ presentation: 'modal', animation: 'fade' }} />
              <Stack.Screen name="reading/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="admin-answer" options={{ animation: 'slide_from_right' }} />
            </Stack>
          </AdminProvider>
        </AppProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
