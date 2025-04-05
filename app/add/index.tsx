import React from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView, 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/Theme';

export default function AddExpense() {
  const router = useRouter();

  const handleManualEntry = () => {
    router.push('/add/manual');
  };

  const handleVoiceEntry = () => {
    router.push('/add/voice');
  };

  const handleScanReceipt = () => {
    router.push('/add/scan');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Add Expense',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>How would you like to add an expense?</Text>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={handleManualEntry}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${Colors.secondary}20` }]}>
            <Ionicons name="create" size={28} color={Colors.secondary} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Manual Entry</Text>
            <Text style={styles.optionDescription}>Enter expense details manually</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={handleVoiceEntry}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${Colors.accent}20` }]}>
            <Ionicons name="mic" size={28} color={Colors.accent} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Voice Entry</Text>
            <Text style={styles.optionDescription}>Speak and we'll add the expense for you</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={handleScanReceipt}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${Colors.primary}20` }]}>
            <Ionicons name="scan" size={28} color={Colors.primary} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Scan Receipt</Text>
            <Text style={styles.optionDescription}>Take a photo of your receipt</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
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
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadow.medium,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
  },
});
