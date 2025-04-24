import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import InsightCard from '../../components/InsightCard';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/Theme';
import { auth } from '../config/firebase';

// Mock data for demonstration purposes
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

// Mock data for spending trends
const monthlySpending = [
  { month: 'Jan', amount: 1800 },
  { month: 'Feb', amount: 1650 },
  { month: 'Mar', amount: 1950 },
  { month: 'Apr', amount: 1250 },
];

// Mock data for weekly spending
const weeklySpending = [
  { week: 'Week 1', amount: 450 },
  { week: 'Week 2', amount: 320 },
  { week: 'Week 3', amount: 280 },
  { week: 'Week 4', amount: 200 },
];

// Mock spending breakdown by category
const categoryBreakdown = [
  { name: 'Food', percentage: 35 },
  { name: 'Housing', percentage: 30 },
  { name: 'Transport', percentage: 15 },
  { name: 'Entertainment', percentage: 10 },
  { name: 'Other', percentage: 10 },
];

export default function Analytics() {
  const [insights, setInsights] = useState(mockInsights);
  const [timeView, setTimeView] = useState<'weekly' | 'monthly'>('monthly');
  
  const dismissInsight = (id: string) => {
    setInsights(insights.filter(insight => insight.id !== id));
  };

  console.log(auth.currentUser?.email);

  // Helper function to render the bar chart (simplified)
  const renderBarChart = () => {
    const data = timeView === 'monthly' ? monthlySpending : weeklySpending;
    const maxAmount = Math.max(...data.map(item => item.amount));
    
    return (
      <View style={styles.barChart}>
        {data.map((item, index) => {
          // Get the label and check if it's the current period
          const label = timeView === 'monthly' ? (item as typeof monthlySpending[0]).month : (item as typeof weeklySpending[0]).week;
          const isCurrentPeriod = timeView === 'monthly' 
            ? label === 'Apr' 
            : label === 'Week 4';
            
          return (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(item.amount / maxAmount) * 100}%`,
                    backgroundColor: isCurrentPeriod ? Colors.primary : Colors.secondary,
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{label}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Helper function to render spending breakdown
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

  // Helper function to get color for category
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food':
        return '#F97316';
      case 'housing':
        return '#8B5CF6';
      case 'transport':
        return '#06B6D4';
      case 'entertainment':
        return '#EC4899';
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
      <View style={styles.timeToggleContainer}>
        <TouchableOpacity 
          style={[
            styles.timeToggleButton, 
            timeView === 'weekly' && styles.activeTimeToggleButton
          ]}
          onPress={() => setTimeView('weekly')}
        >
          <Text 
            style={[
              styles.timeToggleText,
              timeView === 'weekly' && styles.activeTimeToggleText
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.timeToggleButton, 
            timeView === 'monthly' && styles.activeTimeToggleButton
          ]}
          onPress={() => setTimeView('monthly')}
        >
          <Text 
            style={[
              styles.timeToggleText,
              timeView === 'monthly' && styles.activeTimeToggleText
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{timeView === 'monthly' ? 'Monthly' : 'Weekly'} Spending Overview</Text>
          <View style={styles.chartContainer}>
            {renderBarChart()}
          </View>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Average</Text>
              <Text style={styles.summaryValue}>
                ${timeView === 'monthly' 
                  ? (monthlySpending.reduce((sum, item) => sum + item.amount, 0) / monthlySpending.length).toFixed(0)
                  : (weeklySpending.reduce((sum, item) => sum + item.amount, 0) / weeklySpending.length).toFixed(0)
                }
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{timeView === 'monthly' ? 'This Month' : 'This Week'}</Text>
              <Text style={styles.summaryValue}>
                ${timeView === 'monthly' 
                  ? monthlySpending[monthlySpending.length - 1].amount
                  : weeklySpending[weeklySpending.length - 1].amount
                }
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>vs {timeView === 'monthly' ? 'Last Month' : 'Last Week'}</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                {timeView === 'monthly' ? '-36%' : '-29%'}
              </Text>
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
  timeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.s,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timeToggleButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.l,
    borderRadius: BorderRadius.m,
    marginHorizontal: Spacing.xs,
  },
  activeTimeToggleButton: {
    backgroundColor: Colors.primary,
  },
  timeToggleText: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTimeToggleText: {
    color: '#FFFFFF',
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
    height: 200,
    marginBottom: Spacing.m,
    justifyContent: 'flex-end',
    overflow: 'hidden',
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
