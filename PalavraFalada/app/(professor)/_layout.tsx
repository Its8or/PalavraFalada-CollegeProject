import { Stack } from 'expo-router';

export default function ProfessorLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="turmas" options={{ title: 'Minhas Turmas' }} />
      <Stack.Screen name="nova-tarefa" options={{ title: 'Nova Tarefa' }} />
    </Stack>
  );
}