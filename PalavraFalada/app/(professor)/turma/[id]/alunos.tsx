import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function AlunosNaTurma() {
  const { id } = useLocalSearchParams(); // Captura o ID da turma dinamicamente [2]

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Alunos da Turma: {id}</Text>
      {/* Listar os nomes dos alunos vinculados a este ID no banco [2, 3] */}
    </View>
  );
}