import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { ProfessorHeader } from '@/components/professor-header';
import { TarefaPratica } from '@/components/tarefa-pratica';
import { JogoMontarPalavra } from '@/components/jogo-montar-palavra';
import { identificarTipoPorTitulo, extrairConteudo } from '@/constants/tarefas';
import { useAlertModal } from '@/contexts/alert-modal';

// Mesma tela de prática que o aluno vê (palavra, letras separadas, botão de
// ouvir) - só sem o botão de confirmar, já que o professor está revisando,
// não praticando.
export default function TarefaDoProfessor() {
  const { id: turmaId, tarefaId } = useLocalSearchParams<{ id: string; tarefaId: string }>();
  const router = useRouter();
  const { alertar } = useAlertModal();

  const [titulo, setTitulo] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    supabase
      .from('tarefas')
      .select('titulo')
      .eq('id', tarefaId)
      .single()
      .then(({ data }) => {
        setTitulo(data?.titulo ?? null);
        setCarregando(false);
      });
  }, [tarefaId]);

  async function handleExcluir() {
    alertar('Excluir tarefa?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setExcluindo(true);
          // A policy de DELETE não gera "error" quando bloqueia por RLS - ela
          // só devolve 0 linhas. Por isso confere data.length em vez de só o error.
          const { data, error } = await supabase.from('tarefas').delete().eq('id', tarefaId).select();
          setExcluindo(false);

          if (error) {
            alertar('Erro ao excluir', error.message);
            return;
          }
          if (!data || data.length === 0) {
            alertar('Não foi possível excluir', 'Você não tem permissão pra excluir essa tarefa.');
            return;
          }

          router.back();
        },
      },
    ]);
  }

  const config = titulo ? identificarTipoPorTitulo(titulo) : null;

  return (
    <View style={styles.container}>
      <ProfessorHeader
        titulo="Tarefa"
        turmaId={turmaId}
        acaoDireita={
          <>
            <TouchableOpacity
              style={styles.botaoAcao}
              onPress={() => router.push({ pathname: '/(professor)/turma/[id]/criar', params: { id: turmaId, tarefaId } })}
            >
              <Ionicons name="pencil" size={20} color="#1565C0" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoAcao} onPress={handleExcluir} disabled={excluindo}>
              {excluindo ? <ActivityIndicator size="small" color="#D32F2F" /> : <Ionicons name="trash" size={20} color="#D32F2F" />}
            </TouchableOpacity>
          </>
        }
      />

      {carregando ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : !titulo ? (
        <Text style={styles.aviso}>Não foi possível carregar essa tarefa.</Text>
      ) : config?.tipo === 'completar_palavra' ? (
        <JogoMontarPalavra key={tarefaId} palavra={extrairConteudo(titulo, config)} />
      ) : (
        <TarefaPratica titulo={titulo} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  botaoAcao: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  aviso: { textAlign: 'center', color: '#5C6B73', marginTop: 40, paddingHorizontal: 30 },
});
