import React from 'react';
import ProfileView from '../../../components/home/ProfileView';
import { useAuth } from '../../../provider/auth';
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
      userName={user?.displayName || 'ShawaizAli'}
      userEmail={user?.email || 'shawaiz@example.com'}
      userAvatar={user?.profile_pic}
      onSignOut={handleSignOut}
    />
  );
}
