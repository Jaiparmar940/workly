import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import SkillBubbleDiscovery from './SkillBubbleDiscovery';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SkillDiscoveryProps {
  onComplete: (skills: string[], experience: string, interests: string[], availability: string) => void;
  onSkip: () => void;
  userName: string;
}

interface ConversationStep {
  id: number;
  question: string;
  placeholder: string;
  type: 'text' | 'multiselect';
  options?: string[];
}

const CONVERSATION_STEPS: ConversationStep[] = [
  {
    id: 1,
    question: "Hi! I'm here to help you find great opportunities. What do you spend most of your time doing these days?",
    placeholder: "Work, school, hobbies, or something else?",
    type: 'text'
  },
  {
    id: 2,
    question: "Tell me about something you've made, built, or helped create recently. It could be anything!",
    placeholder: "A website, a meal, a garden, a presentation, etc.",
    type: 'text'
  },
  {
    id: 3,
    question: "What kinds of problems do people usually come to you for help with?",
    placeholder: "Technical issues, creative projects, organizing things, etc.",
    type: 'text'
  },
  {
    id: 4,
    question: "What would you be excited to help someone with, even if you haven't done it professionally?",
    placeholder: "Something you'd love to try or are passionate about",
    type: 'text'
  },
  {
    id: 5,
    question: "Do you have any skills or interests that you'd like to explore further?",
    placeholder: "Enter a skill or interest",
    type: 'text'
  }
];

export default function SkillDiscovery({ onComplete, onSkip, userName }: SkillDiscoveryProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [extractedExperience, setExtractedExperience] = useState('');
  const [extractedInterests, setExtractedInterests] = useState<string[]>([]);
  const [bubbleSkills, setBubbleSkills] = useState<string[]>([]);
  const [additionalInterests, setAdditionalInterests] = useState('');
  const [availability, setAvailability] = useState('');

  const currentStepData = CONVERSATION_STEPS[currentStep];

  const getExampleForStep = (step: number): string[] => {
    switch (step) {
      case 0:
        return [
          "I work as a graphic designer and love playing guitar in my free time",
          "I'm a student studying computer science and enjoy photography",
          "I work in marketing but spend weekends woodworking and building furniture",
          "I'm a stay-at-home parent who loves cooking and organizing events",
          "I work in healthcare but have a passion for writing and editing"
        ];
      case 1:
        return [
          "I recently built a website for my friend's small business using WordPress",
          "I created a custom birthday cake for my sister's party",
          "I helped organize a community fundraiser that raised $5,000",
          "I designed and printed custom t-shirts for a local sports team",
          "I built a garden shed from scratch using reclaimed materials"
        ];
      case 2:
        return [
          "People ask me to help with logo design, website updates, and social media graphics",
          "Friends come to me for tech support, computer repairs, and software recommendations",
          "Family asks for help with event planning, decorating, and party coordination",
          "Neighbors request help with gardening, landscaping, and plant care",
          "Colleagues ask for writing help, proofreading, and document formatting"
        ];
      case 3:
        return [
          "I'd love to help with music production or teach guitar lessons to beginners",
          "I want to help people learn to code or build their first website",
          "I'd enjoy helping with home organization and decluttering projects",
          "I'd love to assist with pet training and animal care",
          "I want to help with meal planning and healthy cooking for busy families"
        ];
      case 4:
        return [
          "I'm passionate about digital marketing and enjoy creating content",
          "I'm skilled in graphic design and have a passion for photography",
          "I'm experienced in project management and enjoy organizing events",
          "I'm passionate about pet care and enjoy gardening",
          "I'm skilled in digital marketing and enjoy creating content"
        ];
      default:
        return [];
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentAnswer(answers[currentStep - 1] || '');
    }
  };

  const handleNext = async () => {
    if (!currentAnswer.trim()) {
      Alert.alert('Please share something before continuing');
      return;
    }

    const newAnswers = [...answers, currentAnswer.trim()];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentStep < CONVERSATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Process all answers with AI
      await processAnswers(newAnswers);
    }
  };

  const processAnswers = async (allAnswers: string[]) => {
    setIsProcessing(true);
    
    try {
      // For now, we'll do basic skill extraction
      // In production, this would call an LLM API
      const combinedText = allAnswers.join(' ');
      
      // Basic skill extraction (replace with LLM call)
      const extractedData = await extractSkillsFromText(combinedText);
      
      setExtractedSkills(extractedData.skills);
      setExtractedExperience(extractedData.experience);
      setExtractedInterests(extractedData.interests);
      
      // Show results and let user refine
      setCurrentStep(CONVERSATION_STEPS.length);
    } catch (error) {
      console.error('Error processing answers:', error);
      Alert.alert('Error', 'Failed to process your responses. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractSkillsFromText = async (text: string) => {
    // This is a placeholder implementation
    // In production, you would call OpenAI GPT or similar
    const commonSkills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'Graphic Design', 'UI/UX Design',
      'Content Writing', 'Digital Marketing', 'Project Management', 'Customer Service',
      'Data Analysis', 'Photography', 'Video Editing', 'Social Media', 'SEO',
      'Translation', 'Tutoring', 'Event Planning', 'Personal Training', 'Pet Care',
      'Cleaning', 'Cooking', 'Gardening', 'Handyman', 'Music', 'Art', 'Writing',
      'Teaching', 'Consulting', 'Virtual Assistant', '3D Printing', 'CAD Design'
    ];

    const foundSkills: string[] = [];
    const interests: string[] = [];
    let experience = '';

    // Simple keyword matching (replace with LLM)
    commonSkills.forEach(skill => {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    // Extract potential interests from the text
    if (text.toLowerCase().includes('love') || text.toLowerCase().includes('passion')) {
      interests.push('Creative Projects');
    }
    if (text.toLowerCase().includes('help') || text.toLowerCase().includes('solve')) {
      interests.push('Problem Solving');
    }
    if (text.toLowerCase().includes('build') || text.toLowerCase().includes('create')) {
      interests.push('Building Things');
    }

    experience = `Based on your responses, you seem to have experience with ${foundSkills.slice(0, 3).join(', ')} and enjoy ${interests.slice(0, 2).join(', ')}.`;

    return {
      skills: foundSkills,
      experience,
      interests
    };
  };

  const handleBubbleComplete = (selectedSkills: string[]) => {
    setBubbleSkills(selectedSkills);
    // Process all answers including bubble skills
    const allSkills = [...extractedSkills, ...selectedSkills];
    onComplete(allSkills, extractedExperience, extractedInterests, '');
  };

  const handleBubbleSkip = () => {
    // Process answers without bubble skills
    onComplete(extractedSkills, extractedExperience, extractedInterests, '');
  };

  const handleComplete = () => {
    // Combine extracted skills with bubble skills
    const allSkills = [...extractedSkills, ...bubbleSkills];
    onComplete(allSkills, extractedExperience, extractedInterests, '');
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Skill Discovery?',
      'This process helps our AI find you jobs that match your unique skills and interests. Completing it will give you better job matches and opportunities you\'ll actually enjoy. Are you sure you want to skip?',
      [
        { text: 'Continue Discovery', style: 'cancel' },
        { 
          text: 'Skip for Now', 
          style: 'default', 
          onPress: onSkip 
        }
      ]
    );
  };

  if (isProcessing) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Analyzing your responses...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (currentStep === CONVERSATION_STEPS.length) {
    // Show results
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
            <ThemedText style={styles.title}>Here's what I found about you!</ThemedText>
          </View>
          <View style={styles.subtitleContainer}>
            <ThemedText style={styles.subtitle}>Based on our conversation, here are your skills and interests:</ThemedText>
          </View>

          <View style={styles.resultsContainer}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Skills & Experience</ThemedText>
              <View style={styles.skillsContainer}>
                {[...extractedSkills, ...bubbleSkills].length > 0 ? (
                  [...extractedSkills, ...bubbleSkills].map((skill, index) => (
                    <View key={index} style={[styles.skillChip, { backgroundColor: colors.tint }]}>
                      <ThemedText style={[styles.skillText, { color: 'white' }]}>{skill}</ThemedText>
                    </View>
                  ))
                ) : (
                  <ThemedText style={styles.noSkillsText}>No specific skills detected yet</ThemedText>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Interests & Passions</ThemedText>
              <View style={styles.skillsContainer}>
                {extractedInterests.length > 0 ? (
                  extractedInterests.map((interest, index) => (
                    <View key={index} style={[styles.skillChip, { backgroundColor: colors.tint }]}>
                      <ThemedText style={[styles.skillText, { color: 'white' }]}>{interest}</ThemedText>
                    </View>
                  ))
                ) : (
                  <ThemedText style={styles.noSkillsText}>No specific interests detected yet</ThemedText>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Experience Summary</ThemedText>
              <ThemedText style={styles.experienceText}>{extractedExperience}</ThemedText>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={handleComplete}
            >
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                Looks Good! Continue
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  // Show bubble discovery on step 5
  if (currentStep === 4) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <ThemedText style={[styles.skipText, { color: colors.tint }]}>Skip for now</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.tint,
                  width: `${((currentStep + 1) / (CONVERSATION_STEPS.length + 1)) * 100}%`
                }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressText}>
            {currentStep + 1} of {CONVERSATION_STEPS.length + 1}
          </ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.questionContainer}>
            <ThemedText style={styles.question}>{currentStepData.question}</ThemedText>
          </View>

          <SkillBubbleDiscovery
            onComplete={handleBubbleComplete}
            onSkip={handleBubbleSkip}
          />
        </View>
      </ThemedView>
    );
  }

  // Show additional information step
  if (currentStep === 5) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <ThemedText style={[styles.skipText, { color: colors.tint }]}>Skip for now</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.tint,
                  width: `${((currentStep + 1) / (CONVERSATION_STEPS.length + 1)) * 100}%`
                }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressText}>
            {currentStep + 1} of {CONVERSATION_STEPS.length + 1}
          </ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.questionContainer}>
            <ThemedText style={styles.question}>Tell us a bit more about yourself</ThemedText>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Interests & Hobbies</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.tabIconDefault,
                  color: colors.text,
                }
              ]}
              placeholder="e.g., Photography, Travel, Technology, Art..."
              placeholderTextColor={colors.tabIconDefault}
              value={additionalInterests}
              onChangeText={setAdditionalInterests}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Availability</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.tabIconDefault,
                  color: colors.text,
                }
              ]}
              placeholder="e.g., Weekdays 9-5, Evenings only, Weekends..."
              placeholderTextColor={colors.tabIconDefault}
              value={availability}
              onChangeText={setAvailability}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={() => {
                const allSkills = [...extractedSkills, ...bubbleSkills];
                const allInterests = [...extractedInterests, ...additionalInterests.split(',').map(s => s.trim()).filter(s => s)];
                onComplete(allSkills, extractedExperience, allInterests, availability);
              }}
            >
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                Continue
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <ThemedText style={[styles.skipText, { color: colors.tint }]}>Skip for now</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.tint,
                width: `${((currentStep + 1) / CONVERSATION_STEPS.length) * 100}%`
              }
            ]} 
          />
        </View>
        <ThemedText style={styles.progressText}>
          {currentStep + 1} of {CONVERSATION_STEPS.length}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.questionContainer}>
          <ThemedText style={styles.question}>{currentStepData.question}</ThemedText>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault,
                color: colors.text,
              }
            ]}
            placeholder={currentStepData.placeholder}
            placeholderTextColor={colors.tabIconDefault}
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={() => {
              if (currentAnswer.trim()) {
                handleNext();
              }
            }}
          />
          <View style={styles.exampleContainer}>
            <ThemedText style={[styles.exampleLabel, { color: colors.tabIconDefault }]}>
              💡 Examples:
            </ThemedText>
            {getExampleForStep(currentStep).map((example, index) => (
              <View key={index} style={styles.exampleItem}>
                <ThemedText style={[styles.bulletPoint, { color: colors.tabIconDefault }]}>•</ThemedText>
                <ThemedText style={[styles.exampleText, { color: colors.tabIconDefault }]}>
                  {example}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.backButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.tint,
                    borderWidth: 1,
                    flex: 0.48,
                  }
                ]}
                onPress={handleBack}
              >
                <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
                  Back
                </ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.nextButton,
                {
                  backgroundColor: currentAnswer.trim() ? colors.tint : colors.tabIconDefault,
                  flex: currentStep === 0 ? 1 : 0.48,
                }
              ]}
              onPress={handleNext}
              disabled={!currentAnswer.trim()}
            >
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                {currentStep === CONVERSATION_STEPS.length - 1 ? 'Finish' : 'Next'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionContainer: {
    marginBottom: 32,
  },
  question: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  inputContainer: {
    marginBottom: 32,
  },
  textInput: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: 16,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitleContainer: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  resultsContainer: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noSkillsText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  experienceText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
  exampleContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bulletPoint: {
    marginRight: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  nextButton: {
    padding: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
}); 