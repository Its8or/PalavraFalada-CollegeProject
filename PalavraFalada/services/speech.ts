import * as Speech from 'expo-speech';

/**
 * Fala um texto em português do Brasil usando o TTS nativo do dispositivo.
 *
 * Sempre interrompe qualquer fala em andamento antes de iniciar a próxima,
 * para evitar que os áudios se sobreponham quando o usuário toca em várias
 * palavras/sílabas rapidamente.
 */
export async function playSpeech(text: string, onDone?: () => void) {
  if (!text || !text.trim()) {
    onDone?.();
    return;
  }

  try {
    await Speech.stop();
  } catch {
    // Não há fala em andamento para interromper, pode seguir normalmente
  }

  Speech.speak(text.trim(), {
    language: 'pt-BR',
    onDone,
    // Se der erro no TTS, ainda assim avisa quem tava esperando a fala acabar
    // (senão uma tela que só avança depois do onDone ficaria travada)
    onError: (error) => {
      console.log('Erro ao reproduzir áudio:', error);
      onDone?.();
    },
  });
}

// Usado por telas/hooks que precisam calar o áudio ao sair (ex: troca de rota)
export function stopSpeech() {
  return Speech.stop().catch(() => {});
}
