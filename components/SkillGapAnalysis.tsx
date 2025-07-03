import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { FirebaseService } from '../services/firebaseService';
import { Job } from '../types';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SkillGapAnalysisProps {
  userId: string;
  jobId: string;
  onClose?: () => void;
}

export default function SkillGapAnalysis({ userId, jobId, onClose }: SkillGapAnalysisProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [analysis, setAnalysis] = useState<{
    missingSkills: string[];
    learningResources: Array<{
      skill: string;
      resource: string;
      estimatedTime: string;
    }>;
    alternativeJobs: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<Job | null>(null);

  React.useEffect(() => {
    loadAnalysis();
  }, [userId, jobId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      
      // Load job details
      const jobData = await FirebaseService.getJobById(jobId);
      if (!jobData) {
        Alert.alert('Error', 'Job not found');
        return;
      }
      setJob(jobData);

      // Get skill gap analysis
      const skillAnalysis = await FirebaseService.analyzeSkillGapForJob(userId, jobId);
      setAnalysis(skillAnalysis);

    } catch (error) {
      console.error('Error loading skill gap analysis:', error);
      Alert.alert('Error', 'Failed to load skill analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFindSimilarJobs = () => {
    if (analysis?.alternativeJobs.length) {
      router.push('/(tabs)/browse' as any);
    }
  };

  const handleLearnSkill = (skill: string) => {
    Alert.alert(
      `Learn ${skill}`,
      'Would you like to find learning resources for this skill?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Find Resources', onPress: () => {
          // In a real app, this would open learning platforms or courses
          Alert.alert('Learning Resources', 'Check out online courses on platforms like Coursera, Udemy, or YouTube for this skill.');
        }}
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Analyzing your skills...</ThemedText>
      </ThemedView>
    );
  }

  if (!job || !analysis) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="subtitle">Unable to load analysis</ThemedText>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={loadAnalysis}
        >
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Job Info */}
      <ThemedView style={styles.jobSection}>
        <ThemedText type="title">{job.title}</ThemedText>
        <ThemedText style={styles.jobDescription} numberOfLines={3}>
          {job.description}
        </ThemedText>
        <View style={styles.jobDetails}>
          <ThemedText style={styles.jobDetail}>
            💰 ${job.budget.min}-${job.budget.max}
          </ThemedText>
          <ThemedText style={styles.jobDetail}>
            📍 {job.location.isRemote ? 'Remote' : `${job.location.city}, ${job.location.state}`}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Skill Gap Analysis */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Skill Analysis</ThemedText>
        
        {analysis.missingSkills.length === 0 ? (
          <ThemedView style={styles.successCard}>
            <ThemedText style={styles.successTitle}>🎉 Perfect Match!</ThemedText>
            <ThemedText style={styles.successText}>
              You have all the required skills for this job. You're ready to apply!
            </ThemedText>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push(`/job/${jobId}` as any)}
            >
              <ThemedText style={styles.applyButtonText}>Apply Now</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <>
            {/* Missing Skills */}
            <ThemedView style={styles.missingSkillsSection}>
              <ThemedText style={styles.sectionTitle}>Skills You Need</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                You're missing {analysis.missingSkills.length} skill{analysis.missingSkills.length !== 1 ? 's' : ''}
              </ThemedText>
              
              {analysis.missingSkills.map((skill, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.skillCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}
                  onPress={() => handleLearnSkill(skill)}
                >
                  <View style={styles.skillHeader}>
                    <ThemedText type="subtitle">{skill}</ThemedText>
                    <TouchableOpacity
                      style={[styles.learnButton, { backgroundColor: colors.tint }]}
                      onPress={() => handleLearnSkill(skill)}
                    >
                      <ThemedText style={styles.learnButtonText}>Learn</ThemedText>
                    </TouchableOpacity>
                  </View>
                  
                  {analysis.learningResources.find(resource => resource.skill === skill) && (
                    <View style={styles.learningInfo}>
                      <ThemedText style={styles.learningResource}>
                        📚 {analysis.learningResources.find(resource => resource.skill === skill)?.resource}
                      </ThemedText>
                      <ThemedText style={styles.learningTime}>
                        ⏱️ {analysis.learningResources.find(resource => resource.skill === skill)?.estimatedTime}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ThemedView>

            {/* Alternative Jobs */}
            {analysis.alternativeJobs.length > 0 && (
              <ThemedView style={styles.alternativesSection}>
                <ThemedText style={styles.sectionTitle}>Alternative Opportunities</ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  Jobs that match your current skills
                </ThemedText>
                
                {analysis.alternativeJobs.map((jobType, index) => (
                  <View
                    key={index}
                    style={[styles.alternativeCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}
                  >
                    <ThemedText style={styles.alternativeJob}>{jobType}</ThemedText>
                  </View>
                ))}
                
                <TouchableOpacity
                  style={[styles.findJobsButton, { backgroundColor: colors.tint }]}
                  onPress={handleFindSimilarJobs}
                >
                  <ThemedText style={styles.findJobsButtonText}>Find Similar Jobs</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </>
        )}
      </ThemedView>

      {/* Action Buttons */}
      <ThemedView style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.tint }]}
          onPress={() => router.push('/onboarding' as any)}
        >
          <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
            Update My Skills
          </ThemedText>
        </TouchableOpacity>
        
        {onClose && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}
            onPress={onClose}
          >
            <ThemedText style={[styles.actionButtonText, { color: colors.tabIconDefault }]}>
              Close
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  jobSection: {
    padding: 16,
    marginBottom: 16,
  },
  jobDescription: {
    marginTop: 8,
    opacity: 0.7,
    lineHeight: 20,
  },
  jobDetails: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  jobDetail: {
    fontSize: 14,
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  successCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    marginTop: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  applyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  missingSkillsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  skillCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  learnButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  learnButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  learningInfo: {
    marginTop: 8,
  },
  learningResource: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  learningTime: {
    fontSize: 14,
    opacity: 0.8,
  },
  alternativesSection: {
    marginTop: 24,
  },
  alternativeCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  alternativeJob: {
    fontSize: 14,
    fontWeight: '500',
  },
  findJobsButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  findJobsButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
}); 