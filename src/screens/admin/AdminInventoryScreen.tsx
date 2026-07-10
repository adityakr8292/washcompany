import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { SearchInput } from '../../components/shared/SearchInput';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { mockInventoryProducts } from '../../data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AdminInventoryScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const filteredProducts = useMemo(() => {
    return mockInventoryProducts.filter(
      (p) =>
        search.trim() === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const lowStockCount = mockInventoryProducts.filter((p) => p.stockLevel <= p.reorderPoint).length;

  const renderProductCard = ({ item }: { item: (typeof mockInventoryProducts)[0] }) => {
    const isLow = item.stockLevel <= item.reorderPoint;
    return (
      <Card style={styles.productCard}>
        <View style={styles.productHeader}>
          <View>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productSku}>{item.sku}</Text>
          </View>
          <StatusBadge status={isLow ? 'low' : 'normal'} />
        </View>
        <View style={styles.productMeta}>
          <View style={styles.metaBox}>
            <Text style={styles.metaValue}>{item.stockLevel}</Text>
            <Text style={styles.metaLabel}>In Stock ({item.unit})</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaValue}>{item.reorderPoint}</Text>
            <Text style={styles.metaLabel}>Reorder Point</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaValue}>${item.costPerUnit.toFixed(2)}</Text>
            <Text style={styles.metaLabel}>Unit Cost</Text>
          </View>
        </View>
        <View style={styles.productFooter}>
          <Ionicons name="business-outline" size={14} color={colors.slate400} />
          <Text style={styles.supplierText}>{item.supplier} · Restocked {item.lastRestocked}</Text>
        </View>
      </Card>
    );
  };

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, isDesktop ? undefined : { display: 'none' }]}>
      <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Product</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Stock</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Reorder</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
      <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Supplier</Text>
    </View>
  );

  const renderTableRow = ({ item }: { item: (typeof mockInventoryProducts)[0] }) => {
    const isLow = item.stockLevel <= item.reorderPoint;
    return (
      <View style={[styles.tableRow, isDesktop ? undefined : { display: 'none' }]}>
        <View style={{ flex: 3 }}>
          <Text style={styles.tableRowStrong}>{item.name}</Text>
          <Text style={styles.tableRowLight}>{item.sku}</Text>
        </View>
        <Text style={[styles.tableRowText, { flex: 1 }]}>
          {item.stockLevel} {item.unit}
        </Text>
        <Text style={[styles.tableRowText, { flex: 1 }]}>{item.reorderPoint}</Text>
        <View style={{ flex: 1 }}>
          <StatusBadge status={isLow ? 'low' : 'normal'} size="sm" />
        </View>
        <Text style={[styles.tableRowText, { flex: 2 }]}>{item.supplier}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add Stock</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCards}>
        <Card style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
          <Text style={styles.summaryValue}>{mockInventoryProducts.length}</Text>
          <Text style={styles.summaryLabel}>Total SKUs</Text>
        </Card>
        <Card style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: colors.statusCancelled }]}>
          <Text style={styles.summaryValue}>{lowStockCount}</Text>
          <Text style={styles.summaryLabel}>Low Stock</Text>
        </Card>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search products, SKUs..." />
      </View>

      {isDesktop && renderTableHeader()}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={isDesktop ? renderTableRow : renderProductCard}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="No products found" message="Try adjusting your search." />}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
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
  productCard: {
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  productSku: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metaBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate800,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.slate500,
    marginTop: 2,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  supplierText: {
    fontSize: 12,
    color: colors.slate500,
    marginLeft: 8,
  },
});
