import React, { useCallback } from 'react';
import CustomButton from './CustomButton';

export const useWarmUpBrowser = () => {
    // Stub for warming up native browser
    return null;
};

export default function SignInWith() {
    const onPress = useCallback(() => {
        console.log('Google Sign-In pressed. Connect to @react-native-google-signin/google-signin for Firebase integration.');
    }, []);

    return <CustomButton text='Sign in with Google' onPress={onPress} />;
}