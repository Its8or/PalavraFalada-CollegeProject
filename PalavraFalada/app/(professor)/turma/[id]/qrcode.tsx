import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '@/services/supabase';

export default function QrCodeDaTurma() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [nomeTurma, setNomeTurma] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarTurma() {
      const { data } = await supabase.from('turmas').select('nome').eq('id', id).single();
      setNomeTurma(data?.nome ?? null);
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
        {/* O aluno lê esse código na tela de escanear e o id da turma vai direto pro login dele */}
        <QRCode value={id ?? ''} size={220} color="#0D47A1" backgroundColor="#FFF" />
      </View>

      <Text style={styles.instrucao}>Peça para o aluno abrir &quot;Sou aluno&quot; e escanear esse código pra entrar na turma.</Text>

      {/* Testando pelo navegador, a câmera nem sempre lê o QR - esse texto é só pra copiar e colar no campo manual */}
      <View style={styles.idBox}>
        <Text style={styles.idLabel}>ID da turma (pra colar manualmente ao testar no navegador):</Text>
        <Text selectable style={styles.idTexto}>{id}</Text>
      </View>
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
  idTexto: { fontSize: 13, color: '#0D47A1', textAlign: 'center' },
});
