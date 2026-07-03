import { Slot, Redirect } from 'expo-router';
import { useAuth } from '../../provider/auth';
import { View, ActivityIndicator } from 'react-native';

export default function ProtectedLayout() {
    const { user, initializing } = useAuth();

    if (initializing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href='/' />;
    }

    // Replace user?.unsafeMetadata check with your database-fetched metadata
    // for profile setup (see Step 5)

    return <Slot />;
}
