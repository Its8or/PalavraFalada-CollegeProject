import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoLinha}>
        <Ionicons name="book" size={40} color="#1565C0" />
        <View>
          <Text style={styles.logoPalavra}>Palavra</Text>
          <Text style={styles.logoFalada}>Falada</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.botaoAluno} onPress={() => router.push('/(aluno)/login')}>
        <Ionicons name="person" size={20} color="#FFF" />
        <Text style={styles.botaoAlunoTexto}>Sou aluno</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoProfessor} onPress={() => router.push('/(professor)/login')}>
        <Ionicons name="people" size={20} color="#1565C0" />
        <Text style={styles.botaoProfessorTexto}>Sou professor</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16, backgroundColor: '#FAFAF7' },
  logoLinha: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 40 },
  logoPalavra: { fontSize: 26, fontWeight: 'bold', color: '#0D47A1' },
  logoFalada: { fontSize: 26, fontWeight: 'bold', color: '#1E88E5', marginTop: -6 },
  botaoAluno: {
    flexDirection: 'row', gap: 10, backgroundColor: '#1E88E5', paddingVertical: 16, borderRadius: 30,
    width: '100%', alignItems: 'center', justifyContent: 'center',
  },
  botaoAlunoTexto: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  botaoProfessor: {
    flexDirection: 'row', gap: 10, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#1E88E5',
    paddingVertical: 16, borderRadius: 30, width: '100%', alignItems: 'center', justifyContent: 'center',
  },
  botaoProfessorTexto: { color: '#1565C0', fontSize: 18, fontWeight: 'bold' },
});
