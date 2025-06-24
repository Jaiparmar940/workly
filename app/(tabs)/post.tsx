import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FirebaseService } from '@/services/firebaseService';
import { JobCategory, JobComplexity, JobStatus, JobType } from '@/types';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function PostJobScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthContext();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: JobCategory.OTHER,
    type: JobType.ONE_TIME,
    complexity: JobComplexity.BEGINNER,
    budgetMin: '',
    budgetMax: '',
    city: '',
    state: '',
    zipCode: '',
    isRemote: false,
    requirements: '',
    skills: '',
  });

  const [selectedCategory, setSelectedCategory] = useState<JobCategory>(JobCategory.OTHER);
  const [selectedType, setSelectedType] = useState<JobType>(JobType.ONE_TIME);
  const [selectedComplexity, setSelectedComplexity] = useState<JobComplexity>(JobComplexity.BEGINNER);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Check if user is logged in
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post a job');
      return;
    }

    // Validate form
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!formData.budgetMin || !formData.budgetMax) {
      Alert.alert('Error', 'Please specify budget range');
      return;
    }

    const budgetMin = parseInt(formData.budgetMin);
    const budgetMax = parseInt(formData.budgetMax);

    if (budgetMin > budgetMax) {
      Alert.alert('Error', 'Minimum budget cannot be greater than maximum budget');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Posting job for user:', user.uid);
      
      // Create job object
      const newJob = {
        title: formData.title,
        description: formData.description,
        category: selectedCategory,
        type: selectedType,
        complexity: selectedComplexity,
        budget: {
          min: budgetMin,
          max: budgetMax,
          currency: 'USD'
        },
        location: {
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          isRemote: formData.isRemote
        },
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        postedBy: user.uid, // Use actual user ID
        status: JobStatus.OPEN,
        applicants: []
      };

      console.log('Job data to be posted:', newJob);

      // Save job to Firebase
      const savedJob = await FirebaseService.createJob(newJob);
      console.log('Job posted successfully:', savedJob);
      
      Alert.alert(
        'Success!', 
        'Your job has been posted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                title: '',
                description: '',
                category: JobCategory.OTHER,
                type: JobType.ONE_TIME,
                complexity: JobComplexity.BEGINNER,
                budgetMin: '',
                budgetMax: '',
                city: '',
                state: '',
                zipCode: '',
                isRemote: false,
                requirements: '',
                skills: '',
              });
              setSelectedCategory(JobCategory.OTHER);
              setSelectedType(JobType.ONE_TIME);
              setSelectedComplexity(JobComplexity.BEGINNER);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error posting job:', error);
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectionButton = ({ 
    title, 
    selected, 
    onPress 
  }: { 
    title: string; 
    selected: boolean; 
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.selectionButton,
        {
          backgroundColor: selected ? colors.tint : colors.background,
          borderColor: colors.tint,
        }
      ]}
      onPress={onPress}
    >
      <ThemedText style={[
        styles.selectionButtonText,
        { color: selected ? 'white' : colors.tint }
      ]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Post a New Job</ThemedText>
          <ThemedText style={styles.subtitle}>
            Fill out the form below to create your job posting
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          {/* Basic Information */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Basic Information</ThemedText>
            
            <ThemedText style={styles.label}>Job Title *</ThemedText>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault,
                color: colors.text 
              }]}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="e.g., React Native Developer"
              placeholderTextColor={colors.tabIconDefault}
            />

            <ThemedText style={styles.label}>Description *</ThemedText>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault,
                color: colors.text 
              }]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe the job requirements, responsibilities, and what you're looking for..."
              placeholderTextColor={colors.tabIconDefault}
              multiline
              numberOfLines={4}
            />
          </ThemedView>

          {/* Job Details */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Job Details</ThemedText>
            
            <ThemedText style={styles.label}>Category</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.selectionContainer}>
                {Object.values(JobCategory).slice(0, 8).map((category) => (
                  <SelectionButton
                    key={category}
                    title={category}
                    selected={selectedCategory === category}
                    onPress={() => setSelectedCategory(category)}
                  />
                ))}
              </View>
            </ScrollView>

            <ThemedText style={styles.label}>Job Type</ThemedText>
            <View style={styles.selectionContainer}>
              {Object.values(JobType).map((type) => (
                <SelectionButton
                  key={type}
                  title={type}
                  selected={selectedType === type}
                  onPress={() => setSelectedType(type)}
                />
              ))}
            </View>

            <ThemedText style={styles.label}>Complexity Level</ThemedText>
            <View style={styles.selectionContainer}>
              {Object.values(JobComplexity).map((complexity) => (
                <SelectionButton
                  key={complexity}
                  title={complexity}
                  selected={selectedComplexity === complexity}
                  onPress={() => setSelectedComplexity(complexity)}
                />
              ))}
            </View>
          </ThemedView>

          {/* Budget */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Budget</ThemedText>
            
            <View style={styles.budgetContainer}>
              <View style={styles.budgetInput}>
                <ThemedText style={styles.label}>Minimum ($)</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background, 
                    borderColor: colors.tabIconDefault,
                    color: colors.text 
                  }]}
                  value={formData.budgetMin}
                  onChangeText={(value) => handleInputChange('budgetMin', value)}
                  placeholder="0"
                  placeholderTextColor={colors.tabIconDefault}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.budgetInput}>
                <ThemedText style={styles.label}>Maximum ($)</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background, 
                    borderColor: colors.tabIconDefault,
                    color: colors.text 
                  }]}
                  value={formData.budgetMax}
                  onChangeText={(value) => handleInputChange('budgetMax', value)}
                  placeholder="1000"
                  placeholderTextColor={colors.tabIconDefault}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ThemedView>

          {/* Location */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Location</ThemedText>
            
            <View style={styles.locationContainer}>
              <View style={styles.locationInput}>
                <ThemedText style={styles.label}>City</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background, 
                    borderColor: colors.tabIconDefault,
                    color: colors.text 
                  }]}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="San Francisco"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>
              <View style={styles.locationInput}>
                <ThemedText style={styles.label}>State</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background, 
                    borderColor: colors.tabIconDefault,
                    color: colors.text 
                  }]}
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  placeholder="CA"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>
            </View>

            <ThemedText style={styles.label}>ZIP Code</ThemedText>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault,
                color: colors.text 
              }]}
              value={formData.zipCode}
              onChangeText={(value) => handleInputChange('zipCode', value)}
              placeholder="94102"
              placeholderTextColor={colors.tabIconDefault}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.checkbox, { borderColor: colors.tint }]}
              onPress={() => setFormData(prev => ({ ...prev, isRemote: !prev.isRemote }))}
            >
              <View style={[
                styles.checkboxInner,
                { backgroundColor: formData.isRemote ? colors.tint : 'transparent' }
              ]} />
              <ThemedText style={styles.checkboxLabel}>Remote work available</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Requirements & Skills */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Requirements & Skills</ThemedText>
            
            <ThemedText style={styles.label}>Requirements (comma-separated)</ThemedText>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault,
                color: colors.text 
              }]}
              value={formData.requirements}
              onChangeText={(value) => handleInputChange('requirements', value)}
              placeholder="e.g., 3+ years experience, React Native, TypeScript"
              placeholderTextColor={colors.tabIconDefault}
              multiline
              numberOfLines={3}
            />

            <ThemedText style={styles.label}>Required Skills (comma-separated)</ThemedText>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault,
                color: colors.text 
              }]}
              value={formData.skills}
              onChangeText={(value) => handleInputChange('skills', value)}
              placeholder="e.g., React Native, TypeScript, Node.js"
              placeholderTextColor={colors.tabIconDefault}
              multiline
              numberOfLines={3}
            />
          </ThemedView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.submitButtonText}>Post Job</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.7,
  },
  form: {
    marginBottom: 100, // Account for tab bar
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
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
    textAlignVertical: 'top',
  },
  selectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  selectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  selectionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  budgetContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetInput: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationInput: {
    flex: 1,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 