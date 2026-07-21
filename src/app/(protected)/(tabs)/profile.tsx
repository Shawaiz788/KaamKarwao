import React from 'react';
import ProfileView from '@/pages/client/ProfileView';
import { useAuth } from '@/context/auth';
import { Alert } from 'react-native';

export default function ProfileRoute() {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out error: ', error);
      Alert.alert('Sign Out Error', 'Unable to sign out. Please try again.');
    }
  };

  return (
    <ProfileView
      userName={user?.displayName || 'John Doe'}
      userEmail={user?.email || 'email@example.com'}
      userAvatar={user?.profile_pic}
      onSignOut={handleSignOut}
    />
  );
}
