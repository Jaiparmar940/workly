import { Captcha } from '@/components/Captcha';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRateLimit } from '@/hooks/useRateLimit';
import { User } from '@/types';
import { createBotDetector } from '@/utils/botDetection';
import { router } from 'expo-router';
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

  // Anti-bot measures
  const rateLimit = useRateLimit({
    maxAttempts: 3,
    timeWindow: 5 * 60 * 1000, // 5 minutes
    cooldownPeriod: 15 * 60 * 1000, // 15 minutes
  });

  const botDetector = useRef(createBotDetector());
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [formStartTime] = useState(Date.now());

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

    try {
      console.log('Starting signup process...');
      const userData: Omit<User, 'id' | 'createdAt'> = {
        name: formData.name,
        email: formData.email,
        skills: [], // Removed skills from formData
        experience: 'No experience specified', // Removed experience from formData
        interests: [], // Removed interests from formData
        rating: 0,
        completedJobs: 0,
        location: {
          city: formData.city || 'Unknown',
          state: formData.state || 'Unknown',
          zipCode: formData.zipCode || '00000',
        },
      };

      // Only add phone if it has a value
      if (formData.phone && formData.phone.trim()) {
        (userData as any).phone = formData.phone.trim();
      }

      console.log('User data prepared:', userData);
      const result = await signUp(formData.email, formData.password, userData);
      console.log('Signup successful:', result);
      router.replace('/onboarding' as any);
    } catch (error: any) {
      console.error('Signup error:', error);
      // Show the actual error message to the user
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      Alert.alert('Signup Failed', errorMessage);
    }
  };

  const handleLogin = () => {
    router.push('/login' as any);
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

          {/* Rate limit info */}
          <ThemedView style={styles.rateLimitInfo}>
            <ThemedText style={[styles.rateLimitText, { color: colors.tabIconDefault }]}>
              Attempts remaining: {rateLimit.getRemainingAttempts()}
            </ThemedText>
          </ThemedView>

          <TouchableOpacity
            style={[
              styles.signUpButton,
              {
                backgroundColor: colors.tint,
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
    paddingVertical: 40,
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
}); 