import { StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, View, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'
import { useAuthContext } from '@/hooks/use-auth-context'
import { useEnrollment } from '@/hooks/use-enrollment'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
  const { profile } = useAuthContext()
  const router = useRouter()

  // Use your enrollment hook
  const { loading, enrolledEvent, error } = useEnrollment(profile?.profile_id ?? null)

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ThemedView style={styles.container}>
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        </ThemedView>
      </SafeAreaView>
    )
  }

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

          {/* Error Card (optional) */}
          {error ? (
            <ThemedView style={[styles.card, { marginTop: 16 }]}>
              <ThemedText type="subtitle">Error loading event</ThemedText>
              <ThemedText style={{ marginTop: 6 }}>{error}</ThemedText>
            </ThemedView>
          ) : null}

          {/* Enrolled Event Card */}
          {enrolledEvent ? (
            <ThemedView style={[styles.card, { marginTop: 16 }]}>
              <ThemedText type="subtitle">Your Event</ThemedText>

              <ThemedText style={styles.eventTitle}>{enrolledEvent.event_name}</ThemedText>

              <ThemedText style={styles.eventMeta}>
                {enrolledEvent.event_type} • {enrolledEvent.start_date} → {enrolledEvent.end_date}
              </ThemedText>

              {enrolledEvent.event_description ? (
                <ThemedText style={{ marginTop: 8 }}>
                  {enrolledEvent.event_description}
                </ThemedText>
              ) : null}
            </ThemedView>
          ) : (
            // Not enrolled: friendly nudge
            <ThemedView style={[styles.card, { marginTop: 16, alignItems: 'flex-start', gap: 8 }]}>
              <ThemedText type="subtitle">No Active Event</ThemedText>
              <ThemedText style={{ opacity: 0.8 }}>
                You’re not enrolled in an event yet. Join one to start tracking your progress and compete on leaderboards!
              </ThemedText>

              <TouchableOpacity
                onPress={() => router.push('/events')}
                style={styles.ctaButton}
              >
                <ThemedText style={styles.ctaButtonText}>Browse Events</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { flex: 1 },
  content: {
    padding: 20,
    paddingTop: 8,
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Event card styles
  eventTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 6,
  },
  eventMeta: {
    opacity: 0.7,
    marginTop: 4,
  },

  // CTA button (when not enrolled)
  ctaButton: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
})