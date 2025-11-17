import { Image } from 'expo-image';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, Animated } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useRef } from 'react';

const sampleEvents = [
  { id: '1', name: 'Morning Run' },
  { id: '2', name: 'TrekTrak Global Challenge' },
  { id: '3', name: 'Evening Yoga Session' },
  { id: '4', name: '5K Charity Run' },
];

export default function EventsScreen() {
  const [search, setSearch] = useState('');
  const [enrolledEvents, setEnrolledEvents] = useState<string[]>([]);
  const [bannerMessage, setBannerMessage] = useState('');
  const bannerOpacity = useRef(new Animated.Value(0)).current;

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

  const handleEnroll = (id: string) => {
    setEnrolledEvents(prev => [...prev, id]);
    showBanner('✅ You have enrolled in the event!');
  };

  const handleUnenroll = (id: string) => {
    setEnrolledEvents(prev => prev.filter(eid => eid !== id));
    showBanner('❌ You have unenrolled from the event.');
  };

  const filteredEvents = sampleEvents.filter(event =>
    event.name.toLowerCase().includes(search.toLowerCase())
  );

  const availableEvents = filteredEvents.filter(
    event => !enrolledEvents.includes(event.id)
  );

  const renderEventItem = (event: { id: string; name: string }, enrolled = false) => (
    <ThemedView style={styles.eventItem}>
      <ThemedText>{event.name}</ThemedText>
      <TouchableOpacity
        onPress={() =>
          enrolled ? handleUnenroll(event.id) : handleEnroll(event.id)
        }
        style={[styles.button, enrolled ? styles.unenrollButton : styles.enrollButton]}
      >
        <ThemedText type="subtitle">
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
          <ThemedText type="subtitle">Your Enrolled Events</ThemedText>
          <FlatList
            data={sampleEvents.filter(event => enrolledEvents.includes(event.id))}
            keyExtractor={item => item.id}
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
            keyExtractor={item => item.id}
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
    position: 'absolute',
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
