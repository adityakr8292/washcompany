import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { useAuth } from '../../context/AuthContext';
import { mockDeliveryJobs } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function DeliveryProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const myJobs = mockDeliveryJobs.filter((j) => j.driverId === user?.id);
  const completedCount = myJobs.filter((j) => j.status === 'completed').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>Delivery Partner · {user?.company}</Text>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={14} color={colors.slate400} />
            <Text style={styles.contactText}>{user?.email}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={14} color={colors.slate400} />
            <Text style={styles.contactText}>{user?.phone}</Text>
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{myJobs.length}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
        </View>

        <Card style={styles.menuCard}>
          <ProfileMenuItem icon="navigate-outline" label="Vehicle Info" value="Van #12" />
          <ProfileMenuItem icon="time-outline" label="Shift" value="8:00 AM - 5:00 PM" />
          <ProfileMenuItem icon="help-circle-outline" label="Support" value="" />
        </Card>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.statusCancelled} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ProfileMenuItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value ? <Text style={styles.menuItemValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color={colors.slate400} />
      </View>
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.slate800,
  },
  role: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 2,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  contactText: {
    fontSize: 13,
    color: colors.slate600,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.slate800,
  },
  statLabel: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  menuCard: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate700,
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 13,
    color: colors.slate500,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.statusCancelledBg,
    paddingVertical: 14,
    borderRadius: 10,
  },
  logoutText: {
    color: colors.statusCancelled,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
});
