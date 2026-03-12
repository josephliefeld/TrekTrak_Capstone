import { useEffect, useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'
import { useRouter } from 'expo-router'
import { supabase } from '@/src/components/lib/supabase'

type Profile = {
  profile_id: string
  username: string
  email: string
}

export default function EditProfileScreen() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handlePasswordChange = async () => {
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
    } else {
      alert('Password updated.')
      setPassword('')
      setConfirmPassword('')
      router.push('/profile')
    }
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) throw new Error('No authenticated user')

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('profile_id', user.id)
          .single()

        if (error) throw error

        setProfile(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    )
  }

  if (!profile) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Profile not found.</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>

      <View style={styles.header}>
        <ThemedText type="title">Edit Profile</ThemedText>
        <ThemedText style={styles.subtitle}>
          Update your password
        </ThemedText>
      </View>

      {/* Profile Info */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>Username</ThemedText>
          <ThemedText style={styles.value}>{profile.username}</ThemedText>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedText style={styles.value}>{profile.email}</ThemedText>
        </View>
      </View>

      {/* Password Section */}
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {error !== '' && (
          <ThemedText style={styles.error}>
            {error}
          </ThemedText>
        )}
      </View>

      {/* Save Button */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePasswordChange}
        >
          <ThemedText style={styles.primaryButtonText}>
            Save Changes
          </ThemedText>
        </TouchableOpacity>
      </View>

    </ThemedView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },

  header: {
    marginBottom: 24
  },

  subtitle: {
    marginTop: 4,
    opacity: 0.6
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  card: {
    backgroundColor: '#f9fafb',
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    gap: 12
  },

  infoRow: {
    gap: 4
  },

  label: {
    fontSize: 12,
    opacity: 0.6
  },

  value: {
    fontSize: 16,
    fontWeight: '600'
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb'
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12
  },

  error: {
    color: '#ef4444'
  },

  actions: {
    marginTop: 10
  },

  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: '600'
  }

})