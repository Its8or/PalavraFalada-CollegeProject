import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { ProfessorHeader } from '@/components/professor-header';
import { TarefaCard } from '@/components/tarefa-card';

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
      <ProfessorHeader
        titulo="Tarefas"
        turmaId={turmaId}
        acaoDireita={
          <TouchableOpacity
            style={styles.botaoNovo}
            onPress={() => router.push({ pathname: '/(professor)/turma/[id]/criar', params: { id: turmaId } })}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        }
      />

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
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item }) => (
            <TarefaCard
              titulo={item.titulo}
              onPress={() =>
                router.push({
                  pathname: '/(professor)/turma/[id]/tarefa/[tarefaId]',
                  params: { id: turmaId, tarefaId: item.id },
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  botaoNovo: { backgroundColor: '#007AFF', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  vazio: { textAlign: 'center', color: '#888', marginTop: 40 },
  erro: { textAlign: 'center', color: '#D32F2F', marginTop: 40, paddingHorizontal: 20 },
});
