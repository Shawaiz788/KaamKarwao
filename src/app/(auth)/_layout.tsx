import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';

export default function AuthLayout() {
    console.log('Auth layout');
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    if (isSignedIn) {
        return <Redirect href={'/HomeScreen'} />;
    }

    return (
        <Stack>
            <Stack.Screen
                name='sign-in'
                options={{ headerShown: false, title: 'Sign in' }}
            />
            <Stack.Screen name='sign-up' options={{ headerShown: false, title: 'Sign up' }} />
            <Stack.Screen name='verify' options={{ headerShown: false, title: 'Verify' }} />
        </Stack>
    );
}