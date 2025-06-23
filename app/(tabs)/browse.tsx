import { JobCard } from '@/components/JobCard';
import { FilterOptions, SearchAndFilter } from '@/components/SearchAndFilter';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FirebaseService } from '@/services/firebaseService';
import { Job } from '@/types';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, View } from 'react-native';

export default function BrowseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters, searchQuery]);

  const loadJobs = async () => {
    try {
      const allJobs = await FirebaseService.getAllJobs();
      setJobs(allJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const applyFilters = async () => {
    try {
      let filtered = [...jobs];

      // Apply search filter
      if (searchQuery.trim()) {
        const searchResults = await FirebaseService.searchJobs(searchQuery);
        filtered = searchResults;
      }

      // Apply category filter
      if (filters.category) {
        const categoryJobs = await FirebaseService.getJobsByCategory(filters.category);
        filtered = filtered.filter(job => categoryJobs.some(catJob => catJob.id === job.id));
      }

      // Apply type filter
      if (filters.type) {
        const typeJobs = await FirebaseService.getJobsByType(filters.type);
        filtered = filtered.filter(job => typeJobs.some(typeJob => typeJob.id === job.id));
      }

      // Apply complexity filter
      if (filters.complexity) {
        filtered = filtered.filter(job => job.complexity === filters.complexity);
      }

      // Apply location filter
      if (filters.isRemote !== undefined) {
        filtered = filtered.filter(job => job.location.isRemote === filters.isRemote);
      }

      // Apply budget filter
      if (filters.budgetRange) {
        filtered = filtered.filter(job =>
          job.budget.min >= filters.budgetRange!.min &&
          job.budget.max <= filters.budgetRange!.max
        );
      }

      setFilteredJobs(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredJobs([]);
    }
  };

  const handleJobPress = (job: Job) => {
    console.log('Job pressed:', job.title);
    // In a real app, navigate to job details
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <JobCard
      job={item}
      onPress={handleJobPress}
    />
  );

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyState}>
      <ThemedText type="subtitle">No jobs found</ThemedText>
      <ThemedText style={styles.emptyStateText}>
        Try adjusting your search or filters to find more opportunities.
      </ThemedText>
    </ThemedView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <SearchAndFilter
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filters={filters}
        />
      </View>
      
      <FlatList
        data={filteredJobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          <ThemedText style={styles.resultsCount}>
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </ThemedText>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 100, // Account for tab bar
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
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
}); 