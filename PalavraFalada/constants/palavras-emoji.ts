// Dicionário fixo palavra -> emoji, usado só pelo jogo "Completar a Palavra"
// pra mostrar uma figura representando a palavra. Palavra fora dessa lista
// ainda funciona no jogo, só não mostra figura nenhuma (sem mexer no banco,
// a tabela "tarefas" só guarda o título em texto).
const PALAVRAS_EMOJI: Record<string, string> = {
  CASA: '🏠', GATO: '🐱', CACHORRO: '🐶', BOLA: '⚽', PATO: '🦆', SOL: '☀️', LUA: '🌙',
  ESTRELA: '⭐', PEIXE: '🐟', FLOR: '🌸', LIVRO: '📚', CARRO: '🚗', ARVORE: '🌳',
  MESA: '🪑', PORTA: '🚪', JANELA: '🪟', SAPO: '🐸', RATO: '🐀', URSO: '🐻',
  LEAO: '🦁', VACA: '🐄', GALO: '🐓', OVO: '🥚', PAO: '🍞', AGUA: '💧', FOGO: '🔥',
  CEU: '☁️', MAR: '🌊', BOLO: '🎂', PIPA: '🪁', BONECA: '🪆', CHUVA: '🌧️',
  BANANA: '🍌', MACA: '🍎', UVA: '🍇', SAPATO: '👟', CHAPEU: '🎩', RELOGIO: '⌚',
  TELEFONE: '📱', COMPUTADOR: '💻', BICICLETA: '🚲', AVIAO: '✈️', BARCO: '⛵',
  TREM: '🚂', ABELHA: '🐝', BORBOLETA: '🦋', ARANHA: '🕷️', COBRA: '🐍', TARTARUGA: '🐢',
  COELHO: '🐰', PASSARO: '🐦', PIZZA: '🍕', SORVETE: '🍦', LARANJA: '🍊', MORANGO: '🍓',
  CORACAO: '❤️', PRESENTE: '🎁', MUSICA: '🎵', FUTEBOL: '⚽', PRAIA: '🏖️', MONTANHA: '⛰️',
};

export function buscarEmoji(palavra: string): string | null {
  const chave = palavra
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // remove acento pra bater "ÁRVORE" com "ARVORE"
  return PALAVRAS_EMOJI[chave] ?? null;
}
