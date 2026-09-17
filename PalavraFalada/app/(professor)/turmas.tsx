import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';

type Turma = { id: string; nome: string };
type Aluno = { id: string; nome: string };

export default function TurmasScreen() {
  const router = useRouter();
  const [nomeProfessor, setNomeProfessor] = useState('Professor');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[] | null>(null);

  const carregar = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const nome = (userData.user.user_metadata?.nome as string | undefined) ?? userData.user.email ?? 'Professor';
      setNomeProfessor(nome);
    }

    const { data: turmasData } = await supabase.from('turmas').select('id, nome').order('nome');
    setTurmas(turmasData ?? []);

    // Tabela "alunos" ainda não existe no schema atual - se não existir, não quebra a tela
    const { data: alunosData, error: alunosError } = await supabase.from('alunos').select('id, nome').limit(10);
    setAlunos(alunosError ? null : (alunosData ?? []));
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function handleQrCode() {
    if (turmas.length === 0) {
      Alert.alert('Nenhuma turma ainda', 'Crie uma turma primeiro pra gerar o QR Code dela.');
      return;
    }
    router.push({ pathname: '/(professor)/turma/[id]/qrcode', params: { id: turmas[0].id } });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 50 }}>
        <View style={styles.header}>
          <View style={styles.logoLinha}>
            <Ionicons name="book" size={30} color="#1565C0" />
            <View>
              <Text style={styles.logoPalavra}>Palavra</Text>
              <Text style={styles.logoFalada}>Falada</Text>
            </View>
          </View>
          <View style={styles.perfil}>
            <Ionicons name="person-circle" size={30} color="#90CAF9" />
            <Text style={styles.perfilNome} numberOfLines={1}>{nomeProfessor}</Text>
          </View>
        </View>
        <Text style={styles.subtitulo}>Professor</Text>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/(professor)/minhas-turmas')}>
          <View style={[styles.cardIcone, { backgroundColor: '#64B5F6' }]}>
            <Ionicons name="people" size={26} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitulo}>Minhas Turmas</Text>
            <Text style={styles.cardTexto}>Gerencie suas turmas e veja o progresso dos seus alunos.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#1565C0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleQrCode}>
          <View style={[styles.cardIcone, { backgroundColor: '#81C784' }]}>
            <Ionicons name="qr-code" size={26} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitulo}>Qr Code</Text>
            <Text style={styles.cardTexto}>Acesse a turma rapidamente com o código.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#1565C0" />
        </TouchableOpacity>

        <View style={styles.alunosHeader}>
          <Ionicons name="people" size={20} color="#1565C0" />
          <Text style={styles.alunosTitulo}>Alunos</Text>
        </View>

        <View style={styles.listaAlunos}>
          {alunos === null ? (
            <Text style={styles.alunosAviso}>Cadastro de alunos ainda não disponível.</Text>
          ) : alunos.length === 0 ? (
            <Text style={styles.alunosAviso}>Nenhum aluno entrou em uma turma ainda.</Text>
          ) : (
            alunos.map((aluno, index) => (
              <View key={aluno.id} style={[styles.alunoItem, index === alunos.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={20} color="#FFF" />
                </View>
                <Text style={styles.alunoNome}>{aluno.nome}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.botaoNovo} onPress={() => router.push('/(professor)/nova-turma')}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoLinha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoPalavra: { fontSize: 16, fontWeight: 'bold', color: '#0D47A1' },
  logoFalada: { fontSize: 16, fontWeight: 'bold', color: '#1E88E5', marginTop: -4 },
  perfil: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: 140 },
  perfilNome: { fontWeight: 'bold', color: '#0D47A1' },
  subtitulo: { fontSize: 22, fontWeight: 'bold', color: '#0D47A1', marginTop: 12, marginBottom: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF',
    borderRadius: 16, padding: 16, marginBottom: 14,
  },
  cardIcone: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: '#0D47A1' },
  cardTexto: { fontSize: 13, color: '#5C6B73', marginTop: 2 },
  alunosHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 10 },
  alunosTitulo: { fontSize: 20, fontWeight: 'bold', color: '#0D47A1' },
  listaAlunos: { backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16 },
  alunosAviso: { paddingVertical: 20, textAlign: 'center', color: '#8E8E93' },
  alunoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#90CAF9', alignItems: 'center', justifyContent: 'center' },
  alunoNome: { flex: 1, fontWeight: 'bold', color: '#0D47A1' },
  botaoNovo: {
    position: 'absolute', right: 24, bottom: 30, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1565C0', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
});
