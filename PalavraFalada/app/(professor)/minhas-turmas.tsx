import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';

type Turma = { id: string; nome: string };

export default function MinhasTurmas() {
  const router = useRouter();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0D47A1" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Minhas Turmas</Text>
        <TouchableOpacity onPress={() => router.push('/(professor)/nova-turma')}>
          <Ionicons name="add-circle" size={28} color="#1565C0" />
        </TouchableOpacity>
      </View>

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
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 10, backgroundColor: '#FFF',
  },
  headerTitulo: { fontSize: 18, fontWeight: 'bold', color: '#0D47A1' },
  aviso: { textAlign: 'center', color: '#5C6B73', marginTop: 40, paddingHorizontal: 30 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF',
    borderRadius: 14, padding: 14,
  },
  icone: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#64B5F6', alignItems: 'center', justifyContent: 'center' },
  cardNome: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0D47A1' },
});
