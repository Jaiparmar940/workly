import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Experience } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import OnboardingProgressBar from '../components/OnboardingProgressBar';
import SkillBubbleDiscovery, { SKILL_DATA } from '../components/SkillBubbleDiscovery';

const STEP_LABELS = [
  'Select Skills',
  'Add Missed Skills',
  'Rate Experience',
  'Profile & Bio',
];

const { width } = Dimensions.get('window');

// Simple unique ID generator
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface OnboardingData {
  experience: string;
  experiences: Experience[];
  resume?: {
    url: string;
    fileName: string;
    uploadedAt: Date;
  };
  experienceMethod: 'resume' | 'manual' | undefined;
  workPreferences: {
    jobTypes: string[];
    remoteWork: boolean;
    travelWillingness: boolean;
    availability: string;
  };
  professionalBackground: {
    education: string;
    certifications: string[];
    languages: string[];
    yearsOfExperience: number;
  };
}

const JOB_TYPES = ['One-time', 'Part-time', 'Full-time', 'Contract', 'Internship'];

const STEP_TITLES = [
  'Select Your Skills',
  'Add Missed Skills',
  'Complete!'
];

const STEP_SUBTITLES = [
  'Tap on the skills you have experience with. You can select multiple.',
  'Search and add any skills you missed. You can also add custom skills.',
  'Your profile is ready!'
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentUser, updateUserProfile } = useAuthContext();
  const params = useLocalSearchParams();
  const {
    name = '',
    email = '',
    phone = '',
    skills = '',
    interests = '',
    city = '',
    state = '',
    zipCode = '',
  } = params;

  // Only keep state for discoveredSkills
  const [discoveredSkills, setDiscoveredSkills] = useState<string[]>([]);

  // Convert skill IDs to skill names
  const getSkillNamesFromIds = (skillIds: string[]): string[] => {
    return skillIds.map(id => {
      const skill = SKILL_DATA.find(s => s.id === id);
      return skill ? skill.name : id;
    });
  };

  // Only render the SkillBubbleDiscovery step
  const handleSkillDiscoveryComplete = (skillIds: string[]) => {
    const skillNames = getSkillNamesFromIds(skillIds);
    setDiscoveredSkills(skillNames);
    // Navigate to the new missed skills page, passing selected skills
    router.push({ pathname: '/onboarding-missed-skills', params: { skills: JSON.stringify(skillNames) } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <View style={{ flex: 1 }}>
          <OnboardingProgressBar currentStep={1} totalSteps={4} stepLabels={STEP_LABELS} color={colors.tint} />
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <ThemedView style={{ flex: 1, padding: 16 }}>
              <ThemedText type="title" style={{ marginTop: 0, marginBottom: 16 }}>
                What are you good at?
              </ThemedText>
              <SkillBubbleDiscovery
                onComplete={handleSkillDiscoveryComplete}
                onSkip={() => router.replace('/onboarding-missed-skills')}
              />
        </ThemedView>
      </ScrollView>
        </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  stepContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#0a7ea4',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Services/Skills search styles (matching business onboarding)
  selectedServicesContainer: {
    marginBottom: 16,
  },
  selectedServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedServiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  selectedServiceText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  removeServiceButton: {
    marginLeft: 4,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeServiceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  servicesSearchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  servicesSearchText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicesDropdownModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  servicesDropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  servicesDropdownList: {
    maxHeight: 400,
  },
  servicesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  selectedServiceInModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  selectedServiceInModalText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeServiceInModalButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeServiceInModalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  servicesDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  customServiceItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  customServiceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  servicesDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  servicesDropdownItemText: {
    fontSize: 14,
  },
  noServicesText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
}); 