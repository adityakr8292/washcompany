import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { OrderStatus, OrderStage, DeliveryJob, Invoice, Customer, Payment } from '../../types';

type BadgeEntity =
  | OrderStatus
  | OrderStage
  | DeliveryJob['status']
  | Invoice['status']
  | Customer['status']
  | Payment['status']
  | 'low'
  | 'normal'
  | 'ready'
  | 'info'
  | 'warning'
  | 'success'
  | 'error';

interface StatusBadgeProps {
  status: BadgeEntity;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const { backgroundColor, textColor, displayLabel } = getBadgeStyle(status, label);

  return (
    <View style={[styles.badge, { backgroundColor }, size === 'sm'  ? styles.badgeSmall : undefined]}>
      <Text style={[styles.text, { color: textColor }, size === 'sm'  ? styles.textSmall : undefined]}>
        {displayLabel}
      </Text>
    </View>
  );
}

function getBadgeStyle(status: BadgeEntity, label?: string) {
  switch (status) {
    case 'pending':
      return { backgroundColor: colors.statusPendingBg, textColor: colors.statusPending, displayLabel: label || 'Pending' };
    case 'processing':
      return { backgroundColor: colors.statusProcessingBg, textColor: colors.statusProcessing, displayLabel: label || 'Processing' };
    case 'ready':
      return { backgroundColor: colors.statusReadyBg, textColor: colors.statusReady, displayLabel: label || 'Ready' };
    case 'out_for_delivery':
      return { backgroundColor: colors.statusOutForDeliveryBg, textColor: colors.statusOutForDelivery, displayLabel: label || 'Out for Delivery' };
    case 'completed':
    case 'delivered':
      return { backgroundColor: colors.statusCompletedBg, textColor: colors.statusCompleted, displayLabel: label || 'Completed' };
    case 'cancelled':
      return { backgroundColor: colors.statusCancelledBg, textColor: colors.statusCancelled, displayLabel: label || 'Cancelled' };
    case 'assigned':
      return { backgroundColor: colors.slate100, textColor: colors.slate600, displayLabel: label || 'Assigned' };
    case 'in_progress':
      return { backgroundColor: colors.statusProcessingBg, textColor: colors.statusProcessing, displayLabel: label || 'In Progress' };
    case 'paid':
      return { backgroundColor: colors.statusCompletedBg, textColor: colors.statusCompleted, displayLabel: label || 'Paid' };
    case 'overdue':
      return { backgroundColor: colors.statusCancelledBg, textColor: colors.statusCancelled, displayLabel: label || 'Overdue' };
    case 'low':
      return { backgroundColor: colors.statusCancelledBg, textColor: colors.statusCancelled, displayLabel: label || 'Low Stock' };
    case 'normal':
      return { backgroundColor: colors.statusCompletedBg, textColor: colors.statusCompleted, displayLabel: label || 'OK' };
    case 'info':
      return { backgroundColor: colors.statusProcessingBg, textColor: colors.statusProcessing, displayLabel: label || 'Info' };
    case 'warning':
      return { backgroundColor: colors.statusPendingBg, textColor: colors.statusPending, displayLabel: label || 'Warning' };
    case 'success':
      return { backgroundColor: colors.statusCompletedBg, textColor: colors.statusCompleted, displayLabel: label || 'Success' };
    case 'error':
      return { backgroundColor: colors.statusCancelledBg, textColor: colors.statusCancelled, displayLabel: label || 'Error' };
    case 'active':
      return { backgroundColor: colors.statusCompletedBg, textColor: colors.statusCompleted, displayLabel: label || 'Active' };
    case 'inactive':
      return { backgroundColor: colors.slate200, textColor: colors.slate600, displayLabel: label || 'Inactive' };
    case 'failed':
      return { backgroundColor: colors.statusCancelledBg, textColor: colors.statusCancelled, displayLabel: label || 'Failed' };
    case 'received':
    case 'pickup_scheduled':
    case 'picked_up':
    case 'received_at_facility':
    case 'sorting':
    case 'washing':
    case 'drying':
    case 'pressing':
    case 'quality_check':
    case 'packing':
      return { backgroundColor: colors.statusProcessingBg, textColor: colors.statusProcessing, displayLabel: label || 'Processing' };
    default:
      return { backgroundColor: colors.slate100, textColor: colors.slate600, displayLabel: label || status };
  }
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textSmall: {
    fontSize: 10,
    fontWeight: '500',
  },
});
