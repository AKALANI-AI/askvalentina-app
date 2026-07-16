// Powered by OnSpace.AI
// ASK VALENTINA — Admin Dashboard Tab

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, RefreshControl, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { useAdmin } from '@/contexts/AdminContext';
import { fetchAllReadings } from '@/services/adminService';
import { Reading } from '@/contexts/AppContext';

type AdminFilter = 'all' | 'pending' | 'inProgress' | 'completed';

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { isAdmin, adminLoading, loginAdmin, logoutAdmin } = useAdmin();

  if (adminLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return <AdminLogin onLogin={loginAdmin} />;
  }

  return <AdminDashboard onLogout={logoutAdmin} />;
}

// ─── Admin Login ───────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: (pin: string) => boolean }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleLogin = () => {
    if (!pin.trim()) {
      setError('Please enter your PIN');
      return;
    }
    const success = onLogin(pin);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Incorrect PIN');
      setShaking(true);
      setPin('');
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.loginContainer}>
          <Animated.View entering={FadeIn.duration(600)} style={styles.loginCard}>
            <LinearGradient
              colors={theme.gradientCard}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.lockIcon}>
              <MaterialIcons name="admin-panel-settings" size={48} color={theme.primary} />
            </View>
            <Text style={styles.loginTitle}>Valentina Portal</Text>
            <Text style={styles.loginSubtitle}>Enter your admin PIN to access the dashboard</Text>

            <TextInput
              style={[styles.pinInput, error ? styles.pinInputError : null]}
              placeholder="Enter PIN"
              placeholderTextColor={theme.textMuted}
              value={pin}
              onChangeText={(t) => { setPin(t); setError(''); }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={8}
              autoFocus
            />
            {error ? (
              <View style={styles.errorRow}>
                <MaterialIcons name="error-outline" size={14} color={theme.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable onPress={handleLogin} style={styles.loginButton}>
              <LinearGradient
                colors={[theme.primary, theme.primaryDark]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <MaterialIcons name="lock-open" size={20} color="#FFF" />
              <Text style={styles.loginButtonText}>Unlock Dashboard</Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Admin Dashboard ───────────────────────────────────────

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const insets = useSafeAreaInsets();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<AdminFilter>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReadings = useCallback(async () => {
    const { data, error } = await fetchAllReadings();
    if (data && !error) {
      setReadings(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReadings();
    setRefreshing(false);
  }, [loadReadings]);

  const searchFiltered = searchQuery.trim()
    ? readings.filter((r) => {
        const q = searchQuery.toLowerCase();
        const topicLabel = (APP_CONFIG.topicCategories.find((t) => t.id === r.topic)?.label || '').toLowerCase();
        return (
          r.client_name.toLowerCase().includes(q) ||
          topicLabel.includes(q) ||
          r.client_phone.toLowerCase().includes(q) ||
          r.questions.some((question) => question.toLowerCase().includes(q))
        );
      })
    : readings;

  const filteredReadings = filter === 'all'
    ? searchFiltered
    : searchFiltered.filter((r) => r.status === filter);

  const pendingCount = readings.filter((r) => r.status === 'pending').length;
  const inProgressCount = readings.filter((r) => r.status === 'inProgress').length;
  const completedCount = readings.filter((r) => r.status === 'completed').length;

  const getTopicConfig = (topicId: string) =>
    APP_CONFIG.topicCategories.find((t) => t.id === topicId) || APP_CONFIG.topicCategories[6];

  const getStatusConfig = (status: Reading['status']) => APP_CONFIG.statuses[status];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const handleReading = (reading: Reading) => {
    Haptics.selectionAsync();
    router.push({ pathname: '/admin-answer', params: { readingId: reading.id } });
  };

  const filters: { key: AdminFilter; label: string; count: number }[] = [
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'inProgress', label: 'In Progress', count: inProgressCount },
    { key: 'completed', label: 'Done', count: completedCount },
    { key: 'all', label: 'All', count: readings.length },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.dashHeader}>
        <View>
          <Text style={styles.dashTitle}>Admin Dashboard</Text>
          <Text style={styles.dashSubtitle}>{pendingCount} readings awaiting your answers</Text>
        </View>
        <Pressable onPress={onLogout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color={theme.error} />
        </Pressable>
      </View>

      {/* Stats Row */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: theme.warning + '40' }]}>
          <Text style={[styles.statNum, { color: theme.warning }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { borderColor: theme.primary + '40' }]}>
          <Text style={[styles.statNum, { color: theme.primary }]}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={[styles.statCard, { borderColor: theme.success + '40' }]}>
          <Text style={[styles.statNum, { color: theme.success }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, topic, or question..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={18} color={theme.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((f) => {
            const isActive = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => { Haptics.selectionAsync(); setFilter(f.key); }}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {f.label} ({f.count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Readings List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />
        }
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : filteredReadings.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={64} color={theme.textMuted} />
            <Text style={styles.emptyTitle}>No readings here</Text>
            <Text style={styles.emptyText}>Pull down to refresh</Text>
          </View>
        ) : (
          filteredReadings.map((reading, index) => {
            const topicConfig = getTopicConfig(reading.topic);
            const statusConfig = getStatusConfig(reading.status);
            const isPending = reading.status === 'pending';

            return (
              <Animated.View key={reading.id} entering={FadeInDown.delay(index * 60).duration(400)}>
                <Pressable onPress={() => handleReading(reading)} style={[styles.adminCard, isPending && styles.adminCardUrgent]}>
                  {/* Top Row */}
                  <View style={styles.adminCardTop}>
                    <View style={[styles.topicBadge, { backgroundColor: topicConfig.color + '20' }]}>
                      <MaterialIcons name={topicConfig.icon as any} size={18} color={topicConfig.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.clientName}>{reading.client_name}</Text>
                      <Text style={styles.clientPhone}>{reading.client_phone}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={[styles.statusPill, { backgroundColor: statusConfig.color + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                        <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                      </View>
                      <Text style={styles.cardDate}>{formatDate(reading.submitted_at)}</Text>
                    </View>
                  </View>

                  {/* Questions Preview */}
                  <View style={styles.questionsPreview}>
                    {reading.questions.slice(0, 2).map((q, qi) => (
                      <Text key={qi} style={styles.questionPreviewText} numberOfLines={1}>
                        Q{qi + 1}: {q}
                      </Text>
                    ))}
                    {reading.questions.length > 2 ? (
                      <Text style={styles.moreText}>+{reading.questions.length - 2} more</Text>
                    ) : null}
                  </View>

                  {/* Photos Row */}
                  {(reading.client_photo || (reading.subject_photos && reading.subject_photos.length > 0)) ? (
                    <View style={styles.photosRow}>
                      {reading.client_photo ? (
                        <Image source={{ uri: reading.client_photo }} style={styles.miniPhoto} contentFit="cover" />
                      ) : null}
                      {reading.subject_photos?.map((uri, pi) => (
                        <Image key={pi} source={{ uri }} style={styles.miniPhoto} contentFit="cover" />
                      ))}
                    </View>
                  ) : null}

                  {/* Action Row */}
                  <View style={styles.actionRow}>
                    <Text style={styles.amountText}>{APP_CONFIG.currency}{reading.amount}</Text>
                    <View style={styles.answerCta}>
                      <Text style={styles.answerCtaText}>
                        {reading.status === 'completed' ? 'View Answers' : 'Answer Now'}
                      </Text>
                      <MaterialIcons name="arrow-forward" size={16} color={reading.status === 'completed' ? theme.success : theme.accent} />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },

  // Login
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loginCard: {
    width: '100%',
    borderRadius: theme.radius.xl,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  lockIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  pinInput: {
    width: '100%',
    backgroundColor: theme.background,
    borderRadius: theme.radius.md,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1.5,
    borderColor: theme.border,
    marginBottom: 12,
  },
  pinInputError: {
    borderColor: theme.error,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: theme.error,
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    borderRadius: theme.radius.lg,
    gap: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Dashboard Header
  dashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  dashTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  dashSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: theme.radius.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNum: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textMuted,
    marginTop: 2,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.textPrimary,
    paddingVertical: 0,
  },

  // Filters
  filterBar: {
    height: 48,
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Admin Cards
  adminCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  adminCardUrgent: {
    borderColor: theme.warning + '50',
    borderLeftWidth: 3,
    borderLeftColor: theme.warning,
  },
  adminCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  topicBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  clientPhone: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardDate: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 4,
  },

  // Questions Preview
  questionsPreview: {
    backgroundColor: theme.background,
    borderRadius: theme.radius.sm,
    padding: 10,
    marginBottom: 10,
    gap: 4,
  },
  questionPreviewText: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  moreText: {
    fontSize: 12,
    color: theme.textMuted,
    fontStyle: 'italic',
  },

  // Photos
  photosRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  miniPhoto: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.accent,
  },
  answerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answerCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.accent,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textMuted,
  },
});
