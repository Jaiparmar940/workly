import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface OnboardingCompleteProps {
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({
  onComplete,
  title = 'Profile Complete! 🎉',
  subtitle = 'Your profile has been successfully set up. We\'ll use this information to match you with the best opportunities.',
  buttonText = 'Get Started',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={[styles.emoji, { color: colors.text }]}>✅</ThemedText>
        
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
        
        <ThemedText style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          {subtitle}
        </ThemedText>
        
        <ThemedView style={styles.benefitsContainer}>
          <ThemedText style={[styles.benefitsTitle, { color: colors.text }]}>
            What happens next:
          </ThemedText>
          
          <ThemedView style={styles.benefitItem}>
            <ThemedText style={styles.benefitIcon}>🎯</ThemedText>
            <ThemedText style={[styles.benefitText, { color: colors.tabIconDefault }]}>
              AI will analyze your profile and find matching jobs
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.benefitItem}>
            <ThemedText style={styles.benefitIcon}>📱</ThemedText>
            <ThemedText style={[styles.benefitText, { color: colors.tabIconDefault }]}>
              You'll receive notifications for new opportunities
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.benefitItem}>
            <ThemedText style={styles.benefitIcon}>⚡</ThemedText>
            <ThemedText style={[styles.benefitText, { color: colors.tabIconDefault }]}>
              Start browsing and applying to jobs right away
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      
      <TouchableOpacity
        style={[styles.completeButton, { backgroundColor: colors.tint }]}
        onPress={onComplete}
      >
        <ThemedText style={[styles.completeButtonText, { color: 'white' }]}>
          {buttonText}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsContainer: {
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  completeButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minWidth: 200,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 