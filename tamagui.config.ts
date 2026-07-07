import { createTamagui } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config';

const arenaxTokens = {
  ...defaultConfig.tokens,
  color: {
    ...defaultConfig.tokens.color,
    arenaxPrimary: '#8B5CF6',
    arenaxPrimaryDark: '#4834D4',
    arenaxBlue: '#4F6BFF',

    bg: '#0B0714',
    bgElevated: '#161022',
    bgCard: '#150F20',
    cardBorder: 'rgba(139,92,246,0.18)',

    textPrimary: '#FFFFFF',
    textDim: '#9CA3AF',

    statusLive: '#FF4757',
    statusOpen: '#2ECC71',
    statusClosed: '#F39C12',
    statusFinished: '#7F8C8D',
    statusPending: '#F1C40F',
    statusAccepted: '#27AE60',
    statusRejected: '#E74C3C',
  },
};

const config = createTamagui({
  ...defaultConfig,
  tokens: arenaxTokens,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;