import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View, ActivityIndicator, Text } from 'react-native';
import { useState, useEffect } from 'react';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 🔹 For testing: always force login first
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Simulate auth check delay (optional)
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500); // small delay to simulate checking
    return () => clearTimeout(timer);
  }, []);

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Checking authentication...</Text>
      </View>
    );
  }


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Logged in → tabs
          <Stack.Screen name="(tabs)" />
        ) : (
          // Not logged in → auth screens
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
