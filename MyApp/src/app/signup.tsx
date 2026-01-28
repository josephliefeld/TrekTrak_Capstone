import { Stack, Link, router } from 'expo-router'
import { StyleSheet, TextInput, Alert, useColorScheme, Pressable, Text } from 'react-native'
import { useState } from 'react'

import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'
import { supabase } from '@/src/components/lib/supabase'

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newUsername, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | 'username' | null>(null)

  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const inputTextColor = isDark ? '#F9FAFB' : '#111827'
  const inputBorderColor = isDark ? '#4B5563' : '#D1D5DB'
  const placeholderColor = isDark ? '#9CA3AF' : '#6B7280'
  const focusedBorderColor = '#2563EB'

  const handleSignUp = async () => {
    if (!email || !password || !newUsername) {
      Alert.alert('Missing fields', 'Please complete all fields')
      return
    }

    setLoading(true)

    const { data: existingUser } = await supabase
    .from('profiles')
        .select('id')
        .eq('username', newUsername)
        .single()

    if (existingUser) {
        Alert.alert('Username taken', 'Please choose another username')
        return
        }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (!data || !data.user) {
        setLoading(false)
        Alert.alert('Sign up failed', 'No user returned from Supabase')
        return
      }
    
    const userID = data.user.id

    const { error: profileError } = await supabase
        .from('profiles') 
        .update({ 
            username: newUsername, 
            role: 2 
        }) 
        .eq('profile_id', userID)

    setLoading(false)

    if (profileError) {
      Alert.alert('Sign up failed', profileError.message)
      return
    }

    Alert.alert('Success', 'Your account has been created!')
    router.replace('/(tabs)')
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Sign Up' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Create an Account</ThemedText>

        <TextInput
            style={[
                styles.input,
                {
                color: inputTextColor,
                borderColor:
                    focusedInput === 'username' ? focusedBorderColor : inputBorderColor,
                },
            ]}
            placeholder="Username"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            value={newUsername}
            onChangeText={setUsername}
            onFocus={() => setFocusedInput('username')}
            onBlur={() => setFocusedInput(null)}
        />


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
          onPress={handleSignUp}
          disabled={loading}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? '#065F46' : '#10B981',
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </Text>
        </Pressable>

        <Link href="/login" style={{ marginTop: 16 }}>
          <Text style={{ color: '#2563EB' }}>
            Already have an account? Log in
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
})
