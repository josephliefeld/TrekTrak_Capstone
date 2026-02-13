import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
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
    
    // const handleSaveChanges = () => {
      
    //   console.log("Navigate to Profile page");
    //   router.push('/profile')
    // };
    
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handlePasswordChange = async () => {
      setError('')

      if(password != confirmPassword)
      {
        setError('Passwords do not match');
        return;
      }

      // other checks would go here

      // setLoading(true);

      const {error} = await supabase.auth.updateUser({
        password: password
      });

      // setLoading(false);

      if(error) {
        setError(error.message);
      } else {
        alert('Password updated.');
        setPassword('');
        setConfirmPassword('');
      }

      console.log("Navigate to Profile page");
      router.push('/profile')
    };

    useEffect(() => {
      async function loadProfile() {
        try {
          // get the current user
          const {
            data: {user},
            error: authError,
          } = await supabase.auth.getUser();

          if (authError || !user) {
            throw new Error('No authenticated user');
          }

          // get the user's profile information
          const {data, error} = await supabase
            .from('profiles')
            .select('*')
            .eq('profile_id', user.id)
            .single()
          
          if(error)
          {
            throw error;
          }

          setProfile(data);

        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }

      loadProfile();
    }, [])

    if(loading) return <ThemedText>Loading...</ThemedText>;
    if(!profile) return <ThemedText>Profile not found.</ThemedText>;

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
                    <ThemedText style={styles.infoValue}>{profile.username}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoCard}>
                    <ThemedText style={styles.infoLabel}>Email: </ThemedText>
                    <ThemedText style={styles.infoValue}>{profile.email}</ThemedText>
                </ThemedView>
            </ThemedView>
            <ThemedView style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordTextInput}
                placeholder='New Password'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                style={styles.passwordTextInput}
                placeholder='Confirm Password'
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </ThemedView>
            <ThemedView>
                <TouchableOpacity style={styles.saveButton} onPress={handlePasswordChange}>
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
  passwordContainer:{
    backgroundColor: '#e5e2dd',
    padding: 20,
    borderRadius: 8,
    gap: 20,
  },
  passwordTextInput:{
    backgroundColor: '#e5e2dd',
    color: '#252525',
    // marginBottom: 6,
    padding: 5,
    borderRadius: 10
  },
  saveButton: {
    backgroundColor: '#5f5953',
    color: '#5f5953',
    // marginBottom: 6,
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  saveButtonText: {
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