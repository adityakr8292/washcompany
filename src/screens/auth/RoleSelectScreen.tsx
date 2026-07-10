import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import Ionicons from '@expo/vector-icons/Ionicons';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const roles: RoleOption[] = [
  {
    role: 'admin',
    label: 'Admin',
    description: 'Dashboard, orders, inventory, billing, and reports',
    icon: 'desktop-outline',
  },
  {
    role: 'client',
    label: 'Client',
    description: 'Place orders, track status, manage linen, and pay invoices',
    icon: 'phone-portrait-outline',
  },
  {
    role: 'delivery',
    label: 'Delivery Partner',
    description: 'View routes, pickups, deliveries, and status updates',
    icon: 'navigate-outline',
  },
];

export default function RoleSelectScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.branding}>
        <View style={styles.logoCircle}>
          <Ionicons name="water-outline" size={36} color={colors.white} />
        </View>
        <Text style={styles.brandName}>The Wash Company</Text>
        <Text style={styles.brandTagline}>B2B Laundry Operations Platform</Text>
      </View>

      <View style={[styles.rolesContainer, isDesktop  ? styles.rolesContainerDesktop : undefined]}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.role}
            style={styles.roleCard}
            onPress={() => login(role.role)}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={role.icon} size={28} color={colors.primary} />
            </View>
            <Text style={styles.roleLabel}>{role.label}</Text>
            <Text style={styles.roleDescription}>{role.description}</Text>
            <View style={styles.enterRow}>
              <Text style={styles.enterText}>Enter as {role.label}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.footer}>Select a role to preview the experience. Data is isolated per role.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  branding: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.slate800,
  },
  brandTagline: {
    fontSize: 14,
    color: colors.slate500,
    marginTop: 4,
  },
  rolesContainer: {
    gap: 14,
  },
  rolesContainerDesktop: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  roleCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    minWidth: 280,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate800,
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 13,
    color: colors.slate500,
    lineHeight: 19,
    marginBottom: 16,
  },
  enterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 6,
  },
  footer: {
    fontSize: 12,
    color: colors.slate400,
    textAlign: 'center',
    marginTop: 24,
  },
});
