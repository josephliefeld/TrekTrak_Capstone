import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import ParallaxScrollView from '@/src/components/parallax-scroll-view';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';

export default function StatsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#3B3B3B', dark: '#000' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      
      {/* Header */}
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title" style={styles.titleText}>📊 Your Stats</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitleText}>
          Track your daily activity and global progress
        </ThemedText>
      </ThemedView>

      {/* Stats Section */}
      <ThemedView style={styles.statsContainer}>
        <View style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.label}>Steps Today</ThemedText>
          <ThemedText type="title" style={styles.value}>6420</ThemedText>
        </View>

        <View style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.label}>🌍 Total Steps</ThemedText>
          <ThemedText type="title" style={styles.value}>152,300</ThemedText>
        </View>

        <View style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.label}>🏆 Tiers Earned Today</ThemedText>
          <ThemedText type="title" style={styles.value}>2</ThemedText>
        </View>

        <View style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.label}>🎯 Active Events</ThemedText>
          <ThemedText type="title" style={styles.value}>3</ThemedText>
        </View>
      </ThemedView>

      {/* Placeholder for Future Database Connection */}
      <ThemedView style={styles.footer}>
        <ThemedText type="default" style={styles.footerText}>
          (Live stats will update once Supabase is connected)
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 160,
    width: 280,
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.2,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleText: {
    color: '#FFFFFF',
  },
  subtitleText: {
    color: '#CCCCCC',
  },
  statsContainer: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 16,
    gap: 20,
  },
  statBox: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  label: {
    color: '#AAAAAA',
    marginBottom: 6,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#777777',
  },
});
