import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { fetchInvoices } from '../../services/api';
import type { Invoice } from '../../types';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
  navigation: any;
};

export default function ClientInvoicesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const loadInvoices = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchInvoices(user.id);
      setInvoices(data);
    } catch (error) {
      console.warn('Unable to load invoices:', error);
      setInvoices([]);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInvoices();
    setRefreshing(false);
  }, [loadInvoices]);
  const outstanding = invoices.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0);

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <Card style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
          <Text style={styles.orderNumber}>Order {item.orderNumber}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.invoiceMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText}>Issued {item.issueDate}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText}>Due {item.dueDate}</Text>
        </View>
      </View>
      <View style={styles.invoiceFooter}>
        <Text style={styles.amountLabel}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountValue}>${item.total.toFixed(2)}</Text>
          {item.status !== 'paid' && (
            <TouchableOpacity style={styles.payButton} onPress={() => navigation.navigate('ClientPayments')}>
              <Text style={styles.payButtonText}>Pay</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
      </View>

      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Outstanding Balance</Text>
        <Text style={styles.balanceValue}>${outstanding.toFixed(2)}</Text>
        <Text style={styles.balanceHint}>Pay early to keep your account in good standing.</Text>
      </Card>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="receipt-outline" title="No invoices yet" message="Invoices will appear here once orders are billed." />
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
  balanceCard: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginTop: 4,
  },
  balanceHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  invoiceCard: {
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  orderNumber: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  invoiceMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.slate600,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  amountLabel: {
    fontSize: 13,
    color: colors.slate500,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  payButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
});
