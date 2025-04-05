import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/Theme';

interface BudgetCardProps {
  title: string;
  currentAmount: number;
  budgetAmount: number;
  icon?: string;
  color?: string;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  title,
  currentAmount,
  budgetAmount,
  icon = 'wallet',
  color = Colors.primary,
}) => {
  const percentage = Math.min(Math.round((currentAmount / budgetAmount) * 100), 100);
  const remaining = budgetAmount - currentAmount;
  const isOverBudget = remaining < 0;

  const getStatusColor = () => {
    if (percentage > 90) return Colors.danger;
    if (percentage > 75) return Colors.warning;
    return Colors.success;
  };

  const statusColor = getStatusColor();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${percentage}%`,
                backgroundColor: statusColor 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>

      <View style={styles.amountsContainer}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Spent</Text>
          <Text style={styles.amountValue}>${currentAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Budget</Text>
          <Text style={styles.amountValue}>${budgetAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Remaining</Text>
          <Text style={[
            styles.amountValue, 
            { color: isOverBudget ? Colors.danger : Colors.success }
          ]}>
            {isOverBudget ? '-' : ''}${Math.abs(remaining).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    ...Shadow.medium,
    marginVertical: Spacing.s,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  title: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressContainer: {
    marginBottom: Spacing.m,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  amountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.m,
  },
  amountItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  amountLabel: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  amountValue: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default BudgetCard;
