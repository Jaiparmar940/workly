import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  onRefresh?: () => void;
}

// Simple CAPTCHA patterns - in a real app, you'd use a proper CAPTCHA service
const CAPTCHA_PATTERNS = [
  { text: 'ABC123', pattern: 'ABC123' },
  { text: 'XYZ789', pattern: 'XYZ789' },
  { text: 'DEF456', pattern: 'DEF456' },
  { text: 'GHI012', pattern: 'GHI012' },
  { text: 'JKL345', pattern: 'JKL345' },
  { text: 'MNO678', pattern: 'MNO678' },
  { text: 'PQR901', pattern: 'PQR901' },
  { text: 'STU234', pattern: 'STU234' },
];

export const Captcha: React.FC<CaptchaProps> = ({ onVerify, onRefresh }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [currentCaptcha, setCurrentCaptcha] = useState<{ text: string; pattern: string } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);

  const generateCaptcha = () => {
    const randomIndex = Math.floor(Math.random() * CAPTCHA_PATTERNS.length);
    const captcha = CAPTCHA_PATTERNS[randomIndex];
    setCurrentCaptcha(captcha);
    setUserAnswer('');
    setIsCorrect(null);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = () => {
    if (!currentCaptcha) return;
    
    const valid = userAnswer.toUpperCase() === currentCaptcha.pattern;
    setIsCorrect(valid);
    setAttempts(prev => prev + 1);
    onVerify(valid);
    
    if (valid) {
      // Keep the success state for a moment
      setTimeout(() => {
        setIsCorrect(null);
      }, 2000);
    }
  };

  const handleRefresh = () => {
    generateCaptcha();
    setAttempts(0);
    onRefresh?.();
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      handleVerify();
    }
  };

  if (!currentCaptcha) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={[styles.title, { color: colors.text }]}>
          Loading verification...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, { color: colors.text }]}>
        Verify you're human
      </ThemedText>
      
      <ThemedView style={styles.captchaContainer}>
        <ThemedView style={[
          styles.captchaImageContainer,
          { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5' }
        ]}>
          <ThemedText style={[
            styles.captchaText,
            { color: colorScheme === 'dark' ? '#ffffff' : '#333' }
          ]}>
            {currentCaptcha.text}
          </ThemedText>
          <ThemedView style={[
            styles.captchaOverlay,
            { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' }
          ]} />
        </ThemedView>
        
        <ThemedText style={[styles.instruction, { color: colors.tabIconDefault }]}>
          Enter the characters you see above
        </ThemedText>
        
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: isCorrect === false ? '#ff4444' : colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="Enter characters"
          placeholderTextColor={colors.tabIconDefault}
          value={userAnswer}
          onChangeText={setUserAnswer}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          onKeyPress={handleKeyPress}
        />
        
        {isCorrect === false && (
          <ThemedText style={styles.errorText}>
            Incorrect. Please try again. ({3 - attempts} attempts left)
          </ThemedText>
        )}
        
        {isCorrect === true && (
          <ThemedText style={styles.successText}>
            ✓ Verification successful
          </ThemedText>
        )}
        
        {attempts >= 3 && isCorrect === false && (
          <ThemedText style={styles.errorText}>
            Too many attempts. Please refresh.
          </ThemedText>
        )}
      </ThemedView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.verifyButton, 
            { 
              backgroundColor: '#0a7ea4',
              opacity: attempts >= 3 ? 0.5 : 1
            }
          ]}
          onPress={handleVerify}
          disabled={attempts >= 3}
        >
          <ThemedText style={[styles.verifyButtonText, { color: 'white' }]}>
            Verify
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.refreshButton, { borderColor: colors.tint }]}
          onPress={handleRefresh}
        >
          <ThemedText style={[styles.refreshButtonText, { color: colors.tint }]}>
            Refresh
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  captchaContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  captchaImageContainer: {
    width: 200,
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  captchaText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#333',
    zIndex: 2,
  },
  captchaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    width: 150,
    letterSpacing: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  successText: {
    color: '#4caf50',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  verifyButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 