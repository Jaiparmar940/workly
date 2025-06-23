import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { resetPassword, loading, error, clearError } = useAuthContext();

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      // Error is handled by the auth hook
    }
  };

  const handleBackToLogin = () => {
    router.push('/login' as any);
  };

  if (emailSent) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Check Your Email
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              We've sent a password reset link to:
            </ThemedText>
            <ThemedText style={[styles.email, { color: colors.tint }]}>
              {email}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.messageContainer}>
            <ThemedText style={styles.messageText}>
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </ThemedText>
          </ThemedView>

          <TouchableOpacity
            style={[
              styles.backButton,
              { borderColor: colors.tint },
            ]}
            onPress={handleBackToLogin}
          >
            <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>
              Back to Sign In
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Reset Password
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
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

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>
              Email Address
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
              placeholder="Enter your email address"
              placeholderTextColor={colors.tabIconDefault}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>

          <TouchableOpacity
            style={[
              styles.resetButton,
              {
                backgroundColor: colors.tint,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <ThemedText style={styles.resetButtonText}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={handleBackToLogin}
          >
            <ThemedText style={[styles.backToLoginText, { color: colors.tint }]}>
              Back to Sign In
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
    marginBottom: 16,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageContainer: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#2e7d32',
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
  resetButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLogin: {
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 