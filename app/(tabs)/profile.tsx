import { JobCard } from '@/components/JobCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FirebaseService } from '@/services/firebaseService';
import { Application, Job } from '@/types';
import { useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, userProfile, logout } = useAuthContext();
  
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'posted' | 'applied'>('posted');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Refresh user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadUserData();
      }
    }, [user])
  );

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Loading user data for user ID:', user.uid);
      
      // Get jobs posted by user
      const userPostedJobs = await FirebaseService.getJobsByUser(user.uid);
      console.log('Found posted jobs:', userPostedJobs.length, userPostedJobs);
      setPostedJobs(userPostedJobs);

      // Get user's applications
      const userApplications = await FirebaseService.getApplicationsByUserId(user.uid);
      console.log('Found applications:', userApplications.length, userApplications);
      setApplications(userApplications);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to empty data if Firebase is not configured
      setPostedJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality would be implemented here.');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings functionality would be implemented here.');
  };

  const handleRefresh = () => {
    loadUserData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) return;
              
              // Delete user data from Firestore
              await FirebaseService.deleteUser(user.uid);
              
              // Delete Firebase Auth user
              await user.delete();
              
              // Logout and redirect to login
              await logout();
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleJobPress = (job: Job) => {
    console.log('Job pressed:', job.title);
  };

  const getJobForApplication = async (application: Application): Promise<Job | undefined> => {
    try {
      const job = await FirebaseService.getJobById(application.jobId);
      return job || undefined;
    } catch (error) {
      console.error('Error getting job for application:', error);
      return undefined;
    }
  };

  const [applicationJobs, setApplicationJobs] = useState<{[key: string]: Job}>({});

  useEffect(() => {
    // Load job details for applications
    const loadApplicationJobs = async () => {
      const jobsMap: {[key: string]: Job} = {};
      for (const application of applications) {
        const job = await getJobForApplication(application);
        if (job) {
          jobsMap[application.jobId] = job;
        }
      }
      setApplicationJobs(jobsMap);
    };

    if (applications.length > 0) {
      loadApplicationJobs();
    }
  }, [applications]);

  const TabButton = ({ 
    title, 
    isActive, 
    onPress 
  }: { 
    title: string; 
    isActive: boolean; 
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive ? colors.tint : colors.background,
          borderColor: colors.tint,
        }
      ]}
      onPress={onPress}
    >
      <ThemedText style={[
        styles.tabButtonText,
        { color: isActive ? 'white' : colors.tint }
      ]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  if (!userProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Loading profile...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <ThemedView style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userProfile.avatar ? (
              <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tint }]}>
                <ThemedText style={styles.avatarText}>
                  {userProfile.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <ThemedText type="title" style={styles.profileName}>{userProfile.name}</ThemedText>
            <ThemedText style={styles.profileEmail}>{userProfile.email}</ThemedText>
          </View>
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.tint }]}
            onPress={handleEditProfile}
          >
            <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>Edit Profile</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.tint }]}
            onPress={handleSettings}
          >
            <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>Settings</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Tab Buttons */}
        <ThemedView style={styles.tabContainer}>
          <TabButton
            title="Posted Jobs"
            isActive={activeTab === 'posted'}
            onPress={() => setActiveTab('posted')}
          />
          <TabButton
            title="Applied Jobs"
            isActive={activeTab === 'applied'}
            onPress={() => setActiveTab('applied')}
          />
        </ThemedView>

        {/* Content based on active tab */}
        {activeTab === 'posted' ? (
          <ThemedView style={styles.contentSection}>
            {postedJobs.length > 0 ? (
              postedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onPress={handleJobPress}
                />
              ))
            ) : (
              <ThemedView style={styles.emptyState}>
                <ThemedText type="subtitle">No posted jobs yet</ThemedText>
                <ThemedText style={styles.emptyStateText}>
                  Start by posting your first job opportunity.
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        ) : (
          <ThemedView style={styles.contentSection}>
            {applications.length > 0 ? (
              applications.map((application) => {
                const job = applicationJobs[application.jobId];
                if (!job) return null;
                
                return (
                  <JobCard
                    key={application.id}
                    job={job}
                    onPress={handleJobPress}
                  />
                );
              })
            ) : (
              <ThemedView style={styles.emptyState}>
                <ThemedText type="subtitle">No applications yet</ThemedText>
                <ThemedText style={styles.emptyStateText}>
                  Start browsing jobs and apply to opportunities that interest you.
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}

        {/* Account Actions */}
        <ThemedView style={styles.accountActions}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.background, borderColor: colors.tint }]}
            onPress={handleLogout}
          >
            <ThemedText style={[styles.logoutButtonText, { color: colors.tint }]}>Logout</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: '#ff4444' }]}
            onPress={handleDeleteAccount}
          >
            <ThemedText style={[styles.deleteButtonText, { color: '#ff4444' }]}>Delete Account</ThemedText>
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
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentSection: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  accountActions: {
    gap: 12,
    marginBottom: 32,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 