import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EscanearQrCode() {
  const router = useRouter();
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [jaLeu, setJaLeu] = useState(false);
  const [idManual, setIdManual] = useState('');

  function handleCodigoLido(turmaId: string) {
    // Evita ler o mesmo QR várias vezes seguidas enquanto a câmera continua ligada
    if (jaLeu) return;
    setJaLeu(true);
    router.replace({ pathname: '/(aluno)/login', params: { turmaId } });
  }

  if (!permissao) {
    return <View style={styles.container} />;
  }

  if (!permissao.granted) {
    return (
      <View style={styles.centro}>
        <Ionicons name="camera" size={50} color="#1565C0" />
        <Text style={styles.mensagem}>Precisamos da câmera pra ler o QR Code da turma.</Text>
        <TouchableOpacity style={styles.botao} onPress={solicitarPermissao}>
          <Text style={styles.botaoTexto}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => handleCodigoLido(data)}
      />

      <View style={styles.overlay}>
        <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.moldura} />
        <Text style={styles.instrucao}>Aponte a câmera pro QR Code da turma</Text>

        {/* No navegador web a leitura de QR pela câmera pode não funcionar - deixa uma saída manual */}
        {Platform.OS === 'web' && (
          <View style={styles.manualBox}>
            <TextInput
              style={styles.manualInput}
              placeholder="Ou cole o ID da turma aqui"
              placeholderTextColor="#CCC"
              value={idManual}
              onChangeText={setIdManual}
            />
            <TouchableOpacity
              style={styles.manualBotao}
              onPress={() => idManual.trim() && handleCodigoLido(idManual.trim())}
            >
              <Text style={styles.manualBotaoTexto}>Entrar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 16 },
  mensagem: { textAlign: 'center', fontSize: 15, color: '#37474F' },
  botao: { backgroundColor: '#1565C0', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30 },
  botaoTexto: { color: '#FFF', fontWeight: 'bold' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  voltar: { position: 'absolute', top: 56, left: 20 },
  moldura: { width: 240, height: 240, borderWidth: 3, borderColor: '#FFF', borderRadius: 20 },
  instrucao: { color: '#FFF', marginTop: 20, fontSize: 15 },
  manualBox: { flexDirection: 'row', gap: 8, marginTop: 24, paddingHorizontal: 20, width: '100%' },
  manualInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  manualBotao: { backgroundColor: '#1565C0', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  manualBotaoTexto: { color: '#FFF', fontWeight: 'bold' },
});
