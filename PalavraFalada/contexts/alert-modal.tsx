import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Botao = { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' };

type AlertModalContextType = {
  alertar: (titulo: string, mensagem?: string, botoes?: Botao[]) => void;
};

const AlertModalContext = createContext<AlertModalContextType | null>(null);

// Substitui Alert.alert por um modal de verdade, com a cara do app - Alert.alert
// nativo não combina com o resto da UI, e no react-native-web nem funciona
// (é um no-op), então isso resolve os dois problemas de uma vez.
export function AlertModalProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<{ titulo: string; mensagem?: string; botoes: Botao[] } | null>(null);

  const alertar = useCallback((titulo: string, mensagem?: string, botoes?: Botao[]) => {
    setEstado({ titulo, mensagem, botoes: botoes && botoes.length > 0 ? botoes : [{ text: 'OK' }] });
  }, []);

  function handleBotao(botao: Botao) {
    setEstado(null);
    botao.onPress?.();
  }

  return (
    <AlertModalContext.Provider value={{ alertar }}>
      {children}

      <Modal visible={!!estado} transparent animationType="fade" onRequestClose={() => setEstado(null)}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.titulo}>{estado?.titulo}</Text>
            {estado?.mensagem ? <Text style={styles.mensagem}>{estado.mensagem}</Text> : null}

            <View style={styles.botoesLinha}>
              {estado?.botoes.map((botao, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.botao,
                    botao.style === 'cancel' && styles.botaoCancelar,
                    botao.style === 'destructive' && styles.botaoDestrutivo,
                  ]}
                  onPress={() => handleBotao(botao)}
                >
                  <Text
                    style={[
                      styles.botaoTexto,
                      botao.style === 'cancel' && styles.botaoTextoCancelar,
                    ]}
                  >
                    {botao.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AlertModalContext.Provider>
  );
}

export function useAlertModal() {
  const contexto = useContext(AlertModalContext);
  if (!contexto) throw new Error('useAlertModal precisa estar dentro de <AlertModalProvider>');
  return contexto;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 30 },
  card: { width: '100%', maxWidth: 340, backgroundColor: '#FFF', borderRadius: 18, padding: 22, gap: 8 },
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#0D47A1', textAlign: 'center' },
  mensagem: { fontSize: 14, color: '#37474F', textAlign: 'center', marginTop: 4 },
  botoesLinha: { flexDirection: 'row', gap: 10, marginTop: 18 },
  botao: { flex: 1, backgroundColor: '#1565C0', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  botaoCancelar: { backgroundColor: '#EEF3FA' },
  botaoDestrutivo: { backgroundColor: '#D32F2F' },
  botaoTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  botaoTextoCancelar: { color: '#1565C0' },
});
