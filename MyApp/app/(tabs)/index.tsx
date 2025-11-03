import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HelloWave } from '@/components/hello-wave';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>

      {/* Title Section */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">🏃‍♂️ TrekTrak</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Subtitle / Description */}
      <ThemedView style={styles.introContainer}>
        <ThemedText type="subtitle">Welcome to Your Fitness Journey</ThemedText>
        <ThemedText>
          Track your workouts, join events, and climb the leaderboards with TrekTrak. 
          Your next adventure starts here!
        </ThemedText>
      </ThemedView>

      {/* Navigation Links */}
      <ThemedView style={styles.linksContainer}>
        <Link href="/events" style={styles.linkButton}>
          <ThemedText type="subtitle" style={styles.linkText}>🏅 Events</ThemedText>
        </Link>

        <Link href="/leaderboards" style={styles.linkButton}>
          <ThemedText type="subtitle" style={styles.linkText}>🥇 Leaderboards</ThemedText>
        </Link>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  introContainer: {
    gap: 8,
    marginBottom: 24,
  },
  linksContainer: {
    gap: 16,
    marginBottom: 24,
  },
  linkButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
  },
});
