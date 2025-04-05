import { Stack } from 'expo-router';
import React from 'react';

export default function AddLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Add Expense' }} />
      <Stack.Screen name="manual" options={{ title: 'Manual Entry' }} />
      <Stack.Screen name="voice" options={{ title: 'Voice Entry' }} />
      <Stack.Screen name="scan" options={{ title: 'Scan Receipt' }} />
    </Stack>
  );
}
