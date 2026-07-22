import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDrawerPanel from '@/components/admin/AdminDrawerPanel';
import TaskDetailModal, { AdminTaskItem } from '@/components/admin/TaskDetailModal';
import { getOpenTasksFromBackend } from '@/services/task';

interface StatusFilter {
  id: number | 'all';
  label: string;
}

const STATUS_FILTERS: StatusFilter[] = [
  { id: 'all', label: 'All Statuses' },
  { id: 1, label: 'Searching' },
  { id: 4, label: 'Completed' },
  { id: 5, label: 'Cancelled' },
];

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminTasksView() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<AdminTaskItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<AdminTaskItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const openTasks = await getOpenTasksFromBackend();
      const mapped: AdminTaskItem[] = (openTasks || []).map((t) => ({
        id: t.id!,
        subject: t.subject,
        body: t.body,
        price: t.price,
        category_id: t.category_id,
        status_id: t.status_id || 1,
        customerName: (t as any).customer_name || 'Registered Customer',
        workerName: (t as any).worker_name || 'Searching...',
        created_at: t.created_at,
      }));
      setTasks(mapped);
    } catch (e) {
      console.warn('[AdminTasksView] Error fetching tasks:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleOpenTask = (t: AdminTaskItem) => {
    setSelectedTask(t);
    setModalOpen(true);
  };

  const handleCancelTask = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status_id: 5, statusName: 'Cancelled' } : t))
    );
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = selectedStatus === 'all' || t.status_id === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.body && t.body.toLowerCase().includes(q)) ||
      (t.id && t.id.toString().includes(q));
    return matchesStatus && matchesQuery;
  });

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Manage Tasks"
        subtitle={`System Tasks (${filteredTasks.length})`}
        onOpenDrawer={() => setDrawerOpen(true)}
        user={user}
      />

      {/* Status Filters */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => {
          const active = selectedStatus === f.id;
          return (
            <Pressable
              key={String(f.id)}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setSelectedStatus(f.id)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by task title, body or ID..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 36) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0B5A3E"
            colors={['#0B5A3E']}
          />
        }
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0B5A3E" />
            <Text style={styles.loadingText}>Fetching tasks from server...</Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="documents-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Tasks Found</Text>
            <Text style={styles.emptySub}>No open system tasks match your search criteria.</Text>
          </View>
        ) : (
          filteredTasks.map((t) => (
            <Pressable key={t.id} style={styles.taskCard} onPress={() => handleOpenTask(t)}>
              <View style={styles.cardHeader}>
                <Text style={styles.taskTitle}>{t.subject || `Task #${t.id}`}</Text>
                <View style={styles.priceBadge}>
                  <Text style={styles.taskPrice}>Rs. {t.price}</Text>
                </View>
              </View>
              <Text style={styles.taskBody} numberOfLines={2}>
                {t.body || 'No description provided.'}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.metaText}>Task ID: #{t.id}</Text>
                <Text style={styles.metaText}>Category ID: #{t.category_id}</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <TaskDetailModal
        task={selectedTask}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCancelTask={handleCancelTask}
      />

      <AdminDrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeRoute="tasks"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#0B5A3E',
    borderColor: '#0B5A3E',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  emptySub: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B5A3E',
    flex: 1,
  },
  priceBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  taskBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
