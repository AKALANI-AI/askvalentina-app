// Powered by OnSpace.AI
// ASK VALENTINA — Submit Questions Screen

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { uploadPhoto, uploadMultiplePhotos } from '@/services/storageService';
import { useAlert } from '@/template';

export default function SubmitScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ questionCount: string; totalPrice: string; pushToken: string }>();
  const questionCount = parseInt(params.questionCount || '1');
  const totalPrice = parseInt(params.totalPrice || '15');

  const [firstName, setFirstName] = useState('');
  const [lastInitial, setLastInitial] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questions, setQuestions] = useState<string[]>(Array(questionCount).fill(''));
  const [clientPhoto, setClientPhoto] = useState<string | null>(null);
  const [subjectPhotos, setSubjectPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const { showAlert } = useAlert();

  const updateQuestion = (index: number, text: string) => {
    const updated = [...questions];
    updated[index] = text;
    setQuestions(updated);
  };

  const pickImage = async (type: 'client' | 'subject') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'client') {
        setClientPhoto(result.assets[0].uri);
        setErrors((e) => ({ ...e, clientPhoto: '' }));
      } else {
        setSubjectPhotos((prev) => [...prev, result.assets[0].uri]);
      }
    }
  };

  const removeSubjectPhoto = (index: number) => {
    Haptics.selectionAsync();
    setSubjectPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeClientPhoto = () => {
    Haptics.selectionAsync();
    setClientPhoto(null);
  };

  const formatLastInitial = (text: string) => {
    const letter = text.replace(/[^a-zA-Z]/g, '').slice(0, 1).toUpperCase();
    return letter;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'Please enter your first name';
    if (!lastInitial.trim()) newErrors.lastInitial = 'Please enter your last initial';
    if (!phone.trim()) newErrors.phone = 'Please enter your phone number';
    if (!selectedTopic) newErrors.topic = 'Please select a topic';
    if (!clientPhoto) newErrors.clientPhoto = 'Please upload your photo';
    questions.forEach((q, i) => {
      if (!q.trim()) newErrors[`q${i}`] = `Please enter question ${i + 1}`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUploading(true);

    // Upload client photo to Supabase Storage
    let clientPhotoUrl = '';
    if (clientPhoto) {
      const { url, error } = await uploadPhoto(clientPhoto, 'client');
      if (error || !url) {
        showAlert('Upload Failed', 'Could not upload your photo. Please try again.');
        setUploading(false);
        return;
      }
      clientPhotoUrl = url;
    }

    // Upload subject photos to Supabase Storage
    let subjectPhotoUrls: string[] = [];
    if (subjectPhotos.length > 0) {
      const { urls, errors: uploadErrors } = await uploadMultiplePhotos(subjectPhotos, 'subject');
      subjectPhotoUrls = urls;
      if (uploadErrors.length > 0) {
        console.log('Some subject photos failed to upload:', uploadErrors);
      }
    }

    setUploading(false);

    const displayName = `${firstName.trim()} ${lastInitial.trim()}.`;
    router.push({
      pathname: '/payment',
      params: {
        name: displayName,
        phone,
        topic: selectedTopic,
        questions: JSON.stringify(questions),
        totalPrice: totalPrice.toString(),
        questionCount: questionCount.toString(),
        clientPhoto: clientPhotoUrl,
        subjectPhotos: JSON.stringify(subjectPhotoUrls),
        pushToken: params.pushToken || '',
      },
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color={theme.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Your Questions</Text>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{APP_CONFIG.currency}{totalPrice}</Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step indicator */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.stepRow}>
            <View style={styles.stepDotActive} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Step 1 of 2</Text>
          </Animated.View>

          {/* Name Row: First Name + Last Initial */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <View style={styles.nameRow}>
              <View style={{ flex: 3 }}>
                <TextInput
                  style={[styles.input, errors.firstName ? styles.inputError : null]}
                  placeholder="First name"
                  placeholderTextColor={theme.textMuted}
                  value={firstName}
                  onChangeText={(t) => { setFirstName(t); setErrors((e) => ({ ...e, firstName: '' })); }}
                  autoCapitalize="words"
                />
                {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.input, styles.initialInput, errors.lastInitial ? styles.inputError : null]}
                  placeholder="L"
                  placeholderTextColor={theme.textMuted}
                  value={lastInitial}
                  onChangeText={(t) => { setLastInitial(formatLastInitial(t)); setErrors((e) => ({ ...e, lastInitial: '' })); }}
                  maxLength={1}
                  autoCapitalize="characters"
                />
                {errors.lastInitial ? <Text style={styles.errorText}>{errors.lastInitial}</Text> : null}
              </View>
            </View>
            <Text style={styles.nameHint}>Last initial only for privacy</Text>
          </Animated.View>

          {/* Phone */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              placeholder="Your phone number for reading delivery"
              placeholderTextColor={theme.textMuted}
              value={phone}
              onChangeText={(t) => { setPhone(t); setErrors((e) => ({ ...e, phone: '' })); }}
              keyboardType="phone-pad"
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </Animated.View>

          {/* Your Photo */}
          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <Text style={styles.inputLabel}>Your Photo</Text>
            <Text style={styles.photoHint}>Upload a current photo of yourself</Text>
            {errors.clientPhoto ? <Text style={styles.errorText}>{errors.clientPhoto}</Text> : null}
            {clientPhoto ? (
              <View style={styles.photoPreviewRow}>
                <View style={styles.photoPreviewWrapper}>
                  <Image source={{ uri: clientPhoto }} style={styles.photoPreview} contentFit="cover" />
                  <Pressable onPress={removeClientPhoto} style={styles.photoRemoveBtn}>
                    <MaterialIcons name="close" size={14} color="#FFF" />
                  </Pressable>
                  <View style={styles.photoLabel}>
                    <Text style={styles.photoLabelText}>You</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Pressable onPress={() => pickImage('client')} style={[styles.photoUploadBtn, errors.clientPhoto ? styles.inputError : null]}>
                <MaterialIcons name="add-a-photo" size={28} color={theme.accent} />
                <Text style={styles.photoUploadText}>Tap to upload your photo</Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Subject Photos */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text style={styles.inputLabel}>Person of Interest Photos</Text>
            <Text style={styles.photoHint}>If your questions are about specific people, upload their photos (optional)</Text>
            <View style={styles.subjectPhotoGrid}>
              {subjectPhotos.map((uri, index) => (
                <View key={index} style={styles.photoPreviewWrapper}>
                  <Image source={{ uri }} style={styles.photoPreview} contentFit="cover" />
                  <Pressable onPress={() => removeSubjectPhoto(index)} style={styles.photoRemoveBtn}>
                    <MaterialIcons name="close" size={14} color="#FFF" />
                  </Pressable>
                  <View style={styles.photoLabel}>
                    <Text style={styles.photoLabelText}>Person {index + 1}</Text>
                  </View>
                </View>
              ))}
              {subjectPhotos.length < 5 && (
                <Pressable onPress={() => pickImage('subject')} style={styles.addSubjectBtn}>
                  <MaterialIcons name="person-add" size={24} color={theme.primaryLight} />
                  <Text style={styles.addSubjectText}>Add</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* Topic */}
          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <Text style={styles.inputLabel}>Topic Category</Text>
            {errors.topic ? <Text style={styles.errorText}>{errors.topic}</Text> : null}
            <View style={styles.topicGrid}>
              {APP_CONFIG.topicCategories.map((topic) => {
                const isSelected = selectedTopic === topic.id;
                return (
                  <Pressable
                    key={topic.id}
                    onPress={() => { Haptics.selectionAsync(); setSelectedTopic(topic.id); setErrors((e) => ({ ...e, topic: '' })); }}
                    style={[styles.topicChip, isSelected && { backgroundColor: topic.color + '30', borderColor: topic.color }]}
                  >
                    <MaterialIcons name={topic.icon as any} size={18} color={isSelected ? topic.color : theme.textMuted} />
                    <Text style={[styles.topicChipText, isSelected && { color: topic.color }]}>{topic.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Questions */}
          {questions.map((q, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(400 + i * 80).duration(400)}>
              <Text style={styles.inputLabel}>
                Question {i + 1} of {questionCount}
              </Text>
              <TextInput
                style={[styles.inputMultiline, errors[`q${i}`] ? styles.inputError : null]}
                placeholder="Type your question for Valentina..."
                placeholderTextColor={theme.textMuted}
                value={q}
                onChangeText={(t) => { updateQuestion(i, t); setErrors((e) => ({ ...e, [`q${i}`]: '' })); }}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {errors[`q${i}`] ? <Text style={styles.errorText}>{errors[`q${i}`]}</Text> : null}
            </Animated.View>
          ))}

          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={18} color={theme.primaryLight} />
            <Text style={styles.infoText}>Be specific with your questions for the most accurate reading. Photos help Valentina connect with the energy.</Text>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable onPress={handleContinue} disabled={uploading} style={[styles.ctaButton, uploading && { opacity: 0.6 }]}>
            {uploading ? (
              <Text style={styles.ctaText}>Uploading Photos...</Text>
            ) : (
              <>
                <Text style={styles.ctaText}>Continue to Payment</Text>
                <MaterialIcons name="arrow-forward" size={20} color={theme.background} />
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  closeBtn: {
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
  priceBadge: {
    backgroundColor: theme.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.accent,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  stepDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.accent,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: theme.border,
    maxWidth: 40,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.border,
  },
  stepText: {
    fontSize: 13,
    color: theme.textMuted,
    fontWeight: '500',
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  initialInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  nameHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.textPrimary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  inputMultiline: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.textPrimary,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 100,
  },
  inputError: {
    borderColor: theme.error,
  },
  errorText: {
    fontSize: 12,
    color: theme.error,
    marginTop: 4,
  },
  photoHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 10,
  },
  photoUploadBtn: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderStyle: 'dashed',
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoUploadText: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: '500',
  },
  photoPreviewRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoPreviewWrapper: {
    width: 90,
    height: 90,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  photoLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  subjectPhotoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  addSubjectBtn: {
    width: 90,
    height: 90,
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1.5,
    borderColor: theme.primaryDark + '50',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addSubjectText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primaryLight,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.surface,
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  topicChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textMuted,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: theme.primary + '15',
    borderRadius: theme.radius.md,
    padding: 14,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.primaryLight,
    lineHeight: 18,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.accent,
    gap: 8,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.background,
  },
});
