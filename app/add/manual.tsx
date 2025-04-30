import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/Theme';
import { fetchUserData,addExpense } from '../config/backend';
import { Transaction, UserData, Category } from '../types';

// Define category type

// Define category interface


export default function ManualExpenseScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
 
  
  useEffect(() => {
    fetchUserData().then((userData) => {
      setUser(userData);
      setCategories(userData?.custom_categories || []);
      setSelectedCategory(userData?.custom_categories[0] || categories[0]);
    });
  }, []);

  
  
  // Animation values
  const saveButtonAnim = useRef(new Animated.Value(1)).current;
  
  const handleAmountChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setAmount(cleanedText);
  };
  
  const handleSave = () => {
    if (amount.trim() === '') {
      // Show error or feedback for required amount
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);
    
    // Animate save button
    Animated.sequence([
      Animated.timing(saveButtonAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveButtonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Simulate API call with timeout
    const expense: Transaction = {
      id: (user?.transactions?.length ? user.transactions.length + 1 : 1).toString(),
      title: description,
      amount: parseFloat(amount),
      category: selectedCategory.id,
      date: date.toISOString(),
      isExpense: true
    };

    addExpense(expense);

    setTimeout(() => {
      setIsSaving(false);
      router.push('/');
    }, 1500);
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: 'Add Expense',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={handleAmountChange}
            maxLength={10}
            autoFocus
          />
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What was this expense for?"
            placeholderTextColor={Colors.textSecondary}
            value={description}
            onChangeText={setDescription}
          />
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoriesContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory.id === category.id && styles.selectedCategoryItem
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View 
                    style={[
                      styles.categoryIcon, 
                      { backgroundColor: category.color + '20' }
                    ]}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={24} 
                      color={category.color} 
                    />
                  </View>
                  <Text 
                    style={[
                      styles.categoryLabel,
                      selectedCategory.id === category.id && styles.selectedCategoryLabel
                    ]}
                  >
                    {category.category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={Colors.primary} style={styles.dateIcon} />
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </View>
        
        <Text style={styles.tipText}>
          Tip: Use voice or scan options for faster expense tracking.
        </Text>
      </ScrollView>
      
      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: saveButtonAnim }] }}>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              (!amount || isSaving) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!amount || isSaving}
          >
            {isSaving ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <>
                <Ionicons name="checkmark" size={24} color="#fff" style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>Save Expense</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.m,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    minWidth: 150,
    textAlign: 'center',
  },
  formField: {
    marginBottom: Spacing.l,
  },
  label: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    fontSize: FontSize.s,
    color: Colors.textPrimary,
    ...Shadow.small,
  },
  categoriesContainer: {
    marginTop: Spacing.xs,
  },
  categoriesScroll: {
    paddingVertical: Spacing.s,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: Spacing.m,
    opacity: 0.7,
  },
  selectedCategoryItem: {
    opacity: 1,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    ...Shadow.small,
  },
  categoryLabel: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
  },
  selectedCategoryLabel: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  datePickerButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadow.small,
  },
  dateIcon: {
    marginRight: Spacing.s,
  },
  dateText: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
  },
  tipText: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.l,
  },
  footer: {
    padding: Spacing.m,
    backgroundColor: Colors.background,
    ...Shadow.medium,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.medium,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.primary,
  },
  saveIcon: {
    marginRight: Spacing.s,
  },
  saveButtonText: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: '#fff',
  },
  categorySection: {
    marginTop: Spacing.l,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    margin: Spacing.xs,
    ...Shadow.small,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
  },
  tagInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.s,
    minHeight: 48,
    ...Shadow.small,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.m,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    margin: Spacing.xs,
  },
  tagText: {
    fontSize: FontSize.s,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  tagInput: {
    flex: 1,
    fontSize: FontSize.s,
    color: Colors.textPrimary,
    padding: Spacing.xs,
    minWidth: 100,
  },
  datePickerContainer: {
    marginBottom: Spacing.m,
  },
  notesInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    minHeight: 120,
    fontSize: FontSize.s,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    ...Shadow.small,
  },
});
