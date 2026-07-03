import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Pressable,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type City = 'Lahore' | 'Karachi' | 'Islamabad' | 'Rawalpindi';
type Role = 'client' | 'provider';

export default function ProfileSetupScreen() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Component States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<City>('Lahore');
  const [role, setRole] = useState<Role>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoToHAAN = async () => {
    if (!isLoaded || !user) return;

    // Form Validation
    if (!fullName.trim()) {
      setErrorMsg('Full name is required');
      return;
    }

    const sanitizedPhone = phone.replace(/[^0-9]/g, '');
    if (!sanitizedPhone) {
      setErrorMsg('Phone number is required');
      return;
    }

    if (sanitizedPhone.length < 9 || sanitizedPhone.length > 10) {
      setErrorMsg('Please enter a valid phone number (e.g., 3001234567)');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Split full name into firstName and lastName
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || ' ';

      // Update Clerk User profile and unsafeMetadata
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          phone: `+92${sanitizedPhone}`,
          city,
          role,
          profileComplete: true,
        },
      });

      console.log('Profile setup saved successfully!');
      // Route replacement will trigger re-evaluation of protected layout and load HomeScreen
      router.replace('/HomeScreen');
    } catch (err: any) {
      console.log('Error saving profile setup: ', err);
      setErrorMsg(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#072212" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={[styles.circleDeco, styles.circle1]} />
            <View style={[styles.circleDeco, styles.circle2]} />

            {/* Urdu Language Selector */}
            <Pressable style={styles.langSelector}>
              <Ionicons name="globe-outline" size={14} color="#FFFFFF" />
              <Text style={styles.langSelectorText}>اردو</Text>
            </Pressable>

            {/* Avatar Placeholder */}
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={28} color="#FFFFFF" />
            </View>

            <Text style={styles.headerTitle}>Set up your profile</Text>
            <Text style={styles.headerSubtitle}>Tell us a bit about yourself to get started</Text>

            {/* Progress Step Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarActive} />
                <View style={styles.progressBarActive} />
                <View style={styles.progressBarActive} />
              </View>
              <Text style={styles.progressText}>Step 3 of 3 — Almost done!</Text>
            </View>
          </View>

          {/* Form Body Container */}
          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full name</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Ahmad Ali"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
              />
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputGroup}>
              <View style={styles.phoneLabelRow}>
                <Text style={styles.inputLabel}>Phone number (required)</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredBadgeText}>Required</Text>
                </View>
              </View>

              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>PK +92</Text>
                </View>
                <TextInput
                  style={styles.phoneTextInput}
                  value={phone}
                  onChangeText={(text) => {
                    const numeric = text.replace(/[^0-9]/g, '');
                    setPhone(numeric);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="3XX-XXXXXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <Text style={styles.phoneHint}>
                +92 {phone ? phone : '3XX-XXXXXXX'}
              </Text>
            </View>

            {/* City Selection Pills */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your city</Text>
              <View style={styles.cityPillGrid}>
                {(['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi'] as City[]).map((c) => {
                  const isSelected = city === c;
                  return (
                    <Pressable
                      key={c}
                      style={[
                        styles.cityPill,
                        isSelected && styles.cityPillSelected
                      ]}
                      onPress={() => setCity(c)}
                    >
                      <Text
                        style={[
                          styles.cityPillText,
                          isSelected && styles.cityPillTextSelected
                        ]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Role Radio Card Buttons */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>I want to...</Text>

              {/* Find & Hire Services Card */}
              <Pressable
                style={[
                  styles.roleCard,
                  role === 'client' && styles.roleCardSelected
                ]}
                onPress={() => setRole('client')}
              >
                <View style={styles.roleCardContent}>
                  <Text style={styles.roleIcon}>🏠</Text>
                  <Text style={styles.roleCardText}>Find & hire services</Text>
                </View>
                {role === 'client' && (
                  <Ionicons name="checkmark-sharp" size={20} color="#16A34A" />
                )}
              </Pressable>

              {/* Provide Services & Earn Card */}
              <Pressable
                style={[
                  styles.roleCard,
                  role === 'provider' && styles.roleCardSelected
                ]}
                onPress={() => setRole('provider')}
              >
                <View style={styles.roleCardContent}>
                  <Text style={styles.roleIcon}>🔨</Text>
                  <Text style={styles.roleCardText}>Provide services & earn</Text>
                </View>
                {role === 'provider' && (
                  <Ionicons name="checkmark-sharp" size={20} color="#16A34A" />
                )}
              </Pressable>
            </View>

            {/* Error Message */}
            {errorMsg && (
              <Text style={styles.errorText}>{errorMsg}</Text>
            )}

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                isLoading && styles.primaryButtonDisabled
              ]}
              onPress={handleGoToHAAN}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Go to HAAN 🥳</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#072212',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  circleDeco: {
    position: 'absolute',
    borderRadius: 200,
    backgroundColor: 'rgba(28, 163, 80, 0.08)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -40,
    right: -40,
  },
  circle2: {
    width: 140,
    height: 140,
    bottom: -60,
    left: -20,
  },
  langSelector: {
    position: 'absolute',
    right: 20,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    zIndex: 2,
  },
  langSelectorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  avatarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    zIndex: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 20,
    zIndex: 2,
  },
  progressContainer: {
    zIndex: 2,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  progressBarActive: {
    width: '32%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  phoneLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requiredBadge: {
    backgroundColor: '#FFF0EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  requiredBadgeText: {
    color: '#FF6633',
    fontSize: 10,
    fontWeight: '700',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBadge: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  countryCodeText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  phoneTextInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  phoneHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    fontWeight: '500',
  },
  cityPillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  cityPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityPillSelected: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  cityPillText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  cityPillTextSelected: {
    color: '#FFFFFF',
  },
  roleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  roleCardSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  roleCardText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: '#16A34A',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: '#A7F3D0',
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
