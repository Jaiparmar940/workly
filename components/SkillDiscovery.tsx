import React from 'react';
import SkillBubbleDiscovery from './SkillBubbleDiscovery';

interface SkillDiscoveryProps {
  onComplete: (skills: string[]) => void;
  onSkip: () => void;
  userName: string;
}

export default function SkillDiscovery({ onComplete, onSkip }: SkillDiscoveryProps) {
  return (
    <SkillBubbleDiscovery
      onComplete={onComplete}
      onSkip={onSkip}
    />
  );
} 