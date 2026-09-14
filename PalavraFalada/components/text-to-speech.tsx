import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { playSpeech, stopSpeech } from '@/services/speech';

// Narra a instrução da tela atual sempre que o usuário navega para uma nova rota
export function useAudioGuia(textoDeInstrucao: string) {
  const pathname = usePathname();

  useEffect(() => {
    playSpeech(textoDeInstrucao);

    // Interrompe a narração se o usuário sair da tela antes dela terminar
    return () => {
      stopSpeech();
    };
  }, [pathname, textoDeInstrucao]);
}
