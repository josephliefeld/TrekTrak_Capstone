import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LeaderboardsScreen() {
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
        <ThemedText type="title">🥇 Leaderboards</ThemedText>
      </ThemedView>

      {/* Description Section */}
      <ThemedView style={styles.descriptionContainer}>
        <ThemedText type="subtitle">Track Your Progress & Compete</ThemedText>
        <ThemedText>
          The Leaderboards page showcases top performers from all TrekTrak events. 
          Here you’ll soon be able to view rankings, compare stats, and track your 
          fitness progress in real time once the database connection is live.
        </ThemedText>
      </ThemedView>

      {/* Placeholder for Future Rankings */}
      <ThemedView style={styles.placeholderContainer}>
        <ThemedText type="defaultSemiBold">
          (Leaderboard data will appear here)
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
    marginBottom: 24,
  },
  placeholderContainer: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
 