// Powered by OnSpace.AI
// ASK VALENTINA — Admin Answer Screen

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { useAlert } from '@/template';
import { fetchReadingById } from '@/services/paymentService';
import { submitAnswers, updateReadingStatus } from '@/services/adminService';
import { Reading } from '@/contexts/AppContext';
import { PhotoViewer } from '@/components/feature/PhotoViewer';

export default function AdminAnswerScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { readingId } = useLocalSearchParams<{ readingId: string }>();

  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState('');
  const [viewerLabel, setViewerLabel] = useState('');

  const openPhoto = (uri: string, label: string) => {
    setViewerUri(uri);
    setViewerLabel(label);
    setViewerVisible(true);
  };

  const loadReading = useCallback(async () => {
    if (!readingId) return;
    const { data, error } = await fetchReadingById(readingId);
    if (data && !error) {
      setReading(data);
      // Initialize answers array from existing or empty
      const existingAnswers = data.answers || [];
      const questionCount = data.questions?.length || 0;
      const initialAnswers = Array(questionCount).fill('').map((_: string, i: number) => existingAnswers[i] || '');
      setAnswers(initialAnswers);
    }
    setLoading(false);
  }, [readingId]);

  useEffect(() => {
    loadReading();
  }, [loadReading]);

  const updateAnswer = (index: number, text: string) => {
    const updated = [...answers];
    updated[index] = text;
    setAnswers(updated);
  };

  const handleMarkInProgress = async () => {
    if (!reading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { data, error } = await updateReadingStatus(reading.id, 'inProgress');
    if (error) {
      showAlert('Error', error);
      return;
    }
    showAlert('Updated', 'Reading marked as in progress. Client has been notified.');
    setReading((prev) => prev ? { ...prev, status: 'inProgress' } : prev);
  };

  const handleSubmitAnswers = async () => {
    if (!reading) return;

    const unanswered = answers.findIndex((a) => !a.trim());
    if (unanswered >= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert('Missing Answer', `Please answer question ${unanswered + 1} before submitting.`);
      return;
    }

    showAlert('Submit Answers?', 'This will mark the reading as complete and notify the client.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        style: 'default',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setSubmitting(true);
          const { data, error } = await submitAnswers(reading.id, answers);
          setSubmitting(false);
          if (error) {
            showAlert('Error', error);
            return;
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showAlert('Answers Sent', 'The client has been notified that their reading is ready.');
          setReading((prev) => prev ? { ...prev, status: 'completed', answers } : prev);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Reading</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!reading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Reading</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.errorMsg}>Reading not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const topicConfig = APP_CONFIG.topicCategories.find((t) => t.id === reading.topic) || APP_CONFIG.topicCategories[6];
  const statusConfig = APP_CONFIG.statuses[reading.status];
  const isCompleted = reading.status === 'completed';

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isCompleted ? 'View Answers' : 'Answer Reading'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Client Info Card */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.clientCard}>
            <LinearGradient
              colors={theme.gradientCard}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.clientRow}>
              {reading.client_photo ? (
                <Pressable onPress={() => openPhoto(reading.client_photo!, reading.client_name)}>
                  <Image source={{ uri: reading.client_photo }} style={styles.clientAvatar} contentFit="cover" />
                </Pressable>
              ) : (
                <View style={styles.clientAvatarPlaceholder}>
                  <MaterialIcons name="person" size={28} color={theme.textMuted} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{reading.client_name}</Text>
                <Text style={styles.clientPhone}>{reading.client_phone}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amountText}>{APP_CONFIG.currency}{reading.amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
              </View>
            </View>

            {/* Topic */}
            <View style={[styles.topicRow, { backgroundColor: topicConfig.color + '15' }]}>
              <MaterialIcons name={topicConfig.icon as any} size={18} color={topicConfig.color} />
              <Text style={[styles.topicLabel, { color: topicConfig.color }]}>{topicConfig.label}</Text>
            </View>

            {/* Subject Photos */}
            {reading.subject_photos && reading.subject_photos.length > 0 ? (
              <View style={styles.subjectRow}>
                <Text style={styles.subjectLabel}>Person of Interest:</Text>
                <View style={styles.subjectPhotos}>
                  {reading.subject_photos.map((uri, i) => (
                    <Pressable key={i} onPress={() => openPhoto(uri, `Person ${i + 1}`)}>
                      <Image source={{ uri }} style={styles.subjectPhoto} contentFit="cover" />
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
          </Animated.View>

          {/* Mark In Progress */}
          {reading.status === 'pending' ? (
            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
              <Pressable onPress={handleMarkInProgress} style={styles.inProgressBtn}>
                <MaterialIcons name="hourglass-top" size={18} color={theme.primary} />
                <Text style={styles.inProgressText}>Mark as In Progress</Text>
              </Pressable>
            </Animated.View>
          ) : null}

          {/* Questions & Answers */}
          {reading.questions.map((question, qi) => (
            <Animated.View key={qi} entering={FadeInDown.delay(200 + qi * 80).duration(400)} style={styles.qaBlock}>
              {/* Question */}
              <View style={styles.questionBlock}>
                <View style={styles.qLabel}>
                  <Text style={styles.qLabelText}>Q{qi + 1}</Text>
                </View>
                <Text style={styles.questionText}>{question}</Text>
              </View>

              {/* Answer */}
              <View style={styles.answerBlock}>
                <View style={styles.aLabel}>
                  <MaterialIcons name="auto-awesome" size={14} color={theme.accent} />
                  <Text style={styles.aLabelText}>Your Answer</Text>
                </View>
                {isCompleted ? (
                  <View style={styles.answeredBox}>
                    <Text style={styles.answeredText}>{answers[qi] || 'No answer provided'}</Text>
                  </View>
                ) : (
                  <TextInput
                    style={styles.answerInput}
                    placeholder="Type your spiritual guidance here..."
                    placeholderTextColor={theme.textMuted}
                    value={answers[qi] || ''}
                    onChangeText={(t) => updateAnswer(qi, t)}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                )}
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Submit Button */}
        {!isCompleted ? (
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
            <Pressable
              onPress={handleSubmitAnswers}
              disabled={submitting}
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            >
              <LinearGradient
                colors={submitting ? [theme.surfaceLight, theme.surfaceLight] : [theme.success, '#059669']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              {submitting ? (
                <Text style={styles.submitText}>Sending...</Text>
              ) : (
                <>
                  <MaterialIcons name="send" size={20} color="#FFF" />
                  <Text style={styles.submitText}>Submit Answers and Notify Client</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>

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
  errorMsg: {
    fontSize: 16,
    color: theme.textMuted,
  },

  // Client Card
  clientCard: {
    borderRadius: theme.radius.lg,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  clientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  clientAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  clientPhone: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.accent,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  topicLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  subjectRow: {
    marginTop: 12,
  },
  subjectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 8,
  },
  subjectPhotos: {
    flexDirection: 'row',
    gap: 10,
  },
  subjectPhoto: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },

  // In Progress Button
  inProgressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary + '15',
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.primary + '30',
  },
  inProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },

  // Q&A Blocks
  qaBlock: {
    marginBottom: 20,
  },
  questionBlock: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  qLabel: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  qLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: theme.textPrimary,
    lineHeight: 22,
    fontWeight: '500',
  },
  answerBlock: {
    marginLeft: 40,
  },
  aLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  aLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.accent,
  },
  answerInput: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.textPrimary,
    borderWidth: 1.5,
    borderColor: theme.border,
    minHeight: 120,
    lineHeight: 22,
  },
  answeredBox: {
    backgroundColor: theme.success + '10',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.success + '30',
  },
  answeredText: {
    fontSize: 15,
    color: theme.textPrimary,
    lineHeight: 22,
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: theme.radius.lg,
    gap: 8,
    overflow: 'hidden',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
