import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

export default function MessagesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ThemedView style={styles.header}>
        <ThemedText type="title">Messages</ThemedText>
        <ThemedText style={styles.subtitle}>
          Communicate with job seekers and employers here.
        </ThemedText>
      </ThemedView>
      <View style={styles.placeholder}>
        <ThemedText style={styles.placeholderText}>
          Your conversations will appear here.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  placeholderText: {
    fontSize: 18,
    opacity: 0.5,
    textAlign: 'center',
  },
}); 