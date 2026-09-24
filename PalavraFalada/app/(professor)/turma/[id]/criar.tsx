import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { ProfessorHeader } from '@/components/professor-header';
import { TIPOS_TAREFA, TipoTarefa, identificarTipoPorTitulo, extrairConteudo } from '@/constants/tarefas';

// Só o tipo "ouvir_repetir" salva o título como "Ouvir e repetir B + A = BA" -
// pra editar precisa separar de volta em letraA/letraB (os outros tipos já
// vêm prontos de extrairConteudo)
const REGEX_BLEND = /^(.+) \+ (.+) = .+$/;

export default function CriarTarefa() {
  const { id: turmaId, tarefaId } = useLocalSearchParams<{ id: string; tarefaId?: string }>();
  const router = useRouter();
  const modoEdicao = !!tarefaId;

  const [tipo, setTipo] = useState<TipoTarefa>('falar_palavra');
  const [palavra, setPalavra] = useState('');
  const [letraA, setLetraA] = useState('');
  const [letraB, setLetraB] = useState('');
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
        if (!data?.titulo) {
          setCarregando(false);
          return;
        }
        const config = identificarTipoPorTitulo(data.titulo);
        if (config) {
          setTipo(config.tipo);
          const conteudo = extrairConteudo(data.titulo, config);
          if (config.tipo === 'ouvir_repetir') {
            const match = conteudo.match(REGEX_BLEND);
            setLetraA(match?.[1] ?? '');
            setLetraB(match?.[2] ?? '');
          } else {
            setPalavra(conteudo);
          }
        }
        setCarregando(false);
      });
  }, [tarefaId]);

  const tipoSelecionado = TIPOS_TAREFA.find((config) => config.tipo === tipo)!;

  const conteudoValido =
    tipo === 'ouvir_repetir'
      ? letraA.trim().length > 0 && letraB.trim().length > 0
      : palavra.trim().length > 0;

  function montarTitulo() {
    if (tipo === 'ouvir_repetir') {
      const a = letraA.trim().toUpperCase();
      const b = letraB.trim().toUpperCase();
      return `${tipoSelecionado.prefixo} ${a} + ${b} = ${a}${b}`;
    }
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
          Alert.alert('Erro ao salvar tarefa', error.message);
          return;
        }
        if (!data || data.length === 0) {
          Alert.alert('Não foi possível salvar', 'Você não tem permissão pra editar essa tarefa.');
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
        Alert.alert('Erro ao salvar tarefa', error.message);
        return;
      }

      router.back();
    } catch (erroInesperado) {
      console.log('Erro inesperado ao salvar tarefa:', erroInesperado);
      Alert.alert('Erro inesperado ao salvar tarefa', String(erroInesperado));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <ProfessorHeader titulo={modoEdicao ? 'Editar Tarefa' : 'Nova Tarefa'} />

      {carregando ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.conteudo}>
          <Text style={styles.label}>Tipo de tarefa</Text>
          <View style={styles.tipos}>
            {TIPOS_TAREFA.map((config) => (
              <TouchableOpacity
                key={config.tipo}
                style={[styles.tipoBotao, { backgroundColor: tipo === config.tipo ? config.cor : '#EEE' }]}
                onPress={() => setTipo(config.tipo)}
              >
                <Text style={{ color: tipo === config.tipo ? '#FFF' : '#333', fontWeight: '600' }}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tipo === 'ouvir_repetir' ? (
            <>
              <Text style={styles.label}>Primeira letra/sílaba</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: B"
                value={letraA}
                onChangeText={setLetraA}
                autoCapitalize="characters"
              />
              <Text style={styles.label}>Segunda letra/sílaba</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: A"
                value={letraB}
                onChangeText={setLetraB}
                autoCapitalize="characters"
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>
                {tipo === 'completar_palavra' ? 'Palavra com lacuna (use _ pra marcar o espaço)' : 'Palavra'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={tipo === 'completar_palavra' ? 'Ex: CA_SA' : 'Ex: BOLA'}
                value={palavra}
                onChangeText={setPalavra}
                autoCapitalize="characters"
              />
            </>
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
  salvarBotao: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  salvarBotaoDesabilitado: { opacity: 0.5 },
  salvarTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
