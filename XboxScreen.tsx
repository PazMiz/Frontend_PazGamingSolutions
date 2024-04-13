import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import axios from 'axios';
import TopicItem from './PC/TopicItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const XboxScreen: React.FC = () => {
  const [topics, setTopics] = useState([]);
  const [topicData, setTopicData] = useState({
    topic: '',
    author: '',
    text: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    checkLoginAndOnboardingStatus();
  }, []);

  const checkLoginAndOnboardingStatus = async () => {
    const isLoggedInValue = await AsyncStorage.getItem('isLoggedIn');
    const onboardingStatus = await AsyncStorage.getItem('onboardingComplete');

    if (isLoggedInValue === 'true') {
      setIsLoggedIn(true);
      const displayName = await AsyncStorage.getItem('userDisplayName');
      setUserDisplayName(displayName);
      setTopicData(prevData => ({ ...prevData, author: displayName }));

      if (onboardingStatus !== 'true') {
        Alert.alert(
          "Onboarding Required PazApplication",
          "Hello User Please complete the onboarding process to access this application and mark as read.",
          [{ text: "Go to Onboarding", onPress: () => navigation.navigate('Onboarding') }],
          { cancelable: false }
        );
      } else {
        setOnboardingComplete(true);
        fetchTopics();
      }
    } else {
      setIsLoggedIn(false);
      navigation.navigate('Login');
    }
  };

  const fetchTopics = async () => {
    if (!isLoggedIn || !onboardingComplete) {
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:8000/xboxtopics/');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching Xbox topics:', error);
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn || !onboardingComplete) {
      Alert.alert("Login and Onboarding Required", "You must be logged in and complete onboarding to post.");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/xboxtopics/create/', topicData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 201) {
        Alert.alert("Success", "Xbox post created successfully!");
        setTopicData({ topic: '', author: userDisplayName, text: '' });
        fetchTopics();
      } else {
        console.error('Error creating Xbox topic:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating Xbox topic:', error);
      Alert.alert("Error", "Failed to create post.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['isLoggedIn', 'userDisplayName', 'onboardingComplete']);
    setIsLoggedIn(false);
    navigation.navigate('Login');
  };

  const handleDelete = async (topicId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTopic(topicId) }
      ],
      { cancelable: true }
    );
  };

  const deleteTopic = async (topicId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/xboxtopics/${topicId}/`);
      setTopics(topics.filter(topic => topic.id !== topicId));
      Alert.alert("Success", "Post deleted successfully.");
    } catch (error) {
      console.error('Error deleting Xbox topic:', error);
      Alert.alert("Error", "Failed to delete post.");
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={handleLogout} color="red" />
      <Image source={require('./media/photos/xboxgames.jpeg')} style={styles.xboxImage} />
      <Text style={styles.title}>Xbox Topics</Text>
      <TextInput style={styles.input} placeholder="Xbox Title" value={topicData.topic} onChangeText={value => setTopicData({ ...topicData, topic: value })} />
      <Text style={styles.username}>{topicData.author}</Text>
      <TextInput style={styles.input} placeholder="Text" value={topicData.text} onChangeText={value => setTopicData({ ...topicData, text: value })} />
      {isLoggedIn && onboardingComplete ? (
        <Button title="Create Post" onPress={handleSubmit} />
      ) : (
        <Text>Please log in and complete onboarding to create Xbox posts.</Text>
      )}
      {isLoggedIn && onboardingComplete ? (
        <FlatList
          data={topics}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TopicItem topic={item.topic} author={item.author} text={item.text} />
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Button title="Delete" onPress={() => handleDelete(item.id)} />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.loginMessage}>Please log in and complete onboarding to view Xbox Posts.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    backgroundColor: 'white',
    color: 'black',
  },
  username: {
    marginBottom: 10,
    padding: 10,
    color: 'white',
  },
  xboxImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  card: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButton: {
    marginLeft: 10,
  },
  loginMessage: {
    fontSize: 20,
    color: 'red',
  },
});

export default XboxScreen;
