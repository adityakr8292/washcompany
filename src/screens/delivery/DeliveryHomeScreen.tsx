import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { EmptyState } from '../../components/shared/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { fetchDeliveryJobs } from '../../services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { DeliveryTabParamList, DeliveryStackParamList } from '../../navigation/AppNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DeliveryTabParamList, 'DeliveryHome'>,
  NativeStackScreenProps<DeliveryStackParamList>
>;

export default function DeliveryHomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<Array<{ id: string; orderId: string; orderNumber: string; type: 'pickup' | 'delivery'; status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'; clientName: string; clientCompany: string; address: string; contactPhone: string; scheduledTime: string; completedTime?: string; driverId: string }>>([]);

  const loadJobs = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchDeliveryJobs(user.id);
      setJobs(data);
    } catch (error) {
      console.warn('Falling back to mock delivery jobs:', error);
      setJobs([]);
    }
  }, [user?.id]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }, [loadJobs]);

  const myJobs = useMemo(() => jobs.filter((j) => j.driverId === user?.id), [jobs, user]);
  const activeJobs = myJobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled');
  const completedJobs = myJobs.filter((j) => j.status === 'completed');

  const startJob = (jobId: string) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'in_progress' } : j)));
  };

  const completeJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, status: 'completed', completedTime: new Date().toISOString() }
          : j
      )
    );
  };

  const renderJob = ({ item }: { item: (typeof jobs)[0] }) => (
    <Card
      onPress={() => navigation.navigate('DeliveryJobDetail', { jobId: item.id })}
      style={styles.jobCard}
    >
      <View style={styles.jobHeader}>
        <View style={[styles.typeIcon, { backgroundColor: item.type === 'pickup' ? colors.statusPendingBg : colors.statusCompletedBg }]}>
          <Ionicons
            name={item.type === 'pickup' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
            size={22}
            color={item.type === 'pickup' ? colors.statusPending : colors.statusCompleted}
          />
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobOrder}>{item.orderNumber}</Text>
          <Text style={styles.jobClient}>{item.clientCompany}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: item.status === 'completed' ? colors.statusCompletedBg : item.status === 'in_progress' ? colors.statusProcessingBg : colors.slate100 }]}>
          <Text style={[styles.statusText, { color: item.status === 'completed' ? colors.statusCompleted : item.status === 'in_progress' ? colors.statusProcessing : colors.slate600 }]}>
            {item.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
      <View style={styles.jobMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.slate400} />
          <Text style={styles.metaText}>{new Date(item.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
      {item.status !== 'completed' && item.status !== 'cancelled' && (
        <View style={styles.actions}>
          {item.status === 'assigned' ? (
            <TouchableOpacity style={styles.actionButton} onPress={() => startJob(item.id)}>
              <Ionicons name="navigate-outline" size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={() => completeJob(item.id)}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name.split(' ')[0]}</Text>
          <Text style={styles.subtitle}>{activeJobs.length} active stops today</Text>
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
          <View style={styles.scrollContent}>
            <SectionHeader
              title="Active Jobs"
              actionLabel="View Route"
              onAction={() => navigation.navigate('DeliveryRoute')}
              icon="navigate-outline"
            />
            {activeJobs.length === 0 ? (
              <Card variant="outlined" style={styles.emptyCard}>
                <Text style={styles.emptyText}>No active jobs. Enjoy your break.</Text>
              </Card>
            ) : (
              activeJobs.map((job) => <View key={job.id}>{renderJob({ item: job })}</View>)
            )}

            {completedJobs.length > 0 && (
              <>
                <SectionHeader title="Completed Today" icon="checkmark-circle-outline" />
                {completedJobs.slice(0, 3).map((job) => (
                  <View key={job.id}>{renderJob({ item: job })}</View>
                ))}
              </>
            )}
          </View>
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
  jobCard: {
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobOrder: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  jobClient: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  jobMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.slate600,
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 6,
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
});
