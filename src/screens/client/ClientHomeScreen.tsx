import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { fetchClientHomeData } from '../../services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { ClientTabParamList, ClientStackParamList } from '../../navigation/AppNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<ClientTabParamList, 'ClientHome'>,
  NativeStackScreenProps<ClientStackParamList>
>;

export default function ClientHomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [homeData, setHomeData] = useState<{ orders: Array<{ id: string; orderNumber: string; status: 'pending' | 'processing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled'; deliveryDate: string; total: number; clientId: string }>; invoices: Array<{ id: string; clientId: string; status: 'pending' | 'paid' | 'overdue'; total: number }>; outstandingBalance: number; notifications: Array<{ id: string; title: string; message: string }> } | null>(null);

  const loadHomeData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchClientHomeData(user.id);
      setHomeData(data);
    } catch (error) {
      console.warn('Falling back to mock client home data:', error);
      setHomeData({ orders: [], invoices: [], outstandingBalance: 0, notifications: [] });
    }
  }, [user?.id]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  }, [loadHomeData]);

  const clientOrders = homeData?.orders ?? [];
  const activeOrders = clientOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const outstandingBalance = homeData?.outstandingBalance ?? 0;
  const unreadNotifications = homeData?.notifications ?? [];

  const quickActions = [
    { label: 'Place Order', icon: 'add-circle-outline' as const, screen: 'ClientNewOrder' as const },
    { label: 'My Orders', icon: 'list-outline' as const, screen: 'ClientOrders' as const },
    { label: 'Linen', icon: 'shirt-outline' as const, screen: 'ClientLinen' as const },
    { label: 'Schedule', icon: 'calendar-outline' as const, screen: 'ClientSchedule' as const },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name.split(' ')[0]}</Text>
          <Text style={styles.company}>{user?.company}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color={colors.slate600} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Card style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Outstanding Balance</Text>
              <Text style={styles.balanceValue}>${outstandingBalance.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => navigation.navigate('ClientInvoices')}
              >
                <Text style={styles.payButtonText}>View Invoices</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </TouchableOpacity>
            </Card>

            <View style={styles.quickActions}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={styles.quickAction}
                  onPress={() => navigation.navigate(action.screen)}
                >
                  <Ionicons name={action.icon} size={24} color={colors.primary} />
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <SectionHeader
              title="Active Orders"
              actionLabel="See All"
              onAction={() => navigation.navigate('ClientOrders')}
              icon="refresh-outline"
            />

            {activeOrders.length === 0 ? (
              <Card variant="outlined" style={styles.emptyCard}>
                <Text style={styles.emptyText}>No active orders. Place your first order now.</Text>
              </Card>
            ) : (
              activeOrders.slice(0, 3).map((order) => (
                <Card
                  key={order.id}
                  onPress={() => navigation.navigate('ClientOrderDetail', { orderId: order.id })}
                  style={styles.orderCard}
                >
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <StatusBadge status={order.status} />
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width:
                            order.status === 'pending'
                              ? '15%'
                              : order.status === 'processing'
                              ? '45%'
                              : order.status === 'ready'
                              ? '75%'
                              : order.status === 'out_for_delivery'
                              ? '90%'
                              : '100%',
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.orderFooter}>
                    <Text style={styles.deliveryText}>Delivery {order.deliveryDate}</Text>
                    <Text style={styles.totalText}>${order.total.toFixed(2)}</Text>
                  </View>
                </Card>
              ))
            )}

            {unreadNotifications.length > 0 && (
              <>
                <SectionHeader title="Notifications" icon="notifications-outline" />
                <Card variant="outlined" style={styles.notificationCard}>
                  {unreadNotifications.slice(0, 2).map((n) => (
                    <View key={n.id} style={styles.notificationRow}>
                      <View style={styles.notificationDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.notificationTitle}>{n.title}</Text>
                        <Text style={styles.notificationMessage}>{n.message}</Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </>
            )}
          </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.slate800,
  },
  company: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 16,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginRight: 6,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    width: '23%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate700,
    marginTop: 8,
    textAlign: 'center',
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
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 13,
    color: colors.slate500,
  },
  totalText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.slate500,
    textAlign: 'center',
  },
  notificationCard: {
    marginBottom: 16,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate800,
  },
  notificationMessage: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
});
