import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants/Theme';
import { auth } from '../config/firebase';
import { addCategory, fetchUserData, fetchUserTransactions } from '../config/backend';
import { Transaction, UserData } from '../types';
import BudgetModal from '@/components/BudgetModal';

// Type definitions
import { Category } from '../types';

// Mock data for demonstration purposes


const BudgetCard = ({ budget, onPress }: { budget: Category, onPress: () => void }) => {
  const percentSpent = (budget.spent / budget.allocated) * 100;
  const isOverBudget = budget.spent > budget.allocated;
  
  return (
    <TouchableOpacity 
      style={styles.budgetCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.budgetCardHeader}>
        <Text style={styles.budgetCategory}>{budget.category}</Text>
        <View style={[styles.budgetPeriodBadge, { backgroundColor: budget.color + '20' }]}>
          <Text style={[styles.budgetPeriodText, { color: budget.color }]}>
            {budget.period === 'monthly' ? 'Monthly' : 'Weekly'}
          </Text>
        </View>
      </View>
      
      <View style={styles.budgetAmounts}>
        <Text style={styles.budgetAllocated}>
          ${budget.allocated.toFixed(2)}
        </Text>
        <Text style={styles.budgetSpent}>
          ${budget.spent.toFixed(2)} spent
        </Text>
      </View>
      
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
      
      <View style={styles.budgetFooter}>
        <Text style={[
          styles.budgetRemaining,
          isOverBudget && styles.budgetOverspent
        ]}>
          {isOverBudget ? 'Over budget: ' : 'Remaining: '}
          ${Math.abs(budget.remaining).toFixed(2)}
        </Text>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={Colors.textSecondary} 
        />
      </View>
    </TouchableOpacity>
  );
};

export default function BudgetsTab() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Category[]>([]);
  const [activePeriod, setActivePeriod] = useState<'monthly' | 'weekly'>('monthly');
  
  // New category modal state
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  
  // Budget detail modal state
  const [selectedBudget, setSelectedBudget] = useState<Category | null>(null);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<UserData | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Budgets screen is focused - refreshing data');
      fetchUserData().then((userData) => {
        console.log(userData);
        setUser(userData);
        setTransactions(userData?.transactions ?? []);
        setBudgets(userData?.custom_categories ?? []);
      });
      
      return () => {
        // Cleanup function if needed when screen loses focus
      };
    }, [])
  );

  const calculateUsedBudget = () => {
    const usedBudget = transactions.reduce((total, transaction) => {
      return total + (transaction.isExpense ? transaction.amount : 0);
    }, 0);
    return usedBudget;
  };
  const usedBudget = calculateUsedBudget();
  console.log(budgets);
  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  
  const navigateToBudgetDetail = (budget: Category) => {
    handleBudgetPress(budget);
  };
  
  const toggleAddModal = () => {
    setIsAddModalVisible(!isAddModalVisible);
    // Reset form fields when closing
    if (isAddModalVisible) {
      setNewCategoryName('');
      setNewCategoryBudget('');
    }
  };
  
  const handleBudgetPress = (budget: Category) => {
    setSelectedBudget(budget);
    setIsBudgetModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handleCloseBudgetModal = () => {
    setIsBudgetModalVisible(false);
    setSelectedBudget(null);
  };
  
  const handleUpdateBudget = async (updatedBudget: Category) => {
    try {
      // For now just update the local state
      // In a real implementation, this would call the API
      const updatedBudgets = budgets.map(b => 
        b.id === updatedBudget.id ? updatedBudget : b
      );
      
      setBudgets(updatedBudgets);
      
      // Recalculate the remaining amount based on the new allocated budget
      const budget = updatedBudgets.find(b => b.id === updatedBudget.id);
      if (budget) {
        budget.remaining = budget.allocated - budget.spent;
      }
      
      Alert.alert('Success', 'Budget updated successfully');
    } catch (error) {
      console.error('Error updating budget:', error);
      Alert.alert('Error', 'Failed to update budget');
    }
  };
  
  const handleDeleteBudget = async (budgetId: string) => {
    try {
      // For now just update the local state
      // In a real implementation, this would call the API
      const updatedBudgets = budgets.filter(b => b.id !== budgetId);
      
      setBudgets(updatedBudgets);
      
      Alert.alert('Success', 'Budget deleted successfully');
    } catch (error) {
      console.error('Error deleting budget:', error);
      Alert.alert('Error', 'Failed to delete budget');
    }
  };
  
  const handleAddCategory = () => {
    // Validate inputs
    if (!newCategoryName.trim() || !newCategoryBudget.trim()) {
      // Add error handling here if needed
      return;
    }
    
    const budget = parseFloat(newCategoryBudget);
    if (isNaN(budget) || budget <= 0) {
      // Add error handling for invalid budget
      return;
    }
    
    // Create new category (currently just for UI, not connected to backend)
    const newCategory: Category = {
      id: (budgets.length + 1).toString(),
      category: newCategoryName,
      allocated: budget,
      spent: 0,
      remaining: budget,
      period: activePeriod,
      color: getRandomColor(),
      icon: 'ellipsis-horizontal'
    };

    addCategory(newCategory);
    
    // Add to state
    setBudgets([...budgets, newCategory]);
    
    // Close modal
    toggleAddModal();
  };
  
  // Helper function to generate random colors for new categories
  const getRandomColor = () => {
    const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336', '#00BCD4', '#3F51B5', '#FF5722'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  console.log(auth.currentUser?.email);
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Budgets',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      
      <View style={styles.summaryContainer}>
        <View style={styles.periodToggle}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              activePeriod === 'monthly' && styles.activePeriodButton
            ]}
            onPress={() => setActivePeriod('monthly')}
          >
            <Text style={[
              styles.periodButtonText,
              activePeriod === 'monthly' && styles.activePeriodButtonText
            ]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              activePeriod === 'weekly' && styles.activePeriodButton
            ]}
            onPress={() => setActivePeriod('weekly')}
          >
            <Text style={[
              styles.periodButtonText,
              activePeriod === 'weekly' && styles.activePeriodButtonText
            ]}>
              Weekly
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.totalBudgetCard}>
          <Text style={styles.totalBudgetTitle}>Total Budget</Text>
          <Text style={styles.totalBudgetAmount}>${(user?.budget ?? 0)}</Text>
          
          <View style={styles.totalBudgetDetails}>
            <View style={styles.totalBudgetDetail}>
              <Text style={styles.totalBudgetDetailLabel}>Spent</Text>
              <Text style={styles.totalBudgetDetailValue}>${(usedBudget)}</Text>
            </View>
            <View style={styles.totalBudgetDivider} />
            <View style={styles.totalBudgetDetail}>
              <Text style={styles.totalBudgetDetailLabel}>Remaining</Text>
              <Text style={[
                styles.totalBudgetDetailValue,
                totalRemaining < 0 && styles.totalBudgetOverspent
              ]}>
                ${(user?.budget ?? 0) - (usedBudget)}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${Math.min((usedBudget / (user?.budget ?? 0)) * 100, 100)}%`,
                  backgroundColor: usedBudget > (user?.budget ?? 0) ? Colors.danger : Colors.primary
                }
              ]} 
            />
          </View>
        </View>
      </View>
      
      <View style={styles.budgetsHeaderContainer}>
        <Text style={styles.budgetsHeader}>Budget Categories</Text>
        <TouchableOpacity style={styles.addBudgetButton} onPress={toggleAddModal}>
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
          <Text style={styles.addBudgetText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.budgetsList}>
        {budgets.map((budget: Category) => (
          <BudgetCard 
            key={budget.id} 
            budget={budget} 
            onPress={() => navigateToBudgetDetail(budget)}
          />
        ))}
      </ScrollView>
      
      {/* Add Budget Category Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleAddModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Budget Category</Text>
              <TouchableOpacity style={styles.closeButton} onPress={toggleAddModal}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Category Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="pricetag-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Food & Dining, Transportation"
                  placeholderTextColor={Colors.textSecondary}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Budget Amount</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="cash-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 500"
                  placeholderTextColor={Colors.textSecondary}
                  value={newCategoryBudget}
                  onChangeText={setNewCategoryBudget}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.periodSelectorContainer}>
              <Text style={styles.inputLabel}>Budget Period</Text>
              <View style={styles.periodToggleModal}>
                <TouchableOpacity
                  style={[
                    styles.periodButtonModal,
                    activePeriod === 'monthly' && styles.activePeriodButtonModal
                  ]}
                  onPress={() => setActivePeriod('monthly')}
                >
                  <Text style={[
                    styles.periodButtonTextModal,
                    activePeriod === 'monthly' && styles.activePeriodButtonTextModal
                  ]}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButtonModal,
                    activePeriod === 'weekly' && styles.activePeriodButtonModal
                  ]}
                  onPress={() => setActivePeriod('weekly')}
                >
                  <Text style={[
                    styles.periodButtonTextModal,
                    activePeriod === 'weekly' && styles.activePeriodButtonTextModal
                  ]}>Weekly</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Budget Detail Modal */}
      <BudgetModal
        visible={isBudgetModalVisible}
        budget={selectedBudget}
        onClose={handleCloseBudgetModal}
        onUpdate={handleUpdateBudget}
        onDelete={handleDeleteBudget}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Spacing.xl,
  },
  summaryContainer: {
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.s,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.l,
    padding: Spacing.xs,
    marginBottom: Spacing.m,
    alignSelf: 'center',
    ...Shadow.small,
  },
  periodButton: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.m,
  },
  activePeriodButton: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
  },
  activePeriodButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  totalBudgetCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    ...Shadow.medium,
  },
  totalBudgetTitle: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  totalBudgetAmount: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  totalBudgetDetails: {
    flexDirection: 'row',
    marginBottom: Spacing.m,
  },
  totalBudgetDetail: {
    flex: 1,
  },
  totalBudgetDetailLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  totalBudgetDetailValue: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalBudgetOverspent: {
    color: Colors.danger,
  },
  totalBudgetDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.m,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  budgetsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.xs,
  },
  budgetsHeader: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBudgetText: {
    fontSize: FontSize.s,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  budgetsList: {
    flex: 1,
    paddingHorizontal: Spacing.m,
  },
  budgetCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadow.small,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  budgetCategory: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  budgetPeriodBadge: {
    paddingHorizontal: Spacing.s,
    paddingVertical: 2,
    borderRadius: BorderRadius.s,
  },
  budgetPeriodText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.s,
  },
  budgetAllocated: {
    fontSize: FontSize.m,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  budgetSpent: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  budgetRemaining: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  budgetOverspent: {
    color: Colors.danger,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.l,
    borderTopRightRadius: BorderRadius.l,
    padding: Spacing.l,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  modalTitle: {
    fontSize: FontSize.l,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  formGroup: {
    marginBottom: Spacing.m,
  },
  inputLabel: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  inputIcon: {
    padding: Spacing.m,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: Spacing.s,
    fontSize: FontSize.m,
    color: Colors.textPrimary,
  },
  periodSelectorContainer: {
    marginBottom: Spacing.l,
  },
  periodToggleModal: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.xs,
    ...Shadow.small,
  },
  periodButtonModal: {
    flex: 1,
    paddingVertical: Spacing.s,
    alignItems: 'center',
    borderRadius: BorderRadius.s,
  },
  activePeriodButtonModal: {
    backgroundColor: Colors.primary,
  },
  periodButtonTextModal: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
  },
  activePeriodButtonTextModal: {
    color: Colors.cardBackground,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    alignItems: 'center',
    ...Shadow.small,
  },
  addButtonText: {
    color: Colors.cardBackground,
    fontSize: FontSize.m,
    fontWeight: 'bold',
  },
});
