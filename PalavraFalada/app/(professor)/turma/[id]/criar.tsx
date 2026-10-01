import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { ProfessorHeader } from '@/components/professor-header';
import { TIPOS_TAREFA, TipoTarefa, identificarTipoPorTitulo, extrairConteudo } from '@/constants/tarefas';
import { buscarEmoji } from '@/constants/palavras-emoji';
import { useAlertModal } from '@/contexts/alert-modal';

// Formulário com 2 tipos pra escolher: "falar a palavra" (padrão, só ouvir e
// repetir) e "completar a palavra" (jogo de montar tocando nas letras).
// Tarefas antigas de outros tipos (ouvir_repetir/ler_palavra) continuam
// existindo e sendo lidas normalmente nas outras telas, só não dá pra criar
// esses tipos por aqui - ao editar uma tarefa assim, ela vira "falar_palavra".
const TIPOS_DISPONIVEIS: TipoTarefa[] = ['falar_palavra', 'completar_palavra'];

export default function CriarTarefa() {
  const { id: turmaId, tarefaId } = useLocalSearchParams<{ id: string; tarefaId?: string }>();
  const router = useRouter();
  const { alertar } = useAlertModal();
  const modoEdicao = !!tarefaId;

  const [tipo, setTipo] = useState<TipoTarefa>('falar_palavra');
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
          setTipo(config?.tipo === 'completar_palavra' ? 'completar_palavra' : 'falar_palavra');
        }
        setCarregando(false);
      });
  }, [tarefaId]);

  const conteudoValido = palavra.trim().length > 0;
  const emojiPreview = tipo === 'completar_palavra' ? buscarEmoji(palavra.trim()) : null;

  function montarTitulo() {
    const tipoSelecionado = TIPOS_TAREFA.find((config) => config.tipo === tipo)!;
    return `${tipoSelecionado.prefixo} ${palavra.trim().toUpperCase()}`;
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
          <Text style={styles.label}>Tipo de tarefa</Text>
          <View style={styles.tipos}>
            {TIPOS_DISPONIVEIS.map((tipoOpcao) => {
              const config = TIPOS_TAREFA.find((c) => c.tipo === tipoOpcao)!;
              const selecionado = tipo === tipoOpcao;
              return (
                <TouchableOpacity
                  key={tipoOpcao}
                  style={[styles.tipoBotao, { backgroundColor: selecionado ? config.cor : '#EEE' }]}
                  onPress={() => setTipo(tipoOpcao)}
                >
                  <Text style={{ color: selecionado ? '#FFF' : '#333', fontWeight: '600' }}>
                    {tipoOpcao === 'completar_palavra' ? 'Completar a palavra' : 'Falar a palavra'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Palavra</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: BOLA"
            value={palavra}
            onChangeText={setPalavra}
            autoCapitalize="characters"
          />

          {tipo === 'completar_palavra' && (
            <Text style={styles.dicaEmoji}>
              {emojiPreview
                ? `O jogo vai mostrar essa figura: ${emojiPreview}`
                : 'Essa palavra não tem figura cadastrada - o jogo funciona igual, só sem imagem.'}
            </Text>
          )}

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
  tipos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipoBotao: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 8, fontSize: 16 },
  dicaEmoji: { fontSize: 13, color: '#8E8E93', marginTop: 8 },
  salvarBotao: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  salvarBotaoDesabilitado: { opacity: 0.5 },
  salvarTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
