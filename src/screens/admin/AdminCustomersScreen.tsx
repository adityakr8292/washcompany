import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { SearchInput } from '../../components/shared/SearchInput';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { mockCustomers } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AdminCustomersScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter(
      (c) =>
        search.trim() === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const renderCustomerCard = ({ item }: { item: (typeof mockCustomers)[0] }) => (
    <Card style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.company.charAt(0)}</Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.companyName}>{item.company}</Text>
          <Text style={styles.contactName}>{item.name}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.customerMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="mail-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText}>{item.email}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="call-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText}>{item.phone}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText}>{item.address}</Text>
        </View>
      </View>
      <View style={styles.customerStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.activeOrders}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.totalOrders}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${item.outstandingBalance.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Outstanding</Text>
        </View>
      </View>
    </Card>
  );

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, isDesktop ? undefined : { display: 'none' }]}>
      <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Company / Contact</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Active</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Total</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Balance</Text>
    </View>
  );

  const renderTableRow = ({ item }: { item: (typeof mockCustomers)[0] }) => (
    <View style={[styles.tableRow, isDesktop ? undefined : { display: 'none' }]}>
      <View style={{ flex: 2 }}>
        <Text style={styles.tableRowStrong}>{item.company}</Text>
        <Text style={styles.tableRowLight}>{item.name}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <StatusBadge status={item.status} size="sm" />
      </View>
      <Text style={[styles.tableRowText, { flex: 1 }]}>{item.activeOrders}</Text>
      <Text style={[styles.tableRowText, { flex: 1 }]}>{item.totalOrders}</Text>
      <Text style={[styles.tableRowStrong, { flex: 1, textAlign: 'right' }]}>
        ${item.outstandingBalance.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add Customer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search customers..." />
      </View>

      {isDesktop && renderTableHeader()}

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={isDesktop ? renderTableRow : renderCustomerCard}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No customers found" message="Try adjusting your search." />}
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
    paddingBottom: 24,
  },
  customerCard: {
    marginBottom: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  customerInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  contactName: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 1,
  },
  customerMeta: {
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.slate600,
    marginLeft: 8,
    flex: 1,
  },
  customerStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    gap: 12,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  statLabel: {
    fontSize: 11,
    color: colors.slate500,
    marginTop: 2,
  },
});
