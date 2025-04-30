import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/Theme';


interface TransactionItemProps {
  amount: number;
  category: string;
  title: string;
  date: Date | string;
  isExpense?: boolean;
  onPress?: () => void;
}

const getCategoryIcon = (category: string): string => {
  switch (category) {
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

const getCategoryColor = (category: string): string => {
  switch (category) {
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

const formatDate = (date: string | Date): string => {
  try {
    // Handle string date by converting to Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Make sure it's a valid date
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    // Format the date
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
};

const TransactionItem: React.FC<TransactionItemProps> = ({
  amount,
  category,
  title,
  date,
  isExpense = true,
  onPress,
}) => {
  const amountColor = isExpense ? Colors.textPrimary : Colors.success;
  const amountPrefix = isExpense ? '-' : '+';
  const categoryColor = getCategoryColor(category);
  const iconName = getCategoryIcon(category);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
        <Ionicons name={iconName as any} size={20} color={categoryColor} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.amount, { color: amountColor }]}>
            {amountPrefix}${amount.toFixed(2)}
          </Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginVertical: Spacing.xs,
    ...Shadow.small,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.m,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.s,
  },
  amount: {
    fontSize: FontSize.m,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
  },
  date: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
  },
});

export default TransactionItem;
