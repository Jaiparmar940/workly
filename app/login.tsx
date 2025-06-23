import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRateLimit } from '@/hooks/useRateLimit';
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
    TouchableOpacity
} from 'react-native';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signIn, loading, error, clearError } = useAuthContext();

  // Anti-bot measures
  const rateLimit = useRateLimit({
    maxAttempts: 5,
    timeWindow: 5 * 60 * 1000, // 5 minutes
    cooldownPeriod: 30 * 60 * 1000, // 30 minutes
  });

  const botDetector = useRef(createBotDetector());
  const [formStartTime] = useState(Date.now());

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Start bot detection tracking
  useEffect(() => {
    botDetector.current.startFormTracking();
  }, []);

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (error) clearError();
    
    // Track for bot detection
    botDetector.current.trackInput(value);
  };

  const handleKeystroke = () => {
    botDetector.current.trackKeystroke();
  };

  const validateForm = (): { isValid: boolean; message: string } => {
    if (!email || !password) {
      return { isValid: false, message: 'Please fill in all fields' };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    // Rate limiting check
    if (!rateLimit.checkRateLimit()) {
      const remainingTime = Math.ceil(rateLimit.getRemainingTime() / 1000 / 60);
      return { 
        isValid: false, 
        message: `Too many login attempts. Please wait ${remainingTime} minutes before trying again.` 
      };
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

  const handleLogin = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('Error', validation.message);
      return;
    }

    try {
      await signIn(email, password);
      router.replace('/(tabs)' as any);
    } catch (error) {
      // Error is handled by the auth hook
    }
  };

  const handleSignUp = () => {
    router.push('/signup' as any);
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password' as any);
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
            Welcome Back
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to your account to continue
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
                Login temporarily blocked due to too many attempts.
                Please wait {formatTime(rateLimit.getRemainingTime())} before trying again.
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>
              Email
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
              value={email}
              onChangeText={(text) => handleInputChange('email', text)}
              onKeyPress={handleKeystroke}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>
              Password
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
              value={password}
              onChangeText={(text) => handleInputChange('password', text)}
              onKeyPress={handleKeystroke}
              secureTextEntry
              autoCapitalize="none"
            />
          </ThemedView>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <ThemedText style={[styles.forgotPasswordText, { color: colors.tint }]}>
              Forgot Password?
            </ThemedText>
          </TouchableOpacity>

          {/* Rate limit info */}
          <ThemedView style={styles.rateLimitInfo}>
            <ThemedText style={[styles.rateLimitText, { color: colors.tabIconDefault }]}>
              Login attempts remaining: {rateLimit.getRemainingAttempts()}
            </ThemedText>
          </ThemedView>

          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: colors.tint,
                opacity: (loading || rateLimit.isBlocked) ? 0.7 : 1,
              },
            ]}
            onPress={handleLogin}
            disabled={loading || rateLimit.isBlocked}
          >
            <ThemedText style={[styles.loginButtonText, { color: 'white' }]}>
              {loading ? 'Signing In...' : 'Sign In'}
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
              styles.signUpButton,
              { borderColor: colors.tint },
            ]}
            onPress={handleSignUp}
          >
            <ThemedText style={[styles.signUpButtonText, { color: colors.tint }]}>
              Create New Account
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rateLimitInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  rateLimitText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
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
  signUpButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 