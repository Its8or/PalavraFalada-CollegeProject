import { Stack } from 'expo-router';
import { AlertModalProvider } from '@/contexts/alert-modal';

export default function Layout() {
  return (
    <AlertModalProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Início' }} />
        <Stack.Screen name="(professor)" />
      </Stack>
    </AlertModalProvider>
  );
}