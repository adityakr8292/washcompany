import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { SearchInput } from '../../components/shared/SearchInput';
import { EmptyState } from '../../components/shared/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { mockLinenItems } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ClientLinenScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const linenItems = useMemo(() => {
    return mockLinenItems
      .filter((l) => l.clientId === user?.id)
      .filter((l) => search.trim() === '' || l.name.toLowerCase().includes(search.toLowerCase()));
  }, [user, search]);

  const totalPar = linenItems.reduce((sum, l) => sum + l.parLevel, 0);
  const totalCurrent = linenItems.reduce((sum, l) => sum + l.currentStock, 0);

  const renderCard = ({ item }: { item: (typeof mockLinenItems)[0] }) => {
    const stockPercent = Math.min((item.currentStock / item.parLevel) * 100, 100);
    const isLow = stockPercent < 80;
    return (
      <Card style={styles.linenCard}>
        <View style={styles.linenHeader}>
          <View>
            <Text style={styles.linenName}>{item.name}</Text>
            <Text style={styles.linenCategory}>{item.category}</Text>
          </View>
          <View style={[styles.stockBadge, { backgroundColor: isLow ? colors.statusCancelledBg : colors.statusCompletedBg }]}>
            <Text style={[styles.stockBadgeText, { color: isLow ? colors.statusCancelled : colors.statusCompleted }]}>
              {Math.round(stockPercent)}%
            </Text>
          </View>
        </View>
        <View style={styles.stockBar}>
          <View style={[styles.stockFill, { width: `${stockPercent}%`, backgroundColor: isLow ? colors.statusCancelled : colors.primary }]} />
        </View>
        <View style={styles.linenStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.currentStock}</Text>
            <Text style={styles.statLabel}>In Stock</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.inUse}</Text>
            <Text style={styles.statLabel}>In Use</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.inLaundry}</Text>
            <Text style={styles.statLabel}>Laundry</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.damaged}</Text>
            <Text style={styles.statLabel}>Damaged</Text>
          </View>
        </View>
        <View style={styles.parRow}>
          <Ionicons name="flag-outline" size={14} color={colors.slate400} />
          <Text style={styles.parText}>Par Level: {item.parLevel} {item.unit}</Text>
        </View>
      </Card>
    );
  };

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, isDesktop ? undefined : { display: 'none' }]}>
      <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Item</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Stock</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>In Use</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Laundry</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Par</Text>
    </View>
  );

  const renderTableRow = ({ item }: { item: (typeof mockLinenItems)[0] }) => (
    <View style={[styles.tableRow, isDesktop ? undefined : { display: 'none' }]}>
      <View style={{ flex: 2 }}>
        <Text style={styles.tableRowStrong}>{item.name}</Text>
        <Text style={styles.tableRowLight}>{item.category}</Text>
      </View>
      <Text style={[styles.tableRowText, { flex: 1 }]}>{item.currentStock}</Text>
      <Text style={[styles.tableRowText, { flex: 1 }]}>{item.inUse}</Text>
      <Text style={[styles.tableRowText, { flex: 1 }]}>{item.inLaundry}</Text>
      <Text style={[styles.tableRowText, { flex: 1 }]}>{item.parLevel}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Linen Inventory</Text>
      </View>

      <View style={styles.summaryCards}>
        <Card style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
          <Text style={styles.summaryValue}>{totalCurrent.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Current Stock</Text>
        </Card>
        <Card style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: colors.slate400 }]}>
          <Text style={styles.summaryValue}>{totalPar.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total Par</Text>
        </Card>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search linen items..." />
      </View>

      {isDesktop && renderTableHeader()}

      <FlatList
        data={linenItems}
        keyExtractor={(item) => item.id}
        renderItem={isDesktop ? renderTableRow : renderCard}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="shirt-outline" title="No linen items" message="Your inventory list is empty." />}
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
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.slate800,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  tableRowStrong: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate800,
  },
  tableRowLight: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  tableRowText: {
    fontSize: 13,
    color: colors.slate600,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  linenCard: {
    marginBottom: 12,
  },
  linenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  linenName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  linenCategory: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stockBar: {
    height: 8,
    backgroundColor: colors.slate200,
    borderRadius: 4,
    marginBottom: 14,
    overflow: 'hidden',
  },
  stockFill: {
    height: '100%',
    borderRadius: 4,
  },
  linenStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  statLabel: {
    fontSize: 10,
    color: colors.slate500,
    marginTop: 2,
  },
  parRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  parText: {
    fontSize: 12,
    color: colors.slate500,
    marginLeft: 8,
  },
});
