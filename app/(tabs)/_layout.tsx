// Powered by OnSpace.AI
// ASK VALENTINA — Tab Layout

import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, Text } from 'react-native';
import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { pendingCount } = useApp();

  const tabBarStyle = {
    height: Platform.select({
      ios: insets.bottom + 60,
      android: insets.bottom + 60,
      default: 70,
    }),
    paddingTop: 8,
    paddingBottom: Platform.select({
      ios: insets.bottom + 8,
      android: insets.bottom + 8,
      default: 8,
    }),
    paddingHorizontal: 16,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ask Valentina',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="auto-awesome" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="readings"
        options={{
          title: 'My Readings',
          tabBarIcon: ({ color, size }) => (
            <View>
              <MaterialIcons name="forum" size={size} color={color} />
              {pendingCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  backgroundColor: theme.accent,
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: theme.background }}>{pendingCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Valentina',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="admin-panel-settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
