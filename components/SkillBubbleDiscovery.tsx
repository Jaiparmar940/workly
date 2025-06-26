import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const { width: screenWidth } = Dimensions.get('window');

interface SkillBubble {
  id: string;
  name: string;
  category: string;
  level: 'general' | 'specific' | 'detailed';
  parentId?: string;
}

interface SkillBubbleDiscoveryProps {
  onComplete: (selectedSkills: string[]) => void;
  onSkip: () => void;
}

// Skill data structure - general categories first, then specific skills
const SKILL_DATA: SkillBubble[] = [
  // General categories (level 1)
  { id: 'tech', name: 'Technology', category: 'Technology', level: 'general' },
  { id: 'creative', name: 'Creative Arts', category: 'Creative', level: 'general' },
  { id: 'business', name: 'Business', category: 'Business', level: 'general' },
  { id: 'services', name: 'Services', category: 'Services', level: 'general' },
  { id: 'health', name: 'Health & Wellness', category: 'Health', level: 'general' },
  { id: 'education', name: 'Education', category: 'Education', level: 'general' },
  { id: 'crafts', name: 'Crafts & DIY', category: 'Crafts', level: 'general' },
  { id: 'outdoor', name: 'Outdoor & Nature', category: 'Outdoor', level: 'general' },

  // Technology specific (level 2)
  { id: 'web-dev', name: 'Web Development', category: 'Technology', level: 'specific', parentId: 'tech' },
  { id: 'mobile-dev', name: 'Mobile Development', category: 'Technology', level: 'specific', parentId: 'tech' },
  { id: 'data-science', name: 'Data Science', category: 'Technology', level: 'specific', parentId: 'tech' },
  { id: 'ai-ml', name: 'AI & Machine Learning', category: 'Technology', level: 'specific', parentId: 'tech' },
  { id: 'cybersecurity', name: 'Cybersecurity', category: 'Technology', level: 'specific', parentId: 'tech' },
  { id: 'devops', name: 'DevOps', category: 'Technology', level: 'specific', parentId: 'tech' },

  // Creative Arts specific (level 2)
  { id: 'graphic-design', name: 'Graphic Design', category: 'Creative', level: 'specific', parentId: 'creative' },
  { id: 'ui-ux', name: 'UI/UX Design', category: 'Creative', level: 'specific', parentId: 'creative' },
  { id: 'photography', name: 'Photography', category: 'Creative', level: 'specific', parentId: 'creative' },
  { id: 'video-editing', name: 'Video Editing', category: 'Creative', level: 'specific', parentId: 'creative' },
  { id: 'music', name: 'Music', category: 'Creative', level: 'specific', parentId: 'creative' },
  { id: 'writing', name: 'Writing', category: 'Creative', level: 'specific', parentId: 'creative' },

  // Business specific (level 2)
  { id: 'marketing', name: 'Marketing', category: 'Business', level: 'specific', parentId: 'business' },
  { id: 'sales', name: 'Sales', category: 'Business', level: 'specific', parentId: 'business' },
  { id: 'project-management', name: 'Project Management', category: 'Business', level: 'specific', parentId: 'business' },
  { id: 'consulting', name: 'Consulting', category: 'Business', level: 'specific', parentId: 'business' },
  { id: 'finance', name: 'Finance', category: 'Business', level: 'specific', parentId: 'business' },

  // Services specific (level 2)
  { id: 'virtual-assistant', name: 'Virtual Assistant', category: 'Services', level: 'specific', parentId: 'services' },
  { id: 'translation', name: 'Translation', category: 'Services', level: 'specific', parentId: 'services' },
  { id: 'tutoring', name: 'Tutoring', category: 'Services', level: 'specific', parentId: 'services' },
  { id: 'event-planning', name: 'Event Planning', category: 'Services', level: 'specific', parentId: 'services' },
  { id: 'cleaning', name: 'Cleaning', category: 'Services', level: 'specific', parentId: 'services' },

  // Web Development detailed (level 3)
  { id: 'frontend', name: 'Frontend Development', category: 'Technology', level: 'detailed', parentId: 'web-dev' },
  { id: 'backend', name: 'Backend Development', category: 'Technology', level: 'detailed', parentId: 'web-dev' },
  { id: 'fullstack', name: 'Full Stack Development', category: 'Technology', level: 'detailed', parentId: 'web-dev' },
  { id: 'wordpress', name: 'WordPress', category: 'Technology', level: 'detailed', parentId: 'web-dev' },
  { id: 'ecommerce', name: 'E-commerce Development', category: 'Technology', level: 'detailed', parentId: 'web-dev' },

  // Graphic Design detailed (level 3)
  { id: 'logo-design', name: 'Logo Design', category: 'Creative', level: 'detailed', parentId: 'graphic-design' },
  { id: 'branding', name: 'Branding', category: 'Creative', level: 'detailed', parentId: 'graphic-design' },
  { id: 'illustration', name: 'Illustration', category: 'Creative', level: 'detailed', parentId: 'graphic-design' },
  { id: 'print-design', name: 'Print Design', category: 'Creative', level: 'detailed', parentId: 'graphic-design' },
  { id: 'social-media-graphics', name: 'Social Media Graphics', category: 'Creative', level: 'detailed', parentId: 'graphic-design' },

  // Marketing detailed (level 3)
  { id: 'digital-marketing', name: 'Digital Marketing', category: 'Business', level: 'detailed', parentId: 'marketing' },
  { id: 'social-media-marketing', name: 'Social Media Marketing', category: 'Business', level: 'detailed', parentId: 'marketing' },
  { id: 'content-marketing', name: 'Content Marketing', category: 'Business', level: 'detailed', parentId: 'marketing' },
  { id: 'seo', name: 'SEO', category: 'Business', level: 'detailed', parentId: 'marketing' },
  { id: 'email-marketing', name: 'Email Marketing', category: 'Business', level: 'detailed', parentId: 'marketing' },

  // Music detailed (level 3)
  { id: 'music-production', name: 'Music Production', category: 'Creative', level: 'detailed', parentId: 'music' },
  { id: 'guitar-lessons', name: 'Guitar Lessons', category: 'Creative', level: 'detailed', parentId: 'music' },
  { id: 'piano-lessons', name: 'Piano Lessons', category: 'Creative', level: 'detailed', parentId: 'music' },
  { id: 'vocal-training', name: 'Vocal Training', category: 'Creative', level: 'detailed', parentId: 'music' },
  { id: 'songwriting', name: 'Songwriting', category: 'Creative', level: 'detailed', parentId: 'music' },
];

export default function SkillBubbleDiscovery({ onComplete, onSkip }: SkillBubbleDiscoveryProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [visibleBubbles, setVisibleBubbles] = useState<SkillBubble[]>([]);
  const [bubbleAnimations, setBubbleAnimations] = useState<{ [key: string]: Animated.Value }>({});

  // Initialize with general categories
  useEffect(() => {
    const generalBubbles = SKILL_DATA.filter(skill => skill.level === 'general');
    setVisibleBubbles(generalBubbles);
    
    // Initialize animations
    const animations: { [key: string]: Animated.Value } = {};
    generalBubbles.forEach(bubble => {
      animations[bubble.id] = new Animated.Value(0);
    });
    setBubbleAnimations(animations);
    
    // Animate bubbles in
    setTimeout(() => {
      generalBubbles.forEach(bubble => {
        Animated.spring(animations[bubble.id], {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      });
    }, 100);
  }, []);

  const handleBubblePress = (bubble: SkillBubble) => {
    // Toggle selection
    const isSelected = selectedSkills.includes(bubble.id);
    let newSelectedSkills: string[];
    
    if (isSelected) {
      // Deselect and remove related skills
      newSelectedSkills = selectedSkills.filter(id => {
        const skill = SKILL_DATA.find(s => s.id === id);
        return id !== bubble.id && skill?.parentId !== bubble.id;
      });
      
      // Find child bubbles to remove
      const relatedSkillIds = SKILL_DATA.filter(skill => skill.parentId === bubble.id).map(s => s.id);
      const bubblesToRemove = visibleBubbles.filter(b => relatedSkillIds.includes(b.id));
      
      // Animate out the child bubbles
      bubblesToRemove.forEach(skill => {
        const animation = bubbleAnimations[skill.id];
        if (animation) {
          Animated.timing(animation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            // Remove from visible bubbles after animation
            setVisibleBubbles(prev => prev.filter(b => !relatedSkillIds.includes(b.id)));
          });
        }
      });
      
      // If no animations to wait for, remove immediately
      if (bubblesToRemove.length === 0) {
        setVisibleBubbles(prev => prev.filter(b => !relatedSkillIds.includes(b.id)));
      }
    } else {
      // Select this skill
      newSelectedSkills = [...selectedSkills, bubble.id];
      
      // Find related skills to show
      const relatedSkills = SKILL_DATA.filter(skill => 
        skill.parentId === bubble.id && !visibleBubbles.find(vb => vb.id === skill.id)
      );

      if (relatedSkills.length > 0) {
        // Find the index of the selected bubble
        const selectedIndex = visibleBubbles.findIndex(b => b.id === bubble.id);
        
        // Insert new bubbles after the selected bubble
        const newBubbles = [
          ...visibleBubbles.slice(0, selectedIndex + 1),
          ...relatedSkills,
          ...visibleBubbles.slice(selectedIndex + 1)
        ];
        
        setVisibleBubbles(newBubbles);

        // Animate new bubbles in
        relatedSkills.forEach(skill => {
          const animation = new Animated.Value(0);
          setBubbleAnimations(prev => ({ ...prev, [skill.id]: animation }));
          
          setTimeout(() => {
            Animated.spring(animation, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start();
          }, 100);
        });
      }
    }
    
    setSelectedSkills(newSelectedSkills);
  };

  const renderBubble = (bubble: SkillBubble) => {
    const isSelected = selectedSkills.includes(bubble.id);
    const animation = bubbleAnimations[bubble.id] || new Animated.Value(1);
    
    return (
      <Animated.View
        key={bubble.id}
        style={[
          styles.bubbleContainer,
          {
            transform: [{ scale: animation }],
            opacity: animation,
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bubble,
            {
              backgroundColor: isSelected ? colors.tint : colors.background,
              borderColor: isSelected ? colors.tint : colors.tabIconDefault,
            }
          ]}
          onPress={() => handleBubblePress(bubble)}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              styles.bubbleText,
              {
                color: isSelected ? 'white' : colors.text,
                fontSize: bubble.level === 'general' ? 16 : bubble.level === 'specific' ? 14 : 12,
              }
            ]}
          >
            {bubble.name}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>What are you good at?</ThemedText>
        <ThemedText style={styles.subtitle}>
          Tap on categories that interest you. We'll show you more specific options.
        </ThemedText>
      </View>

      <ScrollView 
        style={styles.bubblesContainer}
        contentContainerStyle={styles.bubblesContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bubblesGrid}>
          {visibleBubbles.map(renderBubble)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.skipButton, { borderColor: colors.tint }]}
          onPress={onSkip}
        >
          <ThemedText style={[styles.skipButtonText, { color: colors.tint }]}>
            Skip for now
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: selectedSkills.length > 0 ? colors.tint : colors.tabIconDefault,
            }
          ]}
          onPress={() => onComplete(selectedSkills)}
          disabled={selectedSkills.length === 0}
        >
          <ThemedText style={[styles.continueButtonText, { color: 'white' }]}>
            Continue ({selectedSkills.length})
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    alignItems: 'center',
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 5,
  },
  bubblesContainer: {
    flex: 1,
  },
  bubblesContent: {
    padding: 16,
    paddingTop: 0,
  },
  bubblesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  bubbleContainer: {
    marginBottom: 8,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    gap: 12,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 