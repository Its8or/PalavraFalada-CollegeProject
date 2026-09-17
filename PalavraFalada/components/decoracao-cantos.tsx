import { View, StyleSheet } from 'react-native';

// Manchas coloridas nos 4 cantos, só decorativas, seguindo o visual das telas de login/landing
export function DecoracaoCantos() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.mancha, styles.topoEsquerda]} />
      <View style={[styles.mancha, styles.baixoEsquerda]} />
      <View style={[styles.mancha, styles.baixoDireita]} />
      <View style={[styles.mancha, styles.baixoDireita2]} />
    </View>
  );
}

const styles = StyleSheet.create({
  mancha: { position: 'absolute', borderRadius: 999 },
  topoEsquerda: { width: 180, height: 180, backgroundColor: '#BBDEFB', top: -70, left: -70 },
  baixoEsquerda: { width: 140, height: 140, backgroundColor: '#C8E6C9', bottom: -50, left: -60 },
  baixoDireita: { width: 160, height: 160, backgroundColor: '#FFE0B2', bottom: -60, right: -60 },
  baixoDireita2: { width: 90, height: 90, backgroundColor: '#BBDEFB', bottom: 10, right: -30 },
});
