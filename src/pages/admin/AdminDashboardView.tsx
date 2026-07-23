import React, { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDrawerPanel from '@/components/admin/AdminDrawerPanel';
import StatCard from '@/components/admin/common/StatCard';
import { SkeletonCard } from '@/components/admin/common/SkeletonLoader';
import EmptyState from '@/components/admin/common/EmptyState';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

export default function AdminDashboardView() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { stats, tasks, openTasks, reviews, isLoading, refetch } = useAdminDashboard();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Dashboard"
        subtitle="Platform Operational & System Overview"
        onOpenDrawer={() => setDrawerOpen(true)}
        user={user}
      />

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
        <Text style={styles.sectionTitle}>Key System Metrics</Text>

        {/* 10 Required Stat Cards Grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Total Users" value={stats.totalUsers} iconName="people" accentColor="#3B82F6" />
          <StatCard label="Total Professionals" value={stats.totalPros} iconName="construct" accentColor="#D97706" />
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Verified Pros" value={stats.verifiedPros} iconName="shield-checkmark" accentColor="#0B5A3E" />
          <StatCard label="Total Tasks" value={stats.totalTasks} iconName="list" accentColor="#8B5CF6" />
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Open Tasks" value={stats.openTasks} iconName="time" accentColor="#F59E0B" />
          <StatCard label="Total Reviews" value={stats.totalReviews} iconName="star" accentColor="#EC4899" />
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Categories" value={stats.totalCategories} iconName="grid" accentColor="#10B981" />
          <StatCard label="Countries" value={stats.totalCountries} iconName="globe" accentColor="#6366F1" />
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Cities" value={stats.totalCities} iconName="business" accentColor="#06B6D4" />
          <StatCard label="Areas" value={stats.totalAreas} iconName="map" accentColor="#84CC16" />
        </View>

        {/* Recent Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          <Pressable onPress={() => router.push('/(protected)/(admin)/tasks')}>
            <Text style={styles.seeAllBtn}>View All</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <SkeletonCard />
        ) : tasks.length === 0 ? (
          <EmptyState title="No tasks recorded" subtitle="Live tasks will appear here." iconName="documents-outline" />
        ) : (
          tasks.slice(0, 3).map((task) => (
            <View key={task.id} style={styles.listItem}>
              <View style={styles.itemIconBox}>
                <Ionicons name="document-text-outline" size={20} color="#0B5A3E" />
              </View>
              <View style={styles.itemTextCol}>
                <Text style={styles.itemTitle}>{task.subject}</Text>
                <Text style={styles.itemSub}>ID: {task.id} • Budget: Rs. {task.price}</Text>
              </View>
              <View style={styles.badgeBox}>
                <Text style={styles.badgeText}>Status {task.status_id}</Text>
              </View>
            </View>
          ))
        )}

        {/* Recent Reviews */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          <Pressable onPress={() => router.push('/(protected)/(admin)/reviews')}>
            <Text style={styles.seeAllBtn}>View All</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <SkeletonCard />
        ) : reviews.length === 0 ? (
          <EmptyState title="No reviews found" subtitle="User ratings will appear here." iconName="star-outline" />
        ) : (
          reviews.slice(0, 3).map((rev) => (
            <View key={rev.id} style={styles.listItem}>
              <View style={[styles.itemIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="star" size={18} color="#D97706" />
              </View>
              <View style={styles.itemTextCol}>
                <Text style={styles.itemTitle}>Rating: {rev.rating} / 5.0</Text>
                <Text style={styles.itemSub}>{rev.body}</Text>
              </View>
            </View>
          ))
        )}

        {/* Shortcuts */}
        <Text style={styles.sectionTitle}>Quick Management Shortcuts</Text>

        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/(protected)/(admin)/users')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="people" size={22} color="#2563EB" />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>User & Professional Directory</Text>
            <Text style={styles.actionSub}>Verify workers, view profiles & earnings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/(protected)/(admin)/masterdata')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="layers" size={22} color="#0B5A3E" />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>Master Data & Locations</Text>
            <Text style={styles.actionSub}>Countries, Cities, Areas, User Types, Statuses</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
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
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  seeAllBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B5A3E',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  itemSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  actionSub: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
});
