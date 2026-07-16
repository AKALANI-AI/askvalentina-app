// Powered by OnSpace.AI
// ASK VALENTINA — Reading Detail Screen

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { useApp } from '@/contexts/AppContext';
import { CountdownBadge } from '@/components/feature/CountdownBadge';
import { PhotoViewer } from '@/components/feature/PhotoViewer';

export default function ReadingDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getReading, refreshReadings } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState('');
  const [viewerLabel, setViewerLabel] = useState('');

  const reading = getReading(id || '');

  const openPhoto = (uri: string, label: string) => {
    setViewerUri(uri);
    setViewerLabel(label);
    setViewerVisible(true);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshReadings();
    setRefreshing(false);
  }, [refreshReadings]);

  if (!reading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.textSecondary }}>Reading not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const topicConfig = APP_CONFIG.topicCategories.find((t) => t.id === reading.topic) || APP_CONFIG.topicCategories[6];
  const statusConfig = APP_CONFIG.statuses[reading.status];

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Reading Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        {/* Status Banner */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.statusBanner, { backgroundColor: statusConfig.color + '15', borderColor: statusConfig.color + '40' }]}>
            <MaterialIcons name={statusConfig.icon as any} size={22} color={statusConfig.color} />
            <Text style={[styles.statusBannerText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </Animated.View>

        {/* Client Info Card */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.topicIconLarge, { backgroundColor: topicConfig.color + '20' }]}>
              <MaterialIcons name={topicConfig.icon as any} size={28} color={topicConfig.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{reading.client_name}</Text>
              <Text style={styles.topicName}>{topicConfig.label}</Text>
            </View>
            <View style={styles.amountBadge}>
              <Text style={styles.amountText}>{APP_CONFIG.currency}{reading.amount}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="schedule" size={14} color={theme.textMuted} />
            <Text style={styles.metaText}>Submitted {formatFullDate(reading.submitted_at)}</Text>
          </View>
          {reading.client_phone ? (
            <View style={styles.metaRow}>
              <MaterialIcons name="phone" size={14} color={theme.textMuted} />
              <Text style={styles.metaText}>{reading.client_phone}</Text>
            </View>
          ) : null}
          {reading.answered_at ? (
            <View style={styles.metaRow}>
              <MaterialIcons name="check-circle" size={14} color={theme.success} />
              <Text style={[styles.metaText, { color: theme.success }]}>Answered {formatFullDate(reading.answered_at)}</Text>
            </View>
          ) : null}
          {(reading.client_photo || (reading.subject_photos && reading.subject_photos.length > 0)) ? (
            <View style={styles.photosSection}>
              <Text style={styles.photosSectionTitle}>Uploaded Photos</Text>
              <View style={styles.photosRow}>
                {reading.client_photo ? (
                  <Pressable onPress={() => openPhoto(reading.client_photo!, reading.client_name)} style={styles.detailPhotoWrapper}>
                    <Image source={{ uri: reading.client_photo }} style={styles.detailPhoto} contentFit="cover" />
                    <View style={styles.detailPhotoLabel}>
                      <Text style={styles.detailPhotoLabelText}>Client</Text>
                    </View>
                  </Pressable>
                ) : null}
                {reading.subject_photos?.map((uri, idx) => (
                  <Pressable key={idx} onPress={() => openPhoto(uri, `Person ${idx + 1}`)} style={styles.detailPhotoWrapper}>
                    <Image source={{ uri }} style={styles.detailPhoto} contentFit="cover" />
                    <View style={styles.detailPhotoLabel}>
                      <Text style={styles.detailPhotoLabelText}>Person {idx + 1}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </Animated.View>

        {/* Questions & Answers */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Text style={styles.sectionTitle}>
            {reading.questions.length} {reading.questions.length === 1 ? 'Question' : 'Questions'}
          </Text>
        </Animated.View>

        {reading.questions.map((question, index) => {
          const answer = reading.answers[index];
          return (
            <Animated.View key={index} entering={FadeInDown.delay(300 + index * 100).duration(400)}>
              {/* Question bubble */}
              <View style={styles.questionBubble}>
                <View style={styles.bubbleHeader}>
                  <View style={styles.questionNumber}>
                    <Text style={styles.questionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.bubbleLabel}>Question</Text>
                </View>
                <Text style={styles.questionText}>{question}</Text>
              </View>

              {/* Answer bubble */}
              {answer ? (
                <View style={styles.answerBubble}>
                  <LinearGradient
                    colors={['rgba(139,92,246,0.1)', 'rgba(139,92,246,0.05)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={styles.bubbleHeader}>
                    <MaterialIcons name="auto-awesome" size={16} color={theme.primaryLight} />
                    <Text style={[styles.bubbleLabel, { color: theme.primaryLight }]}>Valentina's Answer</Text>
                  </View>
                  <Text style={styles.answerText}>{answer}</Text>
                </View>
              ) : (
                <View style={styles.pendingBubble}>
                  <MaterialIcons name="hourglass-top" size={18} color={theme.textMuted} />
                  <Text style={styles.pendingText}>Awaiting spiritual guidance...</Text>
                </View>
              )}
            </Animated.View>
          );
        })}

        {/* Countdown Timer */}
        {(reading.status === 'pending' || reading.status === 'inProgress') ? (
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <CountdownBadge submittedAt={reading.submitted_at} variant="full" />
          </Animated.View>
        ) : null}

        {/* Footer note */}
        {reading.status === 'pending' ? (
          <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.noteCard}>
            <MaterialIcons name="info-outline" size={18} color={theme.accent} />
            <Text style={styles.noteText}>Your reading is in the queue. You will receive your answers within the response window. We will notify you when your reading is ready.</Text>
          </Animated.View>
        ) : null}
      </ScrollView>

      <PhotoViewer
        visible={viewerVisible}
        imageUri={viewerUri}
        label={viewerLabel}
        onClose={() => setViewerVisible(false)}
      />
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  statusBannerText: {
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  topicIconLarge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  topicName: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  amountBadge: {
    backgroundColor: theme.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.accent,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: theme.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  questionBubble: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  questionNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.background,
  },
  bubbleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
    lineHeight: 24,
  },
  answerBubble: {
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.primaryDark + '40',
    overflow: 'hidden',
  },
  answerText: {
    fontSize: 15,
    color: theme.textPrimary,
    lineHeight: 24,
  },
  pendingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.surfaceLight,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 20,
  },
  pendingText: {
    fontSize: 14,
    color: theme.textMuted,
    fontStyle: 'italic',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: theme.accent + '10',
    borderRadius: theme.radius.md,
    padding: 14,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: theme.accent,
    lineHeight: 19,
  },
  photosSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  photosSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 10,
  },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailPhotoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  detailPhoto: {
    width: '100%',
    height: '100%',
  },
  detailPhotoLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  detailPhotoLabelText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFF',
  },
});
