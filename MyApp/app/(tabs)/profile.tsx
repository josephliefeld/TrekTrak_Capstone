import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { getProfile, Profile } from "../mock_user/profileService";

export default function ProfileScreen() {
    const router = useRouter();
    
    const handleEditProfile = () => {
      console.log("Navigate to Edit Profile page");
      router.push('/profile/editProfile')
    };
    
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
      async function loadProfile() {
        const data = await getProfile("user-88888");
        setProfile(data);
      }

      loadProfile();
    }, [])

    if(!profile) return <ThemedText>Loading...</ThemedText>;

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
            {/* Header Section */}
            <ThemedView style={styles.headerContainer}>
                <ThemedText type="title">Profile</ThemedText>
            </ThemedView>

            <ThemedView style={styles.informationContainer}>
                <ThemedView style={styles.infoCard}>
                    <ThemedText style={styles.infoLabel}>Username: </ThemedText>
                    <ThemedText style={styles.infoValue}>{profile.username}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoCard}>
                    <ThemedText style={styles.infoLabel}>Email: </ThemedText>
                    <ThemedText style={styles.infoValue}>{profile.email}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoCard}>
                    <ThemedText style={styles.infoLabel}>Password: </ThemedText>
                    <ThemedText style={styles.infoValue}>{profile.password}</ThemedText>
                </ThemedView>
            </ThemedView>
            <ThemedView>
                <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                    <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
                </TouchableOpacity>
            </ThemedView>
            
              
        </ParallaxScrollView>
    )
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
    color: '#e5e2dd',
  },
  subtitleText: {
    color: '#CCCCCC',
  },
  informationContainer: {
    backgroundColor: '#e5e2dd',
    padding: 20,
    borderRadius: 8,
    gap: 20,
  },
  infoCard: {
    backgroundColor: '#e5e2dd',
    alignItems: 'flex-start',
    flexDirection: 'row', 
  },
  infoLabel: {
    // backgroundColor: '#2A2A2A',
    // padding: 16,
    // borderRadius: 12,
    // alignItems: 'center',
    padding: 0,
    color: '#252525'
  },
  infoValue: {
    backgroundColor: '#e5e2dd',
    color: '#252525',
    // marginBottom: 6,
    padding: 0,
    borderRadius: 10
  },
  editButton: {
    backgroundColor: '#5f5953',
    color: '#5f5953',
    // marginBottom: 6,
    padding: 8,
    borderRadius: 8,
    width: 93,
  },
  editButtonText: {
    color: '#e5e2dd',
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
})