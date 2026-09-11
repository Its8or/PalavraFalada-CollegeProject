import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Palavra Falada</Text>

      <TouchableOpacity 
        style={[styles.button, styles.alunoButton]} 
        onPress={() => router.push('/')} // TODO: Abrir camera pra ler QRCode da turma e fazer login 
      >
        <Text style={styles.buttonText}>Entrar como Aluno (QR Code)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/(professor)/login')}
      >
        <Text style={styles.buttonText}>Área do Professor</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  alunoButton: { backgroundColor: '#34C759' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});