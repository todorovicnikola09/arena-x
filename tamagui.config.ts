import { createTamagui } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config';

// ArenaX brand accent — used sparingly (buttons, active states, chips)
const arenaxTokens = {
  ...defaultConfig.tokens,
  color: {
    ...defaultConfig.tokens.color,
    arenaxPrimary: '#6C5CE7',
    arenaxPrimaryDark: '#4834D4',
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