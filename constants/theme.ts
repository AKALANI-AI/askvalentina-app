// Powered by OnSpace.AI
// ASK VALENTINA — Psychic Medium Readings Theme
// Emotional: Q2 (Calm + Serious) with mystical warmth
// Color: Custom system — Deep cosmic purples with golden accents

export const theme = {
  // Primary palette
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',

  // Accent — celestial gold
  accent: '#F5C542',
  accentLight: '#FBBF24',
  accentDark: '#D4A017',

  // Backgrounds
  background: '#0D0B1A',
  backgroundSecondary: '#151228',
  surface: '#1E1A35',
  surfaceLight: '#2A2545',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#6B6B8D',

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Borders
  border: '#2A2545',
  borderLight: '#3D3760',

  // Gradients
  gradientPrimary: ['#7C3AED', '#4C1D95'] as const,
  gradientAccent: ['#F5C542', '#D4A017'] as const,
  gradientCosmic: ['#0D0B1A', '#1E1048', '#0D0B1A'] as const,
  gradientCard: ['#1E1A35', '#2A2545'] as const,

  // Typography
  typography: {
    heroTitle: { fontSize: 36, fontWeight: '700' as const, color: '#FFFFFF', letterSpacing: -0.5 },
    heroSubtitle: { fontSize: 16, fontWeight: '400' as const, color: '#A0A0C0', lineHeight: 24 },
    sectionHeader: { fontSize: 20, fontWeight: '700' as const, color: '#FFFFFF' },
    cardTitle: { fontSize: 16, fontWeight: '600' as const, color: '#FFFFFF' },
    cardValue: { fontSize: 24, fontWeight: '700' as const, color: '#F5C542' },
    body: { fontSize: 15, fontWeight: '400' as const, color: '#A0A0C0', lineHeight: 22 },
    caption: { fontSize: 13, fontWeight: '400' as const, color: '#6B6B8D' },
    label: { fontSize: 12, fontWeight: '600' as const, color: '#A0A0C0', textTransform: 'uppercase' as const, letterSpacing: 1 },
    button: { fontSize: 16, fontWeight: '700' as const, color: '#FFFFFF' },
    price: { fontSize: 32, fontWeight: '700' as const, color: '#F5C542' },
    questionCount: { fontSize: 48, fontWeight: '700' as const, color: '#FFFFFF' },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  // Radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Shadows
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    glow: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    gold: {
      shadowColor: '#F5C542',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};
