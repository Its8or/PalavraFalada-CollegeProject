import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Barra fixa só visual, seguindo o design; não é um Tabs navigator de verdade
export function AlunoTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { nome, turmaId } = useLocalSearchParams<{ nome?: string; turmaId?: string }>();

  const tarefasAtivo = pathname === '/(aluno)/tarefas';
  const perfilAtivo = pathname === '/(aluno)/perfil';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push({ pathname: '/(aluno)/tarefas', params: { nome, turmaId } })}
      >
        <Ionicons name={tarefasAtivo ? 'clipboard' : 'clipboard-outline'} size={22} color={tarefasAtivo ? '#007AFF' : '#8E8E93'} />
        <Text style={[styles.label, tarefasAtivo && styles.labelAtivo]}>Tarefas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push({ pathname: '/(aluno)/perfil', params: { nome, turmaId } })}
      >
        <Ionicons name={perfilAtivo ? 'person' : 'person-outline'} size={22} color={perfilAtivo ? '#007AFF' : '#8E8E93'} />
        <Text style={[styles.label, perfilAtivo && styles.labelAtivo]}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFF',
    paddingTop: 8,
    paddingBottom: 16,
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  label: { fontSize: 12, color: '#8E8E93' },
  labelAtivo: { color: '#007AFF', fontWeight: '600' },
});
