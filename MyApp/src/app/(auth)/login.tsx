import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  // ✅ Mock credentials
  const MOCK_USERNAME = 'testuser';
  const MOCK_PASSWORD = 'password123';

  // Reset lock after 1 minute
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (locked) {
      timer = setTimeout(() => {
        setAttempts(0);
        setLocked(false);
      }, 60000); // 1 minute
    }
    return () => clearTimeout(timer);
  }, [locked]);

  const handleLogin = () => {
    if (locked) {
      Alert.alert('Too many attempts', 'Please try again in 1 min');
      return;
    }

    if (username === MOCK_USERNAME && password === MOCK_PASSWORD) {
      // 🔹 Removed AsyncStorage token logic
      router.replace('/(tabs)'); // Navigate to tabs
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLocked(true);
        Alert.alert('Too many attempts', 'Please try again in 1 min');
      } else {
        Alert.alert('Invalid login', 'Invalid username or password. Please try again.');
      }
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup'); // Navigate to signup page
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to TrekTrak!</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpText}>New user? Sign up here!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  welcome: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  button: {
    width: '80%',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  signUpButton: { marginTop: 16 },
  signUpText: { color: '#007AFF', fontSize: 14, textDecorationLine: 'underline' },
});
