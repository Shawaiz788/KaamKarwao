import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDrawerPanel from '@/components/admin/AdminDrawerPanel';
import CategoryModal, { AdminCategoryItem } from '@/components/admin/CategoryModal';

const INITIAL_CATEGORIES: AdminCategoryItem[] = [
  { id: 1, name: 'Electrician', commissionRate: 10, active: true, totalJobs: 42 },
  { id: 2, name: 'Plumber', commissionRate: 10, active: true, totalJobs: 38 },
  { id: 3, name: 'AC Repair', commissionRate: 12, active: true, totalJobs: 29 },
  { id: 4, name: 'Carpenter', commissionRate: 8, active: true, totalJobs: 15 },
  { id: 5, name: 'Painter', commissionRate: 8, active: false, totalJobs: 9 },
  { id: 6, name: 'General Helper', commissionRate: 5, active: true, totalJobs: 54 },
];

export default function AdminCategoriesView() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<AdminCategoryItem[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<AdminCategoryItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenAdd = () => {
    setSelectedCat(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: AdminCategoryItem) => {
    setSelectedCat(cat);
    setModalOpen(true);
  };

  const handleSaveCategory = (savedCat: AdminCategoryItem) => {
    if (savedCat.id) {
      setCategories((prev) =>
        prev.map((c) => (c.id === savedCat.id ? { ...c, ...savedCat } : c))
      );
    } else {
      const newCat: AdminCategoryItem = {
        ...savedCat,
        id: Date.now(),
        totalJobs: 0,
      };
      setCategories((prev) => [newCat, ...prev]);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Service Categories"
        subtitle={`Active Platform Categories (${filteredCategories.length})`}
        onOpenDrawer={() => setDrawerOpen(true)}
        user={user}
      />

      {/* Action Bar & Search */}
      <View style={styles.topBar}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Pressable style={styles.addBtn} onPress={handleOpenAdd}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {/* Category List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 36) }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.map((c) => (
          <View key={c.id} style={styles.categoryCard}>
            <View style={styles.catIconBox}>
              <Ionicons name="construct" size={22} color="#0B5A3E" />
            </View>

            <View style={styles.catTextCol}>
              <Text style={styles.catName}>{c.name}</Text>
              <Text style={styles.catSub}>
                Fee: {c.commissionRate}% • Jobs: {c.totalJobs || 0}
              </Text>
            </View>

            <View style={styles.rightCol}>
              <View style={[styles.statusTag, c.active ? styles.tagActive : styles.tagInactive]}>
                <Text style={[styles.tagText, c.active ? styles.tagTextActive : styles.tagTextInactive]}>
                  {c.active ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>

              <Pressable style={styles.editBtn} onPress={() => handleOpenEdit(c)}>
                <Ionicons name="create-outline" size={18} color="#0B5A3E" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <CategoryModal
        category={selectedCat}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCategory}
      />

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B5A3E',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  catIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catTextCol: {
    flex: 1,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  catSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagActive: {
    backgroundColor: '#ECFDF5',
  },
  tagInactive: {
    backgroundColor: '#FEE2E2',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tagTextActive: {
    color: '#0B5A3E',
  },
  tagTextInactive: {
    color: '#EF4444',
  },
  editBtn: {
    padding: 6,
  },
});
