import { StyleSheet, TextInput, FlatList, TouchableOpacity, Animated, View } from 'react-native'
import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'
import { useState, useRef, useEffect } from 'react'

import { supabase } from '@/src/components/lib/supabase'
import { useAuthContext } from '@/hooks/use-auth-context'

type Event = {
  event_id: number
  organizer: string
  event_name: string
  event_type: string
  is_private: boolean
  start_date: string
  end_date: string
  event_description: string
  is_publshed: boolean
}

export default function EventsScreen() {

  const [search, setSearch] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [enrolledEvents, setEnrolledEvents] = useState<Event[]>([])
  const [bannerMessage, setBannerMessage] = useState('')

  const bannerOpacity = useRef(new Animated.Value(0)).current
  const profile = useAuthContext()

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")

    if (error) {
      console.error("Error fetching events:", error)
    } else {
      setEvents(data ?? [])
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const enrollProfileInEvent = async (eventId: number) => {
    const { error } = await supabase
      .from("daily_steps")
      .insert({
        profile_id: profile.profile?.profile_id,
        event_id: eventId,
        dailysteps: 0,
        stepdate: new Date().toISOString().split('T')[0]
      })

    if (error) console.error("Error enrolling:", error)
  }

  const unenrollProfileFromEvent = async (eventId: number) => {
    const { error } = await supabase
      .from("daily_steps")
      .delete()
      .eq("profile_id", profile.profile?.profile_id)
      .eq("event_id", eventId)

    if (error) console.error("Error unenrolling:", error)
  }

  const showBanner = (message: string) => {
    setBannerMessage(message)

    Animated.timing(bannerOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start()

    setTimeout(() => {
      Animated.timing(bannerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start()
    }, 3000)
  }

  const handleEnroll = (event: Event) => {
    if (enrolledEvents.length >= 1) {
      showBanner("You may only enroll in one event at a time")
      return
    }

    setEnrolledEvents([event])
    enrollProfileInEvent(event.event_id)
    showBanner("Successfully enrolled")
  }

  const handleUnenroll = (event: Event) => {
    setEnrolledEvents([])
    unenrollProfileFromEvent(event.event_id)
    showBanner("You have left the event")
  }

  const filteredEvents = events.filter(event =>
    event.event_name.toLowerCase().includes(search.toLowerCase())
  )

  const availableEvents = filteredEvents.filter(
    event => !enrolledEvents.includes(event)
  )

  const renderEventItem = (event: Event, enrolled = false) => (
    <View style={styles.eventCard}>

      <View style={{ flex: 1 }}>
        <ThemedText style={styles.eventTitle}>{event.event_name}</ThemedText>
        <ThemedText style={styles.eventMeta}>
          {event.event_type} • {event.start_date}
        </ThemedText>
      </View>

      <TouchableOpacity
        onPress={() => enrolled ? handleUnenroll(event) : handleEnroll(event)}
        style={[
          styles.actionButton,
          enrolled ? styles.unenrollButton : styles.enrollButton
        ]}
      >
        <ThemedText style={styles.buttonText}>
          {enrolled ? 'Leave' : 'Join'}
        </ThemedText>
      </TouchableOpacity>

    </View>
  )

  return (

    <ThemedView style={styles.container}>

      {bannerMessage ? (
        <Animated.View style={[styles.banner, { opacity: bannerOpacity }]}>
          <ThemedText style={styles.bannerText}>{bannerMessage}</ThemedText>
        </Animated.View>
      ) : null}

      <ThemedView style={styles.pageHeader}>
        <ThemedText type="title">Events</ThemedText>
        <ThemedText style={styles.subtitle}>
          Discover and join activity challenges
        </ThemedText>
      </ThemedView>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search events..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {enrolledEvents.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle">Your Event</ThemedText>

          <FlatList
            data={events.filter(e => enrolledEvents.includes(e))}
            keyExtractor={item => item.event_id.toString()}
            renderItem={({ item }) => renderEventItem(item, true)}
          />
        </View>
      )}

      <View style={styles.section}>
        <ThemedText type="subtitle">Available Events</ThemedText>

        {availableEvents.length > 0 ? (
          <FlatList
            data={availableEvents}
            keyExtractor={item => item.event_id.toString()}
            renderItem={({ item }) => renderEventItem(item)}
          />
        ) : (
          <ThemedText>No events match your search.</ThemedText>
        )}
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

  pageHeader: {
    marginBottom: 20
  },

  subtitle: {
    opacity: 0.6,
    marginTop: 4
  },

  searchContainer: {
    marginBottom: 16
  },

  searchInput: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10
  },

  section: {
    marginTop: 20
  },

  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: '#f9fafb',
    justifyContent: 'space-between'
  },

  eventTitle: {
    fontWeight: '600',
    fontSize: 16
  },

  eventMeta: {
    opacity: 0.6,
    marginTop: 2
  },

  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },

  enrollButton: {
    backgroundColor: '#2563eb'
  },

  unenrollButton: {
    backgroundColor: '#ef4444'
  },

  buttonText: {
    color: 'white',
    fontWeight: '600'
  },

  banner: {
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center'
  },

  bannerText: {
    color: 'white'
  }

})