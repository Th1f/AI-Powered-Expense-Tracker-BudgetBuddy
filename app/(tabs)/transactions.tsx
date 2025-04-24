import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserData } from '../config/backend';
import TransactionItem from '@/components/TransactionItem';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants/Theme';
import { auth } from '../config/firebase';
import { UserData } from '../types';

// Type definitions
interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: 'food' | 'transport' | 'shopping' | 'entertainment' | 'health' | 'housing' | 'income' | 'other';
  date: Date;
  isExpense: boolean;
}

interface TransactionGroup {
  title: string;
  data: Transaction[];
}

// Mock data for demonstration purposes
const mockTransactions: Transaction[] = [
  { id: '1', title: 'Grocery Store', amount: 45.67, category: 'food', date: new Date(2025, 3, 2), isExpense: true },
  { id: '2', title: 'Uber Ride', amount: 12.50, category: 'transport', date: new Date(2025, 3, 1), isExpense: true },
  { id: '3', title: 'Movie Tickets', amount: 24.00, category: 'entertainment', date: new Date(2025, 3, 1), isExpense: true },
  { id: '4', title: 'Salary Deposit', amount: 2500.00, category: 'income', date: new Date(2025, 2, 28), isExpense: false },
  { id: '5', title: 'Rent Payment', amount: 1200.00, category: 'housing', date: new Date(2025, 2, 27), isExpense: true },
  { id: '6', title: 'Pharmacy', amount: 32.40, category: 'health', date: new Date(2025, 2, 25), isExpense: true },
  { id: '7', title: 'Online Shopping', amount: 78.50, category: 'shopping', date: new Date(2025, 2, 23), isExpense: true },
];

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions: Transaction[]): TransactionGroup[] => {
  const groups: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    const date = transaction.date;
    const dateKey = date.toISOString().split('T')[0];
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
  });
  
  // Convert to array of groups and sort by date (newest first)
  return Object.entries(groups)
    .map(([dateString, transactions]) => ({
      title: formatDateHeader(new Date(dateString)),
      data: transactions.sort((a, b) => b.date.getTime() - a.date.getTime()),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.data[0].date).getTime();
      const dateB = new Date(b.data[0].date).getTime();
      return dateB - dateA;
    });
};

// Format date for section headers
const formatDateHeader = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  if (dateOnly.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    // Format as Month Day, Year (e.g., April 1, 2025)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
};

export default function TabTransactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    fetchUserData().then((userData) => {
      setUserData(userData);
    });
  }, []);
  
  const filters = [
    { id: 'all', label: 'All', icon: 'list' },
    { id: 'expense', label: 'Expenses', icon: 'arrow-down' },
    { id: 'income', label: 'Income', icon: 'arrow-up' },
  ];
  
  useEffect(() => {
    filterTransactions(activeFilter, searchQuery);
  }, [searchQuery, activeFilter]);
  
  const filterTransactions = (filterId: string, query: string) => {
    let filtered = [...transactions];
    
    // Apply type filter
    if (filterId === 'expense') {
      filtered = filtered.filter(t => t.isExpense);
    } else if (filterId === 'income') {
      filtered = filtered.filter(t => !t.isExpense);
    }
    
    // Apply search query
    if (query.trim() !== '') {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(lowercaseQuery) || 
        t.category.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    setFilteredTransactions(filtered);
  };
  
  const handleFilterPress = (filterId: string) => {
    setActiveFilter(filterId);
  };
  
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  
  const handleTransactionPress = (transaction: Transaction) => {
    router.push({
      pathname: "/transaction/[id]",
      params: { id: transaction.id }
    });
  };
  
  console.log(auth.currentUser?.email);
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Transactions',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && styles.activeFilterButton
              ]}
              onPress={() => handleFilterPress(filter.id)}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={16} 
                color={activeFilter === filter.id ? '#fff' : Colors.textPrimary} 
                style={styles.filterIcon}
              />
              <Text 
                style={[
                  styles.filterText,
                  activeFilter === filter.id && styles.activeFilterText
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView style={styles.content}>
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map((group, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionHeader}>{group.title}</Text>
              {group.data.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  title={transaction.title}
                  amount={transaction.amount}
                  category={transaction.category}
                  date={transaction.date}
                  isExpense={transaction.isExpense}
                  onPress={() => handleTransactionPress(transaction)}
                />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>No transactions found</Text>
          </View>
        )}
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
  searchContainer: {
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.s,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    paddingHorizontal: Spacing.s,
    marginBottom: Spacing.s,
    ...Shadow.small,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: FontSize.s,
    color: Colors.textPrimary,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  filtersContainer: {
    paddingVertical: Spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.s,
    ...Shadow.small,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
  },
  filterIcon: {
    marginRight: Spacing.xs,
  },
  filterText: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.m,
  },
  section: {
    marginBottom: Spacing.m,
  },
  sectionHeader: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginVertical: Spacing.s,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginTop: Spacing.m,
  }
});
