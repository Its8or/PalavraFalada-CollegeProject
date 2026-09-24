import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useAlertModal } from '@/contexts/alert-modal';

const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function EscanearQrCode() {
  const router = useRouter();
  const { alertar } = useAlertModal();
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [jaLeu, setJaLeu] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [idManual, setIdManual] = useState('');

  async function handleCodigoLido(valorLido: string) {
    // Evita ler o mesmo QR várias vezes seguidas enquanto a câmera continua ligada.
    // Só volta a false quando o usuário confirmar "Tentar novamente" no Alert de
    // erro (nunca sozinho), senão a câmera reabre o mesmo Alert em loop enquanto
    // continuar apontada pro QR Code inválido.
    if (jaLeu) return;
    setJaLeu(true);
    setBuscando(true);

    const valor = valorLido.trim();

    // O QR/campo manual carrega o código curto da turma - aqui a gente descobre
    // o id real dela pra vincular o aluno depois
    const { data } = await supabase.from('turmas').select('id').eq('codigo', valor.toUpperCase()).maybeSingle();
    let turmaId = data?.id;

    // Turma criada antes do código curto existir ainda tem o id (uuid) cru no QR
    if (!turmaId && REGEX_UUID.test(valor)) {
      const { data: porId } = await supabase.from('turmas').select('id').eq('id', valor).maybeSingle();
      turmaId = porId?.id;
    }

    setBuscando(false);

    if (!turmaId) {
      alertar('Código inválido', 'Não encontramos nenhuma turma com esse código.', [
        { text: 'Voltar', style: 'cancel', onPress: () => router.back() },
        { text: 'Tentar novamente', onPress: () => setJaLeu(false) },
      ]);
      return;
    }

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
              placeholder="Ou digite o código da turma"
              placeholderTextColor="#CCC"
              value={idManual}
              onChangeText={setIdManual}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.manualBotao}
              onPress={() => idManual.trim() && handleCodigoLido(idManual.trim())}
              disabled={buscando}
            >
              {buscando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.manualBotaoTexto}>Entrar</Text>}
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
