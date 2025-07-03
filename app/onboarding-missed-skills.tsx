import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import OnboardingProgressBar from '../components/OnboardingProgressBar';
import { SKILL_DATA } from '../components/SkillBubbleDiscovery';

const STEP_LABELS = [
  'Select Skills',
  'Add Missed Skills',
  'Rate Experience',
  'Profile & Bio',
];

export default function OnboardingMissedSkills() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const initialSkills: string[] = useMemo(() => {
    try {
      return params.skills ? JSON.parse(params.skills as string) : [];
    } catch {
      return [];
    }
  }, [params.skills]);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // All unique skill names from SKILL_DATA
  const ALL_SKILL_NAMES = useMemo(() => Array.from(new Set(SKILL_DATA.map(s => s.name))), []);

  // Filtered skills for search - include all skills but mark selected ones
  const getSkillScore = (skill: string, search: string): number => {
    const lowerSearch = search.toLowerCase();
    const lowerSkill = skill.toLowerCase();
    if (lowerSkill === lowerSearch) return 100;
    if (lowerSkill.startsWith(lowerSearch)) return 90;
    if (lowerSkill.includes(lowerSearch)) return 70;
    return 0;
  };

  const filteredSkills = useMemo(() =>
    ALL_SKILL_NAMES
      .map(skill => ({ skill, score: getSkillScore(skill, searchText) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.skill),
    [ALL_SKILL_NAMES, searchText]
  );

  const handleSkillSelect = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      // Remove skill if already selected
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      // Add skill if not selected
      setSelectedSkills(prev => [...prev, skill]);
    }
    // Don't clear search text or close modal
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const handleAddCustomSkill = () => {
    if (searchText.trim() && !selectedSkills.includes(searchText.trim())) {
      setSelectedSkills(prev => [...prev, searchText.trim()]);
      setSearchText('');
      // Don't close modal
    }
  };

  const handleContinue = (skipped = false) => {
    // Go to the skill experience page, passing selected skills and skippedSteps
    router.push({
      pathname: '/onboarding-skill-experience' as any,
      params: {
        skills: JSON.stringify(selectedSkills),
        skippedSteps: skipped ? JSON.stringify(['missedSkills']) : JSON.stringify([]),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1 }}>
          <OnboardingProgressBar currentStep={2} totalSteps={4} stepLabels={STEP_LABELS} color={colors.tint} />
          <ThemedText type="title" style={{ marginTop: 32, marginBottom: 24, textAlign: 'left', paddingHorizontal: 16 }}>
            Add any skills you missed
          </ThemedText>
          {/* Search Bar at the top */}
          <TouchableOpacity
            style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, marginHorizontal: 16, marginBottom: 8 }]}
            onPress={() => setShowDropdown(true)}
            activeOpacity={1}
          >
            <ThemedText style={[styles.searchText, { color: searchText ? colors.text : colors.tabIconDefault }]}> 
              {searchText || 'Search and add skills...'}
            </ThemedText>
          </TouchableOpacity>
          {/* Dropdown Modal */}
          {showDropdown && (
            <View style={styles.dropdownModalOverlay}>
              <View style={[styles.dropdownModal, { backgroundColor: colors.background }]}> 
                <TextInput
                  style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text, marginBottom: 16 }]}
                  placeholder="Search skills or type a custom skill..."
                  placeholderTextColor={colors.tabIconDefault}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus
                />
                <ScrollView style={styles.dropdownList}>
                  {/* Custom Skill Option */}
                  {searchText.trim() &&
                    !ALL_SKILL_NAMES.some(skill => skill.toLowerCase() === searchText.toLowerCase()) &&
                    !selectedSkills.includes(searchText.trim()) && (
                      <TouchableOpacity style={[styles.customSkillItem, { borderColor: colors.tint, backgroundColor: colors.tint + '20' }]} onPress={handleAddCustomSkill}>
                        <ThemedText style={[styles.customSkillText, { color: colors.tint }]}>Add "{searchText.trim()}"</ThemedText>
                      </TouchableOpacity>
                    )}
                  {/* Available Skills - show all filtered skills, mark selected ones */}
                  {filteredSkills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <TouchableOpacity 
                        key={skill} 
                        style={[
                          styles.dropdownItem, 
                          { 
                            borderColor: isSelected ? colors.tint : colors.tabIconDefault,
                            backgroundColor: isSelected ? colors.tint + '20' : 'transparent'
                          }
                        ]} 
                        onPress={() => handleSkillSelect(skill)}
                      >
                        <ThemedText style={[
                          styles.dropdownItemText, 
                          { color: isSelected ? colors.tint : colors.text }
                        ]}>
                          {skill} {isSelected && '✓'}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                  {/* No Results Message */}
                  {filteredSkills.length === 0 && !searchText.trim() && (
                    <ThemedText style={[styles.noSkillsText, { color: colors.tabIconDefault }]}>Start typing to search skills...</ThemedText>
                  )}
                </ScrollView>
                <TouchableOpacity onPress={() => setShowDropdown(false)} style={{ marginTop: 16, alignSelf: 'center' }}>
                  <ThemedText style={{ color: colors.tint, fontWeight: 'bold' }}>Close</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* Selected Skills Scrollable */}
          <ScrollView style={{ flex: 1, paddingHorizontal: 16, marginTop: 8 }} contentContainerStyle={{ paddingBottom: 32 }}>
            <View style={styles.selectedSkillsGrid}>
              {selectedSkills.map(skill => (
                <View key={skill} style={[styles.selectedSkillChip, { backgroundColor: colors.tint, borderColor: colors.tint }]}> 
                  <ThemedText style={[styles.selectedSkillText, { color: 'white' }]}>{skill}</ThemedText>
                  <TouchableOpacity onPress={() => handleRemoveSkill(skill)} style={styles.removeSkillButton}>
                    <ThemedText style={[styles.removeSkillText, { color: 'white' }]}>×</ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
          {/* Skip and Continue Buttons Fixed at Bottom */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  selectedSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  selectedSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
  },
  selectedSkillText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  removeSkillButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSkillText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    justifyContent: 'center',
    marginBottom: 16,
  },
  searchText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dropdownModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  dropdownList: {
    maxHeight: 300,
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
  customSkillItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  customSkillText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noSkillsText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
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