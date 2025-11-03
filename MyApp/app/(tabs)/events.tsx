import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function EventsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      {/* Header Section */}
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">🏅 Events</ThemedText>
      </ThemedView>

      {/* Description Section */}
      <ThemedView style={styles.descriptionContainer}>
        <ThemedText type="subtitle">Upcoming Challenges & Activities</ThemedText>
        <ThemedText>
          This page lists all available fitness events you can participate in — from local
          running challenges to global TrekTrak competitions. Join an event, stay active,
          and earn your spot on the leaderboard!
        </ThemedText>
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
  },
});
