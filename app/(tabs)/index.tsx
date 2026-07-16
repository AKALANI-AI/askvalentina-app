// Powered by OnSpace.AI
// ASK VALENTINA — Home Screen

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { useNotifications } from '@/hooks/useNotifications';

const TESTIMONIALS = [
  {
    text: "It has been a big relief to be able to connect to my husband. You are a gift. Thank you so much and I love you.",
    name: "Darla",
  },
  {
    text: "No words to express this lady. She possesses a gift from God and is surrounded by angels. First class all the way.",
    name: "Ronda",
  },
  {
    text: "Thank you soooo much from the bottom of my heart. I feel so much at ease, knowing my mom made it and is okay. You are a blessing in disguise.",
    name: "Shirley",
  },
  {
    text: "The things Valentina said were mind blowing! She truly has an unbelievable gift. She is such a warm, beautiful soul who truly cares about her clients.",
    name: "Anne",
  },
  {
    text: "I have to say this is the best reading I have ever had. Valentina was so on point with my reading. No guessing games. Only the truth. She is truly gifted and blessed.",
    name: "Claudia",
  },
  {
    text: "Yesterday was a life changing experience. I am so thankful that I was led to you. What you do is very meaningful. May God bless you.",
    name: "David",
  },
  {
    text: "You lifted our spirits so much. You really took a weight off our shoulders. I feel light, clear and confident. Thank you so much.",
    name: "Gloria",
  },
  {
    text: "Meeting you and speaking with you has been one of the greatest things to happen in my life.",
    name: "Jonathan",
  },
];

const STATS = [
  { value: '31+', label: 'Years\nExperience', icon: 'star' },
  { value: '5,000+', label: 'Readings\nDelivered', icon: 'auto-awesome' },
  { value: '98%', label: 'Client\nSatisfaction', icon: 'favorite' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCount, setSelectedCount] = useState(1);
  const { pushToken } = useNotifications();
  const testimonialScrollRef = useRef<ScrollView>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const totalPrice = selectedCount * APP_CONFIG.pricePerQuestion;

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => {
        const next = (prev + 1) % TESTIMONIALS.length;
        const cardWidth = 300 + 12;
        testimonialScrollRef.current?.scrollTo({ x: next * cardWidth, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCount = (count: number) => {
    Haptics.selectionAsync();
    setSelectedCount(count);
  };

  const handleGetReading = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/submit',
      params: {
        questionCount: selectedCount.toString(),
        totalPrice: totalPrice.toString(),
        pushToken: pushToken || '',
      },
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/hero-bg.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(13,11,26,0.3)', 'rgba(13,11,26,0.85)', theme.background]}
        locations={[0, 0.5, 0.75]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
            <View style={styles.availBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.availText}>Available 24/7</Text>
            </View>
          </Animated.View>

          {/* Hero */}
          <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.heroSection}>
            <Image
              source={require('@/assets/images/crystal-ball.png')}
              style={styles.crystalBall}
              contentFit="contain"
            />
            <Text style={styles.heroTitle}>{APP_CONFIG.name}</Text>
            <Text style={styles.heroSubtitle}>{APP_CONFIG.description}</Text>
          </Animated.View>

          {/* ─── Stats Bar ─── */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.statsContainer}>
            {STATS.map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 ? <View style={styles.statDivider} /> : null}
                <View style={styles.statItem}>
                  <MaterialIcons name={stat.icon as any} size={18} color={theme.accent} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </Animated.View>

          {/* ─── About Valentina ─── */}
          <Animated.View entering={FadeInDown.delay(350).duration(600)} style={styles.bioSection}>
            <View style={styles.bioCard}>
              <LinearGradient
                colors={theme.gradientCard}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.bioHeader}>
                <View style={styles.bioIconWrapper}>
                  <MaterialIcons name="visibility" size={22} color={theme.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bioTitle}>About Valentina</Text>
                  <Text style={styles.bioSubtitle}>Psychic Medium & Spiritual Guide</Text>
                </View>
              </View>
              <Text style={styles.bioText}>
                With over 31 years of experience and more than 5,000 readings delivered, Valentina is a gifted psychic medium who connects with spirit to provide clarity, healing, and guidance. She specializes in connecting with loved ones who have crossed over, relationship insight, career guidance, and spiritual growth. Her warm, compassionate approach has earned a 98% client satisfaction rate and a loyal following of clients who return again and again.
              </Text>
              <View style={styles.bioTagsRow}>
                {['Psychic Medium', 'Spirit Communication', 'Life Guidance', 'Energy Healing'].map((tag) => (
                  <View key={tag} style={styles.bioTag}>
                    <Text style={styles.bioTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* ─── Testimonials ─── */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)}>
            <View style={styles.testimonialHeader}>
              <MaterialIcons name="format-quote" size={20} color={theme.accent} />
              <Text style={styles.testimonialSectionTitle}>What Clients Say</Text>
            </View>
            <ScrollView
              ref={testimonialScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.testimonialScroll}
              decelerationRate="fast"
              snapToInterval={312}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / 312);
                setActiveTestimonial(idx);
              }}
            >
              {TESTIMONIALS.map((t, i) => (
                <View key={i} style={styles.testimonialCard}>
                  <LinearGradient
                    colors={[theme.surface, theme.surfaceLight]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <MaterialIcons name="format-quote" size={24} color={theme.primary + '40'} style={styles.quoteIcon} />
                  <Text style={styles.testimonialText} numberOfLines={5}>
                    {t.text}
                  </Text>
                  <View style={styles.testimonialFooter}>
                    <View style={styles.testimonialAvatar}>
                      <Text style={styles.testimonialAvatarText}>{t.name[0]}</Text>
                    </View>
                    <Text style={styles.testimonialName}>~ {t.name}</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <MaterialIcons key={s} name="star" size={12} color={theme.accent} />
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            {/* Pagination dots */}
            <View style={styles.dotsRow}>
              {TESTIMONIALS.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeTestimonial ? styles.dotActive : null]}
                />
              ))}
            </View>
          </Animated.View>

          {/* ─── Question Selector ─── */}
          <View style={{ paddingHorizontal: 16 }}>
            <Animated.View entering={FadeInUp.delay(450).duration(600)}>
              <Text style={styles.sectionLabel}>HOW MANY QUESTIONS?</Text>
              <View style={styles.questionCards}>
                {[1, 2, 3].map((count) => {
                  const isSelected = selectedCount === count;
                  const price = count * APP_CONFIG.pricePerQuestion;
                  return (
                    <Pressable
                      key={count}
                      onPress={() => handleSelectCount(count)}
                      style={[styles.questionCard, isSelected && styles.questionCardSelected]}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={[theme.primaryDark, theme.primary]}
                          style={StyleSheet.absoluteFill}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                      ) : null}
                      <Text style={[styles.questionCount, isSelected && styles.questionCountSelected]}>
                        {count}
                      </Text>
                      <Text style={[styles.questionLabel, isSelected && styles.questionLabelSelected]}>
                        {count === 1 ? 'Question' : 'Questions'}
                      </Text>
                      <Text style={[styles.questionPrice, isSelected && styles.questionPriceSelected]}>
                        {APP_CONFIG.currency}{price}
                      </Text>
                      {isSelected ? (
                        <View style={styles.checkMark}>
                          <MaterialIcons name="check-circle" size={20} color={theme.accent} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            {/* Features */}
            <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.features}>
              {[
                { icon: 'schedule', text: 'Responses within 24 hours' },
                { icon: 'lock', text: 'Private & confidential' },
                { icon: 'verified', text: 'Readings by Valentina personally' },
                { icon: 'favorite', text: '31 years of trusted guidance' },
              ].map((item, i) => (
                <View key={i} style={styles.featureRow}>
                  <MaterialIcons name={item.icon as any} size={18} color={theme.accent} />
                  <Text style={styles.featureText}>{item.text}</Text>
                </View>
              ))}
            </Animated.View>

            {/* CTA */}
            <Animated.View entering={FadeInUp.delay(600).duration(600)}>
              <Pressable onPress={handleGetReading} style={styles.ctaButton}>
                <LinearGradient
                  colors={[theme.accent, theme.accentDark]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <MaterialIcons name="auto-awesome" size={22} color={theme.background} />
                <Text style={styles.ctaText}>Get My Reading — {APP_CONFIG.currency}{totalPrice}</Text>
              </Pressable>
            </Animated.View>

            {/* Disclaimer */}
            <Animated.View entering={FadeInUp.delay(700).duration(600)}>
              <Text style={styles.disclaimer}>
                For entertainment purposes. All readings are personal intuitive guidance.
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.success,
  },
  availText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.success,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  crystalBall: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  heroTitle: {
    ...theme.typography.heroTitle,
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    ...theme.typography.heroSubtitle,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  // ─── Stats ───
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.accent,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.border,
  },

  // ─── Bio ───
  bioSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  bioCard: {
    borderRadius: theme.radius.lg,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  bioIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  bioSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  bioText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
    marginBottom: 14,
  },
  bioTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bioTag: {
    backgroundColor: theme.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  bioTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primaryLight,
  },

  // ─── Testimonials ───
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  testimonialSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  testimonialScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  testimonialCard: {
    width: 300,
    borderRadius: theme.radius.lg,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: 'space-between',
    minHeight: 180,
  },
  quoteIcon: {
    marginBottom: 6,
  },
  testimonialText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 21,
    fontStyle: 'italic',
    flex: 1,
    marginBottom: 14,
  },
  testimonialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testimonialAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.primaryLight,
  },
  testimonialName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textPrimary,
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 28,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: theme.accent,
    borderRadius: 3,
  },

  // ─── Question Selector ───
  sectionLabel: {
    ...theme.typography.label,
    color: theme.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  questionCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  questionCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  questionCardSelected: {
    borderColor: theme.primary,
    ...theme.shadow.glow,
  },
  questionCount: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.textSecondary,
    marginBottom: 2,
  },
  questionCountSelected: {
    color: '#FFFFFF',
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textMuted,
    marginBottom: 6,
  },
  questionLabelSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  questionPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textMuted,
  },
  questionPriceSelected: {
    color: theme.accent,
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  features: {
    gap: 14,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: theme.radius.lg,
    gap: 10,
    overflow: 'hidden',
    marginBottom: 16,
    ...theme.shadow.gold,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.background,
  },
  disclaimer: {
    fontSize: 11,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
});
