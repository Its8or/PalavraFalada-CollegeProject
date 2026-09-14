import { View, Text, Button } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Sem campo de nome de propósito: o público é analfabeto/em alfabetização
export default function AlunoLogin() {
  const router = useRouter();
  const { turmaId } = useLocalSearchParams(); // Captura o ID vindo do QR Code [3]

  const handleEntrar = () => {
    // Registrar no servidor local/API do backend [5]
    // E direcionar para a lista de tarefas da turma vinculada [1]
    router.push({
      pathname: '/(aluno)/tarefas',
      params: { turmaId }
    });
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, marginBottom: 20, textAlign: 'center' }}>Toque para começar</Text>
      <Button title="Entrar" onPress={handleEntrar} />
    </View>
  );
}
