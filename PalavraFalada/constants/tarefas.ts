import { Ionicons } from '@expo/vector-icons';

export type TipoTarefa = 'ouvir_repetir' | 'falar_palavra' | 'ler_palavra' | 'completar_palavra';

type ConfigTipoTarefa = {
  tipo: TipoTarefa;
  label: string;
  // prefixo usado tanto pra montar o título salvo quanto pra reconhecê-lo na listagem,
  // já que a tabela "tarefas" só guarda um campo "titulo" (sem coluna de tipo/categoria)
  prefixo: string;
  categoria: string;
  icone: React.ComponentProps<typeof Ionicons>['name'];
  cor: string;
};

export const TIPOS_TAREFA: ConfigTipoTarefa[] = [
  { tipo: 'ouvir_repetir', label: 'Ouvir e Repetir', prefixo: 'Ouvir e repetir', categoria: 'Letras e Sons', icone: 'volume-high', cor: '#007AFF' },
  { tipo: 'falar_palavra', label: 'Falar a Palavra', prefixo: 'Falar a palavra', categoria: 'Palavras', icone: 'chatbubble', cor: '#8E44AD' },
  { tipo: 'ler_palavra', label: 'Ler a Palavra', prefixo: 'Ler a palavra', categoria: 'Palavras', icone: 'book', cor: '#E67E22' },
  { tipo: 'completar_palavra', label: 'Completar a Palavra', prefixo: 'Completar a palavra', categoria: 'Atividades', icone: 'pencil', cor: '#007AFF' },
];

export function identificarTipoPorTitulo(titulo: string) {
  return TIPOS_TAREFA.find((config) => titulo.startsWith(config.prefixo)) ?? null;
}

// Tira o prefixo do título e devolve só o conteúdo (ex: "BOLA" ou "B + A = BA")
export function extrairConteudo(titulo: string, config: ConfigTipoTarefa) {
  return titulo.slice(config.prefixo.length).trim();
}

// Texto pronunciável pro botão de play: tira os símbolos "+"/"=" do blend
// e a lacuna "_" da palavra incompleta, já que isso não deve ser falado literalmente
export function construirFalaCompleta(config: ConfigTipoTarefa, conteudo: string) {
  if (config.tipo === 'ouvir_repetir') {
    return conteudo
      .split(' ')
      .filter((parte) => parte !== '+' && parte !== '=')
      .join(', ');
  }
  return conteudo.replace(/_/g, '');
}

// Mock só pra telas de exemplo (ainda sem busca real no Supabase pro lado do aluno)
export const TAREFAS_EXEMPLO = [
  { id: '1', titulo: 'Ouvir e repetir B + A = BA' },
  { id: '2', titulo: 'Ouvir e repetir P + A = PA' },
  { id: '3', titulo: 'Falar a palavra BOLA' },
  { id: '4', titulo: 'Ler a palavra CASA' },
  { id: '5', titulo: 'Completar a palavra CA_SA' },
];
