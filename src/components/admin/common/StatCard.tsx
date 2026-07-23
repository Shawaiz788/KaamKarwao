import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: string | number;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  subValue?: string;
}

export default function StatCard({
  label,
  value,
  iconName,
  accentColor = '#0B5A3E',
  subValue,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <View style={[styles.iconBox, { backgroundColor: `${accentColor}15` }]}>
          <Ionicons name={iconName} size={18} color={accentColor} />
        </View>
      </View>

      <Text style={styles.value}>{value}</Text>

      {subValue ? (
        <Text style={[styles.subValue, { color: accentColor }]}>{subValue}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  subValue: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
