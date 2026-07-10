import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { pipelineStages } from '../../data/mockData';
import { fetchOrderById } from '../../services/api';
import type { Order } from '../../types';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AdminStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminOrderDetail'>;

export default function AdminOrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<Order | null>(null);
  const [stage, setStage] = useState('received');

  useEffect(() => {
    let active = true;
    const loadOrder = async () => {
      try {
        const data = await fetchOrderById(orderId);
        if (active) {
          setOrder(data);
          setStage(data.stage);
        }
      } catch (error) {
        console.warn('Unable to load order:', error);
      }
    };

    loadOrder();
    return () => {
      active = false;
    };
  }, [orderId]);

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.slate500 }}>Order not found</Text>
      </View>
    );
  }

  const stageIndex = pipelineStages.findIndex((s) => s.key === stage);

  const advanceStage = () => {
    if (stageIndex < pipelineStages.length - 1) {
      const next = pipelineStages[stageIndex + 1].key;
      setStage(next);
      Alert.alert('Stage Updated', `Order moved to ${pipelineStages[stageIndex + 1].label}`);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.slate700} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{order.orderNumber}</Text>
          <StatusBadge status={order.status} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.clientCard}>
          <View style={styles.clientRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{order.clientName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.clientCompany}>{order.clientCompany}</Text>
              <Text style={styles.clientName}>{order.clientName}</Text>
            </View>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={16} color={colors.slate400} />
            <Text style={styles.contactText}>{order.deliveryAddress}</Text>
          </View>
        </Card>

        <SectionHeader title="Pipeline" icon="git-merge-outline" />
        <Card style={styles.pipelineCard}>
          <View style={styles.pipelineTrack}>
            {pipelineStages.map((s, index) => {
              const isCompleted = index <= stageIndex;
              const isCurrent = index === stageIndex;
              return (
                <View key={s.key} style={styles.pipelineStep}>
                  <View
                    style={[
                      styles.stepDot,
                      isCompleted && styles.stepDotCompleted,
                      isCurrent && styles.stepDotCurrent,
                    ]}
                  >
                    {isCompleted && <Ionicons name="checkmark" size={10} color={colors.white} />}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCompleted && styles.stepLabelCompleted,
                      isCurrent && styles.stepLabelCurrent,
                    ]}
                    numberOfLines={2}
                  >
                    {s.label}
                  </Text>
                </View>
              );
            })}
          </View>
          <TouchableOpacity style={styles.advanceButton} onPress={advanceStage}>
            <Text style={styles.advanceButtonText}>Advance Stage</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </TouchableOpacity>
        </Card>

        <SectionHeader title="Items" icon="list-outline" />
        <Card variant="outlined" style={styles.itemsCard}>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              <View style={styles.itemQty}>
                <Text style={styles.itemQtyText}>×{item.quantity}</Text>
                <Text style={styles.itemPrice}>${item.unitPrice.toFixed(2)}</Text>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </Card>

        <SectionHeader title="Details" icon="information-circle-outline" />
        <Card variant="outlined" style={styles.detailsCard}>
          <DetailRow label="Weight" value={`${order.weight} lbs`} />
          <DetailRow label="Pickup Date" value={order.pickupDate} />
          <DetailRow label="Delivery Date" value={order.deliveryDate} />
          <DetailRow label="Created" value={new Date(order.createdAt).toLocaleString()} />
          <DetailRow label="Last Updated" value={new Date(order.updatedAt).toLocaleString()} />
          {order.notes && <DetailRow label="Notes" value={order.notes} />}
        </Card>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  clientCard: {
    marginBottom: 20,
  },
  clientRow: {
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
  clientCompany: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.slate800,
  },
  clientName: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contactText: {
    fontSize: 13,
    color: colors.slate600,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  pipelineCard: {
    marginBottom: 20,
  },
  pipelineTrack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pipelineStep: {
    width: '16%',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDotCompleted: {
    backgroundColor: colors.statusCompleted,
  },
  stepDotCurrent: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: 10,
    color: colors.slate400,
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: colors.statusCompleted,
    fontWeight: '600',
  },
  stepLabelCurrent: {
    color: colors.primary,
    fontWeight: '700',
  },
  advanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  advanceButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginRight: 8,
  },
  itemsCard: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate800,
  },
  itemCategory: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  itemQty: {
    alignItems: 'flex-end',
  },
  itemQtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate700,
  },
  itemPrice: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  detailsCard: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.slate500,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slate800,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
});
