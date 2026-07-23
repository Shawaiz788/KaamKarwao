import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string | number;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalized = String(status).toLowerCase();

  let bgColor = '#EFF6FF';
  let textColor = '#2563EB';

  if (normalized === '1' || normalized === 'open' || normalized === 'active') {
    bgColor = '#ECFDF5';
    textColor = '#0B5A3E';
  } else if (normalized === '2' || normalized === 'in_progress' || normalized === 'bidding') {
    bgColor = '#FEF3C7';
    textColor = '#D97706';
  } else if (normalized === '3' || normalized === 'completed') {
    bgColor = '#E0E7FF';
    textColor = '#4338CA';
  } else if (normalized === '4' || normalized === 'cancelled' || normalized === 'suspended') {
    bgColor = '#FEE2E2';
    textColor = '#EF4444';
  }

  const displayText = label || (
    normalized === '1' ? 'OPEN' :
    normalized === '2' ? 'IN PROGRESS' :
    normalized === '3' ? 'COMPLETED' :
    normalized === '4' ? 'CANCELLED' :
    String(status).toUpperCase()
  );

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
