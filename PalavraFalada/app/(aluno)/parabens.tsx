import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { playSpeech } from '@/services/speech';
import { TAREFAS_EXEMPLO } from '@/constants/tarefas';

export default function TarefaConcluida() {
  const router = useRouter();
  const { id, nome, turmaId } = useLocalSearchParams<{ id?: string; nome?: string; turmaId?: string }>();

  const indiceAtual = TAREFAS_EXEMPLO.findIndex((tarefa) => tarefa.id === id);
  const proxima = indiceAtual >= 0 ? TAREFAS_EXEMPLO[indiceAtual + 1] : undefined;

  function handleProximaTarefa() {
    if (!proxima) {
      router.push({ pathname: '/(aluno)/tarefas', params: { nome, turmaId } });
      return;
    }
    router.push({
      pathname: '/(aluno)/tarefa/[id]',
      params: { id: proxima.id, titulo: proxima.titulo, nome, turmaId },
    });
  }

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

        <TouchableOpacity style={styles.botaoProxima} onPress={handleProximaTarefa}>
          <Text style={styles.botaoProximaTexto}>{proxima ? 'Próxima Tarefa' : 'Ver Todas as Tarefas'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.push({ pathname: '/(aluno)/tarefas', params: { nome, turmaId } })}
        >
          <Text style={styles.botaoVoltarTexto}>Voltar para Tarefas</Text>
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
  botaoProxima: { backgroundColor: '#1565C0', paddingVertical: 16, borderRadius: 30, width: '100%', alignItems: 'center' },
  botaoProximaTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  botaoVoltar: {
    borderWidth: 2, borderColor: '#1565C0', paddingVertical: 16, borderRadius: 30,
    width: '100%', alignItems: 'center',
  },
  botaoVoltarTexto: { color: '#1565C0', fontSize: 16, fontWeight: 'bold' },
});
