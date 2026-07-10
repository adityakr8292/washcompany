import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import Ionicons from '@expo/vector-icons/Ionicons';

// Auth
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';

// Admin
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminOrderDetailScreen from '../screens/admin/AdminOrderDetailScreen';
import AdminInventoryScreen from '../screens/admin/AdminInventoryScreen';
import AdminBillingScreen from '../screens/admin/AdminBillingScreen';
import AdminCustomersScreen from '../screens/admin/AdminCustomersScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';

// Client
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import ClientOrdersScreen from '../screens/client/ClientOrdersScreen';
import ClientOrderDetailScreen from '../screens/client/ClientOrderDetailScreen';
import ClientLinenScreen from '../screens/client/ClientLinenScreen';
import ClientScheduleScreen from '../screens/client/ClientScheduleScreen';
import ClientInvoicesScreen from '../screens/client/ClientInvoicesScreen';
import ClientPaymentsScreen from '../screens/client/ClientPaymentsScreen';
import ClientNewOrderScreen from '../screens/client/ClientNewOrderScreen';

// Delivery
import DeliveryHomeScreen from '../screens/delivery/DeliveryHomeScreen';
import DeliveryRouteScreen from '../screens/delivery/DeliveryRouteScreen';
import DeliveryHistoryScreen from '../screens/delivery/DeliveryHistoryScreen';
import DeliveryProfileScreen from '../screens/delivery/DeliveryProfileScreen';
import DeliveryJobDetailScreen from '../screens/delivery/DeliveryJobDetailScreen';

// Admin types
export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminOrders: undefined;
  AdminInventory: undefined;
  AdminBilling: undefined;
  AdminCustomers: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  AdminOrderDetail: { orderId: string };
  AdminNotifications: undefined;
};

// Client types
export type ClientTabParamList = {
  ClientHome: undefined;
  ClientOrders: undefined;
  ClientLinen: undefined;
  ClientSchedule: undefined;
  ClientAccount: undefined;
};

export type ClientStackParamList = {
  ClientTabs: undefined;
  ClientOrderDetail: { orderId: string };
  ClientNewOrder: undefined;
  ClientInvoices: undefined;
  ClientPayments: undefined;
};

// Delivery types
export type DeliveryTabParamList = {
  DeliveryHome: undefined;
  DeliveryRoute: undefined;
  DeliveryHistory: undefined;
  DeliveryProfile: undefined;
};

export type DeliveryStackParamList = {
  DeliveryTabs: undefined;
  DeliveryJobDetail: { jobId: string };
};

const AdminTab = createBottomTabNavigator<AdminTabParamList>();
const ClientTab = createBottomTabNavigator<ClientTabParamList>();
const DeliveryTab = createBottomTabNavigator<DeliveryTabParamList>();

const AdminStack = createNativeStackNavigator<AdminStackParamList>();
const ClientStack = createNativeStackNavigator<ClientStackParamList>();
const DeliveryStack = createNativeStackNavigator<DeliveryStackParamList>();

const tabBarScreenOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.backgroundSecondary,
    borderTopColor: colors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.slate400,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
};

function AdminTabs() {
  return (
    <AdminTab.Navigator
      screenOptions={({ route }) => ({
        ...tabBarScreenOptions,
        tabBarIcon: ({ color, size }) => {
          const iconName: Record<string, keyof typeof Ionicons.glyphMap> = {
            AdminDashboard: 'grid-outline',
            AdminOrders: 'list-outline',
            AdminInventory: 'cube-outline',
            AdminBilling: 'card-outline',
            AdminCustomers: 'people-outline',
          };
          return <Ionicons name={iconName[route.name]} size={size} color={color} />;
        },
      })}
    >
      <AdminTab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <AdminTab.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ tabBarLabel: 'Orders' }} />
      <AdminTab.Screen name="AdminInventory" component={AdminInventoryScreen} options={{ tabBarLabel: 'Inventory' }} />
      <AdminTab.Screen name="AdminBilling" component={AdminBillingScreen} options={{ tabBarLabel: 'Billing' }} />
      <AdminTab.Screen name="AdminCustomers" component={AdminCustomersScreen} options={{ tabBarLabel: 'Customers' }} />
    </AdminTab.Navigator>
  );
}

function ClientTabs() {
  return (
    <ClientTab.Navigator
      screenOptions={({ route }) => ({
        ...tabBarScreenOptions,
        tabBarIcon: ({ color, size }) => {
          const iconName: Record<string, keyof typeof Ionicons.glyphMap> = {
            ClientHome: 'home-outline',
            ClientOrders: 'list-outline',
            ClientLinen: 'shirt-outline',
            ClientSchedule: 'calendar-outline',
            ClientAccount: 'person-outline',
          };
          return <Ionicons name={iconName[route.name]} size={size} color={color} />;
        },
      })}
    >
      <ClientTab.Screen name="ClientHome" component={ClientHomeScreen} options={{ tabBarLabel: 'Home' }} />
      <ClientTab.Screen name="ClientOrders" component={ClientOrdersScreen} options={{ tabBarLabel: 'Orders' }} />
      <ClientTab.Screen name="ClientLinen" component={ClientLinenScreen} options={{ tabBarLabel: 'Linen' }} />
      <ClientTab.Screen name="ClientSchedule" component={ClientScheduleScreen} options={{ tabBarLabel: 'Schedule' }} />
      <ClientTab.Screen name="ClientAccount" component={ClientInvoicesScreen} options={{ tabBarLabel: 'Account' }} />
    </ClientTab.Navigator>
  );
}

function DeliveryTabs() {
  return (
    <DeliveryTab.Navigator
      screenOptions={({ route }) => ({
        ...tabBarScreenOptions,
        tabBarIcon: ({ color, size }) => {
          const iconName: Record<string, keyof typeof Ionicons.glyphMap> = {
            DeliveryHome: 'home-outline',
            DeliveryRoute: 'navigate-outline',
            DeliveryHistory: 'time-outline',
            DeliveryProfile: 'person-outline',
          };
          return <Ionicons name={iconName[route.name]} size={size} color={color} />;
        },
      })}
    >
      <DeliveryTab.Screen name="DeliveryHome" component={DeliveryHomeScreen} options={{ tabBarLabel: 'Jobs' }} />
      <DeliveryTab.Screen name="DeliveryRoute" component={DeliveryRouteScreen} options={{ tabBarLabel: 'Route' }} />
      <DeliveryTab.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} options={{ tabBarLabel: 'History' }} />
      <DeliveryTab.Screen name="DeliveryProfile" component={DeliveryProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </DeliveryTab.Navigator>
  );
}

function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminTabs" component={AdminTabs} />
      <AdminStack.Screen name="AdminOrderDetail" component={AdminOrderDetailScreen} />
      <AdminStack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
    </AdminStack.Navigator>
  );
}

function ClientNavigator() {
  return (
    <ClientStack.Navigator screenOptions={{ headerShown: false }}>
      <ClientStack.Screen name="ClientTabs" component={ClientTabs} />
      <ClientStack.Screen name="ClientOrderDetail" component={ClientOrderDetailScreen} />
      <ClientStack.Screen name="ClientNewOrder" component={ClientNewOrderScreen} />
      <ClientStack.Screen name="ClientInvoices" component={ClientInvoicesScreen} />
      <ClientStack.Screen name="ClientPayments" component={ClientPaymentsScreen} />
    </ClientStack.Navigator>
  );
}

function DeliveryNavigator() {
  return (
    <DeliveryStack.Navigator screenOptions={{ headerShown: false }}>
      <DeliveryStack.Screen name="DeliveryTabs" component={DeliveryTabs} />
      <DeliveryStack.Screen name="DeliveryJobDetail" component={DeliveryJobDetailScreen} />
    </DeliveryStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {!user || !role ? (
        <RoleSelectScreen />
      ) : role === 'admin' ? (
        <AdminNavigator />
      ) : role === 'client' ? (
        <ClientNavigator />
      ) : (
        <DeliveryNavigator />
      )}
    </NavigationContainer>
  );
}
