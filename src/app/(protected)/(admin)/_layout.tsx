import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/context/auth';
import { View, ActivityIndicator } from 'react-native';
import { USER_TYPE_ADMIN, USER_TYPE_PRO } from '@/constants/userTypes';

/**
 * Admin route group layout.
 * Guards: must be logged in AND usertype_id === USER_TYPE_ADMIN (1).
 */
export default function AdminLayout() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  // Not logged in
  if (!user) return <Redirect href="/" />;

  // Profile incomplete
  if (!user.displayName) return <Redirect href="/(protected)/profile-setup" />;

  // Worker -> Redirect to Pro Dashboard
  if (user.usertype_id === USER_TYPE_PRO) return <Redirect href="/(protected)/(pro)/dashboard" />;

  // Customer -> Redirect to Client Home
  if (user.usertype_id !== USER_TYPE_ADMIN) return <Redirect href="/(protected)/(client)/home" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
