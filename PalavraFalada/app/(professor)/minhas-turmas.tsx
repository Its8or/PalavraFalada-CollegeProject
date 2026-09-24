import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { ProfessorHeader } from '@/components/professor-header';

type Turma = { id: string; nome: string };

export default function MinhasTurmas() {
  const router = useRouter();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const buscarTurmas = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const { data, error } = await supabase.from('turmas').select('id, nome').order('nome');

    if (error) {
      setErro(error.message);
    } else {
      setTurmas(data ?? []);
    }
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      buscarTurmas();
    }, [buscarTurmas])
  );

  function handleExcluir(turma: Turma) {
    Alert.alert('Excluir turma?', `Isso vai apagar "${turma.nome}" e todas as tarefas dela. Essa ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setExcluindoId(turma.id);
          // Apaga as tarefas antes - não dá pra confiar que a FK de
          // tarefas.turma_id tem "on delete cascade" configurado
          await supabase.from('tarefas').delete().eq('turma_id', turma.id);

          // A policy de DELETE não gera "error" quando bloqueia por RLS -
          // ela só devolve 0 linhas. Por isso confere data.length também.
          const { data, error } = await supabase.from('turmas').delete().eq('id', turma.id).select();
          setExcluindoId(null);

          if (error) {
            Alert.alert('Erro ao excluir', error.message);
            return;
          }
          if (!data || data.length === 0) {
            Alert.alert('Não foi possível excluir', 'Você não tem permissão pra excluir essa turma.');
            return;
          }

          buscarTurmas();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ProfessorHeader
        titulo="Minhas Turmas"
        acaoDireita={
          <TouchableOpacity onPress={() => router.push('/(professor)/nova-turma')} style={styles.botaoAcao}>
            <Ionicons name="add-circle" size={26} color="#1565C0" />
          </TouchableOpacity>
        }
      />

      {carregando ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : erro ? (
        <Text style={styles.aviso}>Não foi possível carregar as turmas: {erro}</Text>
      ) : turmas.length === 0 ? (
        <Text style={styles.aviso}>Você ainda não tem turmas. Toque no + pra criar a primeira.</Text>
      ) : (
        <FlatList
          data={turmas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/(professor)/turma/[id]/tarefas', params: { id: item.id } })}
            >
              <View style={styles.icone}>
                <Ionicons name="people" size={22} color="#FFF" />
              </View>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(professor)/turma/[id]/qrcode', params: { id: item.id } })}
              >
                <Ionicons name="qr-code" size={22} color="#1565C0" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(professor)/nova-turma', params: { turmaId: item.id } })}
              >
                <Ionicons name="pencil" size={20} color="#1565C0" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleExcluir(item)} disabled={excluindoId === item.id}>
                {excluindoId === item.id ? (
                  <ActivityIndicator size="small" color="#D32F2F" />
                ) : (
                  <Ionicons name="trash" size={20} color="#D32F2F" />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  botaoAcao: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  aviso: { textAlign: 'center', color: '#5C6B73', marginTop: 40, paddingHorizontal: 30 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF',
    borderRadius: 14, padding: 14,
  },
  icone: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#64B5F6', alignItems: 'center', justifyContent: 'center' },
  cardNome: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0D47A1' },
});
