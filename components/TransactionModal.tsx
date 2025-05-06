import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  ScrollView,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/Theme';
import { Transaction, Category } from '../app/types';

interface TransactionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (transaction: Transaction) => void;
  categories: Category[];
}

// Helper function to get category icon
const getCategoryIcon = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'food':
      return 'restaurant';
    case 'transport':
      return 'car';
    case 'shopping':
      return 'bag-handle';
    case 'entertainment':
      return 'film';
    case 'health':
      return 'medkit';
    case 'housing':
      return 'home';
    case 'income':
      return 'trending-up';
    default:
      return 'ellipsis-horizontal-circle';
  }
};

// Helper function to get category color
const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'food':
      return '#F97316';
    case 'transport':
      return '#8B5CF6';
    case 'shopping':
      return '#EC4899';
    case 'entertainment':
      return '#06B6D4';
    case 'health':
      return '#10B981';
    case 'housing':
      return '#6366F1';
    case 'income':
      return Colors.success;
    default:
      return Colors.textSecondary;
  }
};

// Helper function to ensure date is properly formatted
const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
};

const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  transaction,
  onClose,
  onDelete,
  onUpdate,
  categories,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const modalAnim = useRef(new Animated.Value(0)).current;
  const deleteAnim = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (visible && transaction) {
      setEditedTransaction({ ...transaction });
      setIsEditing(false);
      setIsDeleting(false);
      
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [visible, transaction]);
  
  const handleClose = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      onClose();
    });
  };
  
  const toggleEdit = () => {
    if (isEditing && editedTransaction && transaction) {
      onUpdate(editedTransaction);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    if (!transaction) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDelete(transaction.id);
    handleClose();
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
  
  const handleCategorySelect = (category: string) => {
    if (editedTransaction) {
      setEditedTransaction({
        ...editedTransaction,
        category
      });
    }
  };
  
  if (!transaction) return null;
  
  const translateY = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0]
  });
  
  const opacity = modalAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1]
  });
  
  const deleteTranslateY = deleteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0]
  });
  
  const deleteOpacity = deleteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { 
              transform: [{ translateY }],
              opacity
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View 
              style={[
                styles.categoryIcon, 
                { backgroundColor: getCategoryColor(transaction.category) }
              ]}
            >
              <Ionicons 
                name={getCategoryIcon(transaction.category) as any} 
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
                  {transaction.isExpense ? '-' : '+'}${Number(transaction.amount).toFixed(2)}
                </Text>
              )}
            </View>
          </View>
          
          {/* Content */}
          <ScrollView style={styles.content}>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(transaction.date)}
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
                          cat.category === editedTransaction.category && styles.selectedCategory
                        ]}
                        onPress={() => handleCategorySelect(cat.category)}
                      >
                        <View 
                          style={[
                            styles.categoryBubble,
                            { backgroundColor: cat.color }
                          ]}
                        >
                          <Ionicons 
                            name={(cat.icon || getCategoryIcon(cat.category)) as any} 
                            size={16} 
                            color="#fff" 
                          />
                        </View>
                        <Text 
                          style={[
                            styles.categoryName,
                            cat.category === editedTransaction.category && styles.selectedCategoryText
                          ]}
                        >
                          {cat.category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.categoryTag}>
                    <View 
                      style={[
                        styles.categoryDot,
                        { backgroundColor: getCategoryColor(transaction.category) }
                      ]}
                    />
                    <Text style={styles.detailValue}>
                      {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
              
              {transaction.title && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Title</Text>
                    {isEditing && editedTransaction ? (
                      <TextInput
                        style={styles.detailInput}
                        value={editedTransaction.title}
                        onChangeText={(text) => handleInputChange('title', text)}
                        multiline
                      />
                    ) : (
                      <Text style={styles.detailValue}>{transaction.title}</Text>
                    )}
                  </View>
                </>
              )}
              
              {transaction.category && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category</Text>
                    {isEditing && editedTransaction ? (
                      <Text
                        style={styles.detailValue}
                      >
                        {editedTransaction.category}
                      </Text>
                    ) : (
                      <Text style={styles.detailValue}>{transaction.category}</Text>
                    )}
                  </View>
                </>
              )}
            </View>
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={styles.actions}>
            {!isDeleting ? (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={startDeleteProcess}
                >
                  <Ionicons name="trash-outline" size={22} color={Colors.danger} />
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]} 
                  onPress={toggleEdit}
                >
                  <Ionicons 
                    name={isEditing ? "save-outline" : "pencil-outline"} 
                    size={22} 
                    color={Colors.primary} 
                  />
                  <Text style={[styles.actionButtonText, styles.editButtonText]}>
                    {isEditing ? "Save" : "Edit"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Animated.View 
                style={[
                  styles.deleteConfirmContainer,
                  {
                    transform: [{ translateY: deleteTranslateY }],
                    opacity: deleteOpacity
                  }
                ]}
              >
                <Text style={styles.deleteConfirmText}>
                  Are you sure you want to delete this transaction?
                </Text>
                
                <View style={styles.deleteConfirmButtons}>
                  <TouchableOpacity 
                    style={[styles.deleteConfirmButton, styles.cancelButton]} 
                    onPress={cancelDelete}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.deleteConfirmButton, styles.confirmButton]} 
                    onPress={confirmDelete}
                  >
                    <Text style={styles.confirmButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.l,
    borderTopRightRadius: BorderRadius.l,
    minHeight: '75%',
    maxHeight: '90%',
    paddingBottom: Spacing.xl,
    ...Shadow.large
  },
  header: {
    padding: Spacing.l,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  titleInput: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    borderBottomWidth: 0,
    padding: Spacing.xs,
    minWidth: '60%',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  amountPrefix: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  amountInput: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 100,
    textAlign: 'center',
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    padding: Spacing.l,
  },
  detailsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    ...Shadow.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  detailLabel: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: FontSize.m,
    color: Colors.textPrimary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.m,
  },
  detailInput: {
    fontSize: FontSize.m,
    color: Colors.textPrimary,
    fontWeight: '500',
    textAlign: 'right',
    borderBottomWidth: 0,
    padding: Spacing.xs,
    flex: 1,
    marginLeft: Spacing.m,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.s,
  },
  categorySelector: {
    flex: 1,
    maxHeight: 36,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.s,
    borderRadius: BorderRadius.s,
    backgroundColor: Colors.cardBackground,
    ...Shadow.small,
  },
  selectedCategory: {
    backgroundColor: Colors.primary + '20',
  },
  categoryBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  categoryName: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
  },
  selectedCategoryText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.l,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    borderRadius: BorderRadius.m,
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  actionButtonText: {
    fontSize: FontSize.m,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  deleteButton: {
    backgroundColor: Colors.danger + '15',
  },
  deleteButtonText: {
    color: Colors.danger,
  },
  editButton: {
    backgroundColor: Colors.primary + '15',
  },
  editButtonText: {
    color: Colors.primary,
  },
  deleteConfirmContainer: {
    flex: 1,
    alignItems: 'center',
  },
  deleteConfirmText: {
    fontSize: FontSize.m,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.m,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteConfirmButton: {
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    borderRadius: BorderRadius.m,
    flex: 1,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.textSecondary + '20',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: FontSize.m,
  },
  confirmButton: {
    backgroundColor: Colors.danger,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: FontSize.m,
  },
});

export default TransactionModal;
