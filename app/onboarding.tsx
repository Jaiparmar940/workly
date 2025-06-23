import { OnboardingComplete } from '@/components/OnboardingComplete';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { User } from '@/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface OnboardingData {
  skills: string[];
  experience: string;
  interests: string[];
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

const SKILL_CATEGORIES = [
  { id: 'tech', label: 'Technology', skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Mobile Development', 'Data Analysis', 'AI/ML', 'DevOps'] },
  { id: 'design', label: 'Design & Creative', skills: ['Graphic Design', 'UI/UX Design', 'Illustration', 'Video Editing', 'Photography', '3D Modeling', 'Animation'] },
  { id: 'business', label: 'Business & Marketing', skills: ['Digital Marketing', 'Content Writing', 'SEO', 'Social Media', 'Project Management', 'Sales', 'Customer Service'] },
  { id: 'services', label: 'Services', skills: ['Virtual Assistant', 'Translation', 'Tutoring', 'Event Planning', 'Personal Training', 'Pet Care', 'Cleaning'] },
];

const JOB_TYPES = ['One-time', 'Part-time', 'Full-time', 'Contract', 'Internship'];

const STEP_TITLES = [
  'What are your skills?',
  'Tell us about your experience',
  'What type of work are you looking for?',
  'Additional Information (Optional)',
  'Complete!'
];

const STEP_SUBTITLES = [
  'Select the skills you have experience with. This helps us match you with relevant jobs.',
  'Describe your professional background and what you\'ve worked on.',
  'Select your preferred job types and work arrangements.',
  'Help us understand your interests and preferences better.',
  'Your profile is ready!'
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentUser, updateUserProfile } = useAuthContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    skills: [],
    experience: '',
    interests: [],
    workPreferences: {
      jobTypes: [],
      remoteWork: false,
      travelWillingness: false,
      availability: '',
    },
    professionalBackground: {
      education: '',
      certifications: [],
      languages: [],
      yearsOfExperience: 0,
    },
  });

  const totalSteps = 5; // Added completion step

  const handleSkillToggle = (skill: string) => {
    setOnboardingData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleJobTypeToggle = (jobType: string) => {
    setOnboardingData(prev => ({
      ...prev,
      workPreferences: {
        ...prev.workPreferences,
        jobTypes: prev.workPreferences.jobTypes.includes(jobType)
          ? prev.workPreferences.jobTypes.filter(t => t !== jobType)
          : [...prev.workPreferences.jobTypes, jobType],
      },
    }));
  };

  const handleInputChange = (field: string, value: string | string[] | boolean | number) => {
    setOnboardingData(prev => {
      const newData = { ...prev };
      const fieldPath = field.split('.');
      let current: any = newData;
      
      for (let i = 0; i < fieldPath.length - 1; i++) {
        current = current[fieldPath[i]];
      }
      
      current[fieldPath[fieldPath.length - 1]] = value;
      return newData;
    });
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return onboardingData.skills.length > 0;
      case 2:
        return onboardingData.experience.trim().length > 0;
      case 3:
        return onboardingData.workPreferences.jobTypes.length > 0;
      case 4:
        return true; // Final step is optional
      case 5:
        return true; // Completion step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps - 1) {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps - 1) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setIsCompleting(true);
      const updatedUserData: Partial<User> = {
        skills: onboardingData.skills,
        experience: onboardingData.experience,
        interests: onboardingData.interests,
      };

      await updateUserProfile(currentUser.id, updatedUserData);
      setCurrentStep(totalSteps); // Show completion step
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleFinishOnboarding = () => {
    router.replace('/welcome' as any);
  };

  const renderStep1 = () => (
    <ThemedView style={styles.stepContainer}>
      <ScrollView style={styles.skillsContainer} showsVerticalScrollIndicator={false}>
        {SKILL_CATEGORIES.map(category => (
          <ThemedView key={category.id} style={styles.categoryContainer}>
            <ThemedText style={[styles.categoryTitle, { color: colors.text }]}>
              {category.label}
            </ThemedText>
            <View style={styles.skillsGrid}>
              {category.skills.map(skill => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillChip,
                    {
                      backgroundColor: onboardingData.skills.includes(skill)
                        ? colors.tint
                        : colors.background,
                      borderColor: colors.tabIconDefault,
                    },
                  ]}
                  onPress={() => handleSkillToggle(skill)}
                >
                  <ThemedText
                    style={[
                      styles.skillText,
                      {
                        color: onboardingData.skills.includes(skill)
                          ? 'white'
                          : colors.text,
                      },
                    ]}
                  >
                    {skill}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );

  const renderStep2 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="Describe your experience, projects you've worked on, and your professional background..."
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.experience}
          onChangeText={(text) => handleInputChange('experience', text)}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Years of Experience
        </ThemedText>
        <View style={styles.experienceSelector}>
          {[0, 1, 2, 3, 5, 10].map(years => (
            <TouchableOpacity
              key={years}
              style={[
                styles.experienceChip,
                {
                  backgroundColor: onboardingData.professionalBackground.yearsOfExperience === years
                    ? colors.tint
                    : colors.background,
                  borderColor: colors.tabIconDefault,
                },
              ]}
              onPress={() => handleInputChange('professionalBackground.yearsOfExperience', years)}
            >
              <ThemedText
                style={[
                  styles.experienceText,
                  {
                    color: onboardingData.professionalBackground.yearsOfExperience === years
                      ? 'white'
                      : colors.text,
                  },
                ]}
              >
                {years === 0 ? 'No experience' : `${years}+ years`}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>
    </ThemedView>
  );

  const renderStep3 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Job Types
        </ThemedText>
        <View style={styles.jobTypesGrid}>
          {JOB_TYPES.map(jobType => (
            <TouchableOpacity
              key={jobType}
              style={[
                styles.jobTypeChip,
                {
                  backgroundColor: onboardingData.workPreferences.jobTypes.includes(jobType)
                    ? colors.tint
                    : colors.background,
                  borderColor: colors.tabIconDefault,
                },
              ]}
              onPress={() => handleJobTypeToggle(jobType)}
            >
              <ThemedText
                style={[
                  styles.jobTypeText,
                  {
                    color: onboardingData.workPreferences.jobTypes.includes(jobType)
                      ? 'white'
                      : colors.text,
                  },
                ]}
              >
                {jobType}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Work Preferences
        </ThemedText>
        <TouchableOpacity
          style={[
            styles.preferenceRow,
            {
              backgroundColor: onboardingData.workPreferences.remoteWork
                ? colors.tint
                : colors.background,
              borderColor: colors.tabIconDefault,
            },
          ]}
          onPress={() => handleInputChange('workPreferences.remoteWork', !onboardingData.workPreferences.remoteWork)}
        >
          <ThemedText
            style={[
              styles.preferenceText,
              {
                color: onboardingData.workPreferences.remoteWork
                  ? 'white'
                  : colors.text,
              },
            ]}
          >
            Open to remote work
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.preferenceRow,
            {
              backgroundColor: onboardingData.workPreferences.travelWillingness
                ? colors.tint
                : colors.background,
              borderColor: colors.tabIconDefault,
            },
          ]}
          onPress={() => handleInputChange('workPreferences.travelWillingness', !onboardingData.workPreferences.travelWillingness)}
        >
          <ThemedText
            style={[
              styles.preferenceText,
              {
                color: onboardingData.workPreferences.travelWillingness
                  ? 'white'
                  : colors.text,
              },
            ]}
          >
            Willing to travel for work
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  const renderStep4 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Interests & Hobbies
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
          placeholder="e.g., Photography, Travel, Technology, Art..."
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.interests.join(', ')}
          onChangeText={(text) => handleInputChange('interests', text.split(',').map(s => s.trim()).filter(s => s))}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Availability
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
          placeholder="e.g., Weekdays 9-5, Evenings only, Weekends..."
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.workPreferences.availability}
          onChangeText={(text) => handleInputChange('workPreferences.availability', text)}
        />
      </ThemedView>
    </ThemedView>
  );

  const renderStep5 = () => (
    <OnboardingComplete
      onComplete={handleFinishOnboarding}
      title="Profile Complete! 🎉"
      subtitle="Your profile has been successfully set up. We'll use this information to match you with the best opportunities."
      buttonText="Get Started"
    />
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  // Don't show progress and buttons for completion step
  if (currentStep === totalSteps) {
    return renderStep5();
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.header}>
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={totalSteps - 1} // Don't count completion step in progress
          title={STEP_TITLES[currentStep - 1]}
          subtitle={STEP_SUBTITLES[currentStep - 1]}
        />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      <ThemedView style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                { borderColor: colors.tabIconDefault },
              ]}
              onPress={handleBack}
            >
              <ThemedText style={[styles.buttonText, { color: colors.text }]}>
                Back
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              {
                backgroundColor: canProceed() ? '#0a7ea4' : colors.tabIconDefault,
                flex: currentStep === 1 ? 1 : 0.6,
              },
            ]}
            onPress={handleNext}
            disabled={!canProceed() || isCompleting}
          >
            <ThemedText style={styles.primaryButtonText}>
              {isCompleting ? 'Saving...' : currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {currentStep < totalSteps - 1 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <ThemedText style={[styles.skipText, { color: colors.tabIconDefault }]}>
              Skip for now
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
  },
  skillsContainer: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
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
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  experienceSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  experienceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  experienceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jobTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  jobTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  jobTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  preferenceRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  preferenceText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    borderWidth: 0,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    flex: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 