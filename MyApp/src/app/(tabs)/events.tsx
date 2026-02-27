import { Image } from 'expo-image';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, Animated } from 'react-native';
import ParallaxScrollView from '@/src/components/parallax-scroll-view';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useState, useRef, useEffect } from 'react';

import { supabase } from '@/src/components/lib/supabase'
import { useAuthContext } from '@/hooks/use-auth-context'


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

const sampleEvents = [
  { id: '1', name: 'Morning Run' },
  { id: '2', name: 'TrekTrak Global Challenge' },
  { id: '3', name: 'Evening Yoga Session' },
  { id: '4', name: '5K Charity Run' },
];

export default function EventsScreen() {
  const [search, setSearch] = useState('');
  const [enrolledEvents, setEnrolledEvents] = useState<Event[]>([]);
  const [bannerMessage, setBannerMessage] = useState('');
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  const profile = useAuthContext()
  

  //Fetch events from Supabase
  const[events, setEvents] = useState<Event[]>([]);


  async function fetchEvents() {
      const { data, error } = await supabase.from<"events", Event>("events").select("*");
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data ?? []);
      }
  };

  useEffect(() => {
    fetchEvents();
    console.log("Fetched", events)
  }, []);

  // Add user to daily_steps table for event they enrolled in
  // TODO: Replace profile_id with users logged in id once auth is completed
  const enrollProfileInEvent = async (eventId: number) => {
    const { data, error } = await supabase
      .from("daily_steps")
      .insert(
        {
          profile_id: profile.profile?.profile_id,
          event_id: eventId,
          dailysteps: 0,
          stepdate: new Date().toISOString().split('T')[0]
        }
      )

      if (error) {
        console.error("Error enrolling: ", error)
      }
  }

  const unenrollProfileFromEvent = async (eventId: number) => {
    const {error} = await supabase
      .from("daily_steps")
      .delete()
      .eq("profile_id", profile.profile?.profile_id)
      .eq("event_id", eventId)  

      if (error) {
        console.error("Error unenrolling: ", error)
      }
  }


  // Banner display logic
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
    }, 3000); // disappears after 3 seconds
  };

  // -------------------------
  // UPDATED: Only 1 event active at a time
  // -------------------------
  const handleEnroll = async (event: Event) => {
    if (enrolledEvents.length >= 1) {
      showBanner("⚠️ You may only enroll in one event at a time");
      return;
    }

    // Check if event is private
    if (event.is_private) {
      const allowed = await isUserAllowedForPrivateEvent(event.event_id, profile.profile?.email || "");
      if (!allowed) {
        showBanner("❌ You are not allowed to join this private event.");
        return;
      }
    }

    setEnrolledEvents([event]); // enroll in ONLY this event

    enrollProfileInEvent(event.event_id); //Add user to event

    showBanner('✅ You have enrolled in the event!');
  };

  const handleUnenroll = (event: Event) => {
    setEnrolledEvents([]);

    unenrollProfileFromEvent(event.event_id); //Remove user from event

    showBanner('❌ You have unenrolled from the event.');
  };

  const filteredEvents = events.filter(event =>
    event.event_name.toLowerCase().includes(search.toLowerCase())
  );

  const availableEvents = filteredEvents.filter(
    event => !enrolledEvents.includes(event)
  );

  const renderEventItem = (event: Event, enrolled = false) => (
    <ThemedView style={styles.eventItem}>
      <ThemedText>{event.event_name}</ThemedText>
      <TouchableOpacity
        onPress={() =>
          enrolled ? handleUnenroll(event) : handleEnroll(event)
        }
        style={[styles.button, enrolled ? styles.unenrollButton : styles.enrollButton]}
      >
        <ThemedText type="subtitle">
          {enrolled ? 'Unenroll' : 'Enroll'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  const isUserAllowedForPrivateEvent = async (eventId: string | number, userEmail: string) => {
    const { data, error } = await supabase
      .from("private_event_members")
      .select("email")
      .eq("event_id", eventId)
      .eq("email", profile.profile?.email)
      .single();
  
    if (error && error.code !== "PGRST116") { // PGRST116 = no rows found
      console.error("Error checking private event:", error);
      return false;
    }
  
    return !!data; // true if the user is allowed, false otherwise
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>

      {/* Banner */}
      {bannerMessage ? (
        <Animated.View style={[styles.banner, { opacity: bannerOpacity }]}>
          <ThemedText style={styles.bannerText}>{bannerMessage}</ThemedText>
        </Animated.View>
      ) : null}

      {/* Header Section */}
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">🏅 Events</ThemedText>
      </ThemedView>

      {/* Description Section */}
      <ThemedView style={styles.descriptionContainer}>
        <ThemedText type="subtitle">Upcoming Challenges & Activities</ThemedText>
        <ThemedText>
          Browse events, enroll to participate, and track your activity!
        </ThemedText>
      </ThemedView>

      {/* Search Section */}
      <ThemedView style={styles.searchContainer}>
        <TextInput
          placeholder="Search events by name..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </ThemedView>

      {/* Enrolled Events */}
      {enrolledEvents.length > 0 && (
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">Your Enrolled Event</ThemedText>
          <FlatList
            data={events.filter(event => enrolledEvents.includes(event))} 
            keyExtractor={item => item.event_id.toString()}
            renderItem={({ item }) => renderEventItem(item, true)}
          />
        </ThemedView>
      )}

      {/* Available Events */}
      <ThemedView style={styles.sectionContainer}>
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
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  headerContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  descriptionContainer: {
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sectionContainer: {
    marginVertical: 12,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginHorizontal: 16,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  enrollButton: {
    backgroundColor: '#4CAF50',
  },
  unenrollButton: {
    backgroundColor: '#F44336',
  },
  banner: {
    top: 0,
    width: '100%',
    backgroundColor: '#333',
    padding: 12,
    zIndex: 999,
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
