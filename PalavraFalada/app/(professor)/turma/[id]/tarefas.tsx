import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { identificarTipoPorTitulo } from '@/constants/tarefas';

type Tarefa = {
  id: string;
  titulo: string;
  turma_id: string;
  created_at: string | null;
};

export default function TarefasDaTurma() {
  const { id: turmaId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const buscarTarefas = useCallback(async () => {
    if (!turmaId) return;

    setCarregando(true);
    setErro(null);
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: false });

    if (error) {
      setErro(error.message);
    } else {
      setTarefas(data ?? []);
    }
    setCarregando(false);
  }, [turmaId]);

  // Recarrega sempre que a tela volta a ficar em foco, ex: depois de criar uma tarefa nova
  useFocusEffect(
    useCallback(() => {
      buscarTarefas();
    }, [buscarTarefas])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Tarefas</Text>
        <TouchableOpacity
          style={styles.botaoNovo}
          onPress={() => router.push({ pathname: '/(professor)/turma/[id]/criar', params: { id: turmaId } })}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : erro ? (
        <Text style={styles.erro}>Não foi possível carregar as tarefas: {erro}</Text>
      ) : tarefas.length === 0 ? (
        <Text style={styles.vazio}>Nenhuma tarefa criada ainda para esta turma.</Text>
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const info = identificarTipoPorTitulo(item.titulo);
            return (
              <View style={styles.card}>
                <View style={[styles.icone, { backgroundColor: info?.cor ?? '#999' }]}>
                  <Ionicons name={info?.icone ?? 'document-text'} size={22} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tituloTarefa}>{item.titulo}</Text>
                  <Text style={styles.categoria}>{info?.categoria ?? 'Tarefa'}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitulo: { fontSize: 22, fontWeight: 'bold' },
  botaoNovo: { backgroundColor: '#007AFF', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  vazio: { textAlign: 'center', color: '#888', marginTop: 40 },
  erro: { textAlign: 'center', color: '#D32F2F', marginTop: 40, paddingHorizontal: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', padding: 14, borderRadius: 12, marginBottom: 12, gap: 12 },
  icone: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tituloTarefa: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  categoria: { fontSize: 13, color: '#888', marginTop: 2 },
});
