import { StyleSheet, ScrollView, SafeAreaView } from 'react-native'

import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'
import { useAuthContext } from '@/hooks/use-auth-context'

export default function HomeScreen() {
  const { profile } = useAuthContext()

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Card */}
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle">Username</ThemedText>
            <ThemedText>{profile?.username}</ThemedText>

            <ThemedText type="subtitle" style={{ marginTop: 12 }}>
              Email
            </ThemedText>
            <ThemedText>{profile?.email}</ThemedText>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff', // ensures background extends into the safe area
  },
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 8,
  },

  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },

  welcomeText: {
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
})