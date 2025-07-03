import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Slider from '@react-native-community/slider';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import OnboardingProgressBar from '../components/OnboardingProgressBar';

const STEP_LABELS = [
  'Select Skills',
  'Add Missed Skills',
  'Rate Experience',
  'Profile & Bio',
];
const EXPERIENCE_LABELS = ['Little', 'Some', 'Good', 'Very Good', 'Pro'];

export default function OnboardingSkillExperience() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const skills: string[] = useMemo(() => {
    try {
      return params.skills ? JSON.parse(params.skills as string) : [];
    } catch {
      return [];
    }
  }, [params.skills]);

  // Experience level for each skill (1-5)
  const [experience, setExperience] = useState<{ [skill: string]: number }>(
    Object.fromEntries(skills.map(skill => [skill, 1])) // Default to 'Little'
  );

  const handleSliderChange = (skill: string, value: number) => {
    setExperience(prev => ({ ...prev, [skill]: value }));
  };

  const handleContinue = (skipped = false) => {
    // Pass skills and experience to the next page
    const skillsWithExperience = skills.map(skill => ({
      name: skill,
      experience: EXPERIENCE_LABELS[experience[skill] - 1] || 'Good',
      experienceLevel: experience[skill],
    }));
    const prevSkipped = params.skippedSteps ? JSON.parse(params.skippedSteps as string) : [];
    const newSkipped = skipped ? [...prevSkipped, 'skillExperience'] : prevSkipped;
    router.push({ pathname: '/onboarding-profile-bio' as any, params: { skills: JSON.stringify(skillsWithExperience), skippedSteps: JSON.stringify(newSkipped) } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <OnboardingProgressBar currentStep={3} totalSteps={4} stepLabels={STEP_LABELS} color={colors.tint} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <ThemedText type="title" style={{ marginBottom: 24 }}>
            Rate your experience for each skill
          </ThemedText>
          {skills.map(skill => (
            <View key={skill} style={styles.skillBlock}>
              <ThemedText style={[styles.skillName, { color: colors.text }]}>{skill}</ThemedText>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={experience[skill]}
                onValueChange={value => handleSliderChange(skill, value)}
                minimumTrackTintColor={colors.tint}
                maximumTrackTintColor={colors.tabIconDefault}
                thumbTintColor={colors.tint}
              />
              <View style={styles.labelsRow}>
                {EXPERIENCE_LABELS.map((label, idx) => (
                  <ThemedText
                    key={label}
                    style={{
                      fontSize: 12,
                      color: experience[skill] === idx + 1 ? colors.tint : colors.tabIconDefault,
                      fontWeight: experience[skill] === idx + 1 ? 'bold' : 'normal',
                    }}
                  >
                    {label}
                  </ThemedText>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.continueButtonContainer, { backgroundColor: colors.background }]}> 
          <TouchableOpacity
            style={[
              styles.skipButton,
              { borderColor: colors.tint, marginBottom: 12 },
            ]}
            onPress={() => handleContinue(true)}
          >
            <ThemedText style={[styles.skipButtonText, { color: colors.tint }]}>Skip for now</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.continueButton, { backgroundColor: colors.tint }]} onPress={() => handleContinue(false)}>
            <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  skillBlock: {
    marginBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 16,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  continueButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 