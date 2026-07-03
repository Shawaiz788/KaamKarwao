import React from 'react';
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import CustomInput from '@/components/CustomInput';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router'; // Updated import to useRouter
import auth from '@react-native-firebase/auth'; // Updated import
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const signUpSchema = z
  .object({
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password should be at least 8 characters long'),
    confirmPassword: z.string({ message: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFields = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpFields>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const router = useRouter();

  const onSignUp = async (data: SignUpFields) => {
    try {
      // Create user using Firebase Auth
      await auth().createUserWithEmailAndPassword(data.email, data.password);

      // Redirect directly to profile setup
      router.replace('/profile-setup');
    } catch (err: any) {
      console.log('Sign up error: ', err);

      // Map Firebase error codes
      if (err.code === 'auth/email-already-in-use') {
        setError('email', { message: 'That email address is already in use' });
      } else if (err.code === 'auth/invalid-email') {
        setError('email', { message: 'Invalid email address' });
      } else if (err.code === 'auth/weak-password') {
        setError('password', { message: 'Password is too weak' });
      } else {
        setError('root', { message: err.message || 'An error occurred during sign up' });
      }
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header Area */}
          <View style={styles.headerContainer}>
            <View style={[styles.circleDeco, styles.circle1]} />
            <View style={[styles.circleDeco, styles.circle2]} />

            <View style={styles.headerTopRow}>
              <View style={styles.logoContainer}>
                <View style={styles.logoIconBg}>
                  <Ionicons name="checkmark-sharp" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.logoText}>HAAN</Text>
              </View>

              <Pressable style={styles.langSelector}>
                <Ionicons name="globe-outline" size={14} color="#FFFFFF" />
                <Text style={styles.langSelectorText}>اردو</Text>
              </Pressable>
            </View>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Create Account</Text>
              <Text style={styles.headerSubtitle}>Free to join. No credit card needed.</Text>
            </View>
          </View>

          {/* Form Content Area */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <CustomInput
                control={control}
                name="email"
                label="Email address"
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />

              <CustomInput
                control={control}
                name="password"
                label="Password"
                placeholder="••••••••"
                secureTextEntry
              />

              <CustomInput
                control={control}
                name="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••"
                secureTextEntry
              />

              {errors.root && (
                <Text style={styles.rootErrorText}>{errors.root.message}</Text>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed
                ]}
                onPress={handleSubmit(onSignUp)}
              >
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.redirectContainer}>
                <Text style={styles.redirectText}>Already have an account? </Text>
                <Link href="/sign-in" asChild>
                  <Pressable>
                    <Text style={styles.redirectLinkText}>Sign In</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
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
    backgroundColor: '#0B5A3E',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
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
    top: -100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -80,
    left: -30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  langSelectorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerTitleContainer: {
    marginTop: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  form: {
    gap: 20,
  },
  rootErrorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#D97706',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9CA3AF',
    fontSize: 14,
  },
  redirectContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  redirectText: {
    color: '#6B7280',
    fontSize: 14,
  },
  redirectLinkText: {
    color: '#0B5A3E',
    fontWeight: '700',
    fontSize: 14,
  },
});
