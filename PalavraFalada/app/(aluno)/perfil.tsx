import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlunoTabBar } from '@/components/aluno-tab-bar';

// Sem mockup específico pra essa tela ainda - fica simples até termos o design
export default function PerfilAluno() {
  return (
    <View style={styles.container}>
      <View style={styles.conteudo}>
        <Ionicons name="person-circle" size={90} color="#90CAF9" />
        <Text style={styles.titulo}>Meu Perfil</Text>
      </View>
      <AlunoTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  conteudo: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#0D47A1' },
});
