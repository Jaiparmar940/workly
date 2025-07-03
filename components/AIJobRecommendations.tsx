import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { Job, JobMatch } from '../types';
import { JobCard } from './JobCard';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AIJobRecommendationsProps {
  userId: string;
  showQuickMoney?: boolean;
  showUrgentJobs?: boolean;
  showHighPaying?: boolean;
  maxRecommendations?: number;
}

export default function AIJobRecommendations({
  userId,
  showQuickMoney = true,
  showUrgentJobs = true,
  showHighPaying = true,
  maxRecommendations = 5,
}: AIJobRecommendationsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [urgentJobs, setUrgentJobs] = useState<Job[]>([]);
  const [highPayingJobs, setHighPayingJobs] = useState<Job[]>([]);
  const [quickMoneyOpportunities, setQuickMoneyOpportunities] = useState<Array<{
    opportunity: string;
    estimatedEarnings: string;
    timeToComplete: string;
    requirements: string[];
    platforms: string[];
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [matchJobs, setMatchJobs] = useState<{[key: string]: Job}>({});

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Load AI-powered job matches
      const matches = await FirebaseService.generateJobMatches(userId);
      setJobMatches(matches.slice(0, maxRecommendations));

      // Load urgent jobs
      if (showUrgentJobs) {
        const urgent = await FirebaseService.getUrgentJobs();
        setUrgentJobs(urgent.slice(0, 3));
      }

      // Load high-paying jobs
      if (showHighPaying) {
        const highPaying = await FirebaseService.getHighPayingJobs(50);
        setHighPayingJobs(highPaying.slice(0, 3));
      }

      // Load quick money opportunities
      if (showQuickMoney) {
        const opportunities = await FirebaseService.getQuickMoneyOpportunities(userId);
        setQuickMoneyOpportunities(opportunities.slice(0, 3));
      }

    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      Alert.alert('Error', 'Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load job details for matches
    const loadMatchJobs = async () => {
      const jobsMap: {[key: string]: Job} = {};
      for (const match of jobMatches) {
        try {
          const job = await FirebaseService.getJobById(match.jobId);
          if (job) {
            jobsMap[match.jobId] = job;
          }
        } catch (error) {
          console.error('Error loading job for match:', error);
        }
      }
      setMatchJobs(jobsMap);
    };

    if (jobMatches.length > 0) {
      loadMatchJobs();
    }
  }, [jobMatches]);

  const handleJobPress = (job: Job) => {
    router.push(`/job/${job.id}` as any);
  };

  const handleQuickMoneyPress = (opportunity: any) => {
    Alert.alert(
      opportunity.opportunity,
      `Earnings: ${opportunity.estimatedEarnings}\nTime: ${opportunity.timeToComplete}\n\nRequirements:\n${opportunity.requirements.join('\n')}\n\nPlatforms:\n${opportunity.platforms.join('\n')}`,
      [
        { text: 'OK', style: 'default' },
        { text: 'Find Similar Jobs', onPress: () => router.push('/(tabs)/browse' as any) }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Finding your perfect opportunities...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* AI-Powered Job Matches */}
      {jobMatches.length > 0 && (
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">🤖 AI Matches for You</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/browse' as any)}>
              <ThemedText style={[styles.seeAllText, { color: colors.tint }]}>
                See All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {jobMatches.map((match) => {
              const job = matchJobs[match.jobId];
              if (!job) return null;
              
              return (
                <View key={match.jobId} style={styles.matchCard}>
                  <JobCard
                    job={job}
                    onPress={handleJobPress}
                    showMatchScore={true}
                    matchScore={match.matchScore}
                  />
                </View>
              );
            })}
          </ScrollView>
        </ThemedView>
      )}

      {/* Quick Money Opportunities */}
      {showQuickMoney && quickMoneyOpportunities.length > 0 && (
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">💰 Quick Money</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Immediate opportunities</ThemedText>
          </View>
          {quickMoneyOpportunities.map((opportunity, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.opportunityCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}
              onPress={() => handleQuickMoneyPress(opportunity)}
            >
              <View style={styles.opportunityHeader}>
                <ThemedText type="subtitle">{opportunity.opportunity}</ThemedText>
                <ThemedText style={[styles.earningsText, { color: colors.tint }]}>
                  {opportunity.estimatedEarnings}
                </ThemedText>
              </View>
              <ThemedText style={styles.timeText}>⏱️ {opportunity.timeToComplete}</ThemedText>
              <View style={styles.platformsContainer}>
                {opportunity.platforms.slice(0, 2).map((platform, idx) => (
                  <View key={idx} style={[styles.platformTag, { backgroundColor: colors.tint }]}>
                    <ThemedText style={styles.platformText}>{platform}</ThemedText>
                  </View>
                ))}
                {opportunity.platforms.length > 2 && (
                  <ThemedText style={styles.morePlatforms}>+{opportunity.platforms.length - 2} more</ThemedText>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ThemedView>
      )}

      {/* Urgent Jobs */}
      {showUrgentJobs && urgentJobs.length > 0 && (
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">🚨 Urgent Jobs</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Time-sensitive opportunities</ThemedText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {urgentJobs.map((job) => (
              <View key={job.id} style={styles.matchCard}>
                <JobCard
                  job={job}
                  onPress={handleJobPress}
                  showUrgency={true}
                />
              </View>
            ))}
          </ScrollView>
        </ThemedView>
      )}

      {/* High-Paying Jobs */}
      {showHighPaying && highPayingJobs.length > 0 && (
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">💎 High-Paying Jobs</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Premium opportunities</ThemedText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {highPayingJobs.map((job) => (
              <View key={job.id} style={styles.matchCard}>
                <JobCard
                  job={job}
                  onPress={handleJobPress}
                  showHighPay={true}
                />
              </View>
            ))}
          </ScrollView>
        </ThemedView>
      )}

      {/* Empty State */}
      {jobMatches.length === 0 && urgentJobs.length === 0 && highPayingJobs.length === 0 && (
        <ThemedView style={styles.emptyState}>
          <ThemedText type="subtitle">No recommendations yet</ThemedText>
          <ThemedText style={styles.emptyStateText}>
            Complete your profile and add skills to get personalized job recommendations.
          </ThemedText>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/onboarding' as any)}
          >
            <ThemedText style={styles.actionButtonText}>Complete Profile</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchCard: {
    width: 280,
    marginRight: 16,
    marginLeft: 16,
  },
  opportunityCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
  platformsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  platformTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  platformText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  morePlatforms: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.7,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 