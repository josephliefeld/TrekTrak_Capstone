import { Image } from 'expo-image';
import {
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import ParallaxScrollView from '@/src/components/parallax-scroll-view';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useState, useRef, useEffect } from 'react';

import { supabase } from '@/src/components/lib/supabase';
import { useAuthContext } from '@/hooks/use-auth-context';

type Event = {
  event_id: number;
  organizer: string;
  event_name: string;
  event_type: string;
  is_private: boolean;
  start_date: string;
  end_date: string;
  event_description: string;
  is_publshed: boolean;
};

export default function EventsScreen() {
  const [search, setSearch] = useState('');
  const [enrolledEvents, setEnrolledEvents] = useState<Event[]>([]);
  const [bannerMessage, setBannerMessage] = useState('');
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  const profile = useAuthContext();

  const [events, setEvents] = useState<Event[]>([]);

  async function fetchEvents() {
    const { data, error } = await supabase
      .from<"events", Event>('events')
      .select('*');

    if (!error) setEvents(data ?? []);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const enrollProfileInEvent = async (eventId: number) => {
    await supabase.from('daily_steps').insert({
      profile_id: profile.profile?.profile_id,
      event_id: eventId,
      dailysteps: 0,
      stepdate: new Date().toISOString().split('T')[0],
    });
  };

  const unenrollProfileFromEvent = async (eventId: number) => {
    await supabase
      .from('daily_steps')
      .delete()
      .eq('profile_id', profile.profile?.profile_id)
      .eq('event_id', eventId);
  };

  const showBanner = (message: string) => {
    setBannerMessage(message);
    Animated.timing(bannerOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(bannerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 3000);
  };

  const handleEnroll = (event: Event) => {
    if (enrolledEvents.length >= 1) {
      showBanner('⚠️ You may only enroll in one event at a time');
      return;
    }
    setEnrolledEvents([event]);
    enrollProfileInEvent(event.event_id);
    showBanner('✅ You have enrolled in the event!');
  };

  const handleUnenroll = (event: Event) => {
    setEnrolledEvents([]);
    unenrollProfileFromEvent(event.event_id);
    showBanner('❌ You have unenrolled from the event.');
  };

  const filteredEvents = events.filter(event =>
    event.event_name.toLowerCase().includes(search.toLowerCase())
  );

  const availableEvents = filteredEvents.filter(
    event => !enrolledEvents.includes(event)
  );

  const renderEventItem = (event: Event, enrolled = false) => (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.cardContent}>
        <ThemedText type="subtitle">{event.event_name}</ThemedText>
        <ThemedText style={styles.cardMeta}>
          {event.event_type || 'Activity'}
        </ThemedText>
      </ThemedView>

      <TouchableOpacity
        onPress={() =>
          enrolled ? handleUnenroll(event) : handleEnroll(event)
        }
        style={[
          styles.actionButton,
          enrolled ? styles.unenroll : styles.enroll,
        ]}
      >
        <ThemedText style={styles.actionText}>
          {enrolled ? 'Unenroll' : 'Enroll'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      {/* Toast Banner */}
      {bannerMessage && (
        <Animated.View
          style={[styles.banner, { opacity: bannerOpacity }]}
        >
          <ThemedText style={styles.bannerText}>
            {bannerMessage}
          </ThemedText>
        </Animated.View>
      )}

      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">🏅 Events</ThemedText>
        <ThemedText style={styles.subtitle}>
          Join challenges and track your activity
        </ThemedText>
      </ThemedView>

      {/* Search */}
      <ThemedView style={styles.searchWrapper}>
        <TextInput
          placeholder="Search events…"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </ThemedView>

      {/* Enrolled */}
      {enrolledEvents.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Your Active Event</ThemedText>
          <FlatList
            data={events.filter(e => enrolledEvents.includes(e))}
            keyExtractor={item => item.event_id.toString()}
            renderItem={({ item }) => renderEventItem(item, true)}
          />
        </ThemedView>
      )}

      {/* Available */}
      <ThemedView style={styles.section}>
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
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 170,
    width: 280,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },

  banner: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: 14,
    backgroundColor: '#111',
    zIndex: 999,
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontWeight: '600',
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 6,
  },

  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  section: {
    marginBottom: 24,
  },

  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardMeta: {
    opacity: 0.6,
    fontSize: 12,
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  enroll: {
    backgroundColor: '#4CAF50',
  },
  unenroll: {
    backgroundColor: '#F44336',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});