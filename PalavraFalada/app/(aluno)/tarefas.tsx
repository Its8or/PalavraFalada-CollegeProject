import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlunoTabBar } from '@/components/aluno-tab-bar';
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

      <View style={styles.banner}>
        <Ionicons name="locate" size={32} color="#FFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitulo}>Pequenos passos, grandes conquistas!</Text>
          <Text style={styles.bannerTexto}>Aqui estão as tarefas que você tem para hoje.</Text>
        </View>
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
                <View style={[styles.icone, { backgroundColor: config?.cor ?? '#999' }]}>
                  <Ionicons name={config?.icone ?? 'document-text'} size={22} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardPrefixo}>{config?.prefixo ?? 'Tarefa'}</Text>
                  <Text style={styles.cardConteudo}>{conteudo}</Text>
                  <Text style={styles.cardCategoria}>{config?.categoria ?? ''}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#1565C0" />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {usandoExemplo && turmaId ? (
        <Text style={styles.avisoExemplo}>Mostrando tarefas de exemplo (sem acesso à turma real ainda)</Text>
      ) : null}

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
  cardPrefixo: { fontSize: 13, color: '#37474F' },
  cardConteudo: { fontSize: 17, fontWeight: '700', color: '#0D47A1' },
  cardCategoria: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  avisoExemplo: { textAlign: 'center', fontSize: 11, color: '#B26A00', paddingBottom: 8 },
});
