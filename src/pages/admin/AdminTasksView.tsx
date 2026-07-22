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
import { getOpenTasksFromBackend } from '@/services/task';
import { BackendTask } from '@/types';

export default function AdminTasksView() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<BackendTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    try {
      const openTasks = await getOpenTasksFromBackend();
      setTasks(openTasks || []);
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

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.body && t.body.toLowerCase().includes(q)) ||
      (t.id && t.id.toString().includes(q))
    );
  });

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Manage Tasks"
        subtitle={`System Tasks (${filteredTasks.length})`}
        onOpenDrawer={() => setDrawerOpen(true)}
        user={user}
      />

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
        contentContainerStyle={styles.scrollContent}
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
            <View key={t.id} style={styles.taskCard}>
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
            </View>
          ))
        )}
      </ScrollView>

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
