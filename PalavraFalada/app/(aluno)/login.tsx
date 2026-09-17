import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LogoIcone } from '@/components/logo';

export default function AlunoLogin() {
  const router = useRouter();
  const { turmaId } = useLocalSearchParams(); // Captura o ID vindo do QR Code
  const [nome, setNome] = useState('');

  function handleEntrar() {
    router.push({ pathname: '/(aluno)/tarefas', params: { nome, turmaId } });
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoLinha}>
        <LogoIcone size={52} />
        <View>
          <Text style={styles.logoPalavra}>Palavra</Text>
          <Text style={styles.logoFalada}>Falada</Text>
        </View>
      </View>

      <View style={styles.qrCirculo}>
        <Ionicons name="qr-code" size={70} color="#1565C0" />
        <View style={styles.qrCheck}>
          <Ionicons name="checkmark-circle" size={30} color="#43A047" />
        </View>
      </View>

      <View style={styles.campoGrupo}>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} textAlign="center" />
        <Text style={styles.legenda}>Digite seu nome</Text>
      </View>

      <TouchableOpacity style={styles.botaoConfirmar} onPress={handleEntrar}>
        <Ionicons name="checkmark" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24, backgroundColor: '#FFF' },
  logoLinha: { flexDirection: 'row', alignItems: 'center', gap: 10, position: 'absolute', top: 60 },
  logoPalavra: { fontSize: 18, fontWeight: 'bold', color: '#0D47A1' },
  logoFalada: { fontSize: 18, fontWeight: 'bold', color: '#1E88E5', marginTop: -4 },
  qrCirculo: {
    width: 140, height: 140, borderRadius: 70, backgroundColor: '#EAF4FE',
    alignItems: 'center', justifyContent: 'center',
  },
  qrCheck: { position: 'absolute', bottom: 4, right: 4, backgroundColor: '#FFF', borderRadius: 15 },
  campoGrupo: { width: '100%', gap: 8 },
  input: {
    borderWidth: 1, borderColor: '#BBD8F5', backgroundColor: '#EAF4FE', borderRadius: 16,
    paddingVertical: 18, paddingHorizontal: 20, fontSize: 28, fontWeight: 'bold', color: '#0D47A1', width: '100%',
  },
  legenda: { textAlign: 'center', color: '#5C6B73', fontSize: 13 },
  botaoConfirmar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#43A047',
    alignItems: 'center', justifyContent: 'center',
  },
});
