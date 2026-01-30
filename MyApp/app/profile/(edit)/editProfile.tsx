// import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity } from 'react-native';
import ParallaxScrollView from '@/src/components/parallax-scroll-view';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
    const router = useRouter();
        
    const handleSaveChanges = () => {
        console.log("Navigate back to Profile page");
        router.push('/profile')
    };

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
                <ThemedText type="title">Edit Profile</ThemedText>
            </ThemedView>

            <ThemedView style={styles.informationContainer}>
                <ThemedView style={styles.infoCard}>
                    <ThemedText style={styles.infoLabel}>Username: </ThemedText>
                    <ThemedText style={styles.infoValue}>testUser</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoCard}>
                    <ThemedText style={styles.infoLabel}>Email: </ThemedText>
                    <ThemedText style={styles.infoValue}>testUser@oregonstate.edu</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoCard}>
                    <ThemedText style={styles.infoLabel}>Password: </ThemedText>
                    <ThemedText style={styles.infoValue}>testPass123$</ThemedText>
                </ThemedView>
            </ThemedView>
            <ThemedView>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                    <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
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
    flexDirection: 'row' 
  },
  infoLabel: {
    backgroundColor: '#e5e2dd',
    color: '#252525',
    // padding: 16,
    // borderRadius: 12,
    // alignItems: 'center',
    padding: 0,
  },
  infoValue: {
    backgroundColor: '#e5e2dd',
    color: '#252525',
    // marginBottom: 6,
    padding: 0,
    borderRadius: 12
  },
  saveButton: {
    backgroundColor: '#5f5953',
    color: '#5f5953',
    // marginBottom: 6,
    padding: 8,
    borderRadius: 8,
    width: 115,

  },
  saveButtonText: {
    backgroundColor: '#5f5953',
    color: '#e4dddd',
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