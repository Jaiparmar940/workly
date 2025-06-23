import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { JobCategory, JobComplexity, JobType } from '../types';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  filters: FilterOptions;
}

export interface FilterOptions {
  category?: JobCategory;
  type?: JobType;
  complexity?: JobComplexity;
  isRemote?: boolean;
  budgetRange?: {
    min: number;
    max: number;
  };
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearch,
  onFilterChange,
  filters
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const FilterChip = ({ 
    label, 
    selected, 
    onPress 
  }: { 
    label: string; 
    selected: boolean; 
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: selected ? colors.tint : colors.background,
          borderColor: colors.tint,
        }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterChipText,
        { color: selected ? 'white' : colors.tint }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search jobs..."
          placeholderTextColor={colors.tabIconDefault}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.tint }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
              Job Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {Object.values(JobCategory).slice(0, 10).map((category) => (
                  <FilterChip
                    key={category}
                    label={category}
                    selected={filters.category === category}
                    onPress={() => handleFilterChange('category', 
                      filters.category === category ? undefined : category
                    )}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
              Job Type
            </Text>
            <View style={styles.filterChips}>
              {Object.values(JobType).map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  selected={filters.type === type}
                  onPress={() => handleFilterChange('type', 
                    filters.type === type ? undefined : type
                  )}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
              Complexity
            </Text>
            <View style={styles.filterChips}>
              {Object.values(JobComplexity).map((complexity) => (
                <FilterChip
                  key={complexity}
                  label={complexity}
                  selected={filters.complexity === complexity}
                  onPress={() => handleFilterChange('complexity', 
                    filters.complexity === complexity ? undefined : complexity
                  )}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
              Location
            </Text>
            <View style={styles.filterChips}>
              <FilterChip
                label="Remote Only"
                selected={filters.isRemote === true}
                onPress={() => handleFilterChange('isRemote', 
                  filters.isRemote === true ? undefined : true
                )}
              />
              <FilterChip
                label="On-site Only"
                selected={filters.isRemote === false}
                onPress={() => handleFilterChange('isRemote', 
                  filters.isRemote === false ? undefined : false
                )}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: colors.tabIconDefault }]}
            onPress={clearFilters}
          >
            <Text style={styles.clearButtonText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 