import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDrawerPanel from '@/components/admin/AdminDrawerPanel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminSettingsView() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Broadcast push state
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'workers' | 'customers'>('all');

  // Configuration state
  const [platformFee, setPlatformFee] = useState('10');
  const [minBudget, setMinBudget] = useState('200');

  const handleSendBroadcast = () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      Alert.alert('Validation Error', 'Please provide both title and body for the push announcement.');
      return;
    }

    Alert.alert(
      'Confirm Broadcast',
      `Dispatch push notification to target audience (${targetAudience.toUpperCase()})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Broadcast',
          onPress: () => {
            if (Platform.OS === 'android') {
              ToastAndroid.show('Push announcement sent successfully!', ToastAndroid.SHORT);
            } else {
              Alert.alert('Success', 'Broadcast notification dispatched!');
            }
            setPushTitle('');
            setPushBody('');
          },
        },
      ]
    );
  };

  const handleSaveConfig = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show('Platform configuration saved!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', 'Platform configurations saved!');
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        title="System Controls & Push"
        subtitle="Platform Configuration & Notifications"
        onOpenDrawer={() => setDrawerOpen(true)}
        user={user}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 36) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Broadcast Push Notification Box */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="megaphone-outline" size={22} color="#0B5A3E" />
            <Text style={styles.cardTitle}>Broadcast Push Announcement</Text>
          </View>

          <Text style={styles.inputLabel}>Target Audience</Text>
          <View style={styles.audienceRow}>
            {(['all', 'customers', 'workers'] as const).map((aud) => {
              const active = targetAudience === aud;
              return (
                <Pressable
                  key={aud}
                  style={[styles.audChip, active && styles.audChipActive]}
                  onPress={() => setTargetAudience(aud)}
                >
                  <Text style={[styles.audChipText, active && styles.audChipTextActive]}>
                    {aud.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Announcement Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Special Weekend Promotion!"
            placeholderTextColor="#9CA3AF"
            value={pushTitle}
            onChangeText={setPushTitle}
          />

          <Text style={styles.inputLabel}>Notification Body</Text>
          <TextInput
            style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
            placeholder="e.g. Get 20% cashback on all home services booked today."
            placeholderTextColor="#9CA3AF"
            multiline
            value={pushBody}
            onChangeText={setPushBody}
          />

          <Pressable style={styles.sendBtn} onPress={handleSendBroadcast}>
            <Ionicons name="send" size={18} color="#FFFFFF" />
            <Text style={styles.sendBtnText}>Dispatch Push Notification</Text>
          </Pressable>
        </View>

        {/* Platform System Parameters */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings-outline" size={22} color="#D97706" />
            <Text style={styles.cardTitle}>Global Platform Parameters</Text>
          </View>

          <Text style={styles.inputLabel}>Default Platform Fee (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={platformFee}
            onChangeText={setPlatformFee}
          />

          <Text style={styles.inputLabel}>Minimum Task Budget (Rs.)</Text>
          <TextInput
            style={styles.input}
            placeholder="200"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={minBudget}
            onChangeText={setMinBudget}
          />

          <Pressable style={styles.saveConfigBtn} onPress={handleSaveConfig}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.sendBtnText}>Save System Configuration</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AdminDrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeRoute="dashboard"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  audienceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  audChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  audChipActive: {
    backgroundColor: '#0B5A3E',
  },
  audChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
  },
  audChipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B5A3E',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  saveConfigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  sendBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
