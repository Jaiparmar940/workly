import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

const FEATURES = [
  {
    title: 'AI-Powered Job Matching',
    description: 'Our intelligent system matches you with jobs based on your skills, experience, and preferences.',
    icon: '🎯',
  },
  {
    title: 'Browse Opportunities',
    description: 'Explore a wide range of jobs from one-time tasks to full-time positions.',
    icon: '🔍',
  },
  {
    title: 'Post Your Own Jobs',
    description: 'Need help with a project? Post a job and find the perfect person for the task.',
    icon: '📝',
  },
  {
    title: 'Secure & Reliable',
    description: 'Built with security in mind, ensuring your data and transactions are protected.',
    icon: '🔒',
  },
];

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleGetStarted = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Welcome to Workly! 🎉
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your profile is all set up. Let's find you the perfect opportunities!
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.featuresContainer}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            What you can do with Workly:
          </ThemedText>
          
          {FEATURES.map((feature, index) => (
            <ThemedView key={index} style={styles.featureCard}>
              <ThemedText style={styles.featureIcon}>
                {feature.icon}
              </ThemedText>
              <ThemedView style={styles.featureContent}>
                <ThemedText style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </ThemedText>
                <ThemedText style={[styles.featureDescription, { color: colors.tabIconDefault }]}>
                  {feature.description}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>

        <ThemedView style={styles.tipContainer}>
          <ThemedText style={[styles.tipTitle, { color: colors.text }]}>
            💡 Pro Tip
          </ThemedText>
          <ThemedText style={[styles.tipText, { color: colors.tabIconDefault }]}>
            Complete your profile with detailed information to get better job matches. You can always update it later in your profile settings.
          </ThemedText>
        </ThemedView>
      </ScrollView>

      <ThemedView style={[
        styles.footer,
        {
          backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      ]}>
        <TouchableOpacity
          style={[styles.getStartedButton, { backgroundColor: colors.tint }]}
          onPress={handleGetStarted}
        >
          <ThemedText style={[styles.getStartedButtonText, { color: 'white' }]}>
            Get Started
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
    marginTop: 4,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  getStartedButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 