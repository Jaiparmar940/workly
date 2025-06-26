import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Profile',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
} 