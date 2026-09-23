import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '@/services/supabase';

export default function QrCodeDaTurma() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [nomeTurma, setNomeTurma] = useState<string | null>(null);
  const [codigoTurma, setCodigoTurma] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [telaCheia, setTelaCheia] = useState(false);
  const { width, height } = useWindowDimensions();
  const tamanhoTelaCheia = Math.min(width, height) * 0.75;
  // Turma criada antes do código curto existir ainda não tem "codigo" - cai pro id como antes
  const valorQr = codigoTurma ?? id ?? '';

  useEffect(() => {
    async function buscarTurma() {
      const { data } = await supabase.from('turmas').select('nome, codigo').eq('id', id).single();
      setNomeTurma(data?.nome ?? null);
      setCodigoTurma(data?.codigo ?? null);
      setCarregando(false);
    }
    if (id) buscarTurma();
  }, [id]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#0D47A1" />
      </TouchableOpacity>

      <Text style={styles.titulo}>QR Code da Turma</Text>
      {carregando ? (
        <ActivityIndicator />
      ) : (
        <Text style={styles.nomeTurma}>{nomeTurma ?? 'Turma'}</Text>
      )}

      <View style={styles.qrCard}>
        {/* O aluno lê esse código na tela de escanear e a gente resolve pro id real da turma */}
        <QRCode value={valorQr} size={220} color="#0D47A1" backgroundColor="#FFF" />
      </View>

      <TouchableOpacity style={styles.botaoTelaCheia} onPress={() => setTelaCheia(true)}>
        <Ionicons name="expand" size={18} color="#1565C0" />
        <Text style={styles.botaoTelaCheiaTexto}>Ver em tela cheia (pra projetar)</Text>
      </TouchableOpacity>

      <Text style={styles.instrucao}>Peça para o aluno abrir &quot;Sou aluno&quot; e escanear esse código pra entrar na turma.</Text>

      {/* Testando pelo navegador, a câmera nem sempre lê o QR - esse texto é só pra digitar no campo manual */}
      <View style={styles.idBox}>
        <Text style={styles.idLabel}>Código da turma (pra digitar manualmente ao testar no navegador):</Text>
        <Text selectable style={styles.codigoTexto}>{valorQr}</Text>
      </View>

      <Modal visible={telaCheia} animationType="fade" onRequestClose={() => setTelaCheia(false)}>
        <View style={styles.telaCheiaContainer}>
          <TouchableOpacity style={styles.telaCheiaFechar} onPress={() => setTelaCheia(false)}>
            <Ionicons name="close" size={28} color="#0D47A1" />
          </TouchableOpacity>
          <Text style={styles.telaCheiaTitulo}>{nomeTurma ?? 'Turma'}</Text>
          <QRCode value={valorQr} size={tamanhoTelaCheia} color="#0D47A1" backgroundColor="#FFF" />
          <Text style={styles.telaCheiaCodigo}>{valorQr}</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#FFF', gap: 16 },
  voltar: { position: 'absolute', top: 56, left: 20 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#0D47A1', marginTop: 30 },
  nomeTurma: { fontSize: 16, color: '#5C6B73' },
  qrCard: { padding: 20, backgroundColor: '#F5F9FF', borderRadius: 20, marginTop: 20 },
  instrucao: { textAlign: 'center', color: '#5C6B73', paddingHorizontal: 30, marginTop: 10 },
  idBox: { backgroundColor: '#F5F9FF', borderRadius: 12, padding: 14, width: '100%', marginTop: 10 },
  idLabel: { fontSize: 12, color: '#8E8E93', marginBottom: 6, textAlign: 'center' },
  codigoTexto: { fontSize: 22, fontWeight: 'bold', letterSpacing: 4, color: '#0D47A1', textAlign: 'center' },
  botaoTelaCheia: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#1565C0', borderRadius: 30, paddingVertical: 10, paddingHorizontal: 18,
  },
  botaoTelaCheiaTexto: { color: '#1565C0', fontWeight: '600' },
  telaCheiaContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', gap: 20 },
  telaCheiaFechar: { position: 'absolute', top: 56, right: 24 },
  telaCheiaTitulo: { fontSize: 24, fontWeight: 'bold', color: '#0D47A1' },
  telaCheiaCodigo: { fontSize: 20, fontWeight: 'bold', letterSpacing: 4, color: '#5C6B73' },
});
