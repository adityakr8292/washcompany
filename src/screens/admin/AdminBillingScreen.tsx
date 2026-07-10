import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { SearchInput } from '../../components/shared/SearchInput';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { mockInvoices, mockPayments } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AdminBillingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter(
      (i) =>
        search.trim() === '' ||
        i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        i.clientName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalBilled = mockInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = mockInvoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalOutstanding = mockInvoices.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0);

  const renderInvoiceCard = ({ item }: { item: (typeof mockInvoices)[0] }) => (
    <Card style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
          <Text style={styles.clientName}>{item.clientName}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.invoiceMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="document-text-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText}>{item.orderNumber}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText}>Due {item.dueDate}</Text>
        </View>
      </View>
      <View style={styles.invoiceFooter}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={styles.amountValue}>${item.total.toFixed(2)}</Text>
      </View>
    </Card>
  );

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, isDesktop ? undefined : { display: 'none' }]}>
      <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Invoice / Client</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Issue Date</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Due Date</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Total</Text>
    </View>
  );

  const renderTableRow = ({ item }: { item: (typeof mockInvoices)[0] }) => (
    <View style={[styles.tableRow, isDesktop ? undefined : { display: 'none' }]}>
      <View style={{ flex: 2 }}>
        <Text style={styles.tableRowStrong}>{item.invoiceNumber}</Text>
        <Text style={styles.tableRowLight}>{item.clientName}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <StatusBadge status={item.status} size="sm" />
      </View>
      <Text style={[styles.tableRowText, { flex: 1 }]}>{item.issueDate}</Text>
      <Text style={[styles.tableRowText, { flex: 1 }]}>{item.dueDate}</Text>
      <Text style={[styles.tableRowStrong, { flex: 1, textAlign: 'right' }]}>${item.total.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Billing</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Create Invoice</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCards}>
        <Card style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
          <Text style={styles.summaryValue}>${totalBilled.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total Billed</Text>
        </Card>
        <Card style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: colors.statusCompleted }]}>
          <Text style={styles.summaryValue}>${totalPaid.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Paid</Text>
        </Card>
        <Card style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: colors.statusPending }]}>
          <Text style={styles.summaryValue}>${totalOutstanding.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Outstanding</Text>
        </Card>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search invoices, clients..." />
      </View>

      <SectionHeader title="Recent Invoices" icon="receipt-outline" />
      {isDesktop && renderTableHeader()}
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        renderItem={isDesktop ? renderTableRow : renderInvoiceCard}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No invoices found" message="Try adjusting your search." />}
      />

      <SectionHeader title="Recent Payments" icon="card-outline" />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={mockPayments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.paymentList}
        renderItem={({ item }) => (
          <Card style={styles.paymentCard}>
            <Text style={styles.paymentAmount}>${item.amount.toFixed(2)}</Text>
            <Text style={styles.paymentInvoice}>{item.invoiceNumber}</Text>
            <View style={styles.paymentFooter}>
              <Text style={styles.paymentMethod}>{item.method.toUpperCase()}</Text>
              <StatusBadge status={item.status} size="sm" />
            </View>
          </Card>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.slate800,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate800,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.slate500,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  tableRowStrong: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate800,
  },
  tableRowLight: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  tableRowText: {
    fontSize: 13,
    color: colors.slate600,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
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
  clientName: {
    fontSize: 13,
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
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  paymentCard: {
    width: 180,
    marginRight: 12,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate800,
  },
  paymentInvoice: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 4,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  paymentMethod: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate400,
  },
});
