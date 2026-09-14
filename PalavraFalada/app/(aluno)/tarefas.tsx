import { View, Text, TouchableOpacity } from 'react-native';
import { playSpeech } from '@/services/speech';

export default function TarefasDaTurma() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Tarefas Da Turma</Text>

      {/* TODO: remover - botão temporário só para validar o playSpeech manualmente */}
      <TouchableOpacity
        style={{ marginTop: 20, backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center' }}
        onPress={() => playSpeech('casa')}
      >
        <Text style={{ color: '#FFF', fontSize: 16 }}>🔊 Testar TTS: &quot;casa&quot;</Text>
      </TouchableOpacity>
    </View>
  );
}
