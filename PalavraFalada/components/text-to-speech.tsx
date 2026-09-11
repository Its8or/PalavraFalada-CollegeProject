import { useEffect } from 'react';
import * as Speech from 'expo-speech';
import { usePathname } from 'expo-router';

export function useAudioGuia(textoDeInstrucao: string) {
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    async function falar() {
      // Cancela qualquer fala anterior antes de iniciar uma nova
      try {
        await Speech.stop();
      } catch (error) {
        // Ignora erros ao parar
      }

      if (isMounted && textoDeInstrucao) {
        Speech.speak(textoDeInstrucao, {
          language: 'pt-BR',
          onError: (err) => console.log('Erro no TTS:', err),
        });
      }
    }

    falar();

    // Cleanup: encerra o áudio tratando a Promise
    return () => {
      isMounted = false;
      Speech.stop().catch(() => {
        // Trata a rejeição para não estourar erro não capturado
      });
    };
  }, [pathname, textoDeInstrucao]);
}