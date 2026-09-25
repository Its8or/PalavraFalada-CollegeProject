-- Rode isso no SQL editor do Supabase, depois do 002_codigo_turma.sql.
-- Sem isso o aluno NUNCA consegue ler as tarefas reais: falta policy de
-- SELECT pra "anon" na tabela tarefas, então o select do app sempre é
-- barrado por RLS e cai no fallback de tarefas de exemplo (mock).
--
-- Seguro rodar de novo mesmo se já tiver rodado antes.

drop policy if exists "Aluno pode ler as tarefas da turma" on public.tarefas;
create policy "Aluno pode ler as tarefas da turma"
  on public.tarefas
  for select
  to anon
  using (true);
