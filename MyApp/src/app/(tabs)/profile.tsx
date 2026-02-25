import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import ParallaxScrollView from '@/src/components/parallax-scroll-view';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/components/lib/supabase';

type Profile = {
  profile_id: string;
  username: string;
  email: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleEditProfile = () => {
    router.push('../profile_edit/editProfile');
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) throw new Error('No authenticated user');

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('profile_id', user.id)
          .single();

        if (error) throw error;

        setProfile(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D3D47" />
      </ThemedView>
    );
  }

  if (!profile) {
    return <ThemedText>Profile not found.</ThemedText>;
  }

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
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">👤 Profile</ThemedText>
        <ThemedText style={styles.subtitle}>
          Manage your account details
        </ThemedText>
      </ThemedView>

      {/* Profile Info Card */}
      <ThemedView style={styles.card}>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.label}>Username</ThemedText>
          <ThemedText style={styles.value}>{profile.username}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.divider} />

        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedText style={styles.value}>{profile.email}</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Actions */}
      <ThemedView style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleEditProfile}>
          <ThemedText style={styles.primaryButtonText}>
            Change Password
          </ThemedText>
        </TouchableOpacity>
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
    opacity: 0.2,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 6,
    opacity: 0.7,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    gap: 12,
  },

  infoRow: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
  },

  actions: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  primaryButton: {
    backgroundColor: '#1D3D47',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});