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
import { Category } from '../app/types';
import { updateCategory, deleteCategory } from '../app/config/backend';

interface BudgetModalProps {
  visible: boolean;
  budget: Category | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (budget: Category) => void;
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

const BudgetModal: React.FC<BudgetModalProps> = ({
  visible,
  budget,
  onClose,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudget, setEditedBudget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const modalAnim = useRef(new Animated.Value(0)).current;
  const deleteAnim = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (visible && budget) {
      setEditedBudget({ ...budget });
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
  }, [visible, budget]);
  
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
    if (isEditing && editedBudget && budget) {
      updateCategory(editedBudget);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUpdate(editedBudget);
      handleClose();
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
    if (!budget) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDelete(budget.id);
    deleteCategory(budget);
    handleClose();
  };
  
  const handleInputChange = (field: keyof Category, value: string | number) => {
    if (editedBudget) {
      setEditedBudget({
        ...editedBudget,
        [field]: field === 'allocated' ? parseFloat(value as string) : value
      });
    }
  };
  
  const handleBudgetAmountChange = (value: string) => {
    // Remove non-numeric characters except for decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 1 
      ? parts[0] + '.' + parts.slice(1).join('')
      : numericValue;
    
    if (editedBudget) {
      setEditedBudget({
        ...editedBudget,
        allocated: parseFloat(formattedValue) || 0
      });
    }
  };
  
  const togglePeriod = () => {
    if (editedBudget) {
      const newPeriod = editedBudget.period === 'monthly' ? 'weekly' : 'monthly';
      setEditedBudget({
        ...editedBudget,
        period: newPeriod
      });
    }
  };
  
  if (!budget) return null;
  
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
  
  const percentSpent = (budget.spent / budget.allocated) * 100;
  const isOverBudget = budget.spent > budget.allocated;
  
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
                { backgroundColor: budget.color }
              ]}
            >
              <Ionicons 
                name={(budget.icon || getCategoryIcon(budget.category)) as any} 
                size={28} 
                color="#fff" 
              />
            </View>
            
            {isEditing && editedBudget ? (
              <TextInput
                style={styles.titleInput}
                value={editedBudget.category}
                onChangeText={(text) => handleInputChange('category', text)}
              />
            ) : (
              <Text style={styles.title}>{budget.category}</Text>
            )}
            
            <View style={styles.periodBadge}>
              {isEditing && editedBudget ? (
                <TouchableOpacity onPress={togglePeriod} style={[styles.periodToggleButton, { backgroundColor: budget.color + '20' }]}>
                  <Text style={[styles.periodToggleText, { color: budget.color }]}>
                    {editedBudget.period === 'monthly' ? 'Monthly' : 'Weekly'}
                  </Text>
                  <Ionicons name="swap-vertical" size={16} color={budget.color} style={{ marginLeft: Spacing.xs }} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.periodBadge, { backgroundColor: budget.color + '20' }]}>
                  <Text style={[styles.periodText, { color: budget.color }]}>
                    {budget.period === 'monthly' ? 'Monthly' : 'Weekly'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Content */}
          <ScrollView style={styles.content}>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Budget Amount</Text>
                {isEditing && editedBudget ? (
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.amountPrefix}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={editedBudget.allocated.toString()}
                      onChangeText={handleBudgetAmountChange}
                      keyboardType="decimal-pad"
                    />
                  </View>
                ) : (
                  <Text style={styles.detailValue}>${budget.allocated.toFixed(2)}</Text>
                )}
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Spent</Text>
                <Text style={styles.detailValue}>${budget.spent.toFixed(2)}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Remaining</Text>
                <Text style={[
                  styles.detailValue,
                  isOverBudget ? styles.overBudgetText : styles.remainingText
                ]}>
                  {isOverBudget ? '-' : ''}${Math.abs(budget.remaining).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.budgetProgressContainer}>
                <Text style={styles.progressLabel}>Budget Usage</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${Math.min(percentSpent, 100)}%`,
                        backgroundColor: isOverBudget ? Colors.danger : budget.color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {percentSpent.toFixed(1)}% used
                </Text>
              </View>
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
                  Are you sure you want to delete this budget category?
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
    minHeight: '65%',
    maxHeight: '85%',
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
  periodBadge: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginTop: Spacing.xs,
  },
  periodText: {
    fontSize: FontSize.s,
    fontWeight: '500',
  },
  periodToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginTop: Spacing.xs,
  },
  periodToggleText: {
    fontSize: FontSize.s,
    fontWeight: '500',
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
    fontWeight: '600',
    textAlign: 'right',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  amountPrefix: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  amountInput: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
    minWidth: 80,
    textAlign: 'right',
    padding: Spacing.xs,
  },
  overBudgetText: {
    color: Colors.danger,
  },
  remainingText: {
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  budgetProgressContainer: {
    marginTop: Spacing.s,
    paddingVertical: Spacing.s,
  },
  progressLabel: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.s,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: Spacing.xs,
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

export default BudgetModal;
