import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { identificarTipoPorTitulo, extrairConteudo, construirFalaCompleta, TIPOS_TAREFA } from '@/constants/tarefas';
import { playSpeech } from '@/services/speech';

const SIMBOLOS_MUDOS = ['+', '='];

type AcaoExtra = { icone: keyof typeof Ionicons.glyphMap; legenda: string; cor: string; onPress: () => void };

// Corpo da tela de "praticar uma palavra" (cartão com a palavra, as letras/sílabas
// separadas pra tocar uma a uma, e o botão de ouvir) - reusado igual pelo aluno
// (que pratica de verdade, com botão extra de confirmar) e pelo professor
// (que só revisa a tarefa, sem esse botão extra).
export function TarefaPratica({ titulo, acaoExtra }: { titulo: string; acaoExtra?: AcaoExtra }) {
  const config = identificarTipoPorTitulo(titulo) ?? TIPOS_TAREFA[1];
  const conteudo = extrairConteudo(titulo, config);
  const tokens = config.tipo === 'ouvir_repetir' ? conteudo.split(' ') : conteudo.split('');
  const coresTile = ['#BBDEFB', '#C8E6C9'];
  const corResultado = '#D1C4E9';
  const ehUltimoTokenDoBlend = (index: number) => config.tipo === 'ouvir_repetir' && index === tokens.length - 1;

  return (
    <>
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
          <View style={styles.botaoGrupo}>
            <TouchableOpacity style={styles.botaoPlay} onPress={() => playSpeech(construirFalaCompleta(config, conteudo))}>
              <Ionicons name="play" size={30} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.botaoLegenda}>Ouvir</Text>
          </View>

          {acaoExtra && (
            <View style={styles.botaoGrupo}>
              <TouchableOpacity style={[styles.botaoExtra, { backgroundColor: acaoExtra.cor }]} onPress={acaoExtra.onPress}>
                <Ionicons name={acaoExtra.icone} size={32} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.botaoLegenda}>{acaoExtra.legenda}</Text>
            </View>
          )}
        </View>

        {acaoExtra && (
          // Não tem reconhecimento de voz de verdade - é o aluno/professor
          // confirmando manualmente que a palavra foi repetida em voz alta
          <Text style={styles.avisoConfirmacao}>Toque em ✓ depois de repetir a palavra em voz alta</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  botoesLinha: { flexDirection: 'row', gap: 32 },
  botaoGrupo: { alignItems: 'center', gap: 6 },
  botaoPlay: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1565C0',
    alignItems: 'center', justifyContent: 'center',
  },
  botaoExtra: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  botaoLegenda: { fontSize: 12, color: '#5C6B73', fontWeight: '600' },
  avisoConfirmacao: { fontSize: 12, color: '#8E8E93', textAlign: 'center' },
});
