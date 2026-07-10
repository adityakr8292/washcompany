import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { EmptyState } from '../../components/shared/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { mockOrders } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ClientScheduleScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const clientOrders = useMemo(() => mockOrders.filter((o) => o.clientId === user?.id), [user]);

  const upcomingEvents = useMemo(() => {
    return clientOrders
      .map((o) => [
        { date: o.pickupDate, type: 'Pickup', orderNumber: o.orderNumber, status: o.status },
        { date: o.deliveryDate, type: 'Delivery', orderNumber: o.orderNumber, status: o.status },
      ])
      .flat()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [clientOrders]);

  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const renderDay = (day: number) => {
    const isSelected = day === selectedDate;
    const hasEvent = upcomingEvents.some((e) => new Date(e.date).getDate() === day && new Date(e.date).getMonth() === today.getMonth());
    return (
      <TouchableOpacity
        key={day}
        style={[styles.dayCell, isSelected  ? styles.dayCellSelected : undefined]}
        onPress={() => setSelectedDate(day)}
      >
        <Text style={[styles.dayText, isSelected  ? styles.dayTextSelected : undefined]}>{day}</Text>
        {hasEvent && <View style={styles.eventDot} />}
      </TouchableOpacity>
    );
  };

  const selectedEvents = upcomingEvents.filter((e) => new Date(e.date).getDate() === selectedDate);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Delivery Schedule</Text>
      </View>

      <Card style={styles.calendarCard}>
        <Text style={styles.monthLabel}>{currentMonth}</Text>
        <View style={styles.daysHeader}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.dayHeaderText}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => renderDay(i + 1))}
        </View>
      </Card>

      <Text style={styles.eventsTitle}>
        Events for {currentMonth.split(' ')[0]} {selectedDate}
      </Text>

      <FlatList
        data={selectedEvents}
        keyExtractor={(item, index) => `${item.orderNumber}-${item.type}-${index}`}
        renderItem={({ item }) => (
          <Card style={styles.eventCard}>
            <View style={[styles.eventIcon, { backgroundColor: item.type === 'Pickup' ? colors.statusPendingBg : colors.statusCompletedBg }]}>
              <Ionicons
                name={item.type === 'Pickup' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
                size={20}
                color={item.type === 'Pickup' ? colors.statusPending : colors.statusCompleted}
              />
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventType}>{item.type}</Text>
              <Text style={styles.eventOrder}>{item.orderNumber}</Text>
            </View>
            <Text style={styles.eventDate}>{item.date}</Text>
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="calendar-outline" title="No events" message="No pickups or deliveries scheduled for this day." />
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
  calendarCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate800,
    marginBottom: 12,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate500,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    color: colors.slate700,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.statusPending,
    marginTop: 2,
  },
  eventsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.slate800,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventType: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  eventOrder: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  eventDate: {
    fontSize: 13,
    color: colors.slate600,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
