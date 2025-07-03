import { Captcha } from '@/components/Captcha';
import { OnboardingComplete } from '@/components/OnboardingComplete';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRateLimit } from '@/hooks/useRateLimit';
import { User, UserIntent } from '@/types';
import { createBotDetector } from '@/utils/botDetection';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signUp, loading, error, clearError } = useAuthContext();
  const navigation = useNavigation();

  // Anti-bot measures
  const rateLimit = useRateLimit({
    maxAttempts: 3,
    timeWindow: 5 * 60 * 1000, // 5 minutes
    cooldownPeriod: 15 * 60 * 1000, // 15 minutes
  });

  const botDetector = useRef(createBotDetector());
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [formStartTime] = useState(Date.now());
  const [userIntent, setUserIntent] = useState<null | UserIntent>(null);
  const [showIntentStep, setShowIntentStep] = useState(false);
  const [showFinalScreen, setShowFinalScreen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Start bot detection tracking
  useEffect(() => {
    botDetector.current.startFormTracking();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
    
    // Track for bot detection
    botDetector.current.trackInput(value);
  };

  const handleKeystroke = () => {
    botDetector.current.trackKeystroke();
  };

  const handleCaptchaVerify = (isValid: boolean) => {
    setCaptchaVerified(isValid);
  };

  const validateForm = (): { isValid: boolean; message: string } => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return { isValid: false, message: 'Please fill in all required fields' };
    }

    if (formData.password !== formData.confirmPassword) {
      return { isValid: false, message: 'Passwords do not match' };
    }

    if (formData.password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    // CAPTCHA verification
    if (!captchaVerified) {
      return { isValid: false, message: 'Please complete the CAPTCHA verification' };
    }

    // Bot detection
    const botDetection = botDetector.current.detectBot();
    if (botDetection.isBot) {
      return { 
        isValid: false, 
        message: `Suspicious activity detected: ${botDetection.reasons.join(', ')}` 
      };
    }

    return { isValid: true, message: '' };
  };

  const handleSignUp = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('Error', validation.message);
      return;
    }

    // Check rate limiting only after validation passes
    if (!rateLimit.checkRateLimit()) {
      const remainingTime = Math.ceil(rateLimit.getRemainingTime() / 1000 / 60);
      Alert.alert('Error', `Too many attempts. Please wait ${remainingTime} minutes before trying again.`);
      return;
    }

    // Instead of signing up, show the intent step
    setShowIntentStep(true);
  };

  const handleLogin = () => {
    router.push('/login' as any);
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handler for intent selection
  const handleIntentSelect = async (intent: UserIntent) => {
    setUserIntent(intent);
    setShowIntentStep(false);
    
    if (intent === UserIntent.INDIVIDUAL_LOOKING_FOR_WORK) {
      // For individuals looking for work, go directly to onboarding
      // Don't show skill discovery here - let onboarding handle it
      try {
        console.log('Starting signup process for individual looking for work...');
        
        const userData: Omit<User, 'id' | 'createdAt'> = {
          name: formData.name,
          email: formData.email,
          skills: [],
          experience: '',
          interests: [],
          rating: 0,
          completedJobs: 0,
          location: {
            city: formData.city || 'Unknown',
            state: formData.state || 'Unknown',
            zipCode: formData.zipCode || '00000',
          },
          accountType: 'personal',
          workerProfileComplete: false, // Will be completed in onboarding
        };

        // Only add phone if it has a value
        if (formData.phone && formData.phone.trim()) {
          (userData as any).phone = formData.phone.trim();
        }

        console.log('User data prepared:', userData);
        const result = await signUp(formData.email, formData.password, userData);
        console.log('Signup successful:', result);
        
        // Reset the navigation stack so onboarding is the root
        navigation.reset({
          index: 0,
          routes: [{ name: 'onboarding', params: {} }],
        });
      } catch (error: any) {
        console.error('Signup error:', error);
        
        // Check if the error is due to an existing account
        const errorMessage = error.message || '';
        const isExistingAccount = errorMessage.includes('already in use') || 
                                 errorMessage.includes('already exists') ||
                                 errorMessage.includes('email-already-in-use') ||
                                 error.code === 'auth/email-already-in-use';
        
        if (isExistingAccount) {
          Alert.alert(
            'Account Already Exists',
            'An account with this email already exists. Please log in instead.',
            [
              {
                text: 'Go to Login',
                onPress: () => router.replace('/login' as any)
              }
            ]
          );
        } else {
          // Show the actual error message to the user for other errors
          const displayMessage = errorMessage || 'Failed to create account. Please try again.';
          Alert.alert('Signup Failed', displayMessage);
        }
      }
    } else if (intent === UserIntent.INDIVIDUAL_NEEDING_SERVICES) {
      // For individuals needing services, complete signup and show final screen
      try {
        console.log('Starting signup process for individual needing services...');
        
        const userData: Omit<User, 'id' | 'createdAt'> = {
          name: formData.name,
          email: formData.email,
          skills: [],
          experience: '',
          interests: [],
          rating: 0,
          completedJobs: 0,
          location: {
            city: formData.city || 'Unknown',
            state: formData.state || 'Unknown',
            zipCode: formData.zipCode || '00000',
          },
          accountType: 'personal',
          workerProfileComplete: true, // Complete for service seekers
        };

        // Only add phone if it has a value
        if (formData.phone && formData.phone.trim()) {
          (userData as any).phone = formData.phone.trim();
        }

        console.log('User data prepared:', userData);
        const result = await signUp(formData.email, formData.password, userData);
        console.log('Signup successful:', result);
        
        setShowFinalScreen(true);
      } catch (error: any) {
        console.error('Signup error:', error);
        
        // Check if the error is due to an existing account
        const errorMessage = error.message || '';
        const isExistingAccount = errorMessage.includes('already in use') || 
                                 errorMessage.includes('already exists') ||
                                 errorMessage.includes('email-already-in-use') ||
                                 error.code === 'auth/email-already-in-use';
        
        if (isExistingAccount) {
          Alert.alert(
            'Account Already Exists',
            'An account with this email already exists. Please log in instead.',
            [
              {
                text: 'Go to Login',
                onPress: () => router.replace('/login' as any)
              }
            ]
          );
        } else {
          // Show the actual error message to the user for other errors
          const displayMessage = errorMessage || 'Failed to create account. Please try again.';
          Alert.alert('Signup Failed', displayMessage);
        }
      }
    } else if (intent === UserIntent.BUSINESS_LOOKING_FOR_WORK) {
      // For business owners, go to business onboarding
      try {
        console.log('Starting signup process for business owner...');
        
        const userData: Omit<User, 'id' | 'createdAt'> = {
          name: formData.name,
          email: formData.email,
          skills: [],
          experience: '',
          interests: [],
          rating: 0,
          completedJobs: 0,
          location: {
            city: formData.city || 'Unknown',
            state: formData.state || 'Unknown',
            zipCode: formData.zipCode || '00000',
          },
          accountType: 'business',
          workerProfileComplete: false, // Will be completed in business onboarding
        };

        // Only add phone if it has a value
        if (formData.phone && formData.phone.trim()) {
          (userData as any).phone = formData.phone.trim();
        }

        console.log('User data prepared:', userData);
        const result = await signUp(formData.email, formData.password, userData);
        console.log('Signup successful:', result);
        
        // Go to business onboarding
        router.replace('/business-onboarding' as any);
      } catch (error: any) {
        console.error('Signup error:', error);
        
        // Check if the error is due to an existing account
        const errorMessage = error.message || '';
        const isExistingAccount = errorMessage.includes('already in use') || 
                                 errorMessage.includes('already exists') ||
                                 errorMessage.includes('email-already-in-use') ||
                                 error.code === 'auth/email-already-in-use';
        
        if (isExistingAccount) {
          Alert.alert(
            'Account Already Exists',
            'An account with this email already exists. Please log in instead.',
            [
              {
                text: 'Go to Login',
                onPress: () => router.replace('/login' as any)
              }
            ]
          );
        } else {
          // Show the actual error message to the user for other errors
          const displayMessage = errorMessage || 'Failed to create account. Please try again.';
          Alert.alert('Signup Failed', displayMessage);
        }
      }
    }
  };

  if (showFinalScreen && userIntent === UserIntent.INDIVIDUAL_NEEDING_SERVICES) {
    return (
      <OnboardingComplete
        onComplete={() => router.replace('/(tabs)' as any)}
        title="Account Created!"
        subtitle="You're ready to start posting jobs on Workly."
        buttonText="Go to Dashboard"
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic info form and CAPTCHA */}
        {!showIntentStep && (
          <>
            <ThemedView style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                Create Account
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Join Workly to find your next opportunity. We'll help you set up your profile next.
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.form}>
              {error && (
                <ThemedView style={[styles.errorContainer, { backgroundColor: '#ffebee' }]}>
                  <ThemedText style={[styles.errorText, { color: '#c62828' }]}>
                    {error}
                  </ThemedText>
                </ThemedView>
              )}

              {rateLimit.isBlocked && (
                <ThemedView style={[styles.blockedContainer, { backgroundColor: '#fff3cd' }]}>
                  <ThemedText style={[styles.blockedText, { color: '#856404' }]}>
                    Account creation temporarily blocked due to too many attempts.
                    Please wait {formatTime(rateLimit.getRemainingTime())} before trying again.
                  </ThemedText>
                </ThemedView>
              )}

              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Full Name *
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
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.tabIconDefault}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  onKeyPress={handleKeystroke}
                />
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Email *
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
                  placeholder="Enter your email"
                  placeholderTextColor={colors.tabIconDefault}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  onKeyPress={handleKeystroke}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Password *
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
                  placeholder="Enter your password"
                  placeholderTextColor={colors.tabIconDefault}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  onKeyPress={handleKeystroke}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Confirm Password *
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
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.tabIconDefault}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  onKeyPress={handleKeystroke}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Phone (Optional)
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
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.tabIconDefault}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  onKeyPress={handleKeystroke}
                  keyboardType="phone-pad"
                />
              </ThemedView>

              <ThemedView style={styles.locationContainer}>
                <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                  Location
                </ThemedText>
                <View style={styles.locationRow}>
                  <View style={[styles.locationInput, { flex: 2 }]}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.tabIconDefault,
                          color: colors.text,
                        },
                      ]}
                      placeholder="City"
                      placeholderTextColor={colors.tabIconDefault}
                      value={formData.city}
                      onChangeText={(text) => handleInputChange('city', text)}
                      onKeyPress={handleKeystroke}
                    />
                  </View>
                  <View style={[styles.locationInput, { flex: 1, marginLeft: 8 }]}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.tabIconDefault,
                          color: colors.text,
                        },
                      ]}
                      placeholder="State"
                      placeholderTextColor={colors.tabIconDefault}
                      value={formData.state}
                      onChangeText={(text) => handleInputChange('state', text)}
                      onKeyPress={handleKeystroke}
                    />
                  </View>
                  <View style={[styles.locationInput, { flex: 1, marginLeft: 8 }]}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.tabIconDefault,
                          color: colors.text,
                        },
                      ]}
                      placeholder="ZIP"
                      placeholderTextColor={colors.tabIconDefault}
                      value={formData.zipCode}
                      onChangeText={(text) => handleInputChange('zipCode', text)}
                      onKeyPress={handleKeystroke}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </ThemedView>

              {/* CAPTCHA */}
              <Captcha onVerify={handleCaptchaVerify} />

              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  {
                    backgroundColor: '#0a7ea4',
                    opacity: (loading || rateLimit.isBlocked || !captchaVerified) ? 0.7 : 1,
                  },
                ]}
                onPress={handleSignUp}
                disabled={loading || rateLimit.isBlocked || !captchaVerified}
              >
                <ThemedText style={[styles.signUpButtonText, { color: 'white' }]}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </ThemedText>
              </TouchableOpacity>

              <ThemedView style={styles.divider}>
                <ThemedView style={[styles.dividerLine, { backgroundColor: colors.tabIconDefault }]} />
                <ThemedText style={[styles.dividerText, { color: colors.tabIconDefault }]}>
                  OR
                </ThemedText>
                <ThemedView style={[styles.dividerLine, { backgroundColor: colors.tabIconDefault }]} />
              </ThemedView>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { borderColor: colors.tint },
                ]}
                onPress={handleLogin}
              >
                <ThemedText style={[styles.loginButtonText, { color: colors.tint }]}>
                  Already have an account? Sign In
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        )}
        {/* Intent selection step after basic info */}
        {showIntentStep && userIntent === null && (
          <ThemedView style={styles.intentContainer}>
            <ThemedText type="title" style={[styles.title, { marginBottom: 60 }]}>
              Please describe your primary interest:
            </ThemedText>
            <TouchableOpacity
              style={[styles.intentButton, { backgroundColor: '#0a7ea4' }]}
              onPress={() => handleIntentSelect(UserIntent.INDIVIDUAL_LOOKING_FOR_WORK)}
            >
              <ThemedText style={styles.intentButtonText}>Individual looking for work</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.intentButton, { backgroundColor: '#0a7ea4' }]}
              onPress={() => handleIntentSelect(UserIntent.INDIVIDUAL_NEEDING_SERVICES)}
            >
              <ThemedText style={styles.intentButtonText}>Individual needing services</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.intentButton, { backgroundColor: '#0a7ea4' }]}
              onPress={() => handleIntentSelect(UserIntent.BUSINESS_LOOKING_FOR_WORK)}
            >
              <ThemedText style={styles.intentButtonText}>Business owner looking for work</ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.disclaimerText, { color: colors.tabIconDefault, marginTop: 20 }]}>
              This can be changed at any time. You can still act as an employee or post jobs regardless of your selection.
            </ThemedText>
          </ThemedView>
        )}
        {/* Main signup form only if userIntent is 'find' or 'both' and after intent step */}
        {/* Place additional onboarding steps here if needed */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  blockedContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  blockedText: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
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
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  locationContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
  },
  locationInput: {
    flex: 1,
  },
  rateLimitInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  rateLimitText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signUpButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  intentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    paddingTop: 60,
    paddingHorizontal: 24,
    flex: 1,
  },
  intentButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  intentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 