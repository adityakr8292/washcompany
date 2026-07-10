import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { SearchInput } from '../../components/shared/SearchInput';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { fetchOrders } from '../../services/api';
import type { Order, OrderStatus } from '../../types';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { ClientTabParamList, ClientStackParamList } from '../../navigation/AppNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<ClientTabParamList, 'ClientOrders'>,
  NativeStackScreenProps<ClientStackParamList>
>;

const statusFilters: Array<'all' | OrderStatus> = ['all', 'pending', 'processing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];

export default function ClientOrdersScreen({ navigation }: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.warn('Unable to load client orders:', error);
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

  const clientOrders = useMemo(() => {
    return orders
      .filter((o) => o.clientId === user?.id)
      .filter((o) => {
        const matchesSearch =
          search.trim() === '' || o.orderNumber.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || o.status === filter;
        return matchesSearch && matchesFilter;
      });
  }, [user, search, filter]);

  const renderOrder = ({ item }: { item: Order }) => (
    <Card
      onPress={() => navigation.navigate('ClientOrderDetail', { orderId: item.id })}
      style={styles.orderCard}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width:
                item.status === 'pending'
                  ? '15%'
                  : item.status === 'processing'
                  ? '45%'
                  : item.status === 'ready'
                  ? '75%'
                  : item.status === 'out_for_delivery'
                  ? '90%'
                  : item.status === 'completed'
                  ? '100%'
                  : '0%',
            },
          ]}
        />
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
        <Text style={styles.itemCount}>{item.items.length} items · {item.weight} lbs</Text>
        <Text style={styles.total}>${item.total.toFixed(2)}</Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search orders..." />
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

      <FlatList
        data={clientOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="file-tray-outline" title="No orders found" message="Try adjusting your search or filters." />
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
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.slate200,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
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
