import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { mockPayments } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ClientPaymentsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const payments = useMemo(() => mockPayments.filter((p) => p.clientId === user?.id), [user]);
  const totalPaid = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  const methodIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
    card: 'card-outline',
    ach: 'cash-outline',
    check: 'document-text-outline',
    cash: 'wallet-outline',
  };

  const renderPayment = ({ item }: { item: (typeof mockPayments)[0] }) => (
    <Card style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name={methodIcon[item.method] || 'cash-outline'} size={20} color={colors.primary} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentAmount}>${item.amount.toFixed(2)}</Text>
          <Text style={styles.paymentInvoice}>{item.invoiceNumber}</Text>
        </View>
        <StatusBadge status={item.status} size="sm" />
      </View>
      <View style={styles.paymentFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.slate400} />
          <Text style={styles.footerText}>{item.date}</Text>
        </View>
        <Text style={styles.methodText}>{item.method.toUpperCase()}</Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment History</Text>
      </View>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Paid</Text>
        <Text style={styles.summaryValue}>${totalPaid.toFixed(2)}</Text>
      </Card>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPayment}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="card-outline" title="No payments yet" message="Payments will appear here after invoices are settled." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.slate800,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.statusCompleted,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.slate500,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.slate800,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  paymentCard: {
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate800,
  },
  paymentInvoice: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.slate500,
    marginLeft: 6,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate400,
  },
});
