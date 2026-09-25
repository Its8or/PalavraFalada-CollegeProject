import { Platform } from 'react-native';

// RN Web deixa o "aria-hidden" no container do Modal antes do elemento
// clicado (ainda focado) sair de dentro dele, e o navegador reclama no
// console. Tirando o foco manualmente antes de fechar o Modal evita isso.
export function tirarFocoWeb() {
  if (Platform.OS !== 'web') return;
  (document.activeElement as HTMLElement | null)?.blur?.();
}
