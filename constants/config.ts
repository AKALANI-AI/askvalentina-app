// Powered by OnSpace.AI
// ASK VALENTINA — App Configuration

export const APP_CONFIG = {
  name: 'ASK VALENTINA',
  tagline: 'Ask Valentina',
  description: 'Get answers to your most pressing questions from Valentina, an experienced psychic medium. Available 24/7.',

  // Pricing per question
  pricePerQuestion: 15,
  currency: '$',
  maxQuestions: 3,

  // Topic categories
  topicCategories: [
    { id: 'love', label: 'Love & Relationships', icon: 'favorite', color: '#EC4899' },
    { id: 'career', label: 'Career & Purpose', icon: 'work', color: '#3B82F6' },
    { id: 'family', label: 'Family & Home', icon: 'home', color: '#10B981' },
    { id: 'spiritual', label: 'Spiritual Growth', icon: 'auto-awesome', color: '#8B5CF6' },
    { id: 'health', label: 'Health & Wellness', icon: 'spa', color: '#F59E0B' },
    { id: 'deceased', label: 'Connect with Loved Ones', icon: 'nights-stay', color: '#A78BFA' },
    { id: 'general', label: 'General Guidance', icon: 'explore', color: '#6366F1' },
  ],

  // Reading statuses
  statuses: {
    pending: { label: 'Awaiting Reading', color: '#F59E0B', icon: 'schedule' },
    inProgress: { label: 'Reading In Progress', color: '#8B5CF6', icon: 'auto-awesome' },
    completed: { label: 'Reading Complete', color: '#10B981', icon: 'check-circle' },
  },

  // Available 24/7
  availability: '24/7',
};
