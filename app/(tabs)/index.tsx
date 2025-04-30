import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/Theme';
import BudgetCard from '../../components/BudgetCard';
import TransactionItem from '../../components/TransactionItem';
import InsightCard from '../../components/InsightCard';
import AddExpenseFAB from '../../components/AddExpenseFAB';
import { fetchUserData } from '../config/backend';
import { auth } from '../config/firebase';
import { Category, Transaction, UserData } from '../types';

// Mock data for demonstration

const mockTransactions = [
  { id: '1', title: 'Grocery Store', amount: 45.67, category: 'food', date: new Date(2025, 3, 2) },
  { id: '2', title: 'Uber Ride', amount: 12.50, category: 'transport', date: new Date(2025, 3, 1) },
  { id: '3', title: 'Coffee Shop', amount: 4.25, category: 'food', date: new Date(2025, 3, 1) },
  { id: '4', title: 'Amazon Purchase', amount: 29.99, category: 'shopping', date: new Date(2025, 2, 30) },
  { id: '5', title: 'Movie Tickets', amount: 22.00, category: 'entertainment', date: new Date(2025, 2, 28) },
];

const mockInsights = [
  { 
    id: '1', 
    title: 'Unusual spending detected', 
    description: 'Your food expenses this week are 30% higher than your weekly average. Consider checking your receipts.',
    type: 'warning'
  },
  { 
    id: '2', 
    title: 'Save $120 next month', 
    description: 'Based on your spending patterns, switching to this grocery store could save you approximately $120 next month.',
    type: 'tip'
  },
  { 
    id: '3', 
    title: 'Entertainment budget forecast', 
    description: "At your current rate, you'll exceed your entertainment budget by $45 this month.",
    type: 'warning'
  },
];

export default function Dashboard() {
  const router = useRouter();
  const totalBudget = 2000;
  const totalSpent = 1250;
  const [insights, setInsights] = useState(mockInsights);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const dismissInsight = (id: string) => {
    setInsights(insights.filter(insight => insight.id !== id));
  };

  const handleViewAllTransactions = () => {
    router.push('/transactions');
  };

  const handleViewAllBudgets = () => {
    router.push('/budgets');
  };

  const handleViewAllInsights = () => {
    router.push('/analytics');
  };

  const handleAddExpenseManual = () => {
    router.push('/add/manual');
  };
  const handleLogin = () => {
    router.push('/login');
  };

  const handleAddExpenseVoice = () => {
    // Open voice recording interface
    console.log('Open voice recording interface');
  };

  const handleAddExpenseScan = () => {
    router.push('/add/scan');
  };

  const handleSettings = () => {
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('Dashboard screen is focused - refreshing data');
      fetchUserData().then((userData) => {
        setUser(userData);
        setTransactions(userData?.transactions ?? []);
        setCustomCategories(userData?.custom_categories ?? []);
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
  const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const [user, setUser] = useState<UserData | null>(null);
  console.log(user);
  const usedBudget = calculateUsedBudget();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}</Text>
          <Text style={styles.date}>{new Date().getDay()} {month[new Date().getMonth()]} {new Date().getFullYear()}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogin}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.budgetCard}>
          <View style={styles.budgetCardHeader}>
            <Text style={styles.budgetCardTitle}>Total Budget</Text>
            <View style={styles.budgetPeriod}>
              <Text style={styles.budgetPeriodText}>April 2025</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
            </View>
          </View>
          <View style={styles.budgetAmount}>
            <Text style={styles.spentAmount}>${(usedBudget)}</Text>
            <Text style={styles.totalAmount}>/${(user?.budget ?? 0)}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${(usedBudget) / (user?.budget ?? 1) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.budgetStats}>
            <View style={styles.budgetStat}>
              <View style={[styles.statIndicator, { backgroundColor: Colors.primary }]} />
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>${(usedBudget)}</Text>
            </View>
            <View style={styles.budgetStat}>
              <View style={[styles.statIndicator, { backgroundColor: Colors.border }]} />
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>${(user?.budget ?? 0) - (usedBudget)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <TouchableOpacity onPress={handleViewAllInsights}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {insights.length > 0 ? (
            insights.map((insight) => (
              <InsightCard
                key={insight.id}
                title={insight.title}
                description={insight.description}
                type={insight.type as 'warning' | 'tip' | 'prediction'}
                onDismiss={() => dismissInsight(insight.id)}
              />
            ))
          ) : (
            <View style={styles.emptyInsightContainer}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              <Text style={styles.emptyInsightText}>You are all caught up!</Text>
              <Text style={styles.emptyInsightSubtext}>No new insights at the moment.</Text>
            </View>
          )}
        </View>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget Categories</Text>
            <TouchableOpacity onPress={handleViewAllBudgets}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {customCategories.map((category) => (
              <BudgetCard
                key={category.id}
                title={category.category}
                currentAmount={category.spent}
                budgetAmount={category.allocated}
                icon={category.icon}
                color={category.color}
              />
            ))}
          </ScrollView>
        </View>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewAllTransactions}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                amount={transaction.amount}
                category={transaction.category as any}
                title={transaction.title}
                date={transaction.date}
                isExpense={true}
              />
            ))
          ) : (
            <View style={styles.emptyTransactionsContainer}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTransactionsTitle}>No transactions yet</Text>
              <Text style={styles.emptyTransactionsText}>
                Start tracking your expenses by adding your first transaction
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyTransactionsContainer: {
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.s,
    marginTop: Spacing.s,
    marginHorizontal: Spacing.s,
    ...Shadow.medium,
  },
  emptyTransactionsTitle: {
    fontWeight: '600',
    fontSize: FontSize.l,
    color: Colors.textPrimary,
    marginTop: Spacing.m,
    marginBottom: Spacing.m,
  },
  emptyTransactionsText: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.s,
  },
  greeting: {
    fontSize: FontSize.l,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  date: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.s,
    ...Shadow.small,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.m,
  },
  budgetCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadow.medium,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  budgetCardTitle: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  budgetPeriod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetPeriodText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  budgetAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.s,
  },
  spentAmount: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  totalAmount: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: Spacing.m,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  budgetStats: {
    flexDirection: 'row',
  },
  budgetStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionContainer: {
    marginBottom: Spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  sectionTitle: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: FontSize.s,
    color: Colors.primary,
  },
  insightsContainer: {
    paddingBottom: Spacing.s,
    flexDirection:'column',
  },
  categoriesContainer: {
    paddingBottom: Spacing.s,
    gap: Spacing.m,
  },
  emptyInsightContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.xl,
    marginVertical: Spacing.s,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.medium,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  emptyInsightText: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.m,
    marginBottom: Spacing.xs,
  },
  emptyInsightSubtext: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 60,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
