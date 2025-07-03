import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, RefreshControl, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import AIJobRecommendations from '@/components/AIJobRecommendations';
import { JobCard } from '@/components/JobCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FirebaseService } from '@/services/firebaseService';
import { Job, JobMatch } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthContext();
  
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Use the authenticated user ID instead of hardcoded value
  const currentUserId = user?.uid || '';

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const loadData = async () => {
    try {
      // Get job matches for current user (only if user is authenticated)
      if (currentUserId) {
        const matches = await FirebaseService.getJobMatchesByUserId(currentUserId);
        setJobMatches(matches);
      } else {
        setJobMatches([]);
      }

      // Get recent jobs (this should always work)
      const recent = await FirebaseService.getRecentJobs(5);
      setRecentJobs(recent);
      console.log('Recent jobs loaded:', recent.length, recent);
      
      // If no recent jobs found, try to get all jobs as fallback
      if (recent.length === 0) {
        console.log('No recent jobs found, trying to get all jobs...');
        const allJobs = await FirebaseService.getAllJobs();
        console.log('All jobs found:', allJobs.length, allJobs);
        setRecentJobs(allJobs.slice(0, 5)); // Take first 5
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to empty arrays if Firebase is not configured
      setJobMatches([]);
      setRecentJobs([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleJobPress = (job: Job) => {
    // Navigate to job details
    router.push(`/job/${job.id}` as any);
  };

  const handleViewAllJobs = () => {
    router.push('/(tabs)/browse');
  };

  const handlePostJob = () => {
    router.push('/(tabs)/post');
  };

  const getMatchJob = async (match: JobMatch): Promise<Job | undefined> => {
    try {
      const job = await FirebaseService.getJobById(match.jobId);
      return job || undefined;
    } catch (error) {
      console.error('Error getting job for match:', error);
      return undefined;
    }
  };

  const [matchJobs, setMatchJobs] = useState<{[key: string]: Job}>({});

  useEffect(() => {
    // Load job details for matches
    const loadMatchJobs = async () => {
      const jobsMap: {[key: string]: Job} = {};
      for (const match of jobMatches) {
        const job = await getMatchJob(match);
        if (job) {
          jobsMap[match.jobId] = job;
        }
      }
      setMatchJobs(jobsMap);
    };

    if (jobMatches.length > 0) {
      loadMatchJobs();
    }
  }, [jobMatches]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">Welcome to Workly!</ThemedText>
          <ThemedText style={styles.subtitle}>
            Find your next opportunity or post a job
          </ThemedText>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            onPress={handlePostJob}
          >
            <ThemedText style={styles.actionButtonText}>Post a Job</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.tint }]}
            onPress={handleViewAllJobs}
          >
            <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
              Browse All Jobs
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Stats */}
        <ThemedView style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
            <ThemedText style={styles.statNumber}>{jobMatches.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Job Matches</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
            <ThemedText style={styles.statNumber}>{recentJobs.length}</ThemedText>
            <ThemedText style={styles.statLabel}>New Jobs</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
            <ThemedText style={styles.statNumber}>15</ThemedText>
            <ThemedText style={styles.statLabel}>Categories</ThemedText>
          </View>
        </ThemedView>

        {/* AI-Powered Recommendations */}
        {currentUserId && (
          <AIJobRecommendations 
            userId={currentUserId}
            showQuickMoney={true}
            showUrgentJobs={true}
            showHighPaying={true}
            maxRecommendations={3}
          />
        )}

        {/* Legacy Job Matches (fallback) */}
        {(!currentUserId || jobMatches.length === 0) && (
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Recent Jobs</ThemedText>
              <TouchableOpacity onPress={handleViewAllJobs}>
                <ThemedText style={[styles.seeAllText, { color: colors.tint }]}>
                  See All
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentJobs.slice(0, 3).map((job) => (
                <View key={job.id} style={styles.matchCard}>
                  <JobCard
                    job={job}
                    onPress={handleJobPress}
                  />
                </View>
              ))}
            </ScrollView>
          </ThemedView>
        )}

        {/* Call to Action */}
        <ThemedView style={styles.ctaSection}>
          <ThemedText type="subtitle">Ready to earn money?</ThemedText>
          <ThemedText style={styles.ctaText}>
            Complete your profile to get personalized job recommendations and start earning today.
          </ThemedText>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/onboarding' as any)}
          >
            <ThemedText style={styles.ctaButtonText}>Get Started</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
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
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchCard: {
    width: 280,
    marginRight: 16,
    marginLeft: 16,
  },
  ctaSection: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  ctaText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    opacity: 0.7,
    lineHeight: 20,
  },
  ctaButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
