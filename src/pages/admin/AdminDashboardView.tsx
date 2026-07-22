import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdminDrawerPanel from '@/components/admin/AdminDrawerPanel';
import { getOpenTasksFromBackend } from '@/services/task';

export default function AdminDashboardView() {
  const router = useRouter();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [taskCount, setTaskCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const openTasks = await getOpenTasksFromBackend();
      setTaskCount(openTasks.length);
    } catch (e) {
      console.warn('[AdminDashboard] Error fetching stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Overview"
        subtitle="System Performance & Management"
        onOpenDrawer={() => setDrawerOpen(true)}
        user={user}
      />

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
        {/* KPI Stats Grid */}
        <View style={styles.statsGrid}>
          <AdminStatCard
            label="Open Tasks"
            value={loading ? '...' : taskCount}
            iconName="list"
            accentColor="#0B5A3E"
            subValue="Live job requests"
          />
          <AdminStatCard
            label="System Status"
            value="Active"
            iconName="server"
            accentColor="#F59E0B"
            subValue="APIs Operational"
          />
        </View>

        <View style={styles.statsGrid}>
          <AdminStatCard
            label="Registered Roles"
            value="3 Types"
            iconName="people"
            accentColor="#10B981"
            subValue="Admin, Customer, Worker"
          />
          <AdminStatCard
            label="Security"
            value="Enforced"
            iconName="shield-checkmark"
            accentColor="#D97706"
            subValue="JWT Token Auth"
          />
        </View>

        {/* Management Actions */}
        <Text style={styles.sectionTitle}>Management Modules</Text>

        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/(protected)/(admin)/tasks')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="documents" size={24} color="#0B5A3E" />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>Manage Tasks & Requests</Text>
            <Text style={styles.actionSub}>View open tasks, categories, and job statuses</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/(protected)/(admin)/users')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="people-circle" size={24} color="#D97706" />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>Manage Platform Users</Text>
            <Text style={styles.actionSub}>View Customers (ID 2), Workers (ID 3), and Admins (ID 1)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  actionSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
