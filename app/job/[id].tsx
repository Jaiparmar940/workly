import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FirebaseService } from '@/services/firebaseService';
import { Job } from '@/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useAuthContext();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [posterName, setPosterName] = useState<string>('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [message, setMessage] = useState('');
  const [imageIndex, setImageIndex] = useState(0);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);

  useEffect(() => {
    loadJob();
    checkInterestStatus();
  }, [id]);

  const loadJob = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const jobData = await FirebaseService.getJobById(id as string);
      setJob(jobData);
      
      // Fetch poster's name
      if (jobData && jobData.postedBy) {
        try {
          const userData = await FirebaseService.getUserById(jobData.postedBy);
          if (userData) {
            setPosterName(userData.name);
          } else {
            setPosterName('Unknown User');
          }
        } catch (error) {
          console.error('Error loading poster info:', error);
          setPosterName('Unknown User');
        }
      }
    } catch (error) {
      console.error('Error loading job:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const checkInterestStatus = async () => {
    if (!id) return;
    
    try {
      // TODO: Check if current user has already expressed interest in this job
      // This would typically involve checking a database for existing interest records
      // For now, we'll use a simple state check
      const hasInterest = false; // Replace with actual database check
      setHasExpressedInterest(hasInterest);
    } catch (error) {
      console.error('Error checking interest status:', error);
    }
  };

  const handleExpressInterest = async () => {
    if (!proposedPrice.trim() || !message.trim()) {
      Alert.alert('Missing Info', 'Please enter your price and a message.');
      return;
    }
    
    try {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to express interest.');
        return;
      }

      console.log('Debug - User ID:', user.uid);
      console.log('Debug - Job ID:', job?.id);
      console.log('Debug - Job Posted By:', job?.postedBy);

      // Create message in job poster's inbox
      await FirebaseService.createJobInterestMessage(
        user.uid,
        job!.postedBy,
        job!.id,
        proposedPrice,
        message
      );

      Alert.alert('Interest Sent', 'Your interest and message have been sent to the job poster!');
      setHasExpressedInterest(true);
      setProposedPrice('');
      setMessage('');
    } catch (error) {
      console.error('Error expressing interest:', error);
      Alert.alert('Error', 'Failed to send interest. Please try again.');
    }
  };

  const handleWithdrawInterest = () => {
    Alert.alert(
      'Withdraw Interest',
      'Are you sure you want to withdraw your interest in this job?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: () => {
            // TODO: Remove interest from database
            setHasExpressedInterest(false);
            Alert.alert('Interest Withdrawn', 'Your interest has been withdrawn from this job.');
          },
        },
      ]
    );
  };

  const renderImage = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
  );

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: 'Job Details',
            headerBackTitle: 'Back'
          }} 
        />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            <ThemedText>Loading job details...</ThemedText>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: 'Job Details',
            headerBackTitle: 'Back'
          }} 
        />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            <ThemedText>Job not found</ThemedText>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Use placeholder images since Job type doesn't have images property
  const jobImages = ['https://placehold.co/600x400?text=No+Image+Available'];

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: job.title,
          headerBackTitle: 'Back'
        }} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Image Slideshow */}
          <FlatList
            data={jobImages}
            renderItem={renderImage}
            keyExtractor={(_, idx: number) => idx.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageSlider}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setImageIndex(idx);
            }}
          />
          <View style={styles.imageDots}>
            {jobImages.map((_, idx: number) => (
              <View
                key={idx}
                style={[styles.dot, imageIndex === idx && styles.activeDot]}
              />
            ))}
          </View>

          {/* Job Info */}
          <ThemedText type="title" style={styles.title}>{job.title}</ThemedText>
          <ThemedText style={styles.label}>Category: <ThemedText style={styles.value}>{job.category}</ThemedText></ThemedText>
          <ThemedText style={styles.label}>Type: <ThemedText style={styles.value}>{job.type}</ThemedText></ThemedText>
          <ThemedText style={styles.label}>Complexity: <ThemedText style={styles.value}>{job.complexity}</ThemedText></ThemedText>
          <ThemedText style={styles.label}>Budget: <ThemedText style={styles.value}>${job.budget.min} - ${job.budget.max} {job.budget.currency}</ThemedText></ThemedText>
          <ThemedText style={styles.label}>Location: <ThemedText style={styles.value}>{job.location.isRemote ? 'Remote' : `${job.location.city}, ${job.location.state}`}</ThemedText></ThemedText>
          <ThemedText style={styles.label}>Posted By: <ThemedText style={styles.value}>{posterName}</ThemedText></ThemedText>
          <ThemedText style={styles.sectionTitle}>Description</ThemedText>
          <ThemedText style={styles.value}>{job.description}</ThemedText>
          <ThemedText style={styles.sectionTitle}>Requirements</ThemedText>
          {job.requirements && job.requirements.map((req: string, idx: number) => (
            <ThemedText key={idx} style={styles.value}>• {req}</ThemedText>
          ))}
          <ThemedText style={styles.sectionTitle}>Skills</ThemedText>
          <View style={styles.skillsRow}>
            {job.skills && job.skills.map((skill: string, idx: number) => (
              <View key={idx} style={styles.skillTag}>
                <ThemedText style={styles.skillText}>{skill}</ThemedText>
              </View>
            ))}
          </View>

          {/* Interest Section */}
          {hasExpressedInterest ? (
            <View style={styles.interestSection}>
              <ThemedText style={styles.sectionTitle}>Interest Status</ThemedText>
              <View style={styles.interestStatus}>
                <ThemedText style={styles.interestStatusText}>✅ You have expressed interest in this job</ThemedText>
                <TouchableOpacity
                  style={[styles.withdrawButton, { borderColor: '#ff4444' }]}
                  onPress={handleWithdrawInterest}
                >
                  <ThemedText style={[styles.withdrawButtonText, { color: '#ff4444' }]}>Withdraw Interest</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.interestSection}>
              <ThemedText style={styles.sectionTitle}>Express Interest</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
                placeholder="Your proposed price (USD)"
                placeholderTextColor={colors.tabIconDefault}
                value={proposedPrice}
                onChangeText={setProposedPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.tabIconDefault }]}
                placeholder="Write a message to the job poster..."
                placeholderTextColor={colors.tabIconDefault}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#0a7ea4' }]}
                onPress={handleExpressInterest}
              >
                <ThemedText style={styles.buttonText}>Express Interest</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
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
  },
  imageSlider: {
    width: '100%',
    height: 220,
    marginBottom: 8,
  },
  image: {
    width: SCREEN_WIDTH - 32,
    height: 220,
    borderRadius: 12,
    marginRight: 8,
  },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#0a7ea4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    marginTop: 4,
  },
  value: {
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  skillTag: {
    backgroundColor: '#e6f2fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#0a7ea4',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 80,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  interestSection: {
    marginTop: 16,
  },
  interestStatus: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    gap: 12,
  },
  interestStatusText: {
    fontWeight: '500',
  },
  withdrawButton: {
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 8,
    padding: 12,
  },
  withdrawButtonText: {
    color: '#ff4444',
    fontWeight: '600',
  },
}); 