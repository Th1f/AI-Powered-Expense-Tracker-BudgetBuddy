import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/Theme';

interface InsightCardProps {
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'prediction';
  onPress?: () => void;
  onDismiss?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  type,
  onPress,
  onDismiss
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'tip':
        return 'bulb';
      case 'warning':
        return 'alert-circle';
      case 'prediction':
        return 'trending-up';
      default:
        return 'information-circle';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'tip':
        return Colors.secondary;
      case 'warning':
        return Colors.warning;
      case 'prediction':
        return Colors.primary;
      default:
        return Colors.primary;
    }
  };

  const typeIcon = getTypeIcon();
  const typeColor = getTypeColor();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
          <Ionicons name={typeIcon} size={20} color={typeColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.footer}>
        <View style={styles.aiIndicator}>
          <Ionicons name="flash" size={14} color={Colors.primary} />
          <Text style={styles.aiText}>AI Insight</Text>
        </View>
        <Text style={styles.actionText}>Tap to learn more</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    ...Shadow.medium,
    marginVertical: Spacing.s,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  title: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  dismissButton: {
    padding: Spacing.xs,
  },
  description: {
    fontSize: FontSize.m,
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  actionText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});

export default InsightCard;
