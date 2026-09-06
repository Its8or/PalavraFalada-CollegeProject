import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'professor.teste@exemplo.com',
    password: 'NAOSEIASENHA01',
  });

  if (authError) {
    console.error('Erro no login:', authError.message);
    return;
  }

  console.log('Login ok! UID:', authData.user?.id);

  const { data: turmaInserida, error: insertError } = await supabase
    .from('turmas')
    .insert({ nome: 'Turma de Teste', professor_id: authData.user!.id })
    .select()
    .single();

  if (insertError) {
    console.error('Erro ao inserir turma:', insertError.message);
    return;
  }

  console.log('Turma criada:', turmaInserida);

  const { data: turmasBuscadas, error: selectError } = await supabase
    .from('turmas')
    .select('*');

  if (selectError) {
    console.error('Erro ao buscar turmas:', selectError.message);
    return;
  }

  console.log('Turmas visíveis para este professor:', turmasBuscadas);
}

main();