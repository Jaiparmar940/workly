import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import OnboardingProgressBar from '../components/OnboardingProgressBar';
import { useAuthContext } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebaseService';

const STEP_LABELS = [
  'Select Skills',
  'Add Missed Skills',
  'Rate Experience',
  'Profile & Bio',
];

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden', marginBottom: 24 }}>
      <View style={{ width: `${progress * 100}%`, height: 8, backgroundColor: color }} />
    </View>
  );
}

export default function OnboardingProfileBio() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const skillsWithExperience = useMemo(() => {
    try {
      return params.skills ? JSON.parse(params.skills as string) : [];
    } catch {
      return [];
    }
  }, [params.skills]);

  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<{ english: boolean; spanish: boolean }>({ english: true, spanish: false });
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { currentUser, updateUserProfile } = useAuthContext();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleLanguageToggle = (lang: 'english' | 'spanish') => {
    setLanguages(prev => ({ ...prev, [lang]: !prev[lang] }));
  };

  const handleContinue = async (skipped = false) => {
    if (!currentUser) return;
    setUploading(true);
    try {
      let avatarUrl = currentUser.avatar || null;
      if (image && !skipped) {
        avatarUrl = await FirebaseService.uploadProfileImage(currentUser.id, image);
      }
      const prevSkipped = params.skippedSteps ? JSON.parse(params.skippedSteps as string) : [];
      const newSkipped = skipped ? [...prevSkipped, 'profileBio'] : prevSkipped;
      const workerProfileComplete = newSkipped.length === 0;
      const languagesSpoken = Object.entries(languages)
        .filter(([_, v]) => v)
        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
      await updateUserProfile(currentUser.id, {
        avatar: avatarUrl,
        bio,
        languages: languagesSpoken,
        workerProfileComplete,
        skills: skillsWithExperience,
      });
      router.replace('/welcome');
    } catch (err) {
      console.error('Error updating profile:', err);
      // Optionally show error to user
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <OnboardingProgressBar currentStep={4} totalSteps={4} stepLabels={STEP_LABELS} color={colors.tint} />
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, backgroundColor: colors.background, paddingBottom: 120 }}>
          <ThemedText type="title" style={{ marginBottom: 24 }}>
            Add a short bio and profile picture
          </ThemedText>
          <ThemedText style={{ marginBottom: 8, color: colors.text }}>
            Profile Picture
          </ThemedText>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <ThemedText style={{ color: colors.tabIconDefault }}>Tap to select a photo</ThemedText>
            )}
          </TouchableOpacity>
          <ThemedText style={{ marginTop: 24, marginBottom: 8, color: colors.text }}>
            Short Bio / Tagline
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault,
                color: colors.text,
              },
            ]}
            placeholder="Tell us about yourself..."
            placeholderTextColor={colors.tabIconDefault}
            value={bio}
            onChangeText={setBio}
            maxLength={120}
            multiline
          />
          <ThemedText style={{ marginTop: 24, marginBottom: 8, color: colors.text }}>
            Languages Spoken
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: 24, marginBottom: 8 }}>
            <TouchableOpacity style={styles.langCheckboxRow} onPress={() => handleLanguageToggle('english')}>
              <View style={[styles.checkbox, { borderColor: colors.tint, backgroundColor: languages.english ? colors.tint : 'transparent' }]}> 
                {languages.english && <Ionicons name="checkmark" size={18} color="white" />}
              </View>
              <ThemedText style={{ color: colors.text, marginLeft: 8 }}>English</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.langCheckboxRow} onPress={() => handleLanguageToggle('spanish')}>
              <View style={[styles.checkbox, { borderColor: colors.tint, backgroundColor: languages.spanish ? colors.tint : 'transparent' }]}> 
                {languages.spanish && <Ionicons name="checkmark" size={18} color="white" />}
              </View>
              <ThemedText style={{ color: colors.text, marginLeft: 8 }}>Spanish</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={[styles.continueButtonContainer, { backgroundColor: colors.background }]}> 
          <TouchableOpacity
            style={[
              styles.skipButton,
              { borderColor: colors.tint, marginBottom: 12 },
            ]}
            onPress={() => handleContinue(true)}
          >
            <ThemedText style={[styles.skipButtonText, { color: colors.tint }]}>Skip for now</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.tint, marginTop: 0 }]}
            onPress={() => handleContinue(false)}
            disabled={uploading}
          >
            <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 60,
    marginBottom: 8,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  langCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  continueButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 