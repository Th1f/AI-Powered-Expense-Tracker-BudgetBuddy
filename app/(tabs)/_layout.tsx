import { Tabs, useRouter, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';

import CustomTabBar from '../../components/CustomTabBar';
import { Colors } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { auth } from '../config/firebase';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return router.replace('/login');
  }
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
        }}
      />
    </Tabs>
  );
}
