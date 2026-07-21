import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthHeaderProps {
  topInset: number;
  title: string;
  subtitle: string;
}

export default function AuthHeader({ topInset, title, subtitle }: AuthHeaderProps) {
  return (
    <View style={[styles.headerContainer, { paddingTop: topInset + 20 }]}>
      <View style={[styles.circleDeco, styles.circle1]} />
      <View style={[styles.circleDeco, styles.circle2]} />

      <View style={styles.headerTopRow}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIconBg}>
            <Ionicons name="checkmark-sharp" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>KaamKarwao</Text>
        </View>

        <Pressable style={styles.langSelector}>
          <Ionicons name="globe-outline" size={14} color="#FFFFFF" />
          <Text style={styles.langSelectorText}>اردو</Text>
        </Pressable>
      </View>

      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0B5A3E',
    paddingHorizontal: 20,
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
});
