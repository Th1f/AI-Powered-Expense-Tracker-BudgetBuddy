import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants/Theme';
import { auth } from '../config/firebase';
import { fetchUserData, fetchUserTransactions } from '../config/backend';
import { Transaction, UserData } from '../types';

// Type definitions
interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: 'monthly' | 'weekly';
  color: string;
}

// Mock data for demonstration purposes
const mockBudgets: Budget[] = [
  { 
    id: '1', 
    category: 'Food & Dining', 
    allocated: 500, 
    spent: 320, 
    remaining: 180, 
    period: 'monthly',
    color: '#4CAF50' 
  },
  { 
    id: '2', 
    category: 'Transportation', 
    allocated: 200, 
    spent: 150, 
    remaining: 50, 
    period: 'monthly',
    color: '#2196F3' 
  },
  { 
    id: '3', 
    category: 'Entertainment', 
    allocated: 150, 
    spent: 120, 
    remaining: 30, 
    period: 'monthly',
    color: '#9C27B0' 
  },
  { 
    id: '4', 
    category: 'Shopping', 
    allocated: 300, 
    spent: 350, 
    remaining: -50, 
    period: 'monthly',
    color: '#FF9800' 
  },
  { 
    id: '5', 
    category: 'Health', 
    allocated: 100, 
    spent: 45, 
    remaining: 55, 
    period: 'monthly',
    color: '#F44336' 
  },
  { 
    id: '6', 
    category: 'Utilities', 
    allocated: 250, 
    spent: 220, 
    remaining: 30, 
    period: 'monthly',
    color: '#00BCD4' 
  },
];

const BudgetCard = ({ budget, onPress }: { budget: Budget, onPress: () => void }) => {
  const percentSpent = (budget.spent / budget.allocated) * 100;
  const isOverBudget = budget.spent > budget.allocated;
  
  return (
    <TouchableOpacity 
      style={styles.budgetCard}
      onPress={onPress}
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
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [activePeriod, setActivePeriod] = useState<'monthly' | 'weekly'>('monthly');
  
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetchUserData().then((userData) => {
      setUser(userData);
      setTransactions(userData?.transactions ?? []);
    });
  }, []);

  const calculateUsedBudget = () => {
    const usedBudget = transactions.reduce((total, transaction) => {
      return total + (transaction.isExpense ? transaction.amount : 0);
    }, 0);
    return usedBudget;
  };
  const usedBudget = calculateUsedBudget();

  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  
  const navigateToBudgetDetail = (budget: Budget) => {
    router.push({
      pathname: "/transactions",
    });
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
        <TouchableOpacity style={styles.addBudgetButton}>
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
          <Text style={styles.addBudgetText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.budgetsList}>
        {mockBudgets.map((budget) => (
          <BudgetCard 
            key={budget.id} 
            budget={budget} 
            onPress={() => navigateToBudgetDetail(budget)}
          />
        ))}
      </ScrollView>
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
});
