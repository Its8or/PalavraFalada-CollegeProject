import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';

export default function NovaTurma() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleCriar() {
    if (!nome.trim()) return;

    setSalvando(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSalvando(false);
      Alert.alert('Sessão expirada', 'Faça login novamente.');
      router.replace('/(professor)/login');
      return;
    }

    const { error } = await supabase.from('turmas').insert({
      nome: nome.trim(),
      professor_id: userData.user.id,
    });
    setSalvando(false);

    if (error) {
      Alert.alert('Erro ao criar turma', error.message);
      return;
    }

    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Nova Turma</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da turma (ex: Turma A)"
        value={nome}
        onChangeText={setNome}
      />
      <TouchableOpacity style={styles.botao} onPress={handleCriar} disabled={salvando || !nome.trim()}>
        {salvando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.botaoTexto}>Criar Turma</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, gap: 16, backgroundColor: '#FFF' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#0D47A1' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 14, fontSize: 16 },
  botao: { backgroundColor: '#1565C0', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
