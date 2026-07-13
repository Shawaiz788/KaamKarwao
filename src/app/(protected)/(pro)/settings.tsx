import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export default function ProSettingsRoute() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Settings — Coming Soon</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.pro.bg, justifyContent: 'center', alignItems: 'center' },
    text: { color: Colors.white, fontSize: 16 },
});
