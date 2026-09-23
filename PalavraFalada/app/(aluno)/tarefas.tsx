import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { TAREFAS_EXEMPLO, identificarTipoPorTitulo, extrairConteudo } from '@/constants/tarefas';

type Tarefa = { id: string; titulo: string };

export default function TarefasDaTurma() {
  const router = useRouter();
  const { nome, turmaId } = useLocalSearchParams<{ nome?: string; turmaId?: string }>();

  const [tarefas, setTarefas] = useState<Tarefa[]>(TAREFAS_EXEMPLO);
  const [carregando, setCarregando] = useState(false);
  const [usandoExemplo, setUsandoExemplo] = useState(true);

  const buscarTarefas = useCallback(async () => {
    // Sem turma vinculada ainda (aluno entrou sem escanear QR Code): fica no mock de exemplo
    if (!turmaId) {
      setTarefas(TAREFAS_EXEMPLO);
      setUsandoExemplo(true);
      return;
    }

    setCarregando(true);
    const { data, error } = await supabase
      .from('tarefas')
      .select('id, titulo')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: false });
    setCarregando(false);

    // Sem policy pública de leitura pro aluno ainda, o select acima é barrado por RLS -
    // nesse caso caímos de volta pro exemplo em vez de mostrar tela vazia/quebrada
    if (error || !data || data.length === 0) {
      setTarefas(TAREFAS_EXEMPLO);
      setUsandoExemplo(true);
      return;
    }

    setTarefas(data);
    setUsandoExemplo(false);
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
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 10, gap: 12 }}
          renderItem={({ item }) => {
            const config = identificarTipoPorTitulo(item.titulo);
            const conteudo = config ? extrairConteudo(item.titulo, config) : item.titulo;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/(aluno)/tarefa/[id]',
                    params: { id: item.id, titulo: item.titulo, nome, turmaId },
                  })
                }
              >
                <Text style={styles.cardConteudo}>{conteudo}</Text>
                <Ionicons name="chevron-forward" size={20} color="#1565C0" />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {usandoExemplo && turmaId ? (
        <Text style={styles.avisoExemplo}>Mostrando tarefas de exemplo (sem acesso à turma real ainda)</Text>
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
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14,
    backgroundColor: '#F5F9FF', borderRadius: 14, padding: 16,
  },
  cardConteudo: { fontSize: 17, fontWeight: '700', color: '#0D47A1' },
  avisoExemplo: { textAlign: 'center', fontSize: 11, color: '#B26A00', paddingBottom: 8 },
});
