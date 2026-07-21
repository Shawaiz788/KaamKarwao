import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';

interface PhoneInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  autoFocus?: boolean;
}

export default function PhoneInputField<T extends FieldValues>({
  control,
  name,
  label = 'Phone Number',
  autoFocus = false,
}: PhoneInputFieldProps<T>) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          const isValid = /^[0-9]{10}$/.test(value || '');
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
                <Text style={styles.countryCode}>+92</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="3001234567"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  autoFocus={autoFocus}
                  value={value}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9]/g, '').slice(0, 10);
                    onChange(clean);
                  }}
                  onBlur={onBlur}
                />
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
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
    paddingRight: 10,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 1,
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
