import { Slot, Redirect, useSegments } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';

export default function ProtectedLayout() {
    console.log('Protected layout');
    const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
    const { user, isLoaded: isUserLoaded } = useUser();
    const segments = useSegments();

    if (!isAuthLoaded || !isUserLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    if (!isSignedIn) {
        return <Redirect href='/' />;
    }

    const isProfileSetupScreen = segments.includes('profile-setup');

    if (!user?.unsafeMetadata?.profileComplete && !isProfileSetupScreen) {
        return <Redirect href='/profile-setup' />;
    }

    return <Slot />;
}