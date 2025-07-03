import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  color?: string;
}

export default function OnboardingProgressBar({ currentStep, totalSteps, stepLabels, color }: OnboardingProgressBarProps) {
  const progress = currentStep / totalSteps;
  return (
    <View style={styles.wrapper}>
      <View style={styles.textContainer}>
        <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
        {stepLabels && stepLabels[currentStep - 1] && (
          <Text style={styles.labelText}>{stepLabels[currentStep - 1]}</Text>
        )}
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: color || Colors.light.tint }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    marginBottom: 2,
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 2,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  barBg: {
    width: '85%',
    maxWidth: 340,
    height: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  barFill: {
    height: 16,
    borderRadius: 8,
  },
}); 