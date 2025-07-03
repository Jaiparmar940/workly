import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuthContext } from '../../contexts/AuthContext';
import { useColorScheme } from '../../hooks/useColorScheme';
import { User } from '../../types';

interface BusinessProfile {
  businessName: string;
  businessType: string;
  yearsInBusiness: number;
  primaryServices: string[];
  serviceAreas: string[];
  website?: string;
  businessLicense?: string;
  insuranceInfo?: string;
  teamSize: string;
  serviceRadius: number;
  locationConstraints?: string;
  warrantyPolicy?: string;
  certifications?: string[];
  equipment?: string[];
  responseTime?: string;
  paymentTerms?: string;
  completedSteps: number;
  isComplete: boolean;
  logo?: string;
  rating?: number;
  reviewCount?: number;
  completedJobs?: number;
  responseRate?: number;
  onTimeDelivery?: number;
}

// Defensive helpers
function safe<T>(val: T | undefined | null, fallback: T): T {
  return val !== undefined && val !== null ? val : fallback;
}

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useAuthContext();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [user, setUser] = useState<User | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', id as string));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          console.log('Fetched user data:', userData);
          console.log('Account type:', userData.accountType);
          console.log('Business profile exists:', !!userData.businessProfile);
          setUser(userData);
          setBusinessProfile(userData.businessProfile || null);
        } else {
          Alert.alert('Error', 'User not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        Alert.alert('Error', 'Failed to load profile');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  const handleContact = () => {
    if (user?.email) {
      Linking.openURL(`mailto:${user.email}`);
    }
  };

  const handleCall = () => {
    if (user?.phone) {
      Linking.openURL(`tel:${user.phone}`);
    }
  };

  const handleWebsite = () => {
    if (businessProfile?.website) {
      let url = businessProfile.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      Linking.openURL(url);
    }
  };

  const formatYearsInBusiness = (years: number): string => {
    if (years === 0) return 'New business';
    if (years === 1) return '1 year';
    return `${years}+ years`;
  };

  const getYearsInBusinessText = (years: number): string => {
    if (years === 0) return 'New business';
    if (years === 1) return '1 year in business';
    return `${years}+ years in business`;
  };

  // Determine if this is a business profile
  console.log('User account type:', user?.accountType);
  console.log('Business profile exists:', !!businessProfile);
  console.log('Business profile data:', businessProfile);
  console.log('Full user data:', user);
  
  // Simplified logic: only show business profile if account type is explicitly 'business'
  const isBusinessProfile = user?.accountType === 'business';

  console.log('Is business profile:', isBusinessProfile);
  console.log('Will show business view:', isBusinessProfile);
  console.log('Will show personal view:', !isBusinessProfile);

  // Set header title based on profile type
  const headerTitle = isBusinessProfile ? 'Business Profile' : 'Profile';

  return (
    <>
      <Stack.Screen 
        options={{
          title: headerTitle,
          headerBackTitle: 'Back',
        }} 
      />
      {loading ? (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedView style={styles.loadingContainer}>
            <ThemedText style={[styles.loadingText, { color: colors.text }]}>
              Loading profile...
            </ThemedText>
          </ThemedView>
        </SafeAreaView>
      ) : !user ? (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={[styles.errorText, { color: colors.text }]}>
              Profile not found
            </ThemedText>
          </ThemedView>
        </SafeAreaView>
      ) : isBusinessProfile ? (
        businessProfile ? (
          <BusinessProfileView user={user} businessProfile={businessProfile} colors={colors} />
        ) : (
          <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={[styles.errorText, { color: colors.text }]}>
                Business profile not found
              </ThemedText>
            </ThemedView>
          </SafeAreaView>
        )
      ) : (
        <PersonalProfileView user={user} colors={colors} />
      )}
    </>
  );
}

// Business Profile Component
const BusinessProfileView = ({ user, businessProfile, colors }: { user: User; businessProfile: BusinessProfile; colors: any }) => {
  const [cityName, setCityName] = useState<string>('');

  useEffect(() => {
    // Convert ZIP code to city name
    if (businessProfile.serviceAreas && businessProfile.serviceAreas[0]) {
      convertZipToCity(businessProfile.serviceAreas[0]);
    }
  }, [businessProfile.serviceAreas]);

  const convertZipToCity = async (zipCode: string) => {
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (response.ok) {
        const data = await response.json();
        const city = data.places[0]['place name'];
        const state = data.places[0]['state abbreviation'];
        setCityName(`${city}, ${state}`);
      } else {
        setCityName(zipCode); // Fallback to ZIP code if API fails
      }
    } catch (error) {
      console.error('Error converting ZIP to city:', error);
      setCityName(zipCode); // Fallback to ZIP code
    }
  };

  const handleContact = () => {
    // Navigate to messages with pre-filled recipient
    router.push({
      pathname: '/messages',
      params: { 
        newMessage: 'true',
        recipientId: user.id,
        recipientName: businessProfile.businessName,
        subject: `Inquiry about ${businessProfile.primaryServices[0] || 'your services'}`
      }
    } as any);
  };

  const handleCall = () => {
    if (user?.phone) {
      Linking.openURL(`tel:${user.phone}`);
    }
  };

  const handleWebsite = () => {
    if (businessProfile?.website) {
      let url = businessProfile.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      Linking.openURL(url);
    }
  };

  const getYearsInBusinessText = (years: number): string => {
    if (years === 0) return 'New business';
    if (years === 1) return '1 year in business';
    return `${years}+ years in business`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Business Info Section */}
        <ThemedView style={styles.section}>
          <View style={styles.businessHeader}>
            <View style={styles.businessInfo}>
              <ThemedText style={[styles.businessName, { color: colors.text }]}>
                {businessProfile.businessName}
              </ThemedText>
              <ThemedText style={[styles.businessType, { color: colors.tabIconDefault }]}>
                {businessProfile.businessType}
              </ThemedText>
              <ThemedText style={[styles.yearsInBusiness, { color: colors.tabIconDefault }]}>
                {getYearsInBusinessText(businessProfile.yearsInBusiness)}
              </ThemedText>
            </View>
            <View style={styles.businessLogoContainer}>
              {businessProfile.logo ? (
                <Image source={{ uri: businessProfile.logo }} style={styles.businessLogo} />
              ) : (
                <View style={[styles.businessLogoPlaceholder, { backgroundColor: colors.tint }]}>
                  <ThemedText style={styles.businessLogoText}>
                    {businessProfile.businessName.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </ThemedView>

        {/* Ratings & Feedback Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Ratings & Feedback
          </ThemedText>
          <View style={styles.ratingsRow}>
            <View style={styles.ratingInfo}>
              <ThemedText style={[styles.ratingValue, { color: colors.text }]}>
                {businessProfile.rating !== undefined && businessProfile.rating !== null ? businessProfile.rating.toFixed(1) : '—'}
              </ThemedText>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= safe(businessProfile.rating, 0) ? "star" : "star-outline"}
                    size={16}
                    color={star <= safe(businessProfile.rating, 0) ? "#FFD700" : colors.tabIconDefault}
                  />
                ))}
              </View>
              <ThemedText style={[styles.ratingCount, { color: colors.tabIconDefault }]}>
                {safe(businessProfile.reviewCount, 0)} reviews
              </ThemedText>
            </View>
            <View style={styles.ratingStats}>
              <ThemedText style={[styles.ratingStat, { color: colors.text }]}>
                Jobs Completed: {safe(businessProfile.completedJobs, 0)}
              </ThemedText>
              <ThemedText style={[styles.ratingStat, { color: colors.text }]}>
                Response Rate: {businessProfile.responseRate !== undefined && businessProfile.responseRate !== null ? businessProfile.responseRate + '%' : '—'}
              </ThemedText>
              <ThemedText style={[styles.ratingStat, { color: colors.text }]}>
                On-Time Delivery: {businessProfile.onTimeDelivery !== undefined && businessProfile.onTimeDelivery !== null ? businessProfile.onTimeDelivery + '%' : '—'}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Contact Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Information
          </ThemedText>
          
          <View style={styles.contactRow}>
            <Ionicons name="person" size={20} color={colors.tint} />
            <ThemedText style={[styles.contactText, { color: colors.text }]}>
              {user.name}
            </ThemedText>
          </View>

          {user.email && (
            <TouchableOpacity style={styles.contactRow} onPress={handleContact}>
              <Ionicons name="mail" size={20} color={colors.tint} />
              <ThemedText style={[styles.contactText, { color: colors.tint }]}>
                {user.email}
              </ThemedText>
            </TouchableOpacity>
          )}

          {user.phone && (
            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <Ionicons name="call" size={20} color={colors.tint} />
              <ThemedText style={[styles.contactText, { color: colors.tint }]}>
                {user.phone}
              </ThemedText>
            </TouchableOpacity>
          )}

          {businessProfile.website && (
            <TouchableOpacity style={styles.contactRow} onPress={handleWebsite}>
              <Ionicons name="globe" size={20} color={colors.tint} />
              <ThemedText style={[styles.contactText, { color: colors.tint }]}>
                {businessProfile.website}
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Services Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Services Offered
          </ThemedText>
          <View style={styles.servicesGrid}>
            {businessProfile.primaryServices.map((service, index) => (
              <View
                key={index}
                style={[styles.serviceChip, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}
              >
                <ThemedText style={[styles.serviceText, { color: colors.tint }]}>
                  {service}
                </ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        {/* Service Area Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Service Area
          </ThemedText>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={colors.tint} />
            <ThemedText style={[styles.infoText, { color: colors.text }]}>
              Central Location: {cityName}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="radio" size={20} color={colors.tint} />
            <ThemedText style={[styles.infoText, { color: colors.text }]}>
              Service Radius: {businessProfile.serviceRadius} miles
            </ThemedText>
          </View>
          {businessProfile.locationConstraints && (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={colors.tint} />
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                {businessProfile.locationConstraints}
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Business Details Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Business Details
          </ThemedText>
          
          <View style={styles.infoRow}>
            <Ionicons name="people" size={20} color={colors.tint} />
            <ThemedText style={[styles.infoText, { color: colors.text }]}>
              Team Size: {businessProfile.teamSize}
            </ThemedText>
          </View>

          {businessProfile.businessLicense && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={20} color={colors.tint} />
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                License: {businessProfile.businessLicense}
              </ThemedText>
            </View>
          )}

          {businessProfile.insuranceInfo && (
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={20} color={colors.tint} />
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                Insurance: {businessProfile.insuranceInfo}
              </ThemedText>
            </View>
          )}

          {businessProfile.certifications && businessProfile.certifications.length > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="ribbon" size={20} color={colors.tint} />
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                Certifications: {businessProfile.certifications.join(', ')}
              </ThemedText>
            </View>
          )}

          {businessProfile.equipment && businessProfile.equipment.length > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="construct" size={20} color={colors.tint} />
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                Equipment: {businessProfile.equipment.join(', ')}
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Policies Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Policies & Preferences
          </ThemedText>
          
          {businessProfile.responseTime && (
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={colors.tint} />
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                Response Time: {businessProfile.responseTime}
              </ThemedText>
            </View>
          )}

          {businessProfile.paymentTerms && (
            <View style={styles.infoRow}>
              <Ionicons name="card" size={20} color={colors.tint} />
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                Payment Terms: {businessProfile.paymentTerms}
              </ThemedText>
            </View>
          )}

          {businessProfile.warrantyPolicy && (
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                Warranty: {businessProfile.warrantyPolicy}
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            onPress={handleContact}
          >
            <Ionicons name="chatbubble" size={20} color="white" />
            <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
              Send Message
            </ThemedText>
          </TouchableOpacity>

          {user.phone && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.tint }]}
              onPress={handleCall}
            >
              <Ionicons name="call" size={20} color={colors.tint} />
              <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
                Call Now
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Personal Profile Component
const PersonalProfileView = ({ user, colors }: { user: User; colors: any }) => {
  const handleContact = () => {
    // Navigate to messages with pre-filled recipient
    router.push({
      pathname: '/messages',
      params: { 
        newMessage: 'true',
        recipientId: user.id,
        recipientName: user.name,
        subject: 'Job inquiry'
      }
    } as any);
  };

  const handleCall = () => {
    if (user?.phone) {
      Linking.openURL(`tel:${user.phone}`);
    }
  };

  const handleResumeDownload = () => {
    if (user?.resume?.url) {
      Linking.openURL(user.resume.url);
    }
  };

  const handleSocialLink = (url: string) => {
    if (url) {
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = 'https://' + url;
      }
      Linking.openURL(formattedUrl);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header Section */}
        <ThemedView style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.tint }]}>
                  <ThemedText style={styles.profileImageText}>
                    {user.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={[styles.profileName, { color: colors.text }]}>
                {user.name}
              </ThemedText>
              <ThemedText style={[styles.profileLocation, { color: colors.tabIconDefault }]}>
                📍 {user.location?.city}, {user.location?.state}
              </ThemedText>
              <View style={styles.ratingRow}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= safe(user.rating, 0) ? "star" : "star-outline"}
                      size={16}
                      color={star <= safe(user.rating, 0) ? "#FFD700" : colors.tabIconDefault}
                    />
                  ))}
                </View>
                <ThemedText style={[styles.ratingText, { color: colors.text }]}>
                  {safe(user.rating, 0).toFixed(1)}
                </ThemedText>
              </View>
              <ThemedText style={[styles.joinDate, { color: colors.tabIconDefault }]}>
                🗓️ Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </ThemedText>
              <ThemedText style={[styles.jobsCompleted, { color: colors.tabIconDefault }]}>
                ✅ {safe(user.completedJobs, 0)} jobs completed
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Resume Download Section */}
        {user.resume && (
          <ThemedView style={styles.section}>
            <TouchableOpacity style={styles.resumeSection} onPress={handleResumeDownload}>
              <Ionicons name="document-text" size={24} color={colors.tint} />
              <View style={styles.resumeInfo}>
                <ThemedText style={[styles.resumeTitle, { color: colors.text }]}>
                  Download Resume
                </ThemedText>
                <ThemedText style={[styles.resumeFileName, { color: colors.tabIconDefault }]}>
                  {user.resume.fileName}
                </ThemedText>
              </View>
              <Ionicons name="download" size={20} color={colors.tint} />
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Bio Section */}
        {user.experience && (
          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              About Me
            </ThemedText>
            <ThemedText style={[styles.bioText, { color: colors.text }]}>
              {user.experience}
            </ThemedText>
          </ThemedView>
        )}

        {/* Skills Section */}
        {user.skills && user.skills.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Skills & Expertise
            </ThemedText>
            <View style={styles.skillsGrid}>
              {user.skills.map((skill, index) => (
                <View
                  key={index}
                  style={[styles.skillChip, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}
                >
                  <ThemedText style={[styles.skillText, { color: colors.tint }]}>
                    {skill}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ThemedView>
        )}

        {/* Interests Section */}
        {user.interests && user.interests.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Interests & Hobbies
            </ThemedText>
            <View style={styles.interestsGrid}>
              {user.interests.map((interest, index) => (
                <View
                  key={index}
                  style={[styles.interestChip, { backgroundColor: colors.background, borderColor: colors.tint }]}
                >
                  <ThemedText style={[styles.interestText, { color: colors.tint }]}>
                    {interest}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ThemedView>
        )}

        {/* Work Preferences Section */}
        {user.workPreferences && (
          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Work Preferences
            </ThemedText>
            <View style={styles.preferencesGrid}>
              {user.workPreferences.jobTypes && user.workPreferences.jobTypes.length > 0 && (
                <View style={styles.preferenceItem}>
                  <ThemedText style={[styles.preferenceLabel, { color: colors.tabIconDefault }]}>
                    Job Types:
                  </ThemedText>
                  <ThemedText style={[styles.preferenceValue, { color: colors.text }]}>
                    {user.workPreferences.jobTypes.join(', ')}
                  </ThemedText>
                </View>
              )}
              <View style={styles.preferenceItem}>
                <ThemedText style={[styles.preferenceLabel, { color: colors.tabIconDefault }]}>
                  Remote Work:
                </ThemedText>
                <ThemedText style={[styles.preferenceValue, { color: colors.text }]}>
                  {user.workPreferences.remoteWork ? 'Yes' : 'No'}
                </ThemedText>
              </View>
              <View style={styles.preferenceItem}>
                <ThemedText style={[styles.preferenceLabel, { color: colors.tabIconDefault }]}>
                  Travel Willingness:
                </ThemedText>
                <ThemedText style={[styles.preferenceValue, { color: colors.text }]}>
                  {user.workPreferences.travelWillingness ? 'Yes' : 'No'}
                </ThemedText>
              </View>
              {user.workPreferences.availability && (
                <View style={styles.preferenceItem}>
                  <ThemedText style={[styles.preferenceLabel, { color: colors.tabIconDefault }]}>
                    Availability:
                  </ThemedText>
                  <ThemedText style={[styles.preferenceValue, { color: colors.text }]}>
                    {user.workPreferences.availability}
                  </ThemedText>
                </View>
              )}
            </View>
          </ThemedView>
        )}

        {/* Contact Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Information
          </ThemedText>
          
          {user.email && (
            <TouchableOpacity style={styles.contactRow} onPress={handleContact}>
              <Ionicons name="mail" size={20} color={colors.tint} />
              <ThemedText style={[styles.contactText, { color: colors.tint }]}>
                {user.email}
              </ThemedText>
            </TouchableOpacity>
          )}

          {user.phone && (
            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <Ionicons name="call" size={20} color={colors.tint} />
              <ThemedText style={[styles.contactText, { color: colors.tint }]}>
                {user.phone}
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Reviews Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Reviews & Feedback
          </ThemedText>
          <View style={styles.reviewsSummary}>
            <View style={styles.reviewStats}>
              <ThemedText style={[styles.reviewRating, { color: colors.text }]}>
                {safe(user.rating, 0).toFixed(1)}
              </ThemedText>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= safe(user.rating, 0) ? "star" : "star-outline"}
                    size={20}
                    color={star <= safe(user.rating, 0) ? "#FFD700" : colors.tabIconDefault}
                  />
                ))}
              </View>
              <ThemedText style={[styles.reviewCount, { color: colors.tabIconDefault }]}>
                Based on {safe(user.completedJobs, 0)} completed jobs
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Badges Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Badges & Achievements
          </ThemedText>
          <View style={styles.badgesGrid}>
            {safe(user.completedJobs, 0) >= 1 && (
              <View style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: colors.tint }]}>
                  <Ionicons name="star" size={20} color="white" />
                </View>
                <ThemedText style={[styles.badgeText, { color: colors.text }]}>
                  First Job
                </ThemedText>
              </View>
            )}
            {safe(user.completedJobs, 0) >= 5 && (
              <View style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: colors.tint }]}>
                  <Ionicons name="trophy" size={20} color="white" />
                </View>
                <ThemedText style={[styles.badgeText, { color: colors.text }]}>
                  Pro Worker
                </ThemedText>
              </View>
            )}
            {safe(user.rating, 0) >= 4.5 && (
              <View style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: colors.tint }]}>
                  <Ionicons name="heart" size={20} color="white" />
                </View>
                <ThemedText style={[styles.badgeText, { color: colors.text }]}>
                  Highly Rated
                </ThemedText>
              </View>
            )}
          </View>
        </ThemedView>

        {/* Recently Completed Jobs Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Recently Completed Jobs
          </ThemedText>
          {safe(user.completedJobs, 0) > 0 ? (
            <View style={styles.completedJobsList}>
              {/* Sample completed jobs - in a real app, this would come from a database */}
              {Array.from({ length: Math.min(safe(user.completedJobs, 0), 3) }, (_, index) => (
                <View key={index} style={styles.completedJobItem}>
                  <View style={styles.completedJobHeader}>
                    <ThemedText style={[styles.completedJobTitle, { color: colors.text }]}>
                      Project {index + 1}
                    </ThemedText>
                    <View style={styles.completedJobRating}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <ThemedText style={[styles.completedJobRatingText, { color: colors.text }]}>
                        {4.5 + (index * 0.2).toFixed(1)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.completedJobDescription, { color: colors.tabIconDefault }]}>
                    Successfully completed project with excellent client satisfaction
                  </ThemedText>
                  <ThemedText style={[styles.completedJobDate, { color: colors.tabIconDefault }]}>
                    Completed {new Date(Date.now() - (index + 1) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
              No completed jobs yet. Start working to build your portfolio!
            </ThemedText>
          )}
        </ThemedView>

        {/* Portfolio/Blog Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Portfolio & Blog
          </ThemedText>
          <View style={styles.portfolioGrid}>
            {/* Sample portfolio items - in a real app, this would come from user's portfolio */}
            <View style={styles.portfolioItem}>
              <View style={[styles.portfolioImagePlaceholder, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name="image" size={32} color={colors.tint} />
              </View>
              <ThemedText style={[styles.portfolioTitle, { color: colors.text }]}>
                Web Development Project
              </ThemedText>
              <ThemedText style={[styles.portfolioDescription, { color: colors.tabIconDefault }]}>
                Modern responsive website built with React and Node.js
              </ThemedText>
              <ThemedText style={[styles.portfolioDate, { color: colors.tabIconDefault }]}>
                Posted 2 weeks ago
              </ThemedText>
            </View>
            
            <View style={styles.portfolioItem}>
              <View style={[styles.portfolioImagePlaceholder, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name="document-text" size={32} color={colors.tint} />
              </View>
              <ThemedText style={[styles.portfolioTitle, { color: colors.text }]}>
                Design Blog Post
              </ThemedText>
              <ThemedText style={[styles.portfolioDescription, { color: colors.tabIconDefault }]}>
                Tips for creating user-friendly mobile interfaces
              </ThemedText>
              <ThemedText style={[styles.portfolioDate, { color: colors.tabIconDefault }]}>
                Posted 1 month ago
              </ThemedText>
            </View>

            <View style={styles.portfolioItem}>
              <View style={[styles.portfolioImagePlaceholder, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name="code" size={32} color={colors.tint} />
              </View>
              <ThemedText style={[styles.portfolioTitle, { color: colors.text }]}>
                Mobile App Development
              </ThemedText>
              <ThemedText style={[styles.portfolioDescription, { color: colors.tabIconDefault }]}>
                Cross-platform app using React Native and Firebase
              </ThemedText>
              <ThemedText style={[styles.portfolioDate, { color: colors.tabIconDefault }]}>
                Posted 3 months ago
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity style={styles.addPortfolioButton}>
            <Ionicons name="add-circle" size={24} color={colors.tint} />
            <ThemedText style={[styles.addPortfolioText, { color: colors.tint }]}>
              Add New Portfolio Item
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            onPress={handleContact}
          >
            <Ionicons name="chatbubble" size={20} color="white" />
            <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
              Send Message
            </ThemedText>
          </TouchableOpacity>

          {user.phone && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.tint }]}
              onPress={handleCall}
            >
              <Ionicons name="call" size={20} color={colors.tint} />
              <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
                Call Now
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessType: {
    fontSize: 16,
    marginBottom: 4,
  },
  yearsInBusiness: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessInfo: {
    flex: 1,
  },
  businessLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  businessLogoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  ratingInfo: {
    alignItems: 'center',
    marginRight: 16,
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  ratingStats: {
    flex: 1,
  },
  ratingStat: {
    fontSize: 14,
    marginBottom: 4,
  },
  personalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personalInfo: {
    flex: 1,
  },
  personalName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  personalLocation: {
    fontSize: 16,
    marginBottom: 4,
  },
  personalJoinDate: {
    fontSize: 14,
  },
  personalAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 16,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  joinDate: {
    fontSize: 14,
  },
  jobsCompleted: {
    fontSize: 14,
  },
  resumeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resumeFileName: {
    fontSize: 14,
  },
  bioText: {
    fontSize: 16,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  preferenceValue: {
    fontSize: 14,
  },
  reviewsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewStats: {
    flex: 1,
  },
  reviewRating: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  badgeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 14,
  },
  completedJobsList: {
    gap: 12,
  },
  completedJobItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
  },
  completedJobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedJobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedJobRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  completedJobRatingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedJobDescription: {
    fontSize: 14,
  },
  completedJobDate: {
    fontSize: 14,
  },
  emptyStateText: {
    fontSize: 14,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  portfolioItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
  },
  portfolioImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  portfolioDescription: {
    fontSize: 14,
  },
  portfolioDate: {
    fontSize: 14,
  },
  addPortfolioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  addPortfolioText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 