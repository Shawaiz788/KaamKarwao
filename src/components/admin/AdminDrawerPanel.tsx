import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface AdminDrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: 'dashboard' | 'tasks' | 'users';
}

export default function AdminDrawerPanel({ isOpen, onClose, activeRoute }: AdminDrawerPanelProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path as any);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    router.replace('/(auth)/sign-in');
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Left Drawer Container */}
        <View
          style={[
            styles.drawer,
            {
              paddingTop: Math.max(insets.top, 20),
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.brandBox}>
              <View style={styles.brandIconBox}>
                <Ionicons name="shield-checkmark" size={22} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.brandTitle}>KaamKarwao</Text>
                <Text style={styles.brandSub}>Admin Portal</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* User Profile Card */}
          <View style={styles.userInfoBox}>
            <View style={styles.userAvatarPlaceholder}>
              <Ionicons name="person" size={20} color="#0B5A3E" />
            </View>
            <View style={styles.userTextCol}>
              <Text style={styles.userName}>{user?.displayName || 'Administrator'}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>System Admin</Text>
              </View>
            </View>
          </View>

          {/* Navigation Items */}
          <View style={styles.navGroup}>
            <Pressable
              style={[styles.navItem, activeRoute === 'dashboard' && styles.navItemActive]}
              onPress={() => navigateTo('/(protected)/(admin)/dashboard')}
            >
              <Ionicons
                name="grid"
                size={20}
                color={activeRoute === 'dashboard' ? '#0B5A3E' : '#6B7280'}
              />
              <Text style={[styles.navText, activeRoute === 'dashboard' && styles.navTextActive]}>
                Dashboard
              </Text>
              {activeRoute === 'dashboard' && <View style={styles.activeDot} />}
            </Pressable>

            <Pressable
              style={[styles.navItem, activeRoute === 'tasks' && styles.navItemActive]}
              onPress={() => navigateTo('/(protected)/(admin)/tasks')}
            >
              <Ionicons
                name="list"
                size={20}
                color={activeRoute === 'tasks' ? '#0B5A3E' : '#6B7280'}
              />
              <Text style={[styles.navText, activeRoute === 'tasks' && styles.navTextActive]}>
                Manage Tasks
              </Text>
              {activeRoute === 'tasks' && <View style={styles.activeDot} />}
            </Pressable>

            <Pressable
              style={[styles.navItem, activeRoute === 'users' && styles.navItemActive]}
              onPress={() => navigateTo('/(protected)/(admin)/users')}
            >
              <Ionicons
                name="people"
                size={20}
                color={activeRoute === 'users' ? '#0B5A3E' : '#6B7280'}
              />
              <Text style={[styles.navText, activeRoute === 'users' && styles.navTextActive]}>
                Manage Users
              </Text>
              {activeRoute === 'users' && <View style={styles.activeDot} />}
            </Pressable>
          </View>

          {/* Footer Sign Out */}
          <View style={styles.footer}>
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </Pressable>
          </View>
        </View>

        {/* Right Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: width * 0.78,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#0B5A3E',
    marginHorizontal: -20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandSub: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  userInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 14,
    marginVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  userAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextCol: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#0B5A3E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  navGroup: {
    flex: 1,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: '#ECFDF5',
  },
  navText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    flex: 1,
  },
  navTextActive: {
    color: '#0B5A3E',
    fontWeight: '700',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
});
