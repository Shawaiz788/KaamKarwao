import { View, Text, Button } from 'react-native'
import React from 'react'
import { getAuth, signOut } from '@react-native-firebase/auth'; // Updated import

const HomeScreen = () => {
    const handleSignOut = async () => {
        try {
            const auth = getAuth();
            await signOut(auth); // Firebase modular sign out API
        } catch (error) {
            console.error('Sign out error: ', error);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 24 }}>HomeScreen</Text>

            <Text style={{ fontSize: 16 }}>Only Logged In users can see this</Text>
            <Button title='Sign Out' onPress={handleSignOut} />
        </View>
    )
}

export default HomeScreen;
