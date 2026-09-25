import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { LogoIcone } from '@/components/logo';
import { WaveHeader } from '@/components/wave-header';
import { useAlertModal } from '@/contexts/alert-modal';

export default function CadastroProfessor() {
  const router = useRouter();
  const { alertar } = useAlertModal();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cadastrando, setCadastrando] = useState(false);

  async function handleCadastrar() {
    if (!nome.trim() || !email.trim() || !senha) return;

    setCadastrando(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: { data: { nome: nome.trim() } },
    });
    setCadastrando(false);

    if (error) {
      alertar('Erro ao cadastrar', error.message);
      return;
    }

    alertar('Cadastro realizado', 'Confirme seu e-mail (se exigido) e faça login.', [
      { text: 'OK', onPress: () => router.push('/(professor)/login') },
    ]);
  }

  return (
    <View style={styles.container}>
      <WaveHeader posicao="top" />

      <View style={styles.logoLinha}>
        <LogoIcone size={58} />
        <View>
          <Text style={styles.logoPalavra}>PALAVRA</Text>
          <Text style={styles.logoFalada}>FALADA</Text>
        </View>
      </View>

      <Text style={styles.titulo}>
        CADASTRO DO{'\n'}PROFESSOR
      </Text>

      <View style={styles.campo}>
        <Ionicons name="person" size={18} color="#5B9BD5" />
        <TextInput style={styles.input} placeholder="Nome Completo" value={nome} onChangeText={setNome} />
      </View>

      <View style={styles.campo}>
        <Ionicons name="mail" size={18} color="#5B9BD5" />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.campo}>
        <Ionicons name="lock-closed" size={18} color="#5B9BD5" />
        <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      </View>

      <TouchableOpacity style={styles.botaoCadastrar} onPress={handleCadastrar} disabled={cadastrando}>
        {cadastrando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.botaoCadastrarTexto}>CADASTRAR</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(professor)/login')}>
        <Text style={styles.link}>Já tem uma conta? Entre aqui.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#FFF', gap: 14 },
  logoLinha: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, zIndex: 1 },
  logoPalavra: { fontSize: 18, fontWeight: 'bold', color: '#1E88E5' },
  logoFalada: { fontSize: 18, fontWeight: 'bold', color: '#0D3B7A', marginTop: -4 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1565C0', textAlign: 'center', marginVertical: 10 },
  campo: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EAF4FE',
    borderRadius: 30, paddingHorizontal: 18, paddingVertical: 4, width: '100%',
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15 },
  botaoCadastrar: {
    backgroundColor: '#1565C0', paddingVertical: 16, borderRadius: 30, width: '100%',
    alignItems: 'center', marginTop: 12,
  },
  botaoCadastrarTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#1565C0', marginTop: 4 },
});
