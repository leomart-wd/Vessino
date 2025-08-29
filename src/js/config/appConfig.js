export const APP_CONFIG = {
  version: '1.0.0',
  buildTimestamp: '2025-08-29 13:10:44',
  api: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://api.vessiamoci.com/v1'
      : 'http://localhost:3000/api/v1',
    timeout: 10000
  },
  auth: {
    tokenRefreshInterval: 45 * 60 * 1000, // 45 minutes
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
  },
  features: {
    analytics: true,
    gamification: true,
    offline: true
  },
  audio: {
    sampleRate: 48000,
    channels: 1,
    encoding: 'opus',
    bufferSize: 4096
  },
  storage: {
    prefix: 'vessiamoci_',
    version: 1
  },
  ui: {
    theme: {
      light: {
        primary: '#4F46E5',
        secondary: '#818CF8',
        accent: '#F59E0B'
      },
      dark: {
        primary: '#6366F1',
        secondary: '#A5B4FC',
        accent: '#FBBF24'
      }
    },
    animations: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};