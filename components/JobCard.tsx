import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { Job, JobStatus } from '../types';

interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
  showMatchScore?: boolean;
  matchScore?: number;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onPress, 
  showMatchScore = false, 
  matchScore 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.OPEN:
        return '#4CAF50';
      case JobStatus.IN_PROGRESS:
        return '#FF9800';
      case JobStatus.COMPLETED:
        return '#2196F3';
      case JobStatus.CANCELLED:
        return '#F44336';
      case JobStatus.EXPIRED:
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const formatBudget = () => {
    if (job.budget.min === job.budget.max) {
      return `$${job.budget.min.toLocaleString()}`;
    }
    return `$${job.budget.min.toLocaleString()} - $${job.budget.max.toLocaleString()}`;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.background }]} 
      onPress={() => onPress(job)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {job.title}
          </Text>
          {showMatchScore && matchScore && (
            <View style={styles.matchScoreContainer}>
              <Text style={styles.matchScoreText}>{matchScore}%</Text>
              <Text style={styles.matchScoreLabel}>Match</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusText}>{job.status}</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.text }]} numberOfLines={3}>
        {job.description}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>Budget:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{formatBudget()}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>Type:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{job.type}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>Location:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {job.location.isRemote ? 'Remote' : `${job.location.city}, ${job.location.state}`}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>Posted:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {format(job.createdAt, 'MMM dd, yyyy')}
          </Text>
        </View>
      </View>

      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: colors.tint + '20' }]}>
          <Text style={[styles.tagText, { color: colors.tint }]}>{job.category}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: colors.tint + '20' }]}>
          <Text style={[styles.tagText, { color: colors.tint }]}>{job.complexity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  matchScoreContainer: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  matchScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchScoreLabel: {
    color: 'white',
    fontSize: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 