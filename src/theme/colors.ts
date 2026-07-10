export const colors = {
  // Background
  background: '#F7F6F3',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#EFEDEA',

  // Accents
  primary: '#2A7A6F',
  primaryDark: '#1F5E56',
  primaryLight: '#E8F3F1',

  // Slate / Grey palette
  slate950: '#020617',
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  slate50: '#F8FAFC',

  // Status
  statusPending: '#D97706',
  statusPendingBg: '#FEF3C7',
  statusProcessing: '#2563EB',
  statusProcessingBg: '#DBEAFE',
  statusCompleted: '#2A7A6F',
  statusCompletedBg: '#E8F3F1',
  statusCancelled: '#DC2626',
  statusCancelledBg: '#FEE2E2',
  statusOutForDelivery: '#7C3AED',
  statusOutForDeliveryBg: '#EDE9FE',
  statusReady: '#0891B2',
  statusReadyBg: '#CFFAFE',

  // Utility
  border: '#E2E8F0',
  shadow: '#000000',
  white: '#FFFFFF',
  black: '#000000',
};

export type ColorType = keyof typeof colors;
