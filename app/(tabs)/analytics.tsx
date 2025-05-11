import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import InsightCard from '../../components/InsightCard';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/Theme';
import { auth } from '../config/firebase';
import { fetchUserData } from '../config/backend';
import { Transaction, UserData, Category } from '../types';

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
  { 
    id: '4', 
    title: 'Monthly spending pattern', 
    description: "You tend to spend more during weekends. Setting a weekend budget could help you save an additional $75 monthly.",
    type: 'prediction'
  },
];

// Month names for display
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function Analytics() {
  const [insights, setInsights] = useState(mockInsights);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<{month: string, amount: number}[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{name: string, percentage: number}[]>([]);
  
  const dismissInsight = (id: string) => {
    setInsights(insights.filter(insight => insight.id !== id));
  };

  // Fetch user data when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('Analytics screen is focused - refreshing data');
      setLoading(true);
      
      fetchUserData().then((userData) => {
        if (userData) {
          setUser(userData);
          setTransactions(userData.transactions || []);
          
          // Calculate monthly spending and category breakdown
          calculateMonthlySpending(userData.transactions || []);
          calculateCategoryBreakdown(userData.transactions || []);
        }
        setLoading(false);
      }).catch(error => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      });
      
      return () => {};
    }, [])
  );
  
  // Calculate monthly spending data from transactions
  const calculateMonthlySpending = (transactions: Transaction[]) => {
    // Get current month and previous 5 months
    const now = new Date();
    const monthlyData: {month: string, amount: number}[] = [];
    
    // Create last 6 months data (including current month)
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (now.getMonth() - i + 12) % 12; // Handle wrapping around to previous year
      const year = now.getFullYear() - (now.getMonth() < i ? 1 : 0);
      monthlyData.push({
        month: monthNames[monthIndex],
        amount: 0
      });
    }
    
    // Calculate spending for each month
    transactions.forEach(transaction => {
      if (!transaction.isExpense) return; // Skip income transactions
      
      const transDate = new Date(transaction.date);
      const monthIndex = transDate.getMonth();
      const year = transDate.getFullYear();
      const now = new Date();
      
      // Only include transactions from the last 6 months
      const monthDiff = (now.getFullYear() - year) * 12 + (now.getMonth() - monthIndex);
      if (monthDiff >= 0 && monthDiff < 6) {
        const index = 5 - monthDiff; // Convert to array index (5 = current month)
        monthlyData[index].amount += transaction.amount;
      }
    });
    
    setMonthlySpending(monthlyData);
  };
  
  // Calculate category breakdown percentages
  const calculateCategoryBreakdown = (transactions: Transaction[]) => {
    // Get current month transactions only
    const now = new Date();
    const currentMonthTransactions = transactions.filter(transaction => {
      if (!transaction.isExpense) return false; // Skip income transactions
      
      const transDate = new Date(transaction.date);
      return transDate.getMonth() === now.getMonth() && 
             transDate.getFullYear() === now.getFullYear();
    });
    
    // Calculate total amount spent
    const totalSpent = currentMonthTransactions.reduce((sum, transaction) => {
      return sum + transaction.amount;
    }, 0);
    
    // Group by category and calculate percentages
    const categories: Record<string, number> = {};
    currentMonthTransactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += transaction.amount;
    });
    
    // Convert to array of category breakdowns
    const breakdownData = Object.entries(categories).map(([name, amount]) => ({
      name,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
    }));
    
    // Sort by percentage (highest first)
    breakdownData.sort((a, b) => b.percentage - a.percentage);
    
    // If there are no transactions, show placeholder
    if (breakdownData.length === 0) {
      breakdownData.push({ name: 'No Data', percentage: 100 });
    }
    
    setCategoryBreakdown(breakdownData);
  };

  const renderBarChart = () => {
    if (monthlySpending.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.noDataText}>No spending data available</Text>
        </View>
      );
    }
    
    const maxAmount = Math.max(...monthlySpending.map(item => item.amount)) || 1; // Prevent division by zero
    
    return (
      <View style={styles.barChart}>
        {monthlySpending.map((item, index) => {
          const isCurrentMonth = index === monthlySpending.length - 1;
          // Calculate the percentage height - max 90% to prevent overflow
          const heightPercentage = Math.min(90, item.amount > 0 ? (item.amount / maxAmount) * 90 : 1);
            
          return (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${heightPercentage}%`,
                    backgroundColor: isCurrentMonth ? Colors.primary : Colors.secondary,
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{item.month}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSpendingBreakdown = () => {
    return (
      <View style={styles.pieChartContainer}>
        {categoryBreakdown.map((category, index) => (
          <View key={index} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <View 
                style={[
                  styles.categoryIndicator, 
                  { backgroundColor: getCategoryColor(category.name) }
                ]} 
              />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
          </View>
        ))}
      </View>
    );
  };

  // Calculate percentage change between two values
  const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  };
  
  // Determine color based on comparison (red for increase in spending, green for decrease)
  const getComparisonColor = (current: number, previous: number): string => {
    if (current < previous) return Colors.success; // Spending less is good
    if (current > previous) return Colors.danger;  // Spending more is bad
    return Colors.textPrimary; // No change
  };
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food':
        return '#F97316';
      case 'housing':
      case 'rent':
        return '#8B5CF6';
      case 'transport':
      case 'transportation':
        return '#06B6D4';
      case 'entertainment':
        return '#EC4899';
      case 'shopping':
        return '#10B981';
      case 'health':
      case 'healthcare':
        return '#EF4444';
      case 'utilities':
        return '#F59E0B';
      case 'travel':
        return '#3B82F6';
      case 'education':
        return '#6366F1';
      default:
        return '#9CA3AF';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Analytics',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your financial data...</Text>
        </View>
      ) : (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Spending Overview</Text>
          <View style={styles.chartContainer}>
            {renderBarChart()}
          </View>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Average</Text>
              <Text style={styles.summaryValue}>
                ${monthlySpending.length > 0 
                  ? (monthlySpending.reduce((sum, item) => sum + item.amount, 0) / monthlySpending.length).toFixed(0)
                  : '0'
                }
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>This Month</Text>
              <Text style={styles.summaryValue}>
                ${monthlySpending.length > 0 
                  ? monthlySpending[monthlySpending.length - 1].amount.toFixed(0)
                  : '0'
                }
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>vs Last Month</Text>
              {monthlySpending.length >= 2 ? (
                <Text style={[
                  styles.summaryValue, 
                  { 
                    color: getComparisonColor(monthlySpending[monthlySpending.length - 1].amount, 
                    monthlySpending[monthlySpending.length - 2].amount)
                  }
                ]}>
                  {calculatePercentageChange(
                    monthlySpending[monthlySpending.length - 1].amount,
                    monthlySpending[monthlySpending.length - 2].amount
                  )}
                </Text>
              ) : (
                <Text style={styles.summaryValue}>N/A</Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending Breakdown</Text>
          {renderSpendingBreakdown()}
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
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
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.m,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.l,
  },
  loadingText: {
    marginTop: Spacing.m,
    fontSize: FontSize.m,
    color: Colors.textSecondary,
  },
  noDataText: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginVertical: Spacing.m,
    ...Shadow.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  cardTitle: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  chartContainer: {
    height: 220,
    marginBottom: Spacing.m,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingTop: 10, // Add some padding at the top to prevent overflow
  },
  barChart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '60%',
    minHeight: 20,
    maxHeight: '100%', // Ensure bar doesn't go above container
    borderTopLeftRadius: BorderRadius.s,
    borderTopRightRadius: BorderRadius.s,
  },
  barLabel: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pieChartContainer: {
    marginTop: Spacing.s,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.s,
  },
  categoryName: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
  },
  categoryPercentage: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
    marginTop: Spacing.m,
  },
  sectionTitle: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
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
});
