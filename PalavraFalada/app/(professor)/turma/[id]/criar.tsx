import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { ProfessorHeader } from '@/components/professor-header';
import { TIPOS_TAREFA, identificarTipoPorTitulo, extrairConteudo } from '@/constants/tarefas';
import { useAlertModal } from '@/contexts/alert-modal';

// Formulário simplificado - só palavra, sem escolher tipo de tarefa. Toda
// tarefa nova sai como "falar_palavra"; tarefas antigas de outros tipos
// (completar/ouvir e repetir) continuam existindo e sendo lidas normalmente
// em outras telas via identificarTipoPorTitulo, só não dá mais pra criar
// esses tipos por aqui.
const TIPO_UNICO = TIPOS_TAREFA.find((config) => config.tipo === 'falar_palavra')!;

export default function CriarTarefa() {
  const { id: turmaId, tarefaId } = useLocalSearchParams<{ id: string; tarefaId?: string }>();
  const router = useRouter();
  const { alertar } = useAlertModal();
  const modoEdicao = !!tarefaId;

  const [palavra, setPalavra] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(modoEdicao);

  useEffect(() => {
    if (!tarefaId) return;
    supabase
      .from('tarefas')
      .select('titulo')
      .eq('id', tarefaId)
      .single()
      .then(({ data }) => {
        if (data?.titulo) {
          const config = identificarTipoPorTitulo(data.titulo);
          setPalavra(config ? extrairConteudo(data.titulo, config) : data.titulo);
        }
        setCarregando(false);
      });
  }, [tarefaId]);

  const conteudoValido = palavra.trim().length > 0;

  function montarTitulo() {
    return `${TIPO_UNICO.prefixo} ${palavra.trim().toUpperCase()}`;
  }

  async function handleSalvar() {
    if (!turmaId || !conteudoValido) return;

    setSalvando(true);
    try {
      if (modoEdicao) {
        // A policy de UPDATE não gera "error" quando bloqueia por RLS - ela só
        // devolve 0 linhas. Por isso confere data.length em vez de só o error.
        const { data, error } = await supabase
          .from('tarefas')
          .update({ titulo: montarTitulo() })
          .eq('id', tarefaId)
          .select();

        if (error) {
          alertar('Erro ao salvar tarefa', error.message);
          return;
        }
        if (!data || data.length === 0) {
          alertar('Não foi possível salvar', 'Você não tem permissão pra editar essa tarefa.');
          return;
        }

        router.back();
        return;
      }

      const { error } = await supabase.from('tarefas').insert({
        titulo: montarTitulo(),
        turma_id: turmaId,
      });

      if (error) {
        console.log('Erro ao salvar tarefa:', error);
        alertar('Erro ao salvar tarefa', error.message);
        return;
      }

      router.back();
    } catch (erroInesperado) {
      console.log('Erro inesperado ao salvar tarefa:', erroInesperado);
      alertar('Erro inesperado ao salvar tarefa', String(erroInesperado));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <ProfessorHeader titulo={modoEdicao ? 'Editar Tarefa' : 'Nova Tarefa'} turmaId={turmaId} />

      {carregando ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.conteudo}>
          <Text style={styles.label}>Palavra</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: BOLA"
            value={palavra}
            onChangeText={setPalavra}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[styles.salvarBotao, !conteudoValido && styles.salvarBotaoDesabilitado]}
            onPress={handleSalvar}
            disabled={!conteudoValido || salvando}
          >
            {salvando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.salvarTexto}>Salvar Tarefa</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  conteudo: { padding: 20 },
  label: { fontSize: 14, color: '#555', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 8, fontSize: 16 },
  salvarBotao: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  salvarBotaoDesabilitado: { opacity: 0.5 },
  salvarTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
