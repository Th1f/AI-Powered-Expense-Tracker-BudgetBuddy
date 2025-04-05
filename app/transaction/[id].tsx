import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Animated
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/Theme';

// Define interfaces for type safety
interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  note: string;
  merchant: string;
  paymentMethod: string;
  location: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CategoryMapItem {
  icon: string;
  color: string;
}

interface CategoryMap {
  [key: string]: CategoryMapItem;
}

// Mock transactions for demonstration
const mockTransactions: Transaction[] = [
  { id: '1', title: 'Grocery Store', amount: 45.67, category: 'food', date: new Date(2025, 3, 2), note: 'Weekly grocery shopping', merchant: 'Whole Foods', paymentMethod: 'Credit Card', location: '123 Main St' },
  { id: '2', title: 'Uber Ride', amount: 12.50, category: 'transport', date: new Date(2025, 3, 1), note: 'Trip to airport', merchant: 'Uber', paymentMethod: 'Credit Card', location: 'Airport Rd' },
  { id: '3', title: 'Coffee Shop', amount: 4.25, category: 'food', date: new Date(2025, 3, 1), note: 'Morning coffee', merchant: 'Starbucks', paymentMethod: 'Debit Card', location: '456 Oak Ave' },
  { id: '4', title: 'Amazon Purchase', amount: 29.99, category: 'shopping', date: new Date(2025, 2, 30), note: 'New headphones', merchant: 'Amazon', paymentMethod: 'Credit Card', location: 'Online' },
  { id: '5', title: 'Movie Tickets', amount: 22.00, category: 'entertainment', date: new Date(2025, 2, 28), note: 'Movie with friends', merchant: 'Cineplex', paymentMethod: 'Cash', location: 'Downtown Mall' },
];

// Category mapping for icons and colors
const categoryMap: CategoryMap = {
  food: { icon: 'restaurant', color: '#F97316' },
  transport: { icon: 'car', color: '#8B5CF6' },
  shopping: { icon: 'bag-handle', color: '#EC4899' },
  entertainment: { icon: 'film', color: '#06B6D4' },
  utilities: { icon: 'flash', color: '#F59E0B' },
  health: { icon: 'medkit', color: '#EF4444' },
  other: { icon: 'ellipsis-horizontal', color: '#6B7280' }
};

// Categories for selection
const categories: Category[] = Object.keys(categoryMap).map(key => ({
  id: key,
  name: key.charAt(0).toUpperCase() + key.slice(1),
  icon: categoryMap[key].icon,
  color: categoryMap[key].color
}));

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Animation values
  const deleteAnim = React.useRef(new Animated.Value(0)).current;
  const saveAnim = React.useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const foundTransaction = mockTransactions.find(t => t.id === id);
    if (foundTransaction) {
      setTransaction(foundTransaction);
      setEditedTransaction({...foundTransaction});
    } else {
      Alert.alert('Error', 'Transaction not found');
      router.back();
    }
  }, [id]);
  
  const toggleEdit = () => {
    if (isEditing && editedTransaction && transaction) {
      // Save changes
      setTransaction({...editedTransaction});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Animate save button
      Animated.sequence([
        Animated.timing(saveAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(saveAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsEditing(!isEditing);
  };
  
  const startDeleteProcess = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsDeleting(true);
    
    Animated.timing(deleteAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  };
  
  const cancelDelete = () => {
    Animated.timing(deleteAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setIsDeleting(false);
    });
  };
  
  const confirmDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // In a real app, this would call an API to delete the transaction
    Alert.alert('Success', 'Transaction deleted successfully');
    router.back();
  };
  
  const handleInputChange = (field: keyof Transaction, value: string | number) => {
    if (editedTransaction) {
      setEditedTransaction({
        ...editedTransaction,
        [field]: value
      });
    }
  };
  
  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except for decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 1 
      ? parts[0] + '.' + parts.slice(1).join('')
      : numericValue;
    
    if (editedTransaction) {
      setEditedTransaction({
        ...editedTransaction,
        amount: parseFloat(formattedValue) || 0
      });
    }
  };
  
  const handleCategorySelect = (category: Category) => {
    if (editedTransaction) {
      setEditedTransaction({
        ...editedTransaction,
        category: category.id
      });
    }
  };
  
  if (!transaction) return null;
  
  const deleteTranslateY = deleteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0]
  });
  
  const deleteOpacity = deleteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Transaction Details',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={toggleEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View 
            style={[
              styles.categoryIcon, 
              { backgroundColor: categoryMap[transaction.category]?.color || Colors.primary }
            ]}
          >
            <Ionicons 
              name={(categoryMap[transaction.category]?.icon || 'ellipsis-horizontal') as any} 
              size={28} 
              color="#fff" 
            />
          </View>
          
          {isEditing && editedTransaction ? (
            <TextInput
              style={styles.titleInput}
              value={editedTransaction.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
          ) : (
            <Text style={styles.title}>{transaction.title}</Text>
          )}
          
          <View style={styles.amountContainer}>
            {isEditing && editedTransaction ? (
              <View style={styles.amountInputContainer}>
                <Text style={styles.amountPrefix}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={editedTransaction.amount.toString()}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                />
              </View>
            ) : (
              <Text style={styles.amount}>
                ${Number(transaction.amount).toFixed(2)}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {transaction.date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            {isEditing && editedTransaction ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelector}
              >
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      cat.id === editedTransaction.category && styles.selectedCategory
                    ]}
                    onPress={() => handleCategorySelect(cat)}
                  >
                    <View 
                      style={[
                        styles.categoryBubble,
                        { backgroundColor: cat.color }
                      ]}
                    >
                      <Ionicons name={cat.icon as any} size={16} color="#fff" />
                    </View>
                    <Text 
                      style={[
                        styles.categoryName,
                        cat.id === editedTransaction.category && styles.selectedCategoryText
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.categoryTag}>
                <View 
                  style={[
                    styles.categoryDot,
                    { backgroundColor: categoryMap[transaction.category]?.color || Colors.primary }
                  ]}
                />
                <Text style={styles.detailValue}>
                  {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Merchant</Text>
            {isEditing && editedTransaction ? (
              <TextInput
                style={styles.detailInput}
                value={editedTransaction.merchant}
                onChangeText={(text) => handleInputChange('merchant', text)}
              />
            ) : (
              <Text style={styles.detailValue}>{transaction.merchant}</Text>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            {isEditing && editedTransaction ? (
              <TextInput
                style={styles.detailInput}
                value={editedTransaction.paymentMethod}
                onChangeText={(text) => handleInputChange('paymentMethod', text)}
              />
            ) : (
              <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            {isEditing && editedTransaction ? (
              <TextInput
                style={styles.detailInput}
                value={editedTransaction.location}
                onChangeText={(text) => handleInputChange('location', text)}
              />
            ) : (
              <Text style={styles.detailValue}>{transaction.location}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.noteSection}>
          <Text style={styles.noteSectionTitle}>Notes</Text>
          {isEditing && editedTransaction ? (
            <TextInput
              style={styles.noteInput}
              value={editedTransaction.note}
              onChangeText={(text) => handleInputChange('note', text)}
              multiline
              numberOfLines={4}
              placeholder="Add notes here..."
              placeholderTextColor={Colors.textSecondary}
            />
          ) : (
            <Text style={styles.noteText}>{transaction.note}</Text>
          )}
        </View>
        
        {!isEditing && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={startDeleteProcess}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.deleteButtonText}>Delete Transaction</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {isDeleting && (
        <View style={styles.deleteOverlay}>
          <Animated.View 
            style={[
              styles.deleteConfirmBox,
              {
                transform: [{ translateY: deleteTranslateY }],
                opacity: deleteOpacity
              }
            ]}
          >
            <Ionicons name="warning" size={32} color={Colors.danger} style={styles.warningIcon} />
            <Text style={styles.deleteTitle}>Delete Transaction</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </Text>
            
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.m,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.m,
    ...Shadow.medium,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.s,
  },
  titleInput: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingBottom: Spacing.xs,
    minWidth: '80%',
  },
  amountContainer: {
    alignItems: 'center',
  },
  amount: {
    fontSize: FontSize.xxxl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingBottom: Spacing.xs,
  },
  amountPrefix: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  amountInput: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
    minWidth: 100,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadow.medium,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  detailLabel: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  detailInput: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs,
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.s,
  },
  categorySelector: {
    flex: 2,
    maxHeight: 40,
  },
  categoryOption: {
    alignItems: 'center',
    marginRight: Spacing.m,
    opacity: 0.7,
    paddingHorizontal: Spacing.xs,
  },
  selectedCategory: {
    opacity: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.s,
    ...Shadow.small,
  },
  categoryBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  selectedCategoryText: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  noteSection: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginBottom: Spacing.l,
    ...Shadow.medium,
  },
  noteSectionTitle: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  noteText: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  noteInput: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 100,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.s,
    padding: Spacing.s,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.s,
    ...Shadow.medium,
  },
  deleteButtonText: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
  },
  editButtonText: {
    fontSize: FontSize.s,
    color: Colors.primary,
    fontWeight: '600',
  },
  deleteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deleteConfirmBox: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.l,
    width: '80%',
    alignItems: 'center',
    ...Shadow.large,
  },
  warningIcon: {
    marginBottom: Spacing.m,
  },
  deleteTitle: {
    fontSize: FontSize.s,
    fontWeight: 'bold',
    color: Colors.danger,
    marginBottom: Spacing.s,
  },
  deleteMessage: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.l,
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  cancelButton: {
    padding: Spacing.m,
    borderRadius: BorderRadius.s,
    marginRight: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: Colors.danger,
    padding: Spacing.m,
    borderRadius: BorderRadius.s,
    flex: 1,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: FontSize.s,
    color: '#fff',
    fontWeight: '600',
  },
});
