import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { identificarTipoPorTitulo, extrairConteudo } from '@/constants/tarefas';

// Item de lista reusado pelo aluno e pelo professor - mesma cara nos dois
// lados, só o "onPress" muda (professor ouve/edita, aluno pratica).
// Ícone sempre o mesmo (volume-high), só pra sinalizar "isso tem áudio" -
// não diferencia mais por tipo/categoria de tarefa
export function TarefaCard({ titulo, onPress }: { titulo: string; onPress: () => void }) {
  const config = identificarTipoPorTitulo(titulo);
  const conteudo = config ? extrairConteudo(titulo, config) : titulo;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.icone}>
        <Ionicons name="volume-high" size={20} color="#FFF" />
      </View>
      <Text style={styles.conteudo}>{conteudo}</Text>
      <Ionicons name="chevron-forward" size={20} color="#1565C0" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F5F9FF',
    borderRadius: 14, padding: 14,
  },
  icone: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1565C0',
    alignItems: 'center', justifyContent: 'center',
  },
  conteudo: { flex: 1, fontSize: 17, fontWeight: '700', color: '#0D47A1' },
});
