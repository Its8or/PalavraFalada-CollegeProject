import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { buscarEmoji } from '@/constants/palavras-emoji';
import { playSpeech } from '@/services/speech';

type LetraSolta = { id: string; letra: string };

// Fisher-Yates, garantindo que não saia na ordem certa (senão o jogo "se
// resolve sozinho" sem o aluno precisar pensar). Limita as tentativas: se a
// palavra só tem uma letra repetida (ex: "AA"), nenhum embaralhamento muda
// a ordem - sem o limite isso trava num loop infinito.
function embaralhar(letras: string[]): string[] {
  let copia = letras;
  for (let tentativa = 0; tentativa < 20; tentativa++) {
    copia = [...letras];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    if (copia.length <= 1 || !copia.every((letra, i) => letra === letras[i])) break;
  }
  return copia;
}

// Jogo de montar a palavra tocando nas letras na ordem certa - usado tanto
// pelo aluno (pratica de verdade, onCompleto leva pra tela de Parabéns)
// quanto pelo professor (só revisão/teste, sem onCompleto - mostra um
// "jogar de novo" no lugar).
//
// Quem usa esse componente deve passar `key={palavra}` - assim, se navegar
// pra uma tarefa diferente sem desmontar a tela, o React remonta o jogo do
// zero sozinho (em vez de resetar manualmente num efeito).
export function JogoMontarPalavra({ palavra, onCompleto }: { palavra: string; onCompleto?: () => void }) {
  const emoji = useMemo(() => buscarEmoji(palavra), [palavra]);
  const letrasDaPalavra = useMemo(() => [...palavra], [palavra]);

  const [proximoIndex, setProximoIndex] = useState(0);
  const [soltas, setSoltas] = useState<LetraSolta[]>(() =>
    embaralhar(letrasDaPalavra).map((letra, i) => ({ id: `${letra}-${i}-${Math.random()}`, letra }))
  );
  const [completo, setCompleto] = useState(false);

  function reiniciar() {
    setProximoIndex(0);
    setCompleto(false);
    setSoltas(embaralhar(letrasDaPalavra).map((letra, i) => ({ id: `${letra}-${i}-${Math.random()}`, letra })));
  }

  // Devolve se o toque foi na letra certa - quem decide se treme (errou) é
  // o botão em si, com base nesse retorno
  function handleToqueLetra(item: LetraSolta): boolean {
    playSpeech(item.letra);

    const acertou = item.letra === letrasDaPalavra[proximoIndex];
    if (!acertou) return false;

    setSoltas((atual) => atual.filter((s) => s.id !== item.id));
    const novoIndex = proximoIndex + 1;
    setProximoIndex(novoIndex);

    if (novoIndex === letrasDaPalavra.length) {
      setCompleto(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      // Só avança pra tela de Parabéns depois que a palavra terminar de ser
      // falada de verdade (não um tempo fixo "chutado", que cortava o áudio)
      setTimeout(() => {
        playSpeech(palavra, () => {
          if (onCompleto) setTimeout(onCompleto, 500);
        });
      }, 300);
    }
    return true;
  }

  return (
    <View style={styles.container}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}

      <View style={styles.espacos}>
        {letrasDaPalavra.map((letra, index) => (
          <View
            key={index}
            style={[
              styles.espaco,
              index < proximoIndex && styles.espacoPreenchido,
              completo && styles.espacoCompleto,
            ]}
          >
            {index < proximoIndex && <Text style={styles.espacoTexto}>{letra}</Text>}
          </View>
        ))}
      </View>

      {completo ? (
        <View style={styles.sucesso}>
          <Ionicons name="checkmark-circle" size={36} color="#43A047" />
          <Text style={styles.sucessoTexto}>Muito bem!</Text>
          {!onCompleto && (
            <TouchableOpacity style={styles.botaoReiniciar} onPress={reiniciar}>
              <Ionicons name="refresh" size={18} color="#1565C0" />
              <Text style={styles.botaoReiniciarTexto}>Jogar de novo</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.banco}>
          {soltas.map((item) => (
            <LetraBotao key={item.id} letra={item.letra} onToque={() => handleToqueLetra(item)} />
          ))}
        </View>
      )}
    </View>
  );
}

const CORES_LETRA = ['#2A6FC9', '#F6B81A', '#43A047'];

function LetraBotao({ letra, onToque }: { letra: string; onToque: () => boolean }) {
  const [deslocamento] = useState(() => new Animated.Value(0));
  const cor = CORES_LETRA[letra.charCodeAt(0) % CORES_LETRA.length];

  function tremer() {
    deslocamento.setValue(0);
    Animated.sequence([
      Animated.timing(deslocamento, { toValue: 1, duration: 45, useNativeDriver: true }),
      Animated.timing(deslocamento, { toValue: -1, duration: 90, useNativeDriver: true }),
      Animated.timing(deslocamento, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(deslocamento, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  }

  return (
    <Animated.View style={{ transform: [{ translateX: Animated.multiply(deslocamento, 6) }] }}>
      <TouchableOpacity
        style={[styles.letraBotao, { backgroundColor: cor }]}
        onPress={() => {
          const acertou = onToque();
          if (!acertou) tremer();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.letraBotaoTexto}>{letra}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, padding: 24 },
  emoji: { fontSize: 64 },
  espacos: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  espaco: {
    width: 44, height: 52, borderRadius: 10, borderWidth: 2, borderColor: '#BBD8F5',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F9FF',
  },
  espacoPreenchido: { borderStyle: 'solid', borderColor: '#1565C0', backgroundColor: '#FFF' },
  espacoCompleto: { borderColor: '#43A047', backgroundColor: '#E8F5E9' },
  espacoTexto: { fontSize: 26, fontWeight: 'bold', color: '#0D47A1' },
  banco: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 320 },
  letraBotao: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  letraBotaoTexto: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  sucesso: { alignItems: 'center', gap: 10 },
  sucessoTexto: { fontSize: 18, fontWeight: 'bold', color: '#43A047' },
  botaoReiniciar: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
    borderWidth: 1, borderColor: '#1565C0', borderRadius: 30, paddingVertical: 8, paddingHorizontal: 16,
  },
  botaoReiniciarTexto: { color: '#1565C0', fontWeight: '600', fontSize: 13 },
});
