import ConversationalOnboarding, { OnboardingData } from '@/components/ConversationalOnboarding';
import { useAuthContext } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView } from 'react-native';

export default function ConversationalOnboardingScreen() {
  const { currentUser } = useAuthContext();

  const handleComplete = (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data);
    // Here you would save the data to the user's profile
    Alert.alert(
      'Onboarding Complete!',
      'Your profile has been set up successfully.',
      [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)')
        }
      ]
    );
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Onboarding',
      'Are you sure you want to skip the onboarding process? You can complete it later in your profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: () => router.replace('/(tabs)')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ConversationalOnboarding
        onComplete={handleComplete}
        onSkip={handleSkip}
        userName={currentUser?.name || 'User'}
      />
    </SafeAreaView>
  );
} 