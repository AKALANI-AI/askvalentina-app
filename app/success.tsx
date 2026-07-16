// Powered by OnSpace.AI
// ASK VALENTINA — Success Confirmation Screen

import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

export default function SuccessScreen() {
  const insets = useSafeAreaInsets();
  const { refreshReadings } = useApp();
  const scale = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 120 }));
    refreshReadings();
  }, []);

  const animatedIcon = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.background, '#1E1048', theme.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* Success icon */}
        <Animated.View style={[styles.iconWrapper, animatedIcon]}>
          <Image
            source={require('@/assets/images/success.png')}
            style={styles.successImage}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text style={styles.title}>Payment Successful</Text>
          <Text style={styles.subtitle}>
            Your reading request has been submitted and paid. You will receive your spiritual guidance from Valentina within 24 hours.
          </Text>
        </Animated.View>

        {/* Info cards */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.infoCards}>
          <View style={styles.infoCard}>
            <MaterialIcons name="schedule" size={22} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoCardTitle}>Response Time</Text>
              <Text style={styles.infoCardText}>Within 24 hours</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <MaterialIcons name="verified" size={22} color={theme.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoCardTitle}>Payment Confirmed</Text>
              <Text style={styles.infoCardText}>Securely processed by Stripe</Text>
            </View>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeIn.delay(800).duration(500)} style={styles.actions}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.replace('/(tabs)/readings');
            }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>View My Readings</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.replace('/(tabs)');
            }}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>Back to Home</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginBottom: 32,
  },
  successImage: {
    width: 160,
    height: 160,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  infoCards: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.surface,
    borderRadius: theme.radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  infoCardText: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.gold,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.background,
  },
  secondaryBtn: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
  },
});
