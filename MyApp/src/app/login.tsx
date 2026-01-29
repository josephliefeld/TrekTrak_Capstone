import { Link, Stack } from 'expo-router'
import { StyleSheet, TextInput, Button, Alert, useColorScheme, Pressable, Text } from 'react-native'
import { useState } from 'react'

import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'
import { supabase } from '@/src/components/lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null)

  const colorScheme = useColorScheme() // "light" or "dark"
  const isDark = colorScheme === 'dark'

  const handleLogin = async () => {
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData?.user) {
      setLoading(false)
      Alert.alert('Login failed', authError?.message ?? 'No user returned')
      return
    }

    const userID = authData.user.id

    const { data: profile, error: profileError } = await supabase
    .from('profiles')
      .select('role')
      .eq('profile_id', userID)
      .single()

    setLoading(false)

    if (profileError || !profile) {
      Alert.alert('Login failed', 'Could not fetch user profile.')
      return
    }

    if (profile.role !== 2) {
      // Not a participant
      await supabase.auth.signOut() // optional, log them out immediately
      Alert.alert('Access denied', 'Only participants are allowed to log in on this app.')
      //console.log("Only participants allowed!")
      return
    }

    Alert.alert('Welcome!', 'You have successfully logged in.')
  }

  const inputTextColor = isDark ? '#F9FAFB' : '#111827'
  const inputBorderColor = isDark ? '#4B5563' : '#D1D5DB'
  const placeholderColor = isDark ? '#9CA3AF' : '#6B7280'
  const focusedBorderColor = '#2563EB' // blue when focused

  return (
    <>
      <Stack.Screen options={{ title: 'Login' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Welcome to TrekTrak!</ThemedText>

        <TextInput
          style={[
            styles.input,
            {
              color: inputTextColor,
              borderColor: focusedInput === 'email' ? focusedBorderColor : inputBorderColor,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={placeholderColor}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
        />

        <TextInput
          style={[
            styles.input,
            {
              color: inputTextColor,
              borderColor: focusedInput === 'password' ? focusedBorderColor : inputBorderColor,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={placeholderColor}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocusedInput('password')}
          onBlur={() => setFocusedInput(null)}
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? '#4F46E5' : '#6366F1', 
              paddingVertical: 16,   
              paddingHorizontal: 24, 
              borderRadius: 8,       
              width: '50%',
              alignItems: 'center',
              marginTop: 12,
            },
          ]}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </Pressable>

        <Link href="/signup" style={{ marginTop: 16 }}>
          <Text style={{ color: '#2563EB' }}>
            Don’t have an account? Sign up here!
          </Text>
        </Link>
      </ThemedView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '50%',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
})
