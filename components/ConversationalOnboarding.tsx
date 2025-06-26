import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { extractSkillsFromText, initializeOpenAI } from '@/services/openaiService';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import SkillConfirmation from './SkillConfirmation';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export interface OnboardingData {
  skills: string[];
  experience: string;
  interests: string[];
  location: {
    city: string;
    state: string;
    zipCode: string;
  };
  availability: string;
  workPreferences: {
    jobTypes: string[];
    remoteWork: boolean;
    travelWillingness: boolean;
  };
  embedding?: string; // For AI job matching
}

interface ConversationalOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
  userName: string;
}

type OnboardingStep = 
  | 'greeting'
  | 'skills_input'
  | 'skills_confirmation'
  | 'experience'
  | 'interests'
  | 'location'
  | 'availability'
  | 'work_preferences'
  | 'summary';

interface OnboardingStepConfig {
  id: OnboardingStep;
  message: string;
  type: 'text' | 'input' | 'choices' | 'location' | 'summary';
  options?: string[];
  skipText?: string;
}

const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'greeting',
    message: "Hey there! 👋 I'm here to help you set up your Workly profile and find the perfect job matches. What kind of work do you enjoy doing?",
    type: 'text',
    skipText: 'Skip for now'
  },
  {
    id: 'skills_input',
    message: "Awesome! Tell me about your skills and what you're good at. You can be as detailed as you want - I'll help organize everything! 😊",
    type: 'input',
    skipText: 'Add skills later'
  },
  {
    id: 'experience',
    message: "Thanks for sharing! 😊 Just curious — how much experience do you have in your field?",
    type: 'choices',
    options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years', '10+ years'],
    skipText: 'Skip'
  },
  {
    id: 'interests',
    message: "Great! What are your interests and hobbies? This helps us find jobs that match your lifestyle and keep you engaged! 🌟",
    type: 'input',
    skipText: 'Skip'
  },
  {
    id: 'location',
    message: "Perfect! Where are you located? This helps us find local opportunities that work for you! 📍",
    type: 'location',
    skipText: 'Add later'
  },
  {
    id: 'availability',
    message: "Got it! What's your availability like? We want to make sure we find opportunities that fit your schedule! ⏰",
    type: 'choices',
    options: ['Full-time', 'Part-time', 'Weekends only', 'Evenings only', 'Flexible', 'Project-based'],
    skipText: 'Skip'
  },
  {
    id: 'work_preferences',
    message: "Almost done! Do you prefer remote work, in-person opportunities, or a mix of both? We'll find what works best for you! 🏠💼",
    type: 'choices',
    options: ['Remote only', 'In-person only', 'Hybrid', 'No preference'],
    skipText: 'Skip'
  },
  {
    id: 'summary',
    message: "Excellent! Let me create a summary of your profile to make sure everything looks perfect! ✨",
    type: 'summary',
    skipText: 'Complete setup'
  }
];

interface SkillWithConfidence {
  skill: string;
  confidence: 'high' | 'medium' | 'low';
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ConversationalOnboarding({ 
  onComplete, 
  onSkip, 
  userName 
}: ConversationalOnboardingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSkillConfirmation, setShowSkillConfirmation] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<SkillWithConfidence[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    skills: [],
    experience: '',
    interests: [],
    location: { city: '', state: '', zipCode: '' },
    availability: '',
    workPreferences: {
      jobTypes: [],
      remoteWork: false,
      travelWillingness: false
    }
  });

  // Initialize chat with greeting
  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      text: ONBOARDING_STEPS[0].message,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([initialMessage]);

    // Initialize OpenAI if API key is available
    // Replace 'your-openai-api-key-here' with your actual API key
    // 
    initializeOpenAI('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');
  }, []);

  const addBotMessage = useCallback((text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(previousMessages => [...previousMessages, newMessage]);
    
    // Auto-scroll to bottom after a short delay
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const addUserMessage = useCallback((text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(previousMessages => [...previousMessages, newMessage]);
    
    // Auto-scroll to bottom after a short delay
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!inputText.trim()) return;
    
    addUserMessage(inputText);
    processUserInput(inputText);
    setInputText('');
  }, [inputText, addUserMessage]);

  const handleQuickReply = useCallback((reply: string) => {
    addUserMessage(reply);
    processUserInput(reply);
  }, [addUserMessage]);

  // Enhanced skill extraction with confidence scores
  const extractSkillsWithConfidence = async (text: string): Promise<SkillWithConfidence[]> => {
    try {
      const skills = await extractSkillsFromText(text);
      
      // Simple confidence scoring based on keyword strength and context
      const skillKeywords = {
        high: ['expert', 'proficient', 'skilled', 'experienced', 'certified', 'professional'],
        medium: ['good', 'familiar', 'knowledgeable', 'capable', 'competent'],
        low: ['basic', 'beginner', 'learning', 'interested', 'curious']
      };

      return skills.map(skill => {
        const lowerSkill = skill.toLowerCase();
        const lowerText = text.toLowerCase();
        
        // Check for confidence indicators in the original text
        if (skillKeywords.high.some(keyword => lowerText.includes(keyword) && lowerText.includes(lowerSkill))) {
          return { skill, confidence: 'high' as const };
        } else if (skillKeywords.medium.some(keyword => lowerText.includes(keyword) && lowerText.includes(lowerSkill))) {
          return { skill, confidence: 'medium' as const };
        } else {
          return { skill, confidence: 'low' as const };
        }
      });
    } catch (error) {
      console.error('Error extracting skills with confidence:', error);
      return [];
    }
  };

  // Enhanced work preferences parsing
  const parseWorkPreferences = (text: string) => {
    const lowerText = text.toLowerCase();
    
    const jobTypes: string[] = [];
    let remoteWork = false;
    let travelWillingness = false;

    // Parse job types
    if (lowerText.includes('remote') || lowerText.includes('work from home')) {
      jobTypes.push('Remote');
      remoteWork = true;
    }
    if (lowerText.includes('in-person') || lowerText.includes('on-site')) {
      jobTypes.push('In-person');
    }
    if (lowerText.includes('hybrid') || lowerText.includes('mix')) {
      jobTypes.push('Hybrid');
      remoteWork = true;
    }
    if (lowerText.includes('no preference') || lowerText.includes('flexible')) {
      jobTypes.push('Flexible');
    }

    // Parse travel willingness
    if (lowerText.includes('travel') || lowerText.includes('willing to travel') || lowerText.includes('mobile')) {
      travelWillingness = true;
    }

    return { jobTypes, remoteWork, travelWillingness };
  };

  // Generate user embedding for AI job matching
  const generateUserEmbedding = async (profileData: OnboardingData): Promise<string> => {
    const profileString = [
      `Skills: ${profileData.skills.join(', ')}`,
      `Experience: ${profileData.experience}`,
      `Interests: ${profileData.interests.join(', ')}`,
      `Availability: ${profileData.availability}`,
      `Work Preferences: ${profileData.workPreferences.jobTypes.join(', ')}`,
      `Remote Work: ${profileData.workPreferences.remoteWork ? 'Yes' : 'No'}`,
      `Travel Willingness: ${profileData.workPreferences.travelWillingness ? 'Yes' : 'No'}`
    ].join(' | ');

    // TODO: Replace with actual embedding generation
    // For now, return a hash-like string
    return btoa(profileString).substring(0, 50);
  };

  // Generate AI profile summary
  const generateProfileSummary = async (profileData: OnboardingData): Promise<string> => {
    const summary = `Here's your Workly profile summary! 🎉

**Skills & Experience:**
• ${profileData.skills.length > 0 ? profileData.skills.join(', ') : 'Skills to be added'}
• ${profileData.experience || 'Experience to be specified'}

**Interests & Lifestyle:**
• ${profileData.interests.length > 0 ? profileData.interests.join(', ') : 'Interests to be added'}

**Work Preferences:**
• Availability: ${profileData.availability || 'To be specified'}
• Work Type: ${profileData.workPreferences.jobTypes.length > 0 ? profileData.workPreferences.jobTypes.join(', ') : 'Flexible'}
• Remote Work: ${profileData.workPreferences.remoteWork ? 'Yes' : 'No'}
• Travel: ${profileData.workPreferences.travelWillingness ? 'Willing to travel' : 'Local work preferred'}

Perfect! We'll use this to find the best job matches for you! 🚀`;

    return summary;
  };

  const processUserInput = useCallback(async (text: string) => {
    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    
    switch (currentStep.id) {
      case 'greeting':
        // After greeting, automatically move to skills input
        addBotMessage(ONBOARDING_STEPS[currentStepIndex + 1].message);
        setCurrentStepIndex(prev => prev + 1);
        break;

      case 'skills_input':
        const skillsWithConfidence = await extractSkillsWithConfidence(text);
        setExtractedSkills(skillsWithConfidence);
        setShowSkillConfirmation(true);
        break;

      case 'experience':
        setOnboardingData(prev => ({ ...prev, experience: text }));
        addBotMessage(ONBOARDING_STEPS[currentStepIndex + 1].message);
        setCurrentStepIndex(prev => prev + 1);
        break;

      case 'interests':
        const interests = text.split(',').map(item => item.trim()).filter(item => item.length > 0);
        setOnboardingData(prev => ({ ...prev, interests }));
        addBotMessage(ONBOARDING_STEPS[currentStepIndex + 1].message);
        setCurrentStepIndex(prev => prev + 1);
        break;

      case 'availability':
        setOnboardingData(prev => ({ ...prev, availability: text }));
        addBotMessage(ONBOARDING_STEPS[currentStepIndex + 1].message);
        setCurrentStepIndex(prev => prev + 1);
        break;

      case 'work_preferences':
        const workPrefs = parseWorkPreferences(text);
        setOnboardingData(prev => ({ 
          ...prev, 
          workPreferences: workPrefs
        }));
        addBotMessage(ONBOARDING_STEPS[currentStepIndex + 1].message);
        setCurrentStepIndex(prev => prev + 1);
        break;

      case 'summary':
        // Generate and display profile summary
        const summary = await generateProfileSummary(onboardingData);
        addBotMessage(summary);
        
        // Generate embedding and complete onboarding
        const embedding = await generateUserEmbedding(onboardingData);
        const finalData = { ...onboardingData, embedding };
        
        // Add completion message
        setTimeout(() => {
          addBotMessage("All set! Your profile is ready and we'll start finding perfect job matches for you! 🎉");
          setTimeout(() => {
            onComplete(finalData);
          }, 2000);
        }, 1000);
        break;

      default:
        addBotMessage("I'm not sure how to process that. Let's continue with the next step!");
        setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, addBotMessage, onboardingData, onComplete]);

  const handleSkillConfirmation = (confirmedSkills: string[]) => {
    setOnboardingData(prev => ({ ...prev, skills: confirmedSkills }));
    setShowSkillConfirmation(false);
    addBotMessage(`Perfect! Now let's talk about your experience. ${ONBOARDING_STEPS[currentStepIndex + 1].message}`);
    setCurrentStepIndex(prev => prev + 1);
  };

  const handleSkillConfirmationBack = () => {
    setShowSkillConfirmation(false);
    addBotMessage("No problem! Let's try again. Tell me about your skills and what you're good at.");
  };

  const handleSkip = useCallback(() => {
    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    Alert.alert(
      'Skip Step',
      `Are you sure you want to skip ${currentStep.skipText || 'this step'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: () => {
            if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
              setCurrentStepIndex(prev => prev + 1);
              addBotMessage(ONBOARDING_STEPS[currentStepIndex + 1].message);
            } else {
              onComplete(onboardingData);
            }
          }
        }
      ]
    );
  }, [currentStepIndex, addBotMessage, onboardingData, onComplete]);

  const renderQuickReplies = () => {
    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    if (currentStep.type !== 'choices' || !currentStep.options) return null;

    return (
      <View style={styles.quickRepliesContainer}>
        {currentStep.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.quickReplyButton, { borderColor: colors.tint }]}
            onPress={() => {
              handleQuickReply(option);
            }}
          >
            <ThemedText style={[styles.quickReplyText, { color: colors.tint }]}>
              {option}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderProgressIndicator = () => {
    const currentStep = currentStepIndex + 1;
    const totalSteps = ONBOARDING_STEPS.length;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(currentStep / totalSteps) * 100}%`,
                backgroundColor: colors.tint 
              }
            ]} 
          />
        </View>
        <ThemedText style={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {showSkillConfirmation ? (
        <SkillConfirmation
          skills={extractedSkills.map(s => s.skill)}
          skillsWithConfidence={extractedSkills}
          onConfirm={handleSkillConfirmation}
          onBack={handleSkillConfirmationBack}
        />
      ) : (
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>Profile Setup</ThemedText>
            <ThemedText style={styles.subtitle}>Let's get to know you better</ThemedText>
            {renderProgressIndicator()}
          </ThemedView>

          <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent} ref={scrollViewRef}>
            {messages.map((message, index) => (
              <ThemedView key={index} style={message.isUser ? styles.userMessage : styles.botMessage}>
                <ThemedText style={styles.messageText}>
                  {message.text}
                </ThemedText>
              </ThemedView>
            ))}
          </ScrollView>

          <ThemedView style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, { borderColor: colors.tint, color: colors.text }]}
              placeholder="Type your message..."
              placeholderTextColor={colors.text + '60'}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, { backgroundColor: colors.tint }]} 
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </ThemedView>

          {renderQuickReplies()}

          <ThemedView style={styles.skipContainer}>
            <TouchableOpacity onPress={handleSkip}>
              <ThemedText style={[styles.skipButton, { color: colors.tint }]}>
                {ONBOARDING_STEPS[currentStepIndex]?.skipText || 'Skip'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </KeyboardAvoidingView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  chatContent: {
    gap: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginBottom: 8,
    maxWidth: '80%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    maxWidth: '80%',
  },
  messageText: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  sendButton: {
    padding: 12,
    borderRadius: 8,
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  quickReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  skipContainer: {
    padding: 16,
    alignItems: 'center',
  },
  skipButton: {
    fontSize: 16,
    fontWeight: '500',
  },
});
