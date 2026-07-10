import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { mockDeliveryJobs } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DeliveryStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<DeliveryStackParamList, 'DeliveryJobDetail'>;

export default function DeliveryJobDetailScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const insets = useSafeAreaInsets();
  const job = mockDeliveryJobs.find((j) => j.id === jobId);
  const [status, setStatus] = useState(job?.status || 'assigned');

  if (!job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.slate500 }}>Job not found</Text>
      </View>
    );
  }

  const callClient = () => {
    Linking.openURL(`tel:${job.contactPhone.replace(/\D/g, '')}`);
  };

  const openMaps = () => {
    const query = encodeURIComponent(job.address);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  const updateStatus = (newStatus: typeof status) => {
    setStatus(newStatus);
    Alert.alert('Status Updated', `Job marked as ${newStatus.replace('_', ' ')}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.slate700} />
        </TouchableOpacity>
        <Text style={styles.title}>{job.orderNumber}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.typeIcon, { backgroundColor: job.type === 'pickup' ? colors.statusPendingBg : colors.statusCompletedBg }]}>
              <Ionicons
                name={job.type === 'pickup' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
                size={28}
                color={job.type === 'pickup' ? colors.statusPending : colors.statusCompleted}
              />
            </View>
            <View>
              <Text style={styles.statusTitle}>{job.type === 'pickup' ? 'Pickup' : 'Delivery'}</Text>
              <Text style={[styles.statusValue, { color: status === 'completed' ? colors.statusCompleted : status === 'in_progress' ? colors.statusProcessing : colors.slate600 }]}>
                {status.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.scheduledTime}>
            Scheduled for {new Date(job.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Card>

        <Card style={styles.clientCard}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text style={styles.clientCompany}>{job.clientCompany}</Text>
          <Text style={styles.clientName}>{job.clientName}</Text>
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={16} color={colors.slate400} />
            <Text style={styles.contactText}>{job.address}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={16} color={colors.slate400} />
            <Text style={styles.contactText}>{job.contactPhone}</Text>
          </View>
        </Card>

        {job.notes && (
          <Card style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{job.notes}</Text>
          </Card>
        )}

        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={callClient}>
            <Ionicons name="call-outline" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Call Client</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.mapButton]} onPress={openMaps}>
            <Ionicons name="map-outline" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Open Maps</Text>
          </TouchableOpacity>
        </View>

        {status !== 'completed' && status !== 'cancelled' && (
          <View style={styles.statusActions}>
            {status === 'assigned' && (
              <TouchableOpacity style={styles.primaryButton} onPress={() => updateStatus('in_progress')}>
                <Ionicons name="navigate-outline" size={18} color={colors.white} />
                <Text style={styles.primaryButtonText}>Start Job</Text>
              </TouchableOpacity>
            )}
            {status === 'in_progress' && (
              <TouchableOpacity style={styles.primaryButton} onPress={() => updateStatus('completed')}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
                <Text style={styles.primaryButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate800,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate800,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  scheduledTime: {
    fontSize: 14,
    color: colors.slate600,
  },
  clientCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  clientCompany: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.slate800,
  },
  clientName: {
    fontSize: 14,
    color: colors.slate500,
    marginTop: 2,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.slate600,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  notesCard: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: colors.slate700,
    lineHeight: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  callButton: {
    backgroundColor: colors.statusProcessing,
  },
  mapButton: {
    backgroundColor: colors.statusCompleted,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusActions: {
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
});
