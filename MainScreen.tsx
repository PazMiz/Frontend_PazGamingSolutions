import React, { useState, useEffect } from 'react';
import { View, Image, Text, StatusBar, TouchableOpacity, Alert } from 'react-native';
import styles from './styles'; // Import styles from the styles.ts file
import NavigationButton from './NavigationButton'; // Import the NavigationButton component
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlaceholderImage = require('./assets/images/one-piece-luffy-iphone-rueztob7egpu3b33.jpg');

const MainScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDisplayName();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userDisplayName');
      // navigation.navigate('Login','Register'); // Simplified navigation call
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An error occurred while trying to log out.');
    }
  };

  const fetchUserDisplayName = async () => {
    try {
      const displayName = await AsyncStorage.getItem('userDisplayName');
      setUserDisplayName(displayName);
    } catch (error) {
      console.error('Error fetching user display name:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={PlaceholderImage} style={styles.backgroundImage} />
      <View style={styles.buttonContainer}>
        {/* <NavigationButton text="Login" routeName="Login" />
        <NavigationButton text="Register" routeName="Register" />
        <NavigationButton text="About My App" routeName="About" />
        <NavigationButton text="PC Games" routeName="Topics" />
        <NavigationButton text="Friend List" routeName="FriendList" />
        <NavigationButton text="Xbox Screen" routeName="XboxScreen" /> */}
      </View>
      {userDisplayName ? (
        <Text style={styles.userGreeting}>Hello, {userDisplayName}!</Text>
      ) : (
        <Text style={styles.userGreeting}>Please log in to see your name.</Text>
      )}
      <Text style={styles.headerText}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        {'\n'}
        <Text style={styles.appName}>Paz App:</Text>
        {'\n'}
        <Text style={styles.appName}>Gaming Social Solutions</Text>
      </Text>
      <StatusBar hidden />
      {userDisplayName && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MainScreen;
