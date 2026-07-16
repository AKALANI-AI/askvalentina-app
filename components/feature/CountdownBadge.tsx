// Powered by OnSpace.AI
// ASK VALENTINA — Countdown Timer Badge Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useCountdown } from '@/hooks/useCountdown';

interface CountdownBadgeProps {
  submittedAt: string;
  variant?: 'compact' | 'full';
}

export function CountdownBadge({ submittedAt, variant = 'compact' }: CountdownBadgeProps) {
  const { hours, minutes, seconds, isExpired, label, progress } = useCountdown(submittedAt);

  const urgencyColor = isExpired
    ? theme.error
    : progress < 0.15
    ? theme.error
    : progress < 0.35
    ? '#F59E0B'
    : theme.accent;

  if (variant === 'full') {
    return (
      <View style={[styles.fullContainer, { borderColor: urgencyColor + '40' }]}>
        <View style={styles.fullHeader}>
          <MaterialIcons
            name={isExpired ? 'timer-off' : 'timer'}
            size={20}
            color={urgencyColor}
          />
          <Text style={[styles.fullTitle, { color: urgencyColor }]}>
            {isExpired ? 'Response Window Closed' : 'Response Window'}
          </Text>
        </View>

        {!isExpired ? (
          <>
            <View style={styles.digitsRow}>
              <View style={styles.digitBlock}>
                <Text style={[styles.digitValue, { color: urgencyColor }]}>
                  {String(hours).padStart(2, '0')}
                </Text>
                <Text style={styles.digitLabel}>Hours</Text>
              </View>
              <Text style={[styles.digitSep, { color: urgencyColor }]}>:</Text>
              <View style={styles.digitBlock}>
                <Text style={[styles.digitValue, { color: urgencyColor }]}>
                  {String(minutes).padStart(2, '0')}
                </Text>
                <Text style={styles.digitLabel}>Min</Text>
              </View>
              <Text style={[styles.digitSep, { color: urgencyColor }]}>:</Text>
              <View style={styles.digitBlock}>
                <Text style={[styles.digitValue, { color: urgencyColor }]}>
                  {String(seconds).padStart(2, '0')}
                </Text>
                <Text style={styles.digitLabel}>Sec</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(1, progress * 100)}%`,
                    backgroundColor: urgencyColor,
                  },
                ]}
              />
            </View>
          </>
        ) : (
          <Text style={styles.expiredText}>
            The 24-hour window has elapsed. Your reading will still be delivered.
          </Text>
        )}
      </View>
    );
  }

  // Compact variant for list cards
  return (
    <View style={[styles.compactContainer, { backgroundColor: urgencyColor + '15' }]}>
      <MaterialIcons
        name={isExpired ? 'timer-off' : 'timer'}
        size={13}
        color={urgencyColor}
      />
      <Text style={[styles.compactText, { color: urgencyColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Full
  fullContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  fullTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  digitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },
  digitBlock: {
    alignItems: 'center',
    minWidth: 52,
  },
  digitValue: {
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  digitLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8EA0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  digitSep: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  expiredText: {
    fontSize: 13,
    color: '#8E8EA0',
    lineHeight: 19,
    textAlign: 'center',
  },
});
