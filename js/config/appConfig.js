export const APP_CONFIG = {
    version: '2.0.0',
    currentUser: 'leomart-wd',
    lastUpdate: '2025-08-29 12:49:17',
    defaultTheme: 'light',
    apiEndpoint: '/api/v2',
    features: {
        offline: true,
        voiceRecording: true,
        gamification: true,
        socialFeatures: true
    }
};

export const THEME_COLORS = {
    light: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        background: '#f8f9fa',
        text: '#212529'
    },
    dark: {
        primary: '#0056b3',
        secondary: '#495057',
        success: '#1e7e34',
        background: '#343a40',
        text: '#f8f9fa'
    }
};

export const LEARNING_PATHS = {
    beginner: {
        soprano: ['breath-basics', 'pitch-control', 'resonance-101'],
        baritone: ['breath-support', 'lower-register', 'resonance-basics']
    },
    advanced: {
        soprano: ['advanced-resonance', 'coloratura', 'dynamics-master'],
        baritone: ['advanced-support', 'dramatic-expression', 'register-blend']
    }
};