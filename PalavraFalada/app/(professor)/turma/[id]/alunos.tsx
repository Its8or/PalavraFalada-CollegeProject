import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { ProfessorHeader } from '@/components/professor-header';

type Aluno = { id: string; nome: string };

export default function AlunosNaTurma() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [alunos, setAlunos] = useState<Aluno[] | null>(null);
  const [carregando, setCarregando] = useState(true);

  const buscarAlunos = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase.from('alunos').select('id, nome').eq('turma_id', id);
    setAlunos(error ? null : (data ?? []));
    setCarregando(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      buscarAlunos();
    }, [buscarAlunos])
  );

  return (
    <View style={styles.container}>
      <ProfessorHeader titulo="Alunos da Turma" />

      {carregando ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : alunos === null ? (
        <Text style={styles.aviso}>Não foi possível carregar os alunos dessa turma.</Text>
      ) : alunos.length === 0 ? (
        <Text style={styles.aviso}>Nenhum aluno entrou nessa turma ainda.</Text>
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color="#FFF" />
              </View>
              <Text style={styles.nome}>{item.nome}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  aviso: { textAlign: 'center', color: '#5C6B73', marginTop: 40, paddingHorizontal: 30 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF', borderRadius: 14, padding: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#90CAF9', alignItems: 'center', justifyContent: 'center' },
  nome: { fontWeight: 'bold', color: '#0D47A1' },
});
