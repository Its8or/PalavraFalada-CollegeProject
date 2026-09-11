import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Início' }} />
      <Stack.Screen name="(professor)" />
      <Stack.Screen name="(aluno)" />
    </Stack>
  );
}