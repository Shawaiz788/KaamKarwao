/**
 * Centralized design token colors for KaamKarwao app.
 * Use these instead of hardcoded hex strings throughout components.
 */
export const Colors = {
  // Brand / Client palette
  brand: {
    dark: '#0B5A3E',       // Primary brand green (headers, buttons)
    medium: '#16A34A',     // Medium green (icons, active states)
    light: '#22C55E',      // Light green (accents, badges)
    amber: '#D97706',      // CTA button color (amber / gold)
  },

  // Professional app palette (dark theme)
  pro: {
    bg: '#0B1A12',         // Screen background (very dark green)
    header: '#0A1810',     // Header bar background
    card: '#132218',       // Card / drawer background
    cardBorder: '#1E3A2A', // Card border
    accent: '#22C55E',     // Online indicator / active green
    accentDim: '#16A34A',  // Less bright green for secondary actions
    liveChip: '#15803D',   // LIVE pill background
    offlineBg: '#374151',  // Offline toggle background
  },

  // Semantic
  success: '#16A34A',
  warning: '#D97706',
  error: '#EF4444',
  info: '#3B82F6',

  // Neutral grays
  neutral: {
    50:  '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;
