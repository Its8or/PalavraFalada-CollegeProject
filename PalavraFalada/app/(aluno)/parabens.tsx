import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { playSpeech } from '@/services/speech';

export default function TarefaConcluida() {
  const router = useRouter();
  const { nome, turmaId } = useLocalSearchParams<{ id?: string; nome?: string; turmaId?: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Text style={styles.topoTexto}>Palavra Falada</Text>
        <Ionicons name="person-circle" size={30} color="#FFF" />
      </View>

      <View style={styles.conteudo}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={90} color="#43A047" />
        </View>

        <Text style={styles.parabens}>Parabéns!</Text>
        <Text style={styles.subtexto}>Você concluiu a tarefa com sucesso!</Text>

        <TouchableOpacity
          style={styles.botaoSom}
          onPress={() => playSpeech('Parabéns, você concluiu a tarefa com sucesso!')}
        >
          <Ionicons name="volume-high" size={26} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.push({ pathname: '/(aluno)/tarefas', params: { nome, turmaId } })}
        >
          <Ionicons name="home" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  topo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1565C0', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  topoTexto: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  conteudo: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 16 },
  badge: { marginBottom: 10 },
  parabens: { fontSize: 30, fontWeight: 'bold', color: '#0D47A1' },
  subtexto: { fontSize: 16, color: '#37474F', textAlign: 'center', marginBottom: 10 },
  botaoSom: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#1565C0',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  botaoVoltar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1565C0',
    alignItems: 'center', justifyContent: 'center',
  },
});
