import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlunoTabBar } from '@/components/aluno-tab-bar';
import { identificarTipoPorTitulo, extrairConteudo, construirFalaCompleta, TIPOS_TAREFA } from '@/constants/tarefas';
import { playSpeech, stopSpeech } from '@/services/speech';

const SIMBOLOS_MUDOS = ['+', '='];

export default function TarefaDetalhe() {
  const { id, titulo, nome, turmaId } = useLocalSearchParams<{ id: string; titulo: string; nome?: string; turmaId?: string }>();
  const router = useRouter();

  const config = identificarTipoPorTitulo(titulo ?? '') ?? TIPOS_TAREFA[1];
  const conteudo = extrairConteudo(titulo ?? '', config);
  const tokens = config.tipo === 'ouvir_repetir' ? conteudo.split(' ') : conteudo.split('');
  const coresTile = ['#BBDEFB', '#C8E6C9'];
  const corResultado = '#D1C4E9';
  const ehUltimoTokenDoBlend = (index: number) => config.tipo === 'ouvir_repetir' && index === tokens.length - 1;

  function handleRepeti() {
    stopSpeech();
    router.push({ pathname: '/(aluno)/parabens', params: { id, nome, turmaId } });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0D47A1" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Tarefa</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.cardTopo}>
        <View style={[styles.icone, { backgroundColor: config.cor }]}>
          <Ionicons name={config.icone} size={26} color="#FFF" />
        </View>
        <Text style={styles.conteudoGrande}>{conteudo}</Text>
      </View>

      <View style={styles.cardAtividade}>
        <View style={styles.tiles}>
          {tokens.map((token, index) => {
            const falavel = !SIMBOLOS_MUDOS.includes(token);
            const cor = ehUltimoTokenDoBlend(index) ? corResultado : coresTile[index % coresTile.length];
            return (
              <TouchableOpacity
                key={`${token}-${index}`}
                disabled={!falavel}
                activeOpacity={falavel ? 0.6 : 1}
                style={[styles.tile, { backgroundColor: cor }, ehUltimoTokenDoBlend(index) && styles.tileResultado]}
                onPress={() => playSpeech(token)}
              >
                <Text style={styles.tileTexto}>{token}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.instrucaoLinha}>
          <Ionicons name="megaphone" size={22} color="#1565C0" />
          <Text style={styles.instrucaoTexto}>
            Ouça o som e repita em voz alta:{'\n'}
            <Text style={styles.instrucaoConteudo}>{conteudo}</Text>
          </Text>
        </View>

        <View style={styles.botoesLinha}>
          <TouchableOpacity style={styles.botaoPlay} onPress={() => playSpeech(construirFalaCompleta(config, conteudo))}>
            <Ionicons name="play" size={30} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoRepeti} onPress={handleRepeti}>
            <Ionicons name="mic" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

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
  cardTopo: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF',
    margin: 20, marginBottom: 10, borderRadius: 16, padding: 16,
  },
  icone: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  conteudoGrande: { fontSize: 22, fontWeight: 'bold', color: '#0D47A1' },
  cardAtividade: {
    flex: 1, backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 16, padding: 20,
    alignItems: 'center', gap: 20,
  },
  tiles: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  tile: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tileResultado: { width: 72, height: 56 },
  tileTexto: { fontSize: 24, fontWeight: 'bold', color: '#0D47A1' },
  instrucaoLinha: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 10 },
  instrucaoTexto: { fontSize: 14, color: '#37474F', flexShrink: 1 },
  instrucaoConteudo: { fontWeight: 'bold', fontSize: 18, color: '#0D47A1' },
  botoesLinha: { flexDirection: 'row', gap: 20 },
  botaoPlay: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1565C0',
    alignItems: 'center', justifyContent: 'center',
  },
  botaoRepeti: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#43A047',
    alignItems: 'center', justifyContent: 'center',
  },
});
