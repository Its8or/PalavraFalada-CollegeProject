import { Image } from 'expo-image';

const RAZAO_ALTURA_LARGURA = 983 / 1601;

// Logo oficial (livro aberto + ondas de som), fundo transparente
export function LogoIcone({ size = 32 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/logo.png')}
      style={{ width: size, height: size * RAZAO_ALTURA_LARGURA }}
      contentFit="contain"
    />
  );
}
