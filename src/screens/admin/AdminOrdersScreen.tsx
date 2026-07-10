import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { SearchInput } from '../../components/shared/SearchInput';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { fetchOrders } from '../../services/api';
import type { Order, OrderStatus } from '../../types';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { AdminTabParamList, AdminStackParamList } from '../../navigation/AppNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, 'AdminOrders'>,
  NativeStackScreenProps<AdminStackParamList>
>;

const statusFilters: Array<'all' | OrderStatus> = ['all', 'pending', 'processing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];

export default function AdminOrdersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.warn('Falling back to empty orders list:', error);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        search.trim() === '' ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.clientCompany.toLowerCase().includes(search.toLowerCase()) ||
        order.clientName.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || order.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const renderOrder = ({ item }: { item: Order }) => (
    <Card onPress={() => navigation.navigate('AdminOrderDetail', { orderId: item.id })} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.clientName}>{item.clientCompany}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.orderMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText}>Pickup {item.pickupDate}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="send-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText}>Delivery {item.deliveryDate}</Text>
        </View>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.itemCount}>{item.items.length} item types · {item.weight} lbs</Text>
        <Text style={styles.total}>${item.total.toFixed(2)}</Text>
      </View>
    </Card>
  );

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, isDesktop ? undefined : { display: 'none' }]}>
      <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Order / Client</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Pickup</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Delivery</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Total</Text>
    </View>
  );

  const renderTableRow = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.tableRow, isDesktop ? undefined : { display: 'none' }]}
      onPress={() => navigation.navigate('AdminOrderDetail', { orderId: item.id })}
    >
      <View style={{ flex: 2 }}>
        <Text style={styles.tableRowStrong}>{item.orderNumber}</Text>
        <Text style={styles.tableRowLight}>{item.clientCompany}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <StatusBadge status={item.status} size="sm" />
      </View>
      <Text style={[styles.tableRowText, { flex: 1 }]}>{item.pickupDate}</Text>
      <Text style={[styles.tableRowText, { flex: 1 }]}>{item.deliveryDate}</Text>
      <Text style={[styles.tableRowStrong, { flex: 1, textAlign: 'right' }]}>${item.total.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>New Order</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search orders, clients..."
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={statusFilters}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item  ? styles.filterChipActive : undefined]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterChipText, filter === item  ? styles.filterChipTextActive : undefined]}>
              {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isDesktop && renderTableHeader()}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={isDesktop ? renderTableRow : renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="file-tray-outline" title="No orders found" message="Try adjusting your search or filters." />}
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
  filterList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.backgroundTertiary,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slate600,
  },
  filterChipTextActive: {
    color: colors.white,
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
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  clientName: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 2,
  },
  orderMeta: {
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
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  itemCount: {
    fontSize: 13,
    color: colors.slate500,
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
});
