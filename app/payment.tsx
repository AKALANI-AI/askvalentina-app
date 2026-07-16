// Powered by OnSpace.AI
// ASK VALENTINA — Payment Screen (Stripe Checkout)

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { theme } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { createPaymentSession, verifyPayment } from '@/services/paymentService';
import { useApp } from '@/contexts/AppContext';

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const { refreshReadings } = useApp();
  const params = useLocalSearchParams<{
    name: string;
    phone: string;
    topic: string;
    questions: string;
    totalPrice: string;
    questionCount: string;
    clientPhoto: string;
    subjectPhotos: string;
    pushToken: string;
  }>();

  const totalPrice = parseInt(params.totalPrice || '15');
  const questionCount = parseInt(params.questionCount || '1');
  const parsedQuestions: string[] = params.questions ? JSON.parse(params.questions) : [];

  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const topicConfig = APP_CONFIG.topicCategories.find((t) => t.id === params.topic);

  // Listen for deep link return from Stripe
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      if (url.includes('payment/success')) {
        const urlParams = new URL(url);
        const sessionId = urlParams.searchParams.get('session_id');
        const readingId = urlParams.searchParams.get('reading_id');

        if (sessionId && readingId) {
          setProcessing(true);
          const { data, error } = await verifyPayment(sessionId, readingId);
          if (data?.verified) {
            await refreshReadings();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/success');
          } else {
            setErrorMsg(error || 'Payment verification failed. Please contact support.');
            setProcessing(false);
          }
        } else {
          await refreshReadings();
          router.replace('/success');
        }
      } else if (url.includes('payment/cancel')) {
        setErrorMsg('Payment was cancelled. You can try again.');
        setProcessing(false);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [refreshReadings]);

  const handlePay = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setProcessing(true);
    setErrorMsg('');

    const parsedSubjectPhotos: string[] = params.subjectPhotos ? JSON.parse(params.subjectPhotos) : [];

    const { data, error } = await createPaymentSession({
      clientName: params.name || 'Guest',
      clientPhone: params.phone || '',
      topic: params.topic || 'general',
      questions: parsedQuestions,
      questionCount,
      clientPhoto: params.clientPhoto || undefined,
      subjectPhotos: parsedSubjectPhotos.length > 0 ? parsedSubjectPhotos : undefined,
      pushToken: params.pushToken || undefined,
    });

    if (error || !data?.url) {
      setErrorMsg(error || 'Failed to create payment session. Please try again.');
      setProcessing(false);
      return;
    }

    try {
      // Open Stripe checkout in in-app browser
      await WebBrowser.openBrowserAsync(data.url);
      // When browser closes, check if we need to verify
      // The deep link handler above will catch the redirect
      setProcessing(false);
    } catch (browserError) {
      // Fallback to system browser
      try {
        await Linking.openURL(data.url);
      } catch {
        setErrorMsg('Could not open payment page. Please try again.');
        setProcessing(false);
      }
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Step indicator */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.stepRow}>
          <View style={styles.stepDotDone}>
            <MaterialIcons name="check" size={8} color="#FFF" />
          </View>
          <View style={styles.stepLineDone} />
          <View style={styles.stepDotActive} />
          <Text style={styles.stepText}>Step 2 of 2</Text>
        </Animated.View>

        {/* Order Summary */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.summaryCard}>
          <LinearGradient
            colors={theme.gradientCard}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{questionCount} {questionCount === 1 ? 'Question' : 'Questions'} Reading</Text>
            <Text style={styles.summaryValue}>{APP_CONFIG.currency}{totalPrice}</Text>
          </View>
          {topicConfig ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Topic</Text>
              <View style={styles.topicPill}>
                <MaterialIcons name={topicConfig.icon as any} size={14} color={topicConfig.color} />
                <Text style={[styles.topicPillText, { color: topicConfig.color }]}>{topicConfig.label}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{APP_CONFIG.currency}{totalPrice}</Text>
          </View>
        </Animated.View>

        {/* Stripe payment info */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.stripeCard}>
          <MaterialIcons name="credit-card" size={28} color={theme.primaryLight} />
          <Text style={styles.stripeTitle}>Secure Checkout</Text>
          <Text style={styles.stripeText}>
            You will be redirected to Stripe to complete your payment securely. All major credit and debit cards are accepted.
          </Text>
          <View style={styles.cardLogosRow}>
            <View style={styles.cardLogoBadge}><Text style={styles.cardLogoText}>VISA</Text></View>
            <View style={styles.cardLogoBadge}><Text style={styles.cardLogoText}>MC</Text></View>
            <View style={styles.cardLogoBadge}><Text style={styles.cardLogoText}>AMEX</Text></View>
          </View>
        </Animated.View>

        {/* Error message */}
        {errorMsg ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.errorCard}>
            <MaterialIcons name="error-outline" size={18} color={theme.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </Animated.View>
        ) : null}

        {/* Security notice */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.securityRow}>
          <MaterialIcons name="lock" size={16} color={theme.success} />
          <Text style={styles.securityText}>Payments processed securely by Stripe</Text>
        </Animated.View>
      </View>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handlePay}
          disabled={processing}
          style={[styles.payButton, processing && styles.payButtonDisabled]}
        >
          <LinearGradient
            colors={processing ? [theme.surfaceLight, theme.surfaceLight] : [theme.accent, theme.accentDark]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          {processing ? (
            <Text style={[styles.payText, { color: theme.textMuted }]}>Processing...</Text>
          ) : (
            <>
              <MaterialIcons name="lock" size={18} color={theme.background} />
              <Text style={styles.payText}>Pay {APP_CONFIG.currency}{totalPrice}</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: theme.surface,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  stepDotDone: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLineDone: {
    flex: 1,
    height: 2,
    backgroundColor: theme.success,
    maxWidth: 40,
  },
  stepDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.accent,
  },
  stepText: {
    fontSize: 13,
    color: theme.textMuted,
    fontWeight: '500',
    marginLeft: 8,
  },
  summaryCard: {
    borderRadius: theme.radius.lg,
    padding: 18,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topicPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.accent,
  },
  stripeCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  stripeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  stripeText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardLogosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardLogoBadge: {
    backgroundColor: theme.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cardLogoText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.textMuted,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: theme.error + '15',
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.error + '40',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: theme.error,
    lineHeight: 19,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 13,
    color: theme.textMuted,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: theme.radius.lg,
    gap: 8,
    overflow: 'hidden',
    ...theme.shadow.gold,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payText: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.background,
  },
});
