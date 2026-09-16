import { useState } from 'react';
import { View, TextInput, Button, Text, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';

export default function ProfessorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);

  async function handleEntrar() {
    if (!email.trim() || !senha) return;

    setEntrando(true);
    // As policies de RLS conferem turmas.professor_id = auth.uid(), por isso
    // precisa de uma sessão de verdade aqui, não só navegar pra frente
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setEntrando(false);

    if (error) {
      Alert.alert('Erro ao entrar', error.message);
      return;
    }

    router.push('/(professor)/turmas');
  }

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Login do Professor</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 5 }}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 }}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      {entrando ? <ActivityIndicator /> : <Button title="Entrar" onPress={handleEntrar} />}
    </View>
  );
}
