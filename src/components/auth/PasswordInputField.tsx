import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';

interface PasswordInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  watchPassword?: string;
}

export default function PasswordInputField<T extends FieldValues>({
  control,
  name,
  label = 'Password',
  placeholder = '••••••••',
  watchPassword,
}: PasswordInputFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          const isValid =
            (value || '').length >= 6 &&
            /[A-Z]/.test(value || '') &&
            /[a-zA-Z]/.test(value || '') &&
            /[^a-zA-Z0-9]/.test(value || '') &&
            (watchPassword === undefined || value === watchPassword);
          return (
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputFieldContainer,
                  {
                    borderColor: error ? '#EF4444' : isValid ? '#16A34A' : '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                  },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.passwordInput}
                  placeholder={placeholder}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 4, marginRight: 4 }}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#6B7280" />
                </Pressable>
                <View style={styles.indicatorContainer}>
                  {isValid ? (
                    <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  ) : (
                    <View style={styles.dotIndicator} />
                  )}
                </View>
              </View>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    gap: 8,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 8,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  indicatorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
});
