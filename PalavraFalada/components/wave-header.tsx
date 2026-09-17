import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Curva decorativa usada no topo (e opcionalmente no rodapé, espelhada) das telas de login/cadastro
export function WaveHeader({ posicao = 'top', cor = '#D6EBFB' }: { posicao?: 'top' | 'bottom'; cor?: string }) {
  return (
    <Svg
      width="100%"
      height={110}
      viewBox="0 0 400 110"
      preserveAspectRatio="none"
      style={posicao === 'top' ? styles.topo : styles.rodape}
    >
      <Path d="M0,0 H400 V40 C280,110 160,0 0,55 Z" fill={cor} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  topo: { position: 'absolute', top: 0, left: 0 },
  rodape: { position: 'absolute', bottom: 0, left: 0, transform: [{ rotate: '180deg' }] },
});
