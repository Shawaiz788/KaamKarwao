import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Image,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AdminUserItem {
  id: number;
  name: string;
  phone: string;
  email?: string;
  usertype_id: number;
  roleName: string;
  status: 'active' | 'suspended' | 'pending';
  profile_pic?: string;
  rating?: number;
  totalTasks?: number;
  joinedDate?: string;
  verified?: boolean;
}

interface UserDetailModalProps {
  user: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (userId: number, newStatus: 'active' | 'suspended') => void;
  onVerifyToggle?: (userId: number) => void;
}

export default function UserDetailModal({
  user,
  isOpen,
  onClose,
  onStatusChange,
  onVerifyToggle,
}: UserDetailModalProps) {
  if (!isOpen || !user) return null;

  const handleToggleStatus = () => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    Alert.alert(
      `${nextStatus === 'suspended' ? 'Suspend' : 'Activate'} User`,
      `Are you sure you want to ${nextStatus === 'suspended' ? 'suspend' : 'activate'} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: nextStatus === 'suspended' ? 'destructive' : 'default',
          onPress: () => {
            if (onStatusChange) onStatusChange(user.id, nextStatus);
            if (Platform.OS === 'android') {
              ToastAndroid.show(`User status updated to ${nextStatus}`, ToastAndroid.SHORT);
            }
          },
        },
      ]
    );
  };

  const handleToggleVerify = () => {
    if (onVerifyToggle) onVerifyToggle(user.id);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`KYC Verification updated for ${user.name}`, ToastAndroid.SHORT);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>User Profile Details</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header User Card */}
            <View style={styles.userCard}>
              {user.profile_pic ? (
                <Image source={{ uri: user.profile_pic }} style={styles.userAvatar} />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Ionicons name="person" size={26} color="#6B7280" />
                </View>
              )}

              <View style={styles.userTextCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  {user.verified ? (
                    <Ionicons name="checkmark-circle" size={18} color="#0B5A3E" />
                  ) : null}
                </View>
                <Text style={styles.userPhone}>{user.phone}</Text>
                <Text style={styles.userEmail}>{user.email || 'No email registered'}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      user.status === 'active' ? '#ECFDF5' : user.status === 'suspended' ? '#FEE2E2' : '#FEF3C7',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        user.status === 'active' ? '#0B5A3E' : user.status === 'suspended' ? '#EF4444' : '#D97706',
                    },
                  ]}
                >
                  {user.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>User Role</Text>
                <Text style={styles.statValue}>{user.roleName} (ID {user.usertype_id})</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Rating</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.statValue}>{user.rating || 5.0}</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Tasks</Text>
                <Text style={styles.statValue}>{user.totalTasks || 0}</Text>
              </View>
            </View>

            {/* Account Details List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Information</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>#{user.id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>KYC Verification</Text>
                <Text style={[styles.infoValue, { color: user.verified ? '#0B5A3E' : '#D97706' }]}>
                  {user.verified ? 'Verified Pro' : 'Pending Verification'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Joined Date</Text>
                <Text style={styles.infoValue}>{user.joinedDate || 'Recently Joined'}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionGroup}>
              <Pressable
                style={[
                  styles.actionBtn,
                  user.status === 'active' ? styles.suspendBtn : styles.activateBtn,
                ]}
                onPress={handleToggleStatus}
              >
                <Ionicons
                  name={user.status === 'active' ? 'ban-outline' : 'checkmark-circle-outline'}
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.actionBtnText}>
                  {user.status === 'active' ? 'Suspend User Account' : 'Activate Account'}
                </Text>
              </Pressable>

              <Pressable style={styles.verifyBtn} onPress={handleToggleVerify}>
                <Ionicons
                  name={user.verified ? 'shield-checkmark' : 'shield-outline'}
                  size={18}
                  color="#0B5A3E"
                />
                <Text style={styles.verifyBtnText}>
                  {user.verified ? 'Revoke KYC Verification' : 'Approve KYC Verification'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#0B5A3E',
  },
  userAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  userPhone: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  section: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  actionGroup: {
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  suspendBtn: {
    backgroundColor: '#EF4444',
  },
  activateBtn: {
    backgroundColor: '#0B5A3E',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B5A3E',
  },
});
