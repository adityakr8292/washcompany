import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { mockNotifications } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AdminNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(
    mockNotifications.filter((n) => n.role === 'admin' || !n.role)
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const renderNotification = ({ item }: { item: (typeof notifications)[0] }) => (
    <TouchableOpacity onPress={() => markRead(item.id)}>
      <Card style={[styles.notificationCard, item.read  ? styles.notificationCardRead : undefined]}>
        <View style={styles.notificationHeader}>
          <View style={styles.titleRow}>
            {!item.read && <View style={styles.unreadDot} />}
            <Text style={[styles.notificationTitle, item.read  ? styles.readText : undefined]}>{item.title}</Text>
          </View>
          <StatusBadge status={item.type} size="sm" />
        </View>
        <Text style={[styles.notificationMessage, item.read  ? styles.readText : undefined]}>{item.message}</Text>
        <Text style={styles.notificationTime}>{new Date(item.createdAt).toLocaleString()}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="No notifications" message="You\'re all caught up." />}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.slate800,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  notificationCard: {
    marginBottom: 10,
  },
  notificationCardRead: {
    backgroundColor: colors.backgroundTertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  notificationMessage: {
    fontSize: 13,
    color: colors.slate600,
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 11,
    color: colors.slate400,
  },
  readText: {
    color: colors.slate500,
    fontWeight: '400',
  },
});
