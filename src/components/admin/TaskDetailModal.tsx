import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AdminTaskItem {
  id: number;
  subject?: string;
  body?: string;
  price: number;
  category_id: number;
  category_name?: string;
  status_id?: number;
  statusName?: string;
  customerName?: string;
  workerName?: string;
  created_at?: string;
}

interface TaskDetailModalProps {
  task: AdminTaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelTask?: (taskId: number) => void;
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onCancelTask,
}: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const statusName = task.statusName || (task.status_id === 4 ? 'Completed' : task.status_id === 5 ? 'Cancelled' : 'Active / Searching');
  const statusColor = task.status_id === 4 ? '#0B5A3E' : task.status_id === 5 ? '#EF4444' : '#D97706';
  const statusBg = task.status_id === 4 ? '#ECFDF5' : task.status_id === 5 ? '#FEE2E2' : '#FEF3C7';

  const handleForceCancel = () => {
    Alert.alert(
      'Cancel Task',
      `Are you sure you want to force cancel Task #${task.id}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Force Cancel',
          style: 'destructive',
          onPress: () => {
            if (onCancelTask) onCancelTask(task.id);
            if (Platform.OS === 'android') {
              ToastAndroid.show(`Task #${task.id} has been cancelled by Admin`, ToastAndroid.SHORT);
            }
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Task Details #{task.id}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Task Card Header */}
            <View style={styles.headerCard}>
              <View style={styles.topRow}>
                <Text style={styles.taskTitle}>{task.subject || `Task #${task.id}`}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{statusName}</Text>
                </View>
              </View>

              <Text style={styles.taskPrice}>Rs. {task.price}</Text>

              <View style={styles.metaRow}>
                <Ionicons name="pricetag-outline" size={14} color="#0B5A3E" />
                <Text style={styles.metaText}>{task.category_name || `Category ID #${task.category_id}`}</Text>
              </View>
            </View>

            {/* Job Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Task Description</Text>
              <Text style={styles.bodyText}>{task.body || 'No detailed instructions provided by customer.'}</Text>
            </View>

            {/* Customer & Worker Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stakeholders</Text>

              <View style={styles.infoRow}>
                <View style={styles.userRoleRow}>
                  <Ionicons name="person-circle-outline" size={18} color="#2563EB" />
                  <Text style={styles.infoLabel}>Customer</Text>
                </View>
                <Text style={styles.infoValue}>{task.customerName || 'Registered Customer'}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.userRoleRow}>
                  <Ionicons name="construct-outline" size={18} color="#D97706" />
                  <Text style={styles.infoLabel}>Assigned Worker</Text>
                </View>
                <Text style={styles.infoValue}>{task.workerName || 'Searching Providers...'}</Text>
              </View>
            </View>

            {/* Admin Action Buttons */}
            {task.status_id !== 4 && task.status_id !== 5 ? (
              <Pressable style={styles.cancelBtn} onPress={handleForceCancel}>
                <Ionicons name="ban-outline" size={18} color="#FFFFFF" />
                <Text style={styles.cancelBtnText}>Force Cancel Task Request</Text>
              </Pressable>
            ) : null}
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
  headerCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B5A3E',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  taskPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D97706',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B5A3E',
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
  },
  bodyText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
