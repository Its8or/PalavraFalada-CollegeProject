import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ProfessorLogin() {
  const router = useRouter();
  const { turmaId } = useLocalSearchParams(); // Captura o ID vindo do QR Code [3]
  const [nome, setNome] = useState('');

  const handleEntrar = () => {
    if (nome.trim()) {
      // Registrar no servidor local/API do backend [5]
      // E direcionar para a lista de turmas do professor
      router.push({
        pathname: '/(professor)/turmas',
        params: { nome, turmaId }
      });
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Escreva seu nome para começar:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 }}
        placeholder="Seu nome"
        value={nome}
        onChangeText={setNome}
      />
      <Button title="Concluir" onPress={handleEntrar} />
    </View>
  );
}