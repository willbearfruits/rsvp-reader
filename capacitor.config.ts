import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.seriousshit.rsvpreader',
    appName: 'RSVP Reader',
    webDir: 'www',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 0
        }
    }
};

export default config;
