import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet } from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  title?: string;
  subtitle?: string;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <ThemedView
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index + 1 <= currentStep ? colors.tint : colors.tabIconDefault,
              },
            ]}
          />
        ))}
      </ThemedView>
      
      <ThemedText style={styles.stepCounter}>
        Step {currentStep} of {totalSteps}
      </ThemedText>
      
      {title && (
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
      )}
      
      {subtitle && (
        <ThemedText style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  stepCounter: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
}); 