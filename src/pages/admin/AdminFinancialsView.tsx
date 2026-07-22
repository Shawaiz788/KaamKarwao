import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdminDrawerPanel from '@/components/admin/AdminDrawerPanel';

const TRANSACTIONS = [
  { id: 'TXN-9012', user: 'Ali Khan', amount: 1500, fee: 150, type: 'Task Payment', status: 'Settled', date: 'Today, 2:30 PM' },
  { id: 'TXN-9011', user: 'Usman Electrician', amount: 3200, fee: 320, type: 'Worker Payout', status: 'Settled', date: 'Today, 11:15 AM' },
  { id: 'TXN-9010', user: 'Hassan Ahmed', amount: 800, fee: 80, type: 'Task Payment', status: 'Pending', date: 'Yesterday' },
  { id: 'TXN-9009', user: 'Zara Worker', amount: 2500, fee: 250, type: 'Task Payment', status: 'Settled', date: '22 Jul 2026' },
];

export default function AdminFinancialsView() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Financials & Commission"
        subtitle="Platform Volume & Earnings Ledger"
        onOpenDrawer={() => setDrawerOpen(true)}
        user={user}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Stats Grid */}
        <View style={styles.statsGrid}>
          <AdminStatCard
            label="Gross Volume"
            value="Rs. 148,500"
            iconName="cash"
            accentColor="#0B5A3E"
            subValue="Total transactions"
          />
          <AdminStatCard
            label="Net Commission"
            value="Rs. 14,850"
            iconName="trending-up"
            accentColor="#D97706"
            subValue="10% Platform Cut"
          />
        </View>

        <View style={styles.statsGrid}>
          <AdminStatCard
            label="Pending Payouts"
            value="Rs. 12,400"
            iconName="wallet"
            accentColor="#3B82F6"
            subValue="Worker Payout Queue"
          />
          <AdminStatCard
            label="Refund Requests"
            value="0 Pending"
            iconName="checkmark-circle"
            accentColor="#10B981"
            subValue="All disputes clear"
          />
        </View>

        {/* Ledger Title */}
        <Text style={styles.sectionTitle}>Recent Platform Transactions</Text>

        {TRANSACTIONS.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txIconBox}>
              <Ionicons name="receipt-outline" size={20} color="#0B5A3E" />
            </View>

            <View style={styles.txTextCol}>
              <Text style={styles.txUser}>{tx.user}</Text>
              <Text style={styles.txMeta}>{tx.id} • {tx.type} • {tx.date}</Text>
            </View>

            <View style={styles.txRightCol}>
              <Text style={styles.txAmount}>Rs. {tx.amount}</Text>
              <Text style={styles.txFee}>Fee: Rs. {tx.fee}</Text>
            </View>
          </View>
        ))}
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
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txTextCol: {
    flex: 1,
  },
  txUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  txMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  txRightCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B5A3E',
  },
  txFee: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
    marginTop: 2,
  },
});
