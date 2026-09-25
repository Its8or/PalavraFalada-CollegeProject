import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { TarefaCard } from '@/components/tarefa-card';
import { TAREFAS_EXEMPLO } from '@/constants/tarefas';

type Tarefa = { id: string; titulo: string };

export default function TarefasDaTurma() {
  const router = useRouter();
  const { nome, turmaId } = useLocalSearchParams<{ nome?: string; turmaId?: string }>();

  const [tarefas, setTarefas] = useState<Tarefa[]>(TAREFAS_EXEMPLO);
  const [carregando, setCarregando] = useState(false);
  const [usandoExemplo, setUsandoExemplo] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const buscarTarefas = useCallback(async () => {
    // Sem turma vinculada ainda (aluno entrou sem escanear QR Code): fica no mock de exemplo
    if (!turmaId) {
      setTarefas(TAREFAS_EXEMPLO);
      setUsandoExemplo(true);
      setErro(null);
      return;
    }

    setCarregando(true);
    setUsandoExemplo(false);
    const { data, error } = await supabase
      .from('tarefas')
      .select('id, titulo')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: false });
    setCarregando(false);

    if (error) {
      setErro(error.message);
      setTarefas([]);
      return;
    }

    setErro(null);
    setTarefas(data ?? []);
  }, [turmaId]);

  useFocusEffect(
    useCallback(() => {
      buscarTarefas();
    }, [buscarTarefas])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0D47A1" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Tarefas</Text>
        <View style={{ width: 24 }} />
      </View>

      {carregando ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : erro ? (
        <Text style={styles.aviso}>Não foi possível carregar as tarefas: {erro}</Text>
      ) : tarefas.length === 0 ? (
        <Text style={styles.aviso}>Nenhuma tarefa por aqui ainda.</Text>
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 10, gap: 12 }}
          renderItem={({ item }) => (
            <TarefaCard
              titulo={item.titulo}
              onPress={() =>
                router.push({
                  pathname: '/(aluno)/tarefa/[id]',
                  params: { id: item.id, titulo: item.titulo, nome, turmaId },
                })
              }
            />
          )}
        />
      )}

      {usandoExemplo ? (
        <Text style={styles.avisoExemplo}>Mostrando tarefas de exemplo (nenhuma turma escaneada ainda)</Text>
      ) : null}
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
  aviso: { textAlign: 'center', color: '#5C6B73', marginTop: 40, paddingHorizontal: 30 },
  avisoExemplo: { textAlign: 'center', fontSize: 11, color: '#B26A00', paddingBottom: 8 },
});
