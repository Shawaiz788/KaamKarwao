import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  subValue?: string;
}

export default function AdminStatCard({
  label,
  value,
  iconName,
  accentColor,
  subValue,
}: AdminStatCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.iconBox, { backgroundColor: `${accentColor}18` }]}>
          <Ionicons name={iconName} size={20} color={accentColor} />
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subValue ? <Text style={styles.subValue}>{subValue}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  subValue: {
    fontSize: 11,
    color: '#0B5A3E',
    fontWeight: '600',
  },
});
