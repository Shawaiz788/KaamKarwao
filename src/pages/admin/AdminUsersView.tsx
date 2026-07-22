import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDrawerPanel from '@/components/admin/AdminDrawerPanel';
import UserDetailModal, { AdminUserItem } from '@/components/admin/UserDetailModal';

interface UserRoleFilter {
  id: number | 'all';
  label: string;
}

const ROLE_FILTERS: UserRoleFilter[] = [
  { id: 'all', label: 'All Roles' },
  { id: 1, label: 'Admin (1)' },
  { id: 2, label: 'Customer (2)' },
  { id: 3, label: 'Worker (3)' },
];

const INITIAL_USERS: AdminUserItem[] = [
  { id: 1, name: 'System Admin', phone: '+923000000000', email: 'admin@kaamkarwao.pk', usertype_id: 1, roleName: 'Admin', status: 'active', verified: true, rating: 5.0, totalTasks: 0, joinedDate: 'Jan 2026' },
  { id: 2, name: 'Ali Khan', phone: '+923001234567', email: 'ali.khan@gmail.com', usertype_id: 2, roleName: 'Customer', status: 'active', verified: false, rating: 4.9, totalTasks: 14, joinedDate: 'Feb 2026' },
  { id: 3, name: 'Zara Worker', phone: '+923009876543', email: 'zara.pro@gmail.com', usertype_id: 3, roleName: 'Worker', status: 'active', verified: true, rating: 4.8, totalTasks: 32, joinedDate: 'Feb 2026' },
  { id: 4, name: 'Hassan Ahmed', phone: '+923011112222', email: 'hassan.a@yahoo.com', usertype_id: 2, roleName: 'Customer', status: 'active', verified: false, rating: 5.0, totalTasks: 5, joinedDate: 'Mar 2026' },
  { id: 5, name: 'Usman Electrician', phone: '+923023334444', email: 'usman.tech@gmail.com', usertype_id: 3, roleName: 'Worker', status: 'suspended', verified: false, rating: 4.2, totalTasks: 19, joinedDate: 'Mar 2026' },
];

export default function AdminUsersView() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [users, setUsers] = useState<AdminUserItem[]>(INITIAL_USERS);
  const [selectedRole, setSelectedRole] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenUser = (u: AdminUserItem) => {
    setSelectedUser(u);
    setModalOpen(true);
  };

  const handleStatusChange = (userId: number, newStatus: 'active' | 'suspended') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
  };

  const handleVerifyToggle = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, verified: !u.verified } : u))
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, verified: !selectedUser.verified });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRole === 'all' || u.usertype_id === selectedRole;
    const matchesQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    return matchesRole && matchesQuery;
  });

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Manage Users"
        subtitle={`Registered Platform Users (${filteredUsers.length})`}
        onOpenDrawer={() => setDrawerOpen(true)}
        user={user}
      />

      {/* Role Filter Chips */}
      <View style={styles.filterRow}>
        {ROLE_FILTERS.map((f) => {
          const active = selectedRole === f.id;
          return (
            <Pressable
              key={String(f.id)}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setSelectedRole(f.id)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Search Input */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone..."
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

      {/* User Directory */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 36) }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.map((u) => (
          <Pressable key={u.id} style={styles.userCard} onPress={() => handleOpenUser(u)}>
            <View
              style={[
                styles.userIconBox,
                {
                  backgroundColor:
                    u.usertype_id === 1 ? '#ECFDF5' : u.usertype_id === 3 ? '#FEF3C7' : '#EFF6FF',
                },
              ]}
            >
              <Ionicons
                name={u.usertype_id === 1 ? 'shield-checkmark' : u.usertype_id === 3 ? 'construct' : 'person'}
                size={22}
                color={u.usertype_id === 1 ? '#0B5A3E' : u.usertype_id === 3 ? '#D97706' : '#2563EB'}
              />
            </View>

            <View style={styles.userInfoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{u.name}</Text>
                {u.verified ? <Ionicons name="checkmark-circle" size={16} color="#0B5A3E" /> : null}
              </View>
              <Text style={styles.userPhone}>{u.phone}</Text>
            </View>

            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    u.status === 'suspended'
                      ? '#FEE2E2'
                      : u.usertype_id === 1
                      ? '#ECFDF5'
                      : u.usertype_id === 3
                      ? '#FEF3C7'
                      : '#EFF6FF',
                },
              ]}
            >
              <Text
                style={[
                  styles.roleBadgeText,
                  {
                    color:
                      u.status === 'suspended'
                        ? '#EF4444'
                        : u.usertype_id === 1
                        ? '#0B5A3E'
                        : u.usertype_id === 3
                        ? '#D97706'
                        : '#2563EB',
                  },
                ]}
              >
                {u.status === 'suspended' ? 'SUSPENDED' : `${u.roleName} (ID ${u.usertype_id})`}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <UserDetailModal
        user={selectedUser}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStatusChange={handleStatusChange}
        onVerifyToggle={handleVerifyToggle}
      />

      <AdminDrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeRoute="users"
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
    gap: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  userIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  userPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
