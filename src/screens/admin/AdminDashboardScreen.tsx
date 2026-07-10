import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { pipelineStages } from '../../data/mockData';
import { fetchDashboardData } from '../../services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { AdminTabParamList, AdminStackParamList } from '../../navigation/AppNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, 'AdminDashboard'>,
  NativeStackScreenProps<AdminStackParamList>
>;

export default function AdminDashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    totalOrders: number;
    activeOrders: number;
    revenue: number;
    outstanding: number;
    stageCounts: Array<{ key: string; label: string; count: number }>;
    notifications: Array<{ id: string; title: string; message: string; type: 'info' | 'warning' | 'success' | 'error'; read: boolean }>;
  } | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await fetchDashboardData(user?.role || 'admin');
      setDashboardData(data);
    } catch (error) {
      console.warn('Falling back to mock dashboard data:', error);
      setDashboardData({
        totalOrders: 8,
        activeOrders: 4,
        revenue: 1250,
        outstanding: 4875,
        stageCounts: pipelineStages.map((stage) => ({ ...stage, count: 0 })),
        notifications: [],
      });
    }
  }, [user?.role]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  const totalOrders = dashboardData?.totalOrders ?? 0;
  const activeOrders = dashboardData?.activeOrders ?? 0;
  const revenue = dashboardData?.revenue ?? 0;
  const outstanding = dashboardData?.outstanding ?? 0;
  const stageCounts = (dashboardData?.stageCounts ?? pipelineStages.map((stage) => ({ ...stage, count: 0 }))).map((stage) => ({ ...stage, label: stage.label }));
  const unreadNotifications = (dashboardData?.notifications ?? []).filter((n) => !n.read);

  const renderKPI = ({ item }: { item: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; color: string } }) => (
    <Card style={[styles.kpiCard, isDesktop && { flex: 1, minWidth: 180 }]}>
      <View style={[styles.kpiIconCircle, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={styles.kpiValue}>{item.value}</Text>
      <Text style={styles.kpiLabel}>{item.label}</Text>
    </Card>
  );

  const kpiData = [
    { label: 'Total Orders', value: totalOrders.toString(), icon: 'briefcase-outline' as const, color: colors.primary },
    { label: 'Active Orders', value: activeOrders.toString(), icon: 'refresh-outline' as const, color: colors.statusProcessing },
    { label: 'Revenue', value: `$${revenue.toLocaleString()}`, icon: 'cash-outline' as const, color: colors.statusCompleted },
    { label: 'Outstanding', value: `$${outstanding.toLocaleString()}`, icon: 'timer-outline' as const, color: colors.statusPending },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, {user?.name.split(' ')[0]}</Text>
          <Text style={styles.subtitle}>Admin Dashboard · {new Date().toLocaleDateString()}</Text>
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={[styles.kpiGrid, isDesktop  ? styles.kpiGridDesktop : undefined]}>
              {kpiData.map((item) => renderKPI({ item }))}
            </View>

            <SectionHeader
              title="Order Pipeline"
              actionLabel="View Orders"
              onAction={() => navigation.navigate('AdminOrders')}
              icon="git-merge-outline"
            />
            <Card style={styles.pipelineCard}>
              <View style={[styles.pipelineGrid, isDesktop  ? styles.pipelineGridDesktop : undefined]}>
                {stageCounts.map((stage) => (
                  <View key={stage.key} style={styles.pipelineItem}>
                    <Text style={styles.pipelineCount}>{stage.count}</Text>
                    <Text style={styles.pipelineLabel}>{stage.label}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <SectionHeader
              title="Recent Notifications"
              actionLabel="See All"
              onAction={() => navigation.navigate('AdminNotifications')}
              icon="notifications-outline"
            />
            <Card variant="outlined" style={styles.notificationsCard}>
              {unreadNotifications.slice(0, 4).map((notification) => (
                <View key={notification.id} style={styles.notificationRow}>
                  <View style={styles.notificationDot} />
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                  </View>
                  <StatusBadge status={notification.type} size="sm" />
                </View>
              ))}
              {unreadNotifications.length === 0 && (
                <Text style={styles.emptyText}>No unread notifications</Text>
              )}
            </Card>

            <SectionHeader title="Quick Actions" icon="flash-outline" />
            <View style={[styles.quickActions, isDesktop  ? styles.quickActionsDesktop : undefined]}>
              <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('AdminOrders')}>
                <Ionicons name="list-outline" size={22} color={colors.primary} />
                <Text style={styles.quickActionText}>Manage Orders</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('AdminInventory')}>
                <Ionicons name="cube-outline" size={22} color={colors.primary} />
                <Text style={styles.quickActionText}>Inventory</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('AdminBilling')}>
                <Ionicons name="card-outline" size={22} color={colors.primary} />
                <Text style={styles.quickActionText}>Billing</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('AdminCustomers')}>
                <Ionicons name="people-outline" size={22} color={colors.primary} />
                <Text style={styles.quickActionText}>Customers</Text>
              </TouchableOpacity>
            </View>
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
  subtitle: {
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
  kpiGrid: {
    gap: 12,
    marginBottom: 24,
  },
  kpiGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  kpiCard: {
    marginBottom: 12,
  },
  kpiIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.slate800,
  },
  kpiLabel: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 2,
  },
  pipelineCard: {
    marginBottom: 24,
  },
  pipelineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pipelineGridDesktop: {
    justifyContent: 'space-between',
  },
  pipelineItem: {
    width: '25%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  pipelineCount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.slate800,
  },
  pipelineLabel: {
    fontSize: 11,
    color: colors.slate500,
    marginTop: 4,
    textAlign: 'center',
  },
  notificationsCard: {
    marginBottom: 24,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
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
  emptyText: {
    fontSize: 14,
    color: colors.slate500,
    textAlign: 'center',
    paddingVertical: 16,
  },
  quickActions: {
    gap: 12,
  },
  quickActionsDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate700,
    marginLeft: 12,
  },
});
