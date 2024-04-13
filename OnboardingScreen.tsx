import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';  // Import useNavigation

// Define the interface for the onboarding steps
interface OnboardingStep {
    id: number;
    step: string;
    description: string;
    marked_as_read: boolean;
    user: any;
}

const OnboardingScreen: React.FC = () => {
    const [onboardingData, setOnboardingData] = useState<OnboardingStep[]>([]);
    const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
    const navigation = useNavigation();  // Initialize navigation

    useEffect(() => {
        fetchOnboardingData();
    }, []);

    const fetchOnboardingData = async () => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            console.error("Authentication token is missing");
            Alert.alert("Error", "Authentication required, please log in again.");
            return;
        }

        try {
            const response = await axios.get('http://127.0.0.1:8000/onboarding/indicators/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200 && response.data) {
                setOnboardingData(response.data);
                setCurrentStep(response.data.find(step => !step.marked_as_read) || null);
            } else {
                throw new Error("Failed to fetch onboarding steps");
            }
        } catch (error) {
            console.error('Error fetching onboarding data:', error);
            Alert.alert("Error", "Failed to fetch onboarding steps.");
        }
    };

    const markAsRead = async (id) => {
        const token = await AsyncStorage.getItem('authToken');
        const csrftoken = await AsyncStorage.getItem('csrftoken');
    
        if (!token) {
            Alert.alert("Session Error", "Please log in again.");
            return;
        }
    
        try {
            const response = await axios.post(`http://127.0.0.1:8000/onboarding/indicators/${id}/mark_as_read/`, {}, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'X-CSRFToken': csrftoken,
                }
            });
    
            if (response.status === 200) {
                console.log("Marked as read successfully.");
                const updatedSteps = onboardingData.map(step =>
                    step.id === id ? { ...step, marked_as_read: true } : step
                );
                setOnboardingData(updatedSteps);
                setCurrentStep(updatedSteps.find(step => !step.marked_as_read) || null);
                await AsyncStorage.setItem('onboardingComplete', 'true');  // Set the flag indicating onboarding is complete
                handleGoBack();  // Call to navigate back
            } else {
                throw new Error(`Failed to mark as read with status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error during mark as read:', error);
            Alert.alert("Error", "Failed to mark the step as read.");
        }
    };
    
    // Navigation function to handle conditional navigation
    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {currentStep ? (
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={true}
                >
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{currentStep.step}: {currentStep.description}</Text>
                        <Button title="Mark as Read" onPress={() => currentStep && markAsRead(currentStep.id)} />
                    </View>
                </Modal>
            ) : (
                <Text>No more onboarding steps!</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});

export default OnboardingScreen;
