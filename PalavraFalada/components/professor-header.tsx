import { ReactNode, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfessorSideMenu } from './professor-side-menu';

// Cabeçalho único reusado em toda tela do professor - cada tela custom tinha
// o seu próprio, o que causava layout inconsistente e (junto com o header
// nativo do Stack) cabeçalho duplicado
export function ProfessorHeader({
  titulo,
  acaoDireita,
  turmaId,
}: {
  titulo: string;
  acaoDireita?: ReactNode;
  turmaId?: string;
}) {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <View style={styles.container}>
        {router.canGoBack() ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.botao}>
            <Ionicons name="arrow-back" size={24} color="#0D47A1" />
          </TouchableOpacity>
        ) : (
          <View style={styles.botao} />
        )}

        <Text style={styles.titulo} numberOfLines={1}>{titulo}</Text>

        <View style={styles.acoes}>
          {acaoDireita}
          <TouchableOpacity onPress={() => setMenuAberto(true)} style={styles.botao}>
            <Ionicons name="menu" size={26} color="#0D47A1" />
          </TouchableOpacity>
        </View>
      </View>

      <ProfessorSideMenu visible={menuAberto} onClose={() => setMenuAberto(false)} turmaId={turmaId} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 56, paddingBottom: 10, backgroundColor: '#FFF',
  },
  botao: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titulo: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#0D47A1', textAlign: 'center' },
  acoes: { flexDirection: 'row', alignItems: 'center' },
});
