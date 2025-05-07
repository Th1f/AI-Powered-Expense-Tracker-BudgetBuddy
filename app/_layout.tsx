import { Slot, Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

// This layout serves as the root layout for all screens
export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';
    const isAuthScreen = segments[0] === 'login' || segments[0] === 'signup';
    const isAddScreen = segments[0] === 'add';
    
    if (!inAuthGroup && !isAuthScreen && !isAddScreen) {
      router.replace('/login');
    }
  }, [segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
