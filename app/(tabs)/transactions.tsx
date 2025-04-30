import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { fetchUserData, fetchUserTransactions } from '../config/backend';
import TransactionItem from '@/components/TransactionItem';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants/Theme';
import { auth } from '../config/firebase';
import { UserData } from '../types';
import { CategoryType } from '../types';
import { Transaction } from '../types';

// Type definitions


interface TransactionGroup {
  title: string;
  data: Transaction[];
}

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions: Transaction[]): TransactionGroup[] => {
  if (!transactions || transactions.length === 0) {
    return [];
  }
  
  const groups: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    if (!transaction.date) return;
    
    // Handle string date format
    const dateKey = transaction.date.split('T')[0];
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
  });
  
  // Convert to array of groups and sort by date (newest first)
  return Object.entries(groups)
    .map(([dateString, transactions]) => ({
      title: formatDateHeader(new Date(dateString)),
      data: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.data[0].date).getTime();
      const dateB = new Date(b.data[0].date).getTime();
      return dateB - dateA;
    });
};

// Format date for section headers
const formatDateHeader = (date: Date): string => {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      // Handle invalid date by returning a fallback format
      return 'Unknown Date';
    }
    
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
      const options = { month: 'long', day: 'numeric', year: 'numeric' } as Intl.DateTimeFormatOptions;
      return dateOnly.toLocaleDateString('en-US', options);
    }
  } catch (error) {
    console.error('Error formatting date header:', error);
    return 'Date Error';
  }
};

export default function TabTransactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [userData, setUserData] = useState<UserData | null>(null);

  
  
  const filters = [
    { id: 'all', label: 'All', icon: 'list' },
    { id: 'expense', label: 'Expenses', icon: 'arrow-down' },
    { id: 'income', label: 'Income', icon: 'arrow-up' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      console.log('Transactions screen is focused - refreshing data');
      fetchUserTransactions().then((data) => {
        console.log(data);
        if (data) {
          setTransactions(data);
        }
      });
      
      return () => {
        // Cleanup function if needed when screen loses focus
      };
    }, [])
  );

  useEffect(() => {
    console.log("Filtering effect running with", transactions.length, "transactions");
    filterTransactions(activeFilter, searchQuery);
  }, [searchQuery, activeFilter, transactions]);

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
        (t.category as CategoryType).toLowerCase().includes(lowercaseQuery)
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
