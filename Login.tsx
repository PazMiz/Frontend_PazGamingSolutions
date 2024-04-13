import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [randomCode, setRandomCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    generateRandomCode();
    checkLoginStatus();
  }, []);

  const generateRandomCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRandomCode(code);
  };

  const checkLoginStatus = async () => {
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    const displayName = await AsyncStorage.getItem('userDisplayName');

    if (isLoggedIn === 'true' && displayName) {
      setIsLoggedIn(true);
      setUserDisplayName(displayName);
    }
  };

  const handleLogin = async () => {
    if (enteredCode !== randomCode) {
        Alert.alert('Invalid Code', 'Please enter the correct code to proceed.');
        return;
    }

    try {
        const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

        const response = await fetch('http://127.0.0.1:8000/login/', {  // Update endpoint as necessary
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: capitalizedUsername,
                password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            await AsyncStorage.setItem('isLoggedIn', 'true');
            await AsyncStorage.setItem('userDisplayName', capitalizedUsername);
            await AsyncStorage.setItem('authToken', data.access);  // Assuming 'access' token is returned
            console.log("User ID : ",data.user_id);
            await AsyncStorage.setItem('user_id',data.user_id.toString());

            // Retrieve CSRF token from the 'set-cookie' header and save it
            const csrfToken = data.csrf_token;
            console.log("csrf_token: ",csrfToken);
            await AsyncStorage.setItem('csrftoken', csrfToken);

            setIsLoggedIn(true);
            setUserDisplayName(capitalizedUsername);
            Alert.alert('Login Successful', 'You are now logged in.');
        } else {
            Alert.alert('Login Failed', 'Invalid username or password.');
        }
    } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Login Error', 'An error occurred during login.');
    }
};


async function retrieveUserId() {
    const userId = await AsyncStorage.getItem('user_id');
    console.log('Retrieved User ID:', userId);
    return userId;
}

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('userDisplayName');
    setIsLoggedIn(false);
    setUserDisplayName('');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleTogglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <>
          <Text style={styles.title}>Welcome, {userDisplayName}!</Text>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleGoBack}>
            <Text style={styles.buttonText}>Go Back to Homepage</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Gaming Login</Text>
          <Text style={styles.codeText}>Enter the following code:</Text>
          <Text style={styles.code}>{randomCode}</Text>
          <TextInput
            style={styles.input}
            placeholder="Code"
            value={enteredCode}
            onChangeText={setEnteredCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={handleTogglePasswordVisibility}
            >
              <Text>{passwordVisible ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleGoBack}>
            <Text style={styles.buttonText}>Go Back to Homepage</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  codeText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  code: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: 'white',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    height: 40,
    backgroundColor: 'white',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 12,
  },
});

export default LoginScreen;
