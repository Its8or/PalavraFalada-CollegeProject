import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlunoTabBar } from '@/components/aluno-tab-bar';
import { TarefaPratica } from '@/components/tarefa-pratica';
import { JogoMontarPalavra } from '@/components/jogo-montar-palavra';
import { identificarTipoPorTitulo, extrairConteudo } from '@/constants/tarefas';
import { stopSpeech } from '@/services/speech';

export default function TarefaDetalhe() {
  const { id, titulo, nome, turmaId } = useLocalSearchParams<{ id: string; titulo: string; nome?: string; turmaId?: string }>();
  const router = useRouter();

  function handleRepeti() {
    stopSpeech();
    router.push({ pathname: '/(aluno)/parabens', params: { id, nome, turmaId } });
  }

  const config = identificarTipoPorTitulo(titulo ?? '');
  const ehMontarPalavra = config?.tipo === 'completar_palavra';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0D47A1" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Tarefa</Text>
        <View style={{ width: 24 }} />
      </View>

      {ehMontarPalavra ? (
        <JogoMontarPalavra key={id} palavra={extrairConteudo(titulo ?? '', config)} onCompleto={handleRepeti} />
      ) : (
        <TarefaPratica
          titulo={titulo ?? ''}
          acaoExtra={{ icone: 'checkmark', legenda: 'Já repeti', cor: '#43A047', onPress: handleRepeti }}
        />
      )}

      <AlunoTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 10, backgroundColor: '#FFF',
  },
  headerTitulo: { fontSize: 20, fontWeight: 'bold', color: '#0D47A1' },
});
