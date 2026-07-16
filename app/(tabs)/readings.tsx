// Powered by OnSpace.AI
// ASK VALENTINA — My Readings Tab

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { useApp, Reading } from '@/contexts/AppContext';
import { CountdownBadge } from '@/components/feature/CountdownBadge';

type FilterType = 'all' | 'pending' | 'inProgress' | 'completed';

export default function ReadingsScreen() {
  const insets = useSafeAreaInsets();
  const { readings, loading, refreshReadings } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchFiltered = searchQuery.trim()
    ? readings.filter((r) => {
        const q = searchQuery.toLowerCase();
        const topicLabel = (APP_CONFIG.topicCategories.find((t) => t.id === r.topic)?.label || '').toLowerCase();
        return (
          r.client_name.toLowerCase().includes(q) ||
          topicLabel.includes(q) ||
          r.questions.some((question) => question.toLowerCase().includes(q))
        );
      })
    : readings;

  const filteredReadings = filter === 'all'
    ? searchFiltered
    : searchFiltered.filter((r) => r.status === filter);

  const handleFilter = (f: FilterType) => {
    Haptics.selectionAsync();
    setFilter(f);
  };

  const handleReading = (reading: Reading) => {
    Haptics.selectionAsync();
    router.push(`/reading/${reading.id}`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshReadings();
    setRefreshing(false);
  }, [refreshReadings]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTopicConfig = (topicId: string) => {
    return APP_CONFIG.topicCategories.find((t) => t.id === topicId) || APP_CONFIG.topicCategories[6];
  };

  const getStatusConfig = (status: Reading['status']) => {
    return APP_CONFIG.statuses[status];
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'inProgress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>My Readings</Text>
        <Text style={styles.headerCount}>{readings.length} total</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, topic, or question..."
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

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((f) => {
            const isActive = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => handleFilter(f.key)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{f.label}</Text>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        {filteredReadings.length === 0 ? (
          <View style={styles.emptyState}>
            <Image
              source={require('@/assets/images/empty-readings.png')}
              style={styles.emptyImage}
              contentFit="contain"
            />
            <Text style={styles.emptyTitle}>{loading ? 'Loading...' : 'No Readings Yet'}</Text>
            <Text style={styles.emptyText}>Your spiritual readings will appear here once you submit your questions.</Text>
            {!loading ? (
              <Pressable
                onPress={() => { router.navigate('/(tabs)'); }}
                style={styles.emptyButton}
              >
                <MaterialIcons name="auto-awesome" size={18} color={theme.background} />
                <Text style={styles.emptyButtonText}>Ask Valentina</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          filteredReadings.map((reading, index) => {
            const topicConfig = getTopicConfig(reading.topic);
            const statusConfig = getStatusConfig(reading.status);
            return (
              <Animated.View key={reading.id} entering={FadeInDown.delay(index * 80).duration(400)}>
                <Pressable
                  onPress={() => handleReading(reading)}
                  style={styles.readingCard}
                >
                  <View style={styles.readingTop}>
                    <View style={[styles.topicIcon, { backgroundColor: topicConfig.color + '20' }]}>
                      <MaterialIcons name={topicConfig.icon as any} size={22} color={topicConfig.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.readingName}>{reading.client_name}</Text>
                      <Text style={styles.readingTopic}>{topicConfig.label}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.readingTime}>{formatDate(reading.submitted_at)}</Text>
                      <Text style={styles.readingAmount}>{APP_CONFIG.currency}{reading.amount}</Text>
                    </View>
                  </View>
                  <Text style={styles.readingQuestion} numberOfLines={2}>
                    "{reading.questions[0]}"
                  </Text>
                  <View style={styles.readingBottom}>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                      <MaterialIcons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                    </View>
                    {(reading.status === 'pending' || reading.status === 'inProgress') ? (
                      <CountdownBadge submittedAt={reading.submitted_at} variant="compact" />
                    ) : (
                      <View style={styles.questionCountBadge}>
                        <Text style={styles.questionCountText}>{reading.questions.length} {reading.questions.length === 1 ? 'question' : 'questions'}</Text>
                      </View>
                    )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 4,
  },
  headerTitle: {
    ...theme.typography.sectionHeader,
    fontSize: 28,
  },
  headerCount: {
    ...theme.typography.caption,
  },
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
  filterContainer: {
    height: 48,
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
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
  readingCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  readingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  topicIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  readingTopic: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  readingTime: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 2,
  },
  readingAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.accent,
  },
  readingQuestion: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 12,
  },
  readingBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.surfaceLight,
  },
  questionCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyImage: {
    width: 200,
    height: 150,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.background,
  },
});
