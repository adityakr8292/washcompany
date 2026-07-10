import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { useAuth } from '../../context/AuthContext';
import { mockDeliveryJobs } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function DeliveryRouteScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const routeJobs = useMemo(
    () =>
      mockDeliveryJobs
        .filter((j) => j.driverId === user?.id)
        .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()),
    [user]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Route</Text>
        <Text style={styles.subtitle}>{routeJobs.length} stops · Est. 4h 15m</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {routeJobs.map((job, index) => (
          <View key={job.id} style={styles.stopRow}>
            <View style={styles.timeline}>
              <View style={[styles.dot, { backgroundColor: job.status === 'completed' ? colors.statusCompleted : colors.primary }]} />
              {index < routeJobs.length - 1 && <View style={styles.line} />}
            </View>
            <Card style={[styles.stopCard, job.status === 'completed'  ? styles.stopCardCompleted : undefined]}>
              <View style={styles.stopHeader}>
                <Text style={styles.stopTime}>
                  {new Date(job.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={[styles.typePill, { backgroundColor: job.type === 'pickup' ? colors.statusPendingBg : colors.statusCompletedBg }]}>
                  <Text style={[styles.typeText, { color: job.type === 'pickup' ? colors.statusPending : colors.statusCompleted }]}>
                    {job.type}
                  </Text>
                </View>
              </View>
              <Text style={styles.stopClient}>{job.clientCompany}</Text>
              <Text style={styles.stopAddress}>{job.address}</Text>
              {job.notes && <Text style={styles.stopNotes}>{job.notes}</Text>}
            </Card>
          </View>
        ))}
      </ScrollView>
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
  subtitle: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  stopRow: {
    flexDirection: 'row',
  },
  timeline: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.slate300,
    marginVertical: 4,
  },
  stopCard: {
    flex: 1,
    marginBottom: 12,
  },
  stopCardCompleted: {
    opacity: 0.7,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopTime: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate800,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  stopClient: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.slate800,
  },
  stopAddress: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 2,
    lineHeight: 18,
  },
  stopNotes: {
    fontSize: 12,
    color: colors.slate400,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
