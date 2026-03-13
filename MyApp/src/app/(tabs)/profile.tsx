import { useEffect, useCallback, useState } from 'react'
import { StyleSheet, TouchableOpacity, ActivityIndicator, View, Pressable } from 'react-native'
import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'
import { useRouter, useFocusEffect } from 'expo-router'
import { supabase } from '@/src/components/lib/supabase'

type Profile = {
  profile_id: string
  username: string
  email: string
}

export default function ProfileScreen() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

  const handleEditProfile = () => {
    router.push('../profile_edit/editProfile')
  }

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setErrorMessage(null)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('profile_id, username, email')
        .eq('profile_id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setLastUpdatedAt(new Date())

    } catch (error: any) {
      console.error(error)
      setErrorMessage(error?.message ?? 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useFocusEffect(
    useCallback(() => {
      loadProfile()
    }, [loadProfile])
  )

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    )
  }

  if (!profile) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Profile not found.</ThemedText>

        {errorMessage && (
          <ThemedText style={styles.errorText}>
            {errorMessage}
          </ThemedText>
        )}

        <Pressable style={styles.refreshButton} onPress={loadProfile}>
          <ThemedText style={styles.refreshText}>
            Retry
          </ThemedText>
        </Pressable>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>

      <View style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText style={styles.subtitle}>
          Manage your account details
        </ThemedText>
      </View>

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

      <View style={styles.actions}>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleEditProfile}
        >
          <ThemedText style={styles.primaryButtonText}>
            Change Password
          </ThemedText>
        </TouchableOpacity>

        <Pressable
          style={styles.secondaryButton}
          onPress={loadProfile}
        >
          <ThemedText style={styles.secondaryButtonText}>
            Refresh Profile
          </ThemedText>
        </Pressable>

      </View>

      {lastUpdatedAt && (
        <ThemedText style={styles.footerText}>
          Last updated {lastUpdatedAt.toLocaleTimeString()}
        </ThemedText>
      )}

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

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },

  errorText: {
    color: '#ef4444'
  },

  card: {
    backgroundColor: '#f9fafb',
    padding: 18,
    borderRadius: 14,
    gap: 16
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

  actions: {
    marginTop: 30,
    gap: 12
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
  },

  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },

  secondaryButtonText: {
    fontWeight: '500'
  },

  refreshButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10
  },

  refreshText: {
    color: '#fff'
  },

  footerText: {
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.6
  }

})