import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FirebaseService } from '@/services/firebaseService';
import { JobCategory, JobComplexity, JobStatus, JobType } from '@/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

export default function PostJobScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<JobCategory | ''>('');
  const [type, setType] = useState<JobType | ''>('');
  const [complexity, setComplexity] = useState<JobComplexity | ''>('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    suggestedCategory?: string;
    suggestedComplexity?: string;
    suggestedBudget?: { min: number; max: number };
    suggestedSkills?: string[];
  } | null>(null);

  const handleAIAnalysis = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please enter a job title and description first.');
      return;
    }

    try {
      setLoading(true);
      
      // Use AI to analyze the job posting
      const openAIService = (await import('@/services/openaiService')).getOpenAIService();
      if (openAIService) {
        const categorization = await openAIService.categorizeJob(description, title);
        
        setAiSuggestions({
          suggestedCategory: categorization.category,
          suggestedComplexity: categorization.complexity,
          suggestedBudget: categorization.suggestedBudget,
          suggestedSkills: categorization.requiredSkills,
        });

        // Auto-fill fields with AI suggestions
        if (!category) setCategory(categorization.category as JobCategory);
        if (!complexity) setComplexity(categorization.complexity as JobComplexity);
        if (!budgetMin) setBudgetMin(categorization.suggestedBudget.min.toString());
        if (!budgetMax) setBudgetMax(categorization.suggestedBudget.max.toString());
        
        Alert.alert(
          'AI Analysis Complete',
          `I've analyzed your job posting and suggested:\n\nCategory: ${categorization.category}\nComplexity: ${categorization.complexity}\nBudget: $${categorization.suggestedBudget.min}-${categorization.suggestedBudget.max}\n\nThese suggestions have been applied to your form.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      Alert.alert('Error', 'AI analysis failed. You can continue filling out the form manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to post a job.');
      return;
    }

    if (!title || !description || !category || !type || !complexity || !budgetMin || !budgetMax || !city || !state) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      const jobData = {
        title: title.trim(),
        description: description.trim(),
        category: category as JobCategory,
        type: type as JobType,
        complexity: complexity as JobComplexity,
        budget: {
          min: parseInt(budgetMin),
          max: parseInt(budgetMax),
          currency: 'USD',
        },
        location: {
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          isRemote,
        },
        requirements: requirements.trim() ? [requirements.trim()] : [],
        skills: aiSuggestions?.suggestedSkills || [],
        postedBy: user.uid,
        status: JobStatus.OPEN,
        applicants: [],
      };

      // Use AI-enhanced job creation
      await FirebaseService.createJobWithAICategorization(jobData);

      Alert.alert(
        'Success!',
        'Your job has been posted successfully. You can view it in the browse section.',
        [
          {
            text: 'View Jobs',
            onPress: () => router.push('/(tabs)/browse' as any),
          },
          {
            text: 'Post Another',
            onPress: () => {
              setTitle('');
              setDescription('');
              setCategory('');
              setType('');
              setComplexity('');
              setBudgetMin('');
              setBudgetMax('');
              setCity('');
              setState('');
              setZipCode('');
              setIsRemote(false);
              setRequirements('');
              setAiSuggestions(null);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error posting job:', error);
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = Object.values(JobCategory).map(cat => ({
    label: cat,
    value: cat,
  }));

  const typeOptions = Object.values(JobType).map(type => ({
    label: type,
    value: type,
  }));

  const complexityOptions = Object.values(JobComplexity).map(comp => ({
    label: comp,
    value: comp,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.header}>
            <ThemedText type="title">Post a Job</ThemedText>
            <ThemedText style={styles.subtitle}>
              Create a job posting to find the perfect worker
            </ThemedText>
          </ThemedView>

          {/* AI Analysis Button */}
          <ThemedView style={styles.aiSection}>
            <TouchableOpacity
              style={[styles.aiButton, { backgroundColor: colors.tint }]}
              onPress={handleAIAnalysis}
              disabled={loading || !title || !description}
            >
              <ThemedText style={styles.aiButtonText}>
                🤖 Analyze with AI
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.aiDescription}>
              Let AI help categorize your job and suggest optimal settings
            </ThemedText>
          </ThemedView>

          {/* AI Suggestions */}
          {aiSuggestions && (
            <ThemedView style={styles.suggestionsCard}>
              <ThemedText type="subtitle">AI Suggestions</ThemedText>
              <View style={styles.suggestionRow}>
                <ThemedText style={styles.suggestionLabel}>Category:</ThemedText>
                <ThemedText style={styles.suggestionValue}>{aiSuggestions.suggestedCategory}</ThemedText>
              </View>
              <View style={styles.suggestionRow}>
                <ThemedText style={styles.suggestionLabel}>Complexity:</ThemedText>
                <ThemedText style={styles.suggestionValue}>{aiSuggestions.suggestedComplexity}</ThemedText>
              </View>
              <View style={styles.suggestionRow}>
                <ThemedText style={styles.suggestionLabel}>Budget:</ThemedText>
                <ThemedText style={styles.suggestionValue}>
                  ${aiSuggestions.suggestedBudget?.min}-${aiSuggestions.suggestedBudget?.max}
                </ThemedText>
              </View>
              {aiSuggestions.suggestedSkills && aiSuggestions.suggestedSkills.length > 0 && (
                <View style={styles.suggestionRow}>
                  <ThemedText style={styles.suggestionLabel}>Skills:</ThemedText>
                  <ThemedText style={styles.suggestionValue}>
                    {aiSuggestions.suggestedSkills.join(', ')}
                  </ThemedText>
                </View>
              )}
            </ThemedView>
          )}

          {/* Job Details Form */}
          <ThemedView style={styles.formSection}>
            <ThemedText type="subtitle">Job Details</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Job Title *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., House Cleaning Needed"
                placeholderTextColor={colors.tabIconDefault}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Description *</ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the job requirements, responsibilities, and any specific details..."
                placeholderTextColor={colors.tabIconDefault}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <ThemedText style={styles.label}>Category *</ThemedText>
                <RNPickerSelect
                  value={category}
                  onValueChange={(value) => setCategory(value)}
                  items={categoryOptions}
                  style={pickerSelectStyles}
                  placeholder={{ label: 'Select category', value: null }}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <ThemedText style={styles.label}>Job Type *</ThemedText>
                <RNPickerSelect
                  value={type}
                  onValueChange={(value) => setType(value)}
                  items={typeOptions}
                  style={pickerSelectStyles}
                  placeholder={{ label: 'Select type', value: null }}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Complexity Level *</ThemedText>
              <RNPickerSelect
                value={complexity}
                onValueChange={(value) => setComplexity(value)}
                items={complexityOptions}
                style={pickerSelectStyles}
                placeholder={{ label: 'Select complexity', value: null }}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <ThemedText style={styles.label}>Min Budget ($) *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  placeholder="25"
                  placeholderTextColor={colors.tabIconDefault}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <ThemedText style={styles.label}>Max Budget ($) *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  placeholder="100"
                  placeholderTextColor={colors.tabIconDefault}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ThemedView>

          {/* Location */}
          <ThemedView style={styles.formSection}>
            <ThemedText type="subtitle">Location</ThemedText>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <ThemedText style={styles.label}>City *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="New York"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <ThemedText style={styles.label}>State *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                  value={state}
                  onChangeText={setState}
                  placeholder="NY"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>ZIP Code</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                value={zipCode}
                onChangeText={setZipCode}
                placeholder="10001"
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.checkboxContainer, { borderColor: colors.tabIconDefault }]}
              onPress={() => setIsRemote(!isRemote)}
            >
              <View style={[styles.checkbox, { backgroundColor: isRemote ? colors.tint : 'transparent', borderColor: colors.tabIconDefault }]}>
                {isRemote && <ThemedText style={styles.checkmark}>✓</ThemedText>}
              </View>
              <ThemedText style={styles.checkboxLabel}>Remote work available</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Additional Requirements */}
          <ThemedView style={styles.formSection}>
            <ThemedText type="subtitle">Additional Requirements</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Requirements (Optional)</ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                value={requirements}
                onChangeText={setRequirements}
                placeholder="Any specific requirements, certifications, or experience needed..."
                placeholderTextColor={colors.tabIconDefault}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ThemedView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <ThemedText style={styles.submitButtonText}>
              {loading ? 'Posting...' : 'Post Job'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.7,
  },
  aiSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  aiButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  aiButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  aiDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  suggestionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  suggestionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionValue: {
    fontSize: 14,
    opacity: 0.8,
  },
  formSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
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
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  submitButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
}); 