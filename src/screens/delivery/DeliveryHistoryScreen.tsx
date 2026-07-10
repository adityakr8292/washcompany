import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { EmptyState } from '../../components/shared/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { mockDeliveryJobs } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function DeliveryHistoryScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const completedJobs = useMemo(
    () =>
      mockDeliveryJobs
        .filter((j) => j.driverId === user?.id && j.status === 'completed')
        .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()),
    [user]
  );

  const renderJob = ({ item }: { item: (typeof mockDeliveryJobs)[0] }) => (
    <Card style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Ionicons
          name={item.type === 'pickup' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
          size={24}
          color={item.type === 'pickup' ? colors.statusPending : colors.statusCompleted}
        />
        <View style={styles.jobInfo}>
          <Text style={styles.jobOrder}>{item.orderNumber}</Text>
          <Text style={styles.jobClient}>{item.clientCompany}</Text>
        </View>
        <Text style={styles.jobDate}>{new Date(item.scheduledTime).toLocaleDateString()}</Text>
      </View>
      <View style={styles.jobFooter}>
        <Ionicons name="time-outline" size={14} color={colors.slate400} />
        <Text style={styles.footerText}>
          Completed {item.completedTime ? new Date(item.completedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <FlatList
        data={completedJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="time-outline" title="No completed jobs" message="Completed jobs will appear here." />}
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  jobCard: {
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
    marginLeft: 12,
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
  jobDate: {
    fontSize: 12,
    color: colors.slate400,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: colors.slate500,
    marginLeft: 6,
  },
});
