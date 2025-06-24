import { Stack } from 'expo-router';
import React from 'react';

import { AuthGuard } from '@/components/AuthGuard';

export default function JobLayout() {
  return (
    <AuthGuard>
      <Stack>
        <Stack.Screen name="[id]" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
} 