import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const RegistrationForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false); // State for terms of use checkbox
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const isValidEmail = (email) => {
    return email.endsWith('@gmail.com'); // Customize this validation as needed.
  };

  const handleSubmit = async () => {
    if (!isChecked) {
      setError('Please agree to the terms of use');
      return;
    }

    if (username.trim().length < 5 || email.trim().length === 0) {
      setError('Username, password, and email are required');
      return;
    }

    // Add more validation logic as needed

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('email', email);

      const response = await axios.post('http://127.0.0.1:8000/register/', formData);

      console.log('Registration successful:', response.data);
      setSuccess(true);
      setError('');
      setUsername('');
      setPassword('');
      setEmail('');
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid =
    username.trim().length >= 5 &&
    password.trim().length >= 5 &&
    email.trim().length > 0 &&
    isChecked;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration Form</Text>
      {success ? (
        <Text style={styles.successText}>Registration successful!</Text>
      ) : (
        <View>
          <Text style={styles.infoText}>Enter a username with 5 or more characters</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <Text style={styles.infoText}>Enter a password with at least 5 characters and one uppercase letter</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.infoText}>Enter your email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />

          {/* Terms of use checkbox */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, isChecked ? styles.checkboxChecked : {}]}
              onPress={() => setIsChecked(!isChecked)}
            >
              <Text style={styles.checkboxText}>I agree to the terms of use</Text>
              {isChecked && <Ionicons name="checkmark-circle" size={24} color="green" />}
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, isFormValid ? {} : styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!isFormValid}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
        <Text style={styles.goBackText}>Go Back to Homepage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  successText: {
    fontSize: 18,
    color: 'green',
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 40,
    backgroundColor: 'white',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'blue',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginTop: 10,
  },
  goBackButton: {
    marginTop: 20,
  },
  goBackText: {
    color: '#007bff',
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    color: 'white', // Change to a color with good contrast against your dark theme
    marginBottom: 10,
    textAlign: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    top: 112,
    right: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    color: 'white', // Change to a color with good contrast
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxChecked: {
    marginLeft: 10,
  },
  checkboxText: {
    color: 'white',
    marginRight: 10,
  },
});

export default RegistrationForm;
