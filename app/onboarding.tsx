import { OnboardingComplete } from '@/components/OnboardingComplete';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import SkillDiscovery from '@/components/SkillDiscovery';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { storage } from '@/config/firebase';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Experience } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
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
  'Discover Your Skills',
  'Tell us your professional experience',
  'What type of work are you looking for?',
  'Complete!'
];

const STEP_SUBTITLES = [
  'Let\'s understand your skills and interests through a quick conversation.',
  'Choose how you\'d like to share your experience with us.',
  'Select your preferred job types and work arrangements.',
  'Your profile is ready!'
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentUser, updateUserProfile } = useAuthContext();
  const params = useLocalSearchParams();
  const {
    experience = '',
    editMode = 'false',
    name = '',
    email = '',
    phone = '',
    skills = '',
    interests = '',
    city = '',
    state = '',
    zipCode = '',
  } = params;

  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [discoveredSkills, setDiscoveredSkills] = useState<string[]>([]);
  const [discoveredExperience, setDiscoveredExperience] = useState('');
  const [discoveredInterests, setDiscoveredInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    experience: '',
    experiences: [],
    resume: undefined,
    experienceMethod: undefined,
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

  // Check if this is edit mode
  const isEditMode = editMode === 'true';

  // Pre-populate data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      console.log('Edit mode - pre-populating data with params:', params);
      
      // Parse skills and interests from comma-separated strings
      const skillsString = Array.isArray(skills) ? skills[0] : skills;
      const interestsString = Array.isArray(interests) ? interests[0] : interests;
      const skillsArray = skillsString ? skillsString.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [];
      const interestsArray = interestsString ? interestsString.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [];
      
      // Pre-populate discovered data
      setDiscoveredSkills(skillsArray);
      setDiscoveredExperience(experience as string || '');
      setDiscoveredInterests(interestsArray);
      
      const prePopulatedData: OnboardingData = {
        experience: experience as string || '',
        experiences: [],
        resume: undefined,
        experienceMethod: undefined,
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
      };
      
      console.log('Pre-populated data:', prePopulatedData);
      setOnboardingData(prePopulatedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  const totalSteps = 4; // Now 4 steps including skill discovery

  // Skill discovery handlers
  const handleSkillDiscoveryComplete = (skills: string[], experience: string, interests: string[], avail: string) => {
    setDiscoveredSkills(skills);
    setDiscoveredExperience(experience);
    setDiscoveredInterests(interests);
    setAvailability(avail);
    setCurrentStep(2); // Move to next step
  };

  const handleSkillDiscoverySkip = () => {
    setCurrentStep(2); // Skip to next step
  };

  const handleResumeUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      if (!file) {
        Alert.alert('Error', 'No file selected');
        return;
      }

      // Show loading state
      Alert.alert('Uploading', 'Please wait while we upload your resume...');

      // Create a unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `resumes/${currentUser?.id}/${generateId()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      // Convert file to blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const uploadResult = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Update onboarding data
      setOnboardingData(prev => ({
        ...prev,
        resume: {
          url: downloadURL,
          fileName: file.name,
          uploadedAt: new Date(),
        },
        experienceMethod: 'resume',
      }));

      Alert.alert('Success', 'Resume uploaded successfully!');
    } catch (error) {
      console.error('Resume upload error:', error);
      Alert.alert('Error', 'Failed to upload resume. Please try again.');
    }
  };

  const handleAddExperience = () => {
    const newExperience: Experience = {
      id: generateId(),
      title: '',
      description: '',
      yearsOfExperience: 0,
      company: '',
    };

    setOnboardingData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExperience],
      experienceMethod: 'manual',
    }));
  };

  const handleUpdateExperience = (id: string, field: keyof Experience, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setOnboardingData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id),
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
    setHasUnsavedChanges(true);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        // Skill discovery step - always allow proceeding (handled by SkillDiscovery component)
        return true;
      case 2:
        // For experience step, require either resume upload or at least one manual experience
        if (onboardingData.experienceMethod === 'resume') {
          return !!onboardingData.resume;
        } else if (onboardingData.experienceMethod === 'manual') {
          return onboardingData.experiences.length > 0 && 
                 onboardingData.experiences.every(exp => exp.title.trim() && exp.description.trim());
        }
        return false; // No method selected yet
      case 3:
        return onboardingData.workPreferences.jobTypes.length > 0;
      case 4:
        return true; // Final step is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Skill discovery step - handled by SkillDiscovery component
      return;
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps - 1) {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      // Can't go back from skill discovery step
      return;
    }
    
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Go Back', 
            style: 'destructive',
            onPress: () => {
              setHasUnsavedChanges(false);
              setCurrentStep(currentStep - 1);
            }
          }
        ]
      );
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep === 1) {
      // Skip skill discovery
      handleSkillDiscoverySkip();
    } else if (currentStep === 2) {
      // Skip experience step
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // Skip work preferences step
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
      
      // Prepare the update data, ensuring proper serialization
      const updateData: any = {
        workerProfileComplete: true, // Mark worker profile as complete
      };

      // Add experience data if available
      if (onboardingData.experienceMethod === 'resume' && onboardingData.resume) {
        updateData.resume = {
          url: onboardingData.resume.url,
          fileName: onboardingData.resume.fileName,
          uploadedAt: onboardingData.resume.uploadedAt.toISOString(), // Convert Date to string
        };
        updateData.experienceMethod = onboardingData.experienceMethod;
      } else if (onboardingData.experienceMethod === 'manual' && onboardingData.experiences.length > 0) {
        // Convert experiences to serializable format
        updateData.experiences = onboardingData.experiences.map(exp => ({
          id: exp.id,
          title: exp.title,
          description: exp.description,
          yearsOfExperience: exp.yearsOfExperience,
          company: exp.company || '',
        }));
        updateData.experienceMethod = onboardingData.experienceMethod;
      }

      // Add work preferences
      updateData.workPreferences = {
        jobTypes: onboardingData.workPreferences.jobTypes,
        remoteWork: onboardingData.workPreferences.remoteWork,
        travelWillingness: onboardingData.workPreferences.travelWillingness,
        availability: onboardingData.workPreferences.availability,
      };

      console.log('Updating user profile with data:', updateData);
      
      await updateUserProfile(currentUser.id, updateData);
      setHasUnsavedChanges(false);
      setCurrentStep(totalSteps); // Show completion step
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleFinishOnboarding = () => {
    router.replace('/(tabs)');
  };

  const renderStep2 = () => (
    <ThemedView style={styles.stepContainer}>
      {/* Method Selection */}
      {!onboardingData.experienceMethod && (
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            How would you like to share your experience?
          </ThemedText>
          
          <TouchableOpacity
            style={[
              styles.methodOption,
              { borderColor: colors.tabIconDefault, backgroundColor: colors.background },
            ]}
            onPress={() => setOnboardingData(prev => ({ ...prev, experienceMethod: 'resume' }))}
          >
            <Ionicons name="document-outline" size={24} color={colors.text} />
            <View style={styles.methodTextContainer}>
              <ThemedText style={[styles.methodTitle, { color: colors.text }]}>
                Upload Resume
              </ThemedText>
              <ThemedText style={[styles.methodSubtitle, { color: colors.tabIconDefault }]}>
                Upload your resume and we'll extract your experience
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodOption,
              { borderColor: colors.tabIconDefault, backgroundColor: colors.background },
            ]}
            onPress={() => setOnboardingData(prev => ({ ...prev, experienceMethod: 'manual' }))}
          >
            <Ionicons name="create-outline" size={24} color={colors.text} />
            <View style={styles.methodTextContainer}>
              <ThemedText style={[styles.methodTitle, { color: colors.text }]}>
                Enter Manually
              </ThemedText>
              <ThemedText style={[styles.methodSubtitle, { color: colors.tabIconDefault }]}>
                Add your experiences one by one
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Resume Upload Section */}
      {onboardingData.experienceMethod === 'resume' && (
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Upload Your Resume
          </ThemedText>
          
          {onboardingData.resume ? (
            <View style={[styles.resumePreview, { borderColor: colors.tabIconDefault, backgroundColor: colors.background }]}>
              <Ionicons name="document" size={24} color={colors.tint} />
              <View style={styles.resumeInfo}>
                <ThemedText style={[styles.resumeFileName, { color: colors.text }]}>
                  {onboardingData.resume.fileName}
                </ThemedText>
                <ThemedText style={[styles.resumeDate, { color: colors.tabIconDefault }]}>
                  Uploaded {onboardingData.resume.uploadedAt.toLocaleDateString()}
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={() => setOnboardingData(prev => ({ ...prev, resume: undefined }))}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color={colors.error || '#ff4444'} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.uploadButton, { borderColor: colors.tabIconDefault, backgroundColor: colors.background }]}
              onPress={handleResumeUpload}
            >
              <Ionicons name="cloud-upload-outline" size={32} color={colors.tint} />
              <ThemedText style={[styles.uploadText, { color: colors.text }]}>
                Choose Resume File
              </ThemedText>
              <ThemedText style={[styles.uploadSubtext, { color: colors.tabIconDefault }]}>
                PDF, DOC, or DOCX files accepted
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.changeMethodButton}
            onPress={() => setOnboardingData(prev => ({ ...prev, experienceMethod: undefined }))}
          >
            <ThemedText style={[styles.changeMethodText, { color: colors.tint }]}>
              Choose different method
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Manual Experience Entry */}
      {onboardingData.experienceMethod === 'manual' && (
        <ThemedView style={styles.inputContainer}>
          <View style={styles.experienceHeader}>
            <ThemedText style={[styles.label, { color: colors.text }]}>
              Your Experiences
            </ThemedText>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.tint }]}
              onPress={handleAddExperience}
            >
              <Ionicons name="add" size={20} color="white" />
              <ThemedText style={styles.addButtonText}>Add Experience</ThemedText>
            </TouchableOpacity>
          </View>

          {onboardingData.experiences.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.tabIconDefault, backgroundColor: colors.background }]}>
              <Ionicons name="briefcase-outline" size={48} color={colors.tabIconDefault} />
              <ThemedText style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
                No experiences added yet
              </ThemedText>
              <ThemedText style={[styles.emptyStateSubtext, { color: colors.tabIconDefault }]}>
                Tap "Add Experience" to get started
              </ThemedText>
            </View>
          ) : (
            onboardingData.experiences.map((experience, index) => (
              <View key={experience.id} style={[styles.experienceCard, { borderColor: colors.tabIconDefault, backgroundColor: colors.background }]}>
                <View style={styles.experienceHeader}>
                  <ThemedText style={[styles.experienceTitle, { color: colors.text }]}>
                    Experience {index + 1}
                  </ThemedText>
                  {onboardingData.experiences.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveExperience(experience.id)}
                      style={styles.removeExperienceButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error || '#ff4444'} />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                  placeholder="Job Title"
                  placeholderTextColor={colors.tabIconDefault}
                  value={experience.title}
                  onChangeText={(text) => handleUpdateExperience(experience.id, 'title', text)}
                />

                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                  placeholder="Company (optional)"
                  placeholderTextColor={colors.tabIconDefault}
                  value={experience.company || ''}
                  onChangeText={(text) => handleUpdateExperience(experience.id, 'company', text)}
                />

                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                  placeholder="Describe your role, responsibilities, and achievements..."
                  placeholderTextColor={colors.tabIconDefault}
                  value={experience.description}
                  onChangeText={(text) => handleUpdateExperience(experience.id, 'description', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <ThemedText style={[styles.label, { color: colors.text, marginTop: 12 }]}>
                  Years of Experience
                </ThemedText>
                <View style={styles.experienceSelector}>
                  {[0, 1, 2, 3, 5, 10].map(years => (
                    <TouchableOpacity
                      key={years}
                      style={[
                        styles.experienceChip,
                        {
                          backgroundColor: experience.yearsOfExperience === years
                            ? colors.tint
                            : colors.background,
                          borderColor: colors.tabIconDefault,
                        },
                      ]}
                      onPress={() => handleUpdateExperience(experience.id, 'yearsOfExperience', years)}
                    >
                      <ThemedText
                        style={[
                          styles.experienceText,
                          {
                            color: experience.yearsOfExperience === years
                              ? 'white'
                              : colors.text,
                          },
                        ]}
                      >
                        {years === 0 ? '<1 year' : years === 1 ? '1+ years' : `${years}+ years`}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            style={styles.changeMethodButton}
            onPress={() => setOnboardingData(prev => ({ ...prev, experienceMethod: undefined }))}
          >
            <ThemedText style={[styles.changeMethodText, { color: colors.tint }]}>
              Choose different method
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
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
        return (
          <SkillDiscovery
            onComplete={handleSkillDiscoveryComplete}
            onSkip={handleSkillDiscoverySkip}
            userName={name as string || 'there'}
          />
        );
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
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
      {/* Header */}
      {isEditMode && (
        <View style={[styles.editHeader, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          {currentStep !== 1 && ( // Hide buttons during skill discovery
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
          )}

          {currentStep < totalSteps - 1 && currentStep !== 1 && (
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
      </ScrollView>
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
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  backButton: {
    padding: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  methodOption: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  resumePreview: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeFileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  resumeDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  uploadButton: {
    padding: 24,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  changeMethodButton: {
    padding: 12,
    alignItems: 'center',
  },
  changeMethodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  experienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    padding: 32,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  experienceCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  removeExperienceButton: {
    padding: 8,
  },
}); 