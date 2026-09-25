import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { ProfessorHeader } from '@/components/professor-header';
import { useAlertModal } from '@/contexts/alert-modal';

// Sem caracteres que se confundem fácil (0/O, 1/I) - vai pro QR Code e pro
// campo de digitar manualmente, então precisa ser curto e fácil de bater o olho
const CARACTERES_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function gerarCodigoTurma() {
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += CARACTERES_CODIGO[Math.floor(Math.random() * CARACTERES_CODIGO.length)];
  }
  return codigo;
}

export default function NovaTurma() {
  const router = useRouter();
  const { alertar } = useAlertModal();
  const { turmaId } = useLocalSearchParams<{ turmaId?: string }>();
  const modoEdicao = !!turmaId;

  const [nome, setNome] = useState('');
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!turmaId) return;
    supabase
      .from('turmas')
      .select('nome')
      .eq('id', turmaId)
      .single()
      .then(({ data }) => {
        setNome(data?.nome ?? '');
        setCarregando(false);
      });
  }, [turmaId]);

  async function handleSalvar() {
    if (!nome.trim()) return;

    setSalvando(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSalvando(false);
      alertar('Sessão expirada', 'Faça login novamente.');
      router.replace('/(professor)/login');
      return;
    }

    if (modoEdicao) {
      // A policy de UPDATE não gera "error" quando bloqueia por RLS - ela só
      // devolve 0 linhas. Por isso confere data.length em vez de só o error.
      const { data, error } = await supabase
        .from('turmas')
        .update({ nome: nome.trim() })
        .eq('id', turmaId)
        .select();
      setSalvando(false);

      if (error) {
        alertar('Erro ao salvar turma', error.message);
        return;
      }
      if (!data || data.length === 0) {
        alertar('Não foi possível salvar', 'Você não tem permissão pra editar essa turma.');
        return;
      }

      router.back();
      return;
    }

    const { error } = await supabase.from('turmas').insert({
      nome: nome.trim(),
      professor_id: userData.user.id,
      codigo: gerarCodigoTurma(),
    });
    setSalvando(false);

    if (error) {
      alertar('Erro ao criar turma', error.message);
      return;
    }

    router.back();
  }

  return (
    <View style={styles.container}>
      <ProfessorHeader titulo={modoEdicao ? 'Editar Turma' : 'Nova Turma'} />

      <View style={styles.conteudo}>
        {carregando ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nome da turma (ex: Turma A)"
              value={nome}
              onChangeText={setNome}
            />
            <TouchableOpacity style={styles.botao} onPress={handleSalvar} disabled={salvando || !nome.trim()}>
              {salvando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.botaoTexto}>{modoEdicao ? 'Salvar Turma' : 'Criar Turma'}</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  conteudo: { padding: 24, gap: 16 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 14, fontSize: 16 },
  botao: { backgroundColor: '#1565C0', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
