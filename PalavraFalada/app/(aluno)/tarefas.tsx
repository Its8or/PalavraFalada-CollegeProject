import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlunoTabBar } from '@/components/aluno-tab-bar';
import { TAREFAS_EXEMPLO, identificarTipoPorTitulo } from '@/constants/tarefas';

export default function TarefasDaTurma() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0D47A1" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Tarefas</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.banner}>
        <Ionicons name="flag" size={32} color="#FFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitulo}>Pequenos passos, grandes conquistas!</Text>
          <Text style={styles.bannerTexto}>Aqui estão as tarefas que você tem para hoje.</Text>
        </View>
      </View>

      <FlatList
        data={TAREFAS_EXEMPLO}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 10, gap: 12 }}
        renderItem={({ item }) => {
          const config = identificarTipoPorTitulo(item.titulo);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/(aluno)/tarefa/[id]', params: { id: item.id, titulo: item.titulo } })}
            >
              <View style={[styles.icone, { backgroundColor: config?.cor ?? '#999' }]}>
                <Ionicons name={config?.icone ?? 'document-text'} size={22} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitulo}>{item.titulo}</Text>
                <Text style={styles.cardCategoria}>{config?.categoria ?? 'Tarefa'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1565C0" />
            </TouchableOpacity>
          );
        }}
      />

      <AlunoTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 10,
  },
  headerTitulo: { fontSize: 20, fontWeight: 'bold', color: '#0D47A1' },
  banner: {
    flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: '#1565C0',
    marginHorizontal: 20, borderRadius: 16, padding: 18,
  },
  bannerTitulo: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  bannerTexto: { color: '#D6EBFB', fontSize: 12, marginTop: 4 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F5F9FF',
    borderRadius: 14, padding: 14,
  },
  icone: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: '#0D47A1' },
  cardCategoria: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
});
