import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SkillWithConfidence {
  skill: string;
  confidence: 'high' | 'medium' | 'low';
}

interface SkillConfirmationProps {
  skills: string[];
  skillsWithConfidence?: SkillWithConfidence[];
  onConfirm: (skills: string[]) => void;
  onBack: () => void;
}

export default function SkillConfirmation({ 
  skills, 
  skillsWithConfidence,
  onConfirm, 
  onBack 
}: SkillConfirmationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Use skillsWithConfidence if available, otherwise convert skills array
  const initialSkills = skillsWithConfidence || skills.map(skill => ({ skill, confidence: 'medium' as const }));
  const [editableSkills, setEditableSkills] = useState<SkillWithConfidence[]>(initialSkills);
  const [newSkill, setNewSkill] = useState('');

  const handleRemoveSkill = (index: number) => {
    setEditableSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editableSkills.some(s => s.skill === newSkill.trim())) {
      setEditableSkills(prev => [...prev, { skill: newSkill.trim(), confidence: 'high' }]);
      setNewSkill('');
    }
  };

  const handleConfirm = () => {
    onConfirm(editableSkills.map(s => s.skill).filter(skill => skill.trim()));
  };

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return '#4CAF50'; // Green
      case 'medium':
        return '#FF9800'; // Orange
      case 'low':
        return '#F44336'; // Red
      default:
        return colors.tint;
    }
  };

  const getConfidenceIcon = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'checkmark-circle';
      case 'medium':
        return 'help-circle';
      case 'low':
        return 'alert-circle';
      default:
        return 'ellipse';
    }
  };

  const getConfidenceLabel = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'High Confidence';
      case 'medium':
        return 'Medium Confidence';
      case 'low':
        return 'Low Confidence';
      default:
        return 'Unknown';
    }
  };

  // Group skills by confidence
  const highConfidenceSkills = editableSkills.filter(s => s.confidence === 'high');
  const mediumConfidenceSkills = editableSkills.filter(s => s.confidence === 'medium');
  const lowConfidenceSkills = editableSkills.filter(s => s.confidence === 'low');

  const renderSkillSection = (skills: SkillWithConfidence[], title: string, confidence: 'high' | 'medium' | 'low') => {
    if (skills.length === 0) return null;

    return (
      <View style={styles.skillSection}>
        <View style={styles.sectionHeader}>
          <Ionicons 
            name={getConfidenceIcon(confidence)} 
            size={16} 
            color={getConfidenceColor(confidence)} 
          />
          <ThemedText style={[styles.sectionTitle, { color: getConfidenceColor(confidence) }]}>
            {title} ({skills.length})
          </ThemedText>
        </View>
        <View style={styles.skillsContainer}>
          {skills.map((skillData, index) => (
            <View 
              key={`${confidence}-${index}`} 
              style={[
                styles.skillChip, 
                { 
                  backgroundColor: getConfidenceColor(confidence) + '20',
                  borderColor: getConfidenceColor(confidence) + '40'
                }
              ]}
            >
              <ThemedText style={[styles.skillText, { color: getConfidenceColor(confidence) }]}>
                {skillData.skill}
              </ThemedText>
              <TouchableOpacity
                onPress={() => handleRemoveSkill(editableSkills.findIndex(s => s.skill === skillData.skill))}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color={getConfidenceColor(confidence)} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.tint} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Confirm Your Skills</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        <ThemedText style={styles.subtitle}>
          We found these skills in your description. Skills are grouped by confidence level:
        </ThemedText>

        {renderSkillSection(highConfidenceSkills, 'High Confidence Skills', 'high')}
        {renderSkillSection(mediumConfidenceSkills, 'Medium Confidence Skills', 'medium')}
        {renderSkillSection(lowConfidenceSkills, 'Low Confidence Skills', 'low')}

        <View style={styles.addSkillContainer}>
          <TextInput
            style={[styles.input, { borderColor: colors.tint, color: colors.text }]}
            placeholder="Add a skill..."
            placeholderTextColor={colors.text + '60'}
            value={newSkill}
            onChangeText={setNewSkill}
            onSubmitEditing={handleAddSkill}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={handleAddSkill}
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            disabled={!newSkill.trim()}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleConfirm}
          style={[styles.confirmButton, { backgroundColor: colors.tint }]}
        >
          <ThemedText style={styles.confirmButtonText}>
            Confirm Skills ({editableSkills.length})
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  removeButton: {
    padding: 2,
  },
  addSkillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skillSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 