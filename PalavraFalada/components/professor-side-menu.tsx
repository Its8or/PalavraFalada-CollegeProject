import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { tirarFocoWeb } from '@/utils/blur-focus-web';
import { useAlertModal } from '@/contexts/alert-modal';

// turmaId: quando o menu é aberto de dentro de uma turma (tarefas/alunos/qrcode/
// criar), passa o id dela pra ir direto no QR Code certo. Fora de uma turma
// (ex: Minhas Turmas), busca a primeira turma do professor como atalho.
export function ProfessorSideMenu({ visible, onClose, turmaId }: { visible: boolean; onClose: () => void; turmaId?: string }) {
  const router = useRouter();
  const { alertar } = useAlertModal();
  const [nomeProfessor, setNomeProfessor] = useState('Professor');

  function fechar() {
    tirarFocoWeb();
    onClose();
  }

  useEffect(() => {
    if (!visible) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      // Conta cadastrada pelo app já vem com "nome" no metadata; contas de teste
      // criadas direto no Supabase não têm, então cai pro prefixo do e-mail em
      // vez do e-mail inteiro (que estoura a tela)
      const nome = (data.user.user_metadata?.nome as string | undefined) ?? data.user.email?.split('@')[0] ?? 'Professor';
      setNomeProfessor(nome);
    });
  }, [visible]);

  function handleMinhasTurmas() {
    fechar();
    router.push('/(professor)/minhas-turmas');
  }

  async function handleQrCode() {
    if (turmaId) {
      fechar();
      router.push({ pathname: '/(professor)/turma/[id]/qrcode', params: { id: turmaId } });
      return;
    }

    const { data } = await supabase.from('turmas').select('id').order('nome').limit(1).maybeSingle();
    fechar();

    if (!data) {
      alertar('Nenhuma turma ainda', 'Crie uma turma primeiro pra gerar o QR Code dela.');
      return;
    }

    router.push({ pathname: '/(professor)/turma/[id]/qrcode', params: { id: data.id } });
  }

  async function handleSair() {
    fechar();
    await supabase.auth.signOut();
    router.replace('/(professor)/login');
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={fechar}>
      <View style={styles.linha}>
        <TouchableOpacity style={styles.overlay} onPress={fechar} />

        <View style={styles.painel}>
          <View style={styles.perfil}>
            <Ionicons name="person-circle" size={48} color="#90CAF9" />
            <Text style={styles.nome} numberOfLines={1}>{nomeProfessor}</Text>
          </View>

          <TouchableOpacity style={styles.item} onPress={handleMinhasTurmas}>
            <Ionicons name="people" size={20} color="#0D47A1" />
            <Text style={styles.itemTexto}>Minhas Turmas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleQrCode}>
            <Ionicons name="qr-code" size={20} color="#0D47A1" />
            <Text style={styles.itemTexto}>QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleSair}>
            <Ionicons name="log-out" size={20} color="#D32F2F" />
            <Text style={[styles.itemTexto, { color: '#D32F2F' }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  linha: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)' },
  painel: { width: '75%', maxWidth: 300, backgroundColor: '#FFF', paddingTop: 64, paddingHorizontal: 20 },
  overlay: { flex: 1 },
  perfil: { alignItems: 'center', gap: 8, marginBottom: 30 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#0D47A1', maxWidth: '100%' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  itemTexto: { fontSize: 15, fontWeight: '600', color: '#0D47A1' },
});
