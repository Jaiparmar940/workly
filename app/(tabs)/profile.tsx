import { JobCard } from '@/components/JobCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FirebaseService } from '@/services/firebaseService';
import { Application, Job } from '@/types';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
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
          <ThemedText type="title">{userProfile.name}</ThemedText>
          <ThemedText style={styles.email}>{userProfile.email}</ThemedText>
          <ThemedText style={styles.location}>
            {userProfile.location.city}, {userProfile.location.state}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.editButton, { borderColor: colors.tint }]}
          onPress={handleEditProfile}
        >
          <ThemedText style={[styles.editButtonText, { color: colors.tint }]}>
            Edit
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
      </ThemedView>

      {/* Stats */}
      <ThemedView style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
          <ThemedText style={styles.statNumber}>{userProfile.rating}</ThemedText>
          <ThemedText style={styles.statLabel}>Rating</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
          <ThemedText style={styles.statNumber}>{userProfile.completedJobs}</ThemedText>
          <ThemedText style={styles.statLabel}>Completed</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
          <ThemedText style={styles.statNumber}>{postedJobs.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Posted</ThemedText>
        </View>
      </ThemedView>

      {/* Skills */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Skills</ThemedText>
        <View style={styles.skillsContainer}>
          {userProfile.skills.map((skill, index) => (
            <View key={index} style={[styles.skillTag, { backgroundColor: colors.tint + '20' }]}>
              <ThemedText style={[styles.skillText, { color: colors.tint }]}>
                {skill}
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      {/* Experience */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Experience</ThemedText>
        <ThemedText style={styles.experienceText}>{userProfile.experience}</ThemedText>
      </ThemedView>

      {/* Interests */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Interests</ThemedText>
        <View style={styles.interestsContainer}>
          {userProfile.interests.map((interest, index) => (
            <View key={index} style={[styles.interestTag, { backgroundColor: colors.tint + '20' }]}>
              <ThemedText style={[styles.interestText, { color: colors.tint }]}>
                {interest}
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      {/* Tabs */}
      <ThemedView style={styles.tabsContainer}>
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
        <ThemedView style={styles.jobsContainer}>
          {postedJobs.length === 0 ? (
            <ThemedText style={styles.emptyText}>No jobs posted yet</ThemedText>
          ) : (
            postedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => handleJobPress(job)}
              />
            ))
          )}
        </ThemedView>
      ) : (
        <ThemedView style={styles.jobsContainer}>
          {applications.length === 0 ? (
            <ThemedText style={styles.emptyText}>No applications yet</ThemedText>
          ) : (
            applications.map((application) => {
              const job = applicationJobs[application.jobId];
              return job ? (
                <JobCard
                  key={application.id}
                  job={job}
                  onPress={() => handleJobPress(job)}
                />
              ) : null;
            })
          )}
        </ThemedView>
      )}

      {/* Delete Account Button */}
      <TouchableOpacity
        style={[styles.deleteAccountButton, { backgroundColor: '#dc3545' }]}
        onPress={handleDeleteAccount}
      >
        <ThemedText style={styles.deleteAccountButtonText}>Delete Account</ThemedText>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: '#ff4444' }]}
        onPress={handleLogout}
      >
        <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  experienceText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  jobsContainer: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  deleteAccountButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 12,
  },
  deleteAccountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 