import { OnboardingComplete } from '@/components/OnboardingComplete';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { User } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface BusinessOnboardingData {
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
}

const SERVICE_CATEGORIES = [
  'Accounting',
  'Advertising',
  'Air Conditioning',
  'Appliance Repair',
  'Architecture',
  'Audio/Video Services',
  'Automotive Services',
  'Bookkeeping',
  'Carpentry',
  'Catering',
  'Childcare',
  'Cleaning',
  'Computer Repair',
  'Consulting',
  'Content Writing',
  'Copywriting',
  'Data Entry',
  'Digital Marketing',
  'Eldercare',
  'Electrical',
  'Event Planning',
  'Financial Planning',
  'Flooring',
  'Graphic Design',
  'Handyman Services',
  'HVAC',
  'Interior Design',
  'IT Services',
  'Landscaping',
  'Legal Services',
  'Marketing',
  'Moving',
  'Music Lessons',
  'Notary Services',
  'Painting',
  'Pet Care',
  'Photography',
  'Plumbing',
  'Printing Services',
  'Property Management',
  'Real Estate',
  'Roofing',
  'Security Services',
  'SEO Services',
  'Social Media Management',
  'Software Development',
  'Storage',
  'Tax Preparation',
  'Translation Services',
  'Transportation',
  'Tutoring',
  'Video Production',
  'Web Design',
  'Web Development',
  'Window Cleaning',
  'Writing Services'
];

// Service categories with keywords for smart search
const SERVICE_KEYWORDS: { [key: string]: string[] } = {
  'IT Services': ['it', 'information technology', 'tech', 'technical', 'computer', 'system', 'network', 'support'],
  'Software Development': ['software', 'programming', 'coding', 'development', 'app', 'application', 'developer', 'code'],
  'Web Development': ['web', 'website', 'development', 'programming', 'coding', 'developer', 'frontend', 'backend'],
  'Web Design': ['web', 'website', 'design', 'ui', 'ux', 'interface', 'frontend', 'designer'],
  'SEO Services': ['seo', 'search', 'optimization', 'google', 'ranking', 'traffic', 'digital marketing'],
  'Digital Marketing': ['digital', 'marketing', 'online', 'internet', 'social', 'advertising', 'promotion'],
  'Social Media Management': ['social', 'media', 'facebook', 'instagram', 'twitter', 'linkedin', 'management'],
  'Content Writing': ['content', 'writing', 'blog', 'article', 'copy', 'text', 'writer'],
  'Copywriting': ['copy', 'writing', 'advertising', 'marketing', 'sales', 'persuasive', 'copywriter'],
  'Graphic Design': ['graphic', 'design', 'logo', 'branding', 'visual', 'art', 'illustration', 'designer'],
  'Video Production': ['video', 'production', 'filming', 'editing', 'camera', 'cinematography', 'videographer'],
  'Audio/Video Services': ['audio', 'video', 'sound', 'recording', 'editing', 'production'],
  'Photography': ['photo', 'photography', 'camera', 'photographer', 'portrait', 'event', 'wedding'],
  'Architecture': ['architecture', 'architect', 'building', 'design', 'planning', 'construction', 'blueprint'],
  'Interior Design': ['interior', 'design', 'decorating', 'furniture', 'home', 'office', 'space'],
  'Consulting': ['consulting', 'consultant', 'business', 'strategy', 'advice', 'expert', 'professional'],
  'Financial Planning': ['financial', 'planning', 'money', 'investment', 'retirement', 'budget', 'finance'],
  'Accounting': ['accounting', 'accountant', 'bookkeeping', 'tax', 'financial', 'records', 'audit'],
  'Bookkeeping': ['bookkeeping', 'accounting', 'records', 'financial', 'data entry', 'ledger'],
  'Tax Preparation': ['tax', 'preparation', 'filing', 'accounting', 'financial', 'irs', 'returns'],
  'Legal Services': ['legal', 'law', 'attorney', 'lawyer', 'legal advice', 'contract', 'document'],
  'Notary Services': ['notary', 'notarization', 'legal', 'document', 'witness', 'certification'],
  'Real Estate': ['real estate', 'property', 'realtor', 'agent', 'buying', 'selling', 'housing'],
  'Property Management': ['property', 'management', 'landlord', 'rental', 'maintenance', 'tenant'],
  'Event Planning': ['event', 'planning', 'wedding', 'party', 'celebration', 'coordination', 'organizer'],
  'Catering': ['catering', 'food', 'caterer', 'event', 'party', 'meal', 'service'],
  'Transportation': ['transportation', 'transport', 'delivery', 'moving', 'shipping', 'logistics'],
  'Moving': ['moving', 'relocation', 'transport', 'packing', 'shipping', 'delivery'],
  'Storage': ['storage', 'warehouse', 'facility', 'space', 'rental', 'self storage'],
  'Security Services': ['security', 'guard', 'protection', 'safety', 'surveillance', 'monitoring'],
  'Cleaning': ['cleaning', 'janitorial', 'housekeeping', 'maintenance', 'sanitize', 'clean'],
  'Window Cleaning': ['window', 'cleaning', 'glass', 'exterior', 'maintenance'],
  'Handyman Services': ['handyman', 'repair', 'maintenance', 'fix', 'home', 'improvement'],
  'Appliance Repair': ['appliance', 'repair', 'maintenance', 'fix', 'home', 'kitchen'],
  'Computer Repair': ['computer', 'repair', 'tech', 'maintenance', 'fix', 'hardware', 'software'],
  'Electrical': ['electrical', 'electrician', 'wiring', 'power', 'installation', 'repair'],
  'Plumbing': ['plumbing', 'plumber', 'pipe', 'water', 'drain', 'installation', 'repair'],
  'HVAC': ['hvac', 'heating', 'cooling', 'air conditioning', 'ventilation', 'climate'],
  'Air Conditioning': ['air conditioning', 'ac', 'cooling', 'hvac', 'climate', 'temperature'],
  'Carpentry': ['carpentry', 'carpenter', 'wood', 'construction', 'building', 'repair'],
  'Roofing': ['roofing', 'roof', 'shingle', 'construction', 'repair', 'installation'],
  'Flooring': ['flooring', 'floor', 'carpet', 'tile', 'installation', 'repair'],
  'Painting': ['painting', 'paint', 'interior', 'exterior', 'decorating', 'finishing'],
  'Landscaping': ['landscaping', 'landscape', 'garden', 'yard', 'outdoor', 'maintenance'],
  'Childcare': ['childcare', 'child', 'care', 'babysitting', 'daycare', 'nanny'],
  'Eldercare': ['eldercare', 'elder', 'care', 'senior', 'assistance', 'companionship'],
  'Pet Care': ['pet', 'care', 'dog', 'cat', 'walking', 'sitting', 'grooming'],
  'Tutoring': ['tutoring', 'tutor', 'education', 'teaching', 'learning', 'academic'],
  'Music Lessons': ['music', 'lessons', 'teaching', 'instruction', 'instrument', 'piano', 'guitar'],
  'Translation Services': ['translation', 'translator', 'language', 'interpreter', 'multilingual'],
  'Data Entry': ['data', 'entry', 'typing', 'administrative', 'office', 'records'],
  'Advertising': ['advertising', 'ads', 'promotion', 'marketing', 'media', 'campaign'],
  'Marketing': ['marketing', 'promotion', 'advertising', 'branding', 'strategy', 'campaign'],
  'Printing Services': ['printing', 'print', 'copy', 'document', 'paper', 'reproduction'],
  'Writing Services': ['writing', 'writer', 'content', 'copy', 'text', 'editorial'],
};

const BUSINESS_TYPE_OPTIONS = [
  'Sole Proprietorship',
  'LLC (Limited Liability Company)',
  'Corporation',
  'Partnership',
  'S-Corporation',
  'Non-Profit',
  'Franchise',
  'Other'
];

const TEAM_SIZE_OPTIONS = ['Solo', '2-3', '5-10', '10-25', '25-50', '50-100', '100-250', '250-500', '500-1000', '1000+'];
const YEARS_IN_BUSINESS_OPTIONS = [0, 1, 2, 3, 5, 10, 15, 20, '20+'];
const SERVICE_RADIUS_OPTIONS = [5, 10, 15, 20, 25, 30, 50, 100];

const STEP_TITLES = [
  'Business Basics',
  'Services & Coverage',
  'Team & Equipment',
  'Policies & Preferences',
  'Complete!'
];

const STEP_SUBTITLES = [
  'Tell us about your business foundation.',
  'What services do you offer and where?',
  'About your team and capabilities.',
  'Your work policies and preferences.',
  'Your business profile is ready!'
];

export default function BusinessOnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentUser, updateUserProfile } = useAuthContext();
  const params = useLocalSearchParams();
  const {
    businessName = '',
    businessType = '',
    yearsInBusiness = '0',
    primaryServices = '',
    serviceAreas = '',
    website = '',
    businessLicense = '',
    insuranceInfo = '',
    teamSize = 'Solo',
    serviceRadius = '10',
    locationConstraints = '',
    warrantyPolicy = '',
    certifications = '',
    equipment = '',
    responseTime = '',
    paymentTerms = '',
    editMode = 'false',
  } = params;

  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [onboardingData, setOnboardingData] = useState<BusinessOnboardingData>({
    businessName: '',
    businessType: '',
    yearsInBusiness: 0,
    primaryServices: [],
    serviceAreas: [],
    website: '',
    businessLicense: '',
    insuranceInfo: '',
    teamSize: 'Solo',
    serviceRadius: 10,
  });

  // Check if this is edit mode
  const isEditMode = editMode === 'true';

  // Pre-populate data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const prePopulatedData: BusinessOnboardingData = {
        businessName: businessName as string || '',
        businessType: businessType as string || '',
        yearsInBusiness: parseInt(yearsInBusiness as string) || 0,
        primaryServices: (primaryServices as string)?.split(',').filter(s => s.trim()) || [],
        serviceAreas: (serviceAreas as string)?.split(',').filter(s => s.trim()) || [],
        website: website as string || '',
        businessLicense: businessLicense as string || '',
        insuranceInfo: insuranceInfo as string || '',
        teamSize: teamSize as string || 'Solo',
        serviceRadius: parseInt(serviceRadius as string) || 10,
        locationConstraints: locationConstraints as string || '',
        warrantyPolicy: warrantyPolicy as string || '',
        certifications: (certifications as string)?.split(',').filter(s => s.trim()) || [],
        equipment: (equipment as string)?.split(',').filter(s => s.trim()) || [],
        responseTime: responseTime as string || '',
        paymentTerms: paymentTerms as string || '',
      };
      setOnboardingData(prePopulatedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  // Services search functionality
  const [servicesSearchText, setServicesSearchText] = useState('');
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [showBusinessTypeDropdown, setShowBusinessTypeDropdown] = useState(false);

  const totalSteps = 5;

  const handleServiceToggle = (service: string) => {
    setOnboardingData(prev => ({
      ...prev,
      primaryServices: prev.primaryServices.includes(service)
        ? prev.primaryServices.filter(s => s !== service)
        : [...prev.primaryServices, service],
    }));
  };

  const handleInputChange = (field: string, value: string | string[] | boolean | number) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return onboardingData.businessName.trim().length > 0 && onboardingData.primaryServices.length > 0;
      case 2:
        return onboardingData.serviceAreas.length > 0 && onboardingData.serviceAreas[0].trim().length > 0 && onboardingData.serviceRadius > 0;
      case 3:
        return true; // Can skip
      case 4:
        return true; // Can skip
      case 5:
        return true; // Completion step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps - 1) {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard Changes', 
            style: 'destructive',
            onPress: () => {
              setHasUnsavedChanges(false);
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                router.back();
              }
            }
          }
        ]
      );
    } else {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      } else {
        router.back();
      }
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps - 1) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setIsCompleting(true);
      
      // Update user profile with business information
      const updatedUserData: Partial<User> = {
        // Store business data in a structured way
        businessProfile: {
          ...onboardingData,
          completedSteps: currentStep,
          isComplete: true,
        },
        workerProfileComplete: true, // Mark as complete for business owners
      };

      await updateUserProfile(currentUser.id, updatedUserData);
      setHasUnsavedChanges(false);
      setCurrentStep(totalSteps); // Show completion step
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleFinishOnboarding = () => {
    router.replace('/welcome' as any);
  };

  // Helper functions for services search
  const getServiceScore = (service: string, searchText: string): number => {
    const lowerSearch = searchText.toLowerCase();
    const lowerService = service.toLowerCase();
    
    // Exact match gets highest score
    if (lowerService === lowerSearch) return 100;
    
    // Starts with search text gets high score
    if (lowerService.startsWith(lowerSearch)) return 90;
    
    // Contains search text gets medium score
    if (lowerService.includes(lowerSearch)) return 70;
    
    // Check keywords for this service
    const keywords = (SERVICE_KEYWORDS as { [key: string]: string[] })[service] || [];
    let keywordScore = 0;
    
    for (const keyword of keywords) {
      if (keyword.includes(lowerSearch) || lowerSearch.includes(keyword)) {
        keywordScore = Math.max(keywordScore, 60);
      }
    }
    
    return keywordScore;
  };

  const filteredServices = SERVICE_CATEGORIES
    .filter(service => !onboardingData.primaryServices.includes(service))
    .map(service => ({
      service,
      score: getServiceScore(service, servicesSearchText)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.service);

  const handleServiceSelect = (service: string) => {
    handleServiceToggle(service);
    setServicesSearchText('');
    // Don't close the modal - keep it open for more selections
  };

  const handleRemoveService = (service: string) => {
    handleServiceToggle(service);
  };

  const handleRemoveServiceFromModal = (service: string) => {
    handleServiceToggle(service);
    // Keep modal open after removal
  };

  const handleAddCustomService = () => {
    if (servicesSearchText.trim() && !onboardingData.primaryServices.includes(servicesSearchText.trim())) {
      handleServiceToggle(servicesSearchText.trim());
      setServicesSearchText('');
      setShowServicesDropdown(false);
    }
  };

  const handleBusinessTypeSelect = (type: string) => {
    if (type === 'Other') {
      setCustomBusinessType('');
      setShowBusinessTypeDropdown(false);
    } else {
      handleInputChange('businessType', type);
      setShowBusinessTypeDropdown(false);
    }
  };

  const handleCloseServicesModal = () => {
    setShowServicesDropdown(false);
    setServicesSearchText('');
  };

  const renderStep1 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Business Name</ThemedText>
        {isEditMode && (
          <ThemedText style={[styles.readOnlyText, { color: colors.text }]}>
            (Cannot be changed)
          </ThemedText>
        )}
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
            isEditMode && styles.readOnlyInput
          ]}
          placeholder="Enter your business name"
          placeholderTextColor={colors.text}
          value={onboardingData.businessName}
          onChangeText={(text) => handleInputChange('businessName', text)}
          editable={!isEditMode}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Business Type
        </ThemedText>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
            },
          ]}
          onPress={() => setShowBusinessTypeDropdown(true)}
        >
          <ThemedText style={[
            styles.dropdownButtonText,
            { color: onboardingData.businessType ? colors.text : colors.tabIconDefault }
          ]}>
            {onboardingData.businessType || 'Select business type'}
          </ThemedText>
        </TouchableOpacity>

        {/* Business Type Dropdown Modal */}
        <Modal
          visible={showBusinessTypeDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowBusinessTypeDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowBusinessTypeDropdown(false)}
          >
            <ThemedView style={[styles.dropdownModal, { backgroundColor: colors.background }]}>
              <ScrollView style={styles.dropdownList}>
                {BUSINESS_TYPE_OPTIONS.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.dropdownItem,
                      {
                        backgroundColor: onboardingData.businessType === type ? colors.tint : 'transparent',
                      },
                    ]}
                    onPress={() => handleBusinessTypeSelect(type)}
                  >
                    <ThemedText style={[
                      styles.dropdownItemText,
                      { color: onboardingData.businessType === type ? 'white' : colors.text }
                    ]}>
                      {type}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
          </TouchableOpacity>
        </Modal>

        {/* Custom Business Type Input (shown when "Other" is selected) */}
        {onboardingData.businessType === 'Other' && (
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault,
                color: colors.text,
                marginTop: 8,
              },
            ]}
            placeholder="Specify your business type"
            placeholderTextColor={colors.tabIconDefault}
            value={customBusinessType}
            onChangeText={(text) => {
              setCustomBusinessType(text);
              handleInputChange('businessType', text);
            }}
          />
        )}
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Years in Business
        </ThemedText>
        <View style={styles.optionsGrid}>
          {YEARS_IN_BUSINESS_OPTIONS.map(years => (
            <TouchableOpacity
              key={years}
              style={[
                styles.optionChip,
                {
                  backgroundColor: onboardingData.yearsInBusiness === years
                    ? colors.tint
                    : colors.background,
                  borderColor: colors.tabIconDefault,
                },
              ]}
              onPress={() => handleInputChange('yearsInBusiness', years)}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  {
                    color: onboardingData.yearsInBusiness === years
                      ? 'white'
                      : colors.text,
                  },
                ]}
              >
                {years === 0 ? 'New' : `${years}+ years`}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Primary Services *
        </ThemedText>
        
        {/* Selected Services Display */}
        {onboardingData.primaryServices.length > 0 && (
          <View style={styles.selectedServicesContainer}>
            <View style={styles.selectedServicesGrid}>
              {onboardingData.primaryServices.map(service => (
                <View
                  key={service}
                  style={[
                    styles.selectedServiceChip,
                    {
                      backgroundColor: colors.tint,
                      borderColor: colors.tint,
                    },
                  ]}
                >
                  <ThemedText style={[styles.selectedServiceText, { color: 'white' }]}>
                    {service}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => handleRemoveServiceFromModal(service)}
                    style={styles.removeServiceButton}
                  >
                    <ThemedText style={[styles.removeServiceText, { color: 'white' }]}>
                      ×
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Services Search Input */}
        <TouchableOpacity
          style={[
            styles.servicesSearchInput,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
            },
          ]}
          onPress={() => setShowServicesDropdown(true)}
        >
          <ThemedText style={[
            styles.servicesSearchText,
            { color: servicesSearchText ? colors.text : colors.tabIconDefault }
          ]}>
            {servicesSearchText || 'Search and add services...'}
          </ThemedText>
        </TouchableOpacity>

        {/* Services Dropdown Modal */}
        <Modal
          visible={showServicesDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseServicesModal}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCloseServicesModal}
          >
            <ThemedView style={[styles.servicesDropdownModal, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.servicesDropdownTitle, { color: colors.text }]}>
                Select Services
              </ThemedText>
              
              {/* Search Input */}
              <TextInput
                style={[
                  styles.servicesSearchInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.tabIconDefault,
                    color: colors.text,
                    marginBottom: 16,
                  },
                ]}
                placeholder="Search services or type a custom service..."
                placeholderTextColor={colors.tabIconDefault}
                value={servicesSearchText}
                onChangeText={setServicesSearchText}
                autoFocus={true}
              />

              {/* Services List */}
              <ScrollView style={styles.servicesDropdownList}>
                {/* Selected Services Section */}
                {onboardingData.primaryServices.length > 0 && (
                  <>
                    <ThemedText style={[styles.servicesSectionTitle, { color: colors.text }]}>
                      Selected Services:
                    </ThemedText>
                    {onboardingData.primaryServices.map(service => (
                      <View
                        key={service}
                        style={[
                          styles.selectedServiceInModal,
                          {
                            backgroundColor: colors.tint,
                            borderColor: colors.tint,
                          },
                        ]}
                      >
                        <ThemedText style={[styles.selectedServiceInModalText, { color: 'white' }]}>
                          {service}
                        </ThemedText>
                        <TouchableOpacity
                          onPress={() => handleRemoveServiceFromModal(service)}
                          style={styles.removeServiceInModalButton}
                        >
                          <ThemedText style={[styles.removeServiceInModalText, { color: 'white' }]}>
                            ×
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <View style={styles.servicesDivider} />
                  </>
                )}

                {/* Custom Service Option */}
                {servicesSearchText.trim() && 
                 !SERVICE_CATEGORIES.some(service => 
                   service.toLowerCase() === servicesSearchText.toLowerCase()
                 ) && 
                 !onboardingData.primaryServices.includes(servicesSearchText.trim()) && (
                  <TouchableOpacity
                    style={[
                      styles.customServiceItem,
                      {
                        borderColor: colors.tint,
                        backgroundColor: colors.tint + '20',
                      },
                    ]}
                    onPress={handleAddCustomService}
                  >
                    <ThemedText style={[
                      styles.customServiceText,
                      { color: colors.tint }
                    ]}>
                      Add &quot;{servicesSearchText.trim()}&quot;
                    </ThemedText>
                  </TouchableOpacity>
                )}

                {/* Available Services */}
                {filteredServices.length > 0 && (
                  <>
                    <ThemedText style={[styles.servicesSectionTitle, { color: colors.tabIconDefault }]}>
                      Available Services:
                    </ThemedText>
                    {filteredServices.map(service => (
                      <TouchableOpacity
                        key={service}
                        style={[
                          styles.servicesDropdownItem,
                          {
                            borderColor: colors.tabIconDefault,
                          },
                        ]}
                        onPress={() => handleServiceSelect(service)}
                      >
                        <ThemedText style={[
                          styles.servicesDropdownItemText,
                          { color: colors.text }
                        ]}>
                          {service}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* No Results Message */}
                {filteredServices.length === 0 && 
                 !servicesSearchText.trim() && (
                  <ThemedText style={[styles.noServicesText, { color: colors.tabIconDefault }]}>
                    Start typing to search services...
                  </ThemedText>
                )}
              </ScrollView>
            </ThemedView>
          </TouchableOpacity>
        </Modal>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Website (Optional)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="https://yourbusiness.com"
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.website}
          onChangeText={(text) => handleInputChange('website', text)}
          keyboardType="url"
          autoCapitalize="none"
        />
      </ThemedView>
    </ThemedView>
  );

  const renderStep2 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Central Service Location (ZIP code) *
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="Enter your central ZIP code (e.g., 90210)"
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.serviceAreas[0] || ''}
          onChangeText={(text) => handleInputChange('serviceAreas', [text.trim()])}
          keyboardType="numeric"
          maxLength={5}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Service Radius (miles) *
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="Enter service radius in miles (e.g., 25)"
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.serviceRadius.toString()}
          onChangeText={(text) => {
            const radius = parseInt(text) || 0;
            handleInputChange('serviceRadius', radius);
          }}
          keyboardType="numeric"
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Service Location Constraints (Optional)
        </ThemedText>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="Describe any location constraints, travel limitations, or service area restrictions..."
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.locationConstraints || ''}
          onChangeText={(text) => handleInputChange('locationConstraints', text)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </ThemedView>
    </ThemedView>
  );

  const renderStep3 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Team Size
        </ThemedText>
        <View style={styles.optionsGrid}>
          {TEAM_SIZE_OPTIONS.map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.optionChip,
                {
                  backgroundColor: onboardingData.teamSize === size
                    ? colors.tint
                    : colors.background,
                  borderColor: colors.tabIconDefault,
                },
              ]}
              onPress={() => handleInputChange('teamSize', size)}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  {
                    color: onboardingData.teamSize === size
                      ? 'white'
                      : colors.text,
                  },
                ]}
              >
                {size}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Business License Number (Optional)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="Enter your business license number"
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.businessLicense}
          onChangeText={(text) => handleInputChange('businessLicense', text)}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Insurance Information (Optional)
        </ThemedText>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="Describe your insurance coverage..."
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.insuranceInfo}
          onChangeText={(text) => handleInputChange('insuranceInfo', text)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </ThemedView>
    </ThemedView>
  );

  const renderStep4 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Response Time (Optional)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="e.g., Same day, Within 24 hours, Within 48 hours"
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.responseTime}
          onChangeText={(text) => handleInputChange('responseTime', text)}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Payment Terms (Optional)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="e.g., Net 30, Upfront, Milestone payments"
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.paymentTerms}
          onChangeText={(text) => handleInputChange('paymentTerms', text)}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          Warranty Policy (Optional)
        </ThemedText>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.background,
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          placeholder="Describe your warranty policy..."
          placeholderTextColor={colors.tabIconDefault}
          value={onboardingData.warrantyPolicy}
          onChangeText={(text) => handleInputChange('warrantyPolicy', text)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </ThemedView>
    </ThemedView>
  );

  const renderStep5 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="title" style={[styles.completionTitle, { color: colors.text }]}>
        Business Profile Complete!
      </ThemedText>
      <ThemedText style={[styles.completionSubtitle, { color: colors.tabIconDefault }]}>
        Your business is now ready to find work opportunities on Workly.
      </ThemedText>
      <ThemedText style={[styles.completionText, { color: colors.tabIconDefault }]}>
        You can always update your profile later to add more details and improve your matching.
      </ThemedText>
    </ThemedView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  if (currentStep === totalSteps) {
    return (
      <OnboardingComplete
        onComplete={handleFinishOnboarding}
        title="Business Profile Complete!"
        subtitle="Your business is ready to find work opportunities on Workly."
        buttonText="Go to Dashboard"
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {isEditMode ? 'Edit Business Profile' : 'Business Onboarding'}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          title={STEP_TITLES[currentStep - 1]}
          subtitle={STEP_SUBTITLES[currentStep - 1]}
        />

        {renderCurrentStep()}

        <ThemedView style={styles.navigationContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.backButton, { borderColor: colors.tint }]}
              onPress={handleBack}
            >
              <ThemedText style={[styles.navButtonText, { color: colors.tint }]}>
                Back
              </ThemedText>
            </TouchableOpacity>
          )}

          <View style={styles.rightButtons}>
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                {
                  backgroundColor: canProceed() ? colors.tint : colors.tabIconDefault,
                  opacity: canProceed() ? 1 : 0.5,
                },
              ]}
              onPress={handleNext}
              disabled={!canProceed() || isCompleting}
            >
              <ThemedText style={[styles.navButtonText, { color: 'white' }]}>
                {isCompleting ? 'Saving...' : currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  stepContainer: {
    flex: 1,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  servicesContainer: {
    maxHeight: 200,
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
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  completionSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  completionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  nextButton: {
    borderColor: 'transparent',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: '80%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  dropdownList: {
    maxHeight: '80%',
  },
  dropdownItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedServicesContainer: {
    marginBottom: 12,
  },
  selectedServicesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedServiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
  },
  selectedServiceText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  removeServiceButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeServiceText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  servicesSearchInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  servicesSearchText: {
    fontSize: 16,
    fontWeight: '500',
  },
  servicesDropdownModal: {
    width: '80%',
    height: '70%',
    borderRadius: 16,
    padding: 20,
  },
  servicesDropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  servicesDropdownList: {
    flex: 1,
  },
  servicesDropdownItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  servicesDropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noServicesText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
  },
  customServiceItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  customServiceText: {
    fontSize: 16,
    fontWeight: '500',
  },
  servicesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  selectedServiceInModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  selectedServiceInModalText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  removeServiceInModalButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeServiceInModalText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  servicesDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 8,
  },
  readOnlyText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  readOnlyInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
}); 