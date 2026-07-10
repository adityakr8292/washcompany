import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Card } from '../../components/shared/Card';
import { useAuth } from '../../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const ITEM_OPTIONS = [
  { name: 'Bath Towel', category: 'Towels', unitPrice: 2.25 },
  { name: 'Hand Towel', category: 'Towels', unitPrice: 1.5 },
  { name: 'King Fitted Sheet', category: 'Bed Linen', unitPrice: 4.5 },
  { name: 'Queen Duvet Cover', category: 'Bed Linen', unitPrice: 7.5 },
  { name: 'Pillowcase', category: 'Bed Linen', unitPrice: 1.25 },
  { name: 'Napkin', category: 'Table Linen', unitPrice: 0.75 },
  { name: 'Tablecloth - White', category: 'Table Linen', unitPrice: 6.0 },
];

type Props = {
  navigation: any;
};

export default function ClientNewOrderScreen({ navigation }: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<{ name: string; quantity: number; unitPrice: number }[]>([]);
  const [pickupDate, setPickupDate] = useState('2025-07-12');
  const [deliveryDate, setDeliveryDate] = useState('2025-07-14');
  const [notes, setNotes] = useState('');

  const toggleItem = (option: (typeof ITEM_OPTIONS)[0]) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.name === option.name);
      if (exists) {
        return prev.filter((i) => i.name !== option.name);
      }
      return [...prev, { name: option.name, quantity: 1, unitPrice: option.unitPrice }];
    });
  };

  const updateQuantity = (name: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.name === name) {
          const next = Math.max(1, i.quantity + delta);
          return { ...i, quantity: next };
        }
        return i;
      })
    );
  };

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const submitOrder = () => {
    if (items.length === 0) {
      Alert.alert('Select Items', 'Please add at least one item to your order.');
      return;
    }
    Alert.alert('Order Placed', `Your order has been placed. Total: $${total.toFixed(2)}`, [
      { text: 'OK', onPress: () => navigation.navigate('ClientOrders') },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.slate700} />
        </TouchableOpacity>
        <Text style={styles.title}>New Order</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Select Items</Text>
          {ITEM_OPTIONS.map((option) => {
            const selected = items.find((i) => i.name === option.name);
            return (
              <TouchableOpacity
                key={option.name}
                style={[styles.itemRow, selected  ? styles.itemRowSelected : undefined]}
                onPress={() => toggleItem(option)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{option.name}</Text>
                  <Text style={styles.itemCategory}>{option.category}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemPrice}>${option.unitPrice.toFixed(2)}</Text>
                  {selected ? (
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(option.name, -1)}
                      >
                        <Ionicons name="remove" size={14} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{selected.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(option.name, 1)}
                      >
                        <Ionicons name="add" size={14} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.addCircle}>
                      <Ionicons name="add" size={18} color={colors.primary} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup & Delivery</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pickup Date</Text>
            <TextInput
              style={styles.input}
              value={pickupDate}
              onChangeText={setPickupDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Delivery Date</Text>
            <TextInput
              style={styles.input}
              value={deliveryDate}
              onChangeText={setDeliveryDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Special Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special requests..."
              multiline
              numberOfLines={3}
            />
          </View>
        </Card>

        <Card style={styles.totalCard}>
          <Text style={styles.totalLabel}>Estimated Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </Card>

        <TouchableOpacity style={styles.submitButton} onPress={submitOrder}>
          <Text style={styles.submitButtonText}>Place Order</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate800,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemRowSelected: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: -16,
    paddingHorizontal: 16,
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
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  addCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    padding: 6,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate800,
    minWidth: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate500,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.slate800,
    backgroundColor: colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.slate700,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
    marginRight: 8,
  },
});
