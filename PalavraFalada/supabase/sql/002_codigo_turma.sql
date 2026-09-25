-- Rode isso no SQL editor do Supabase, depois do 001_criar_tabela_alunos.sql.
-- Adiciona um código curto (tipo "7X9K2A") pra turma, pra não precisar
-- digitar/colar o UUID inteiro no QR Code ou no campo manual de teste.
--
-- Seguro rodar de novo mesmo se já tiver rodado antes.

alter table public.turmas add column if not exists codigo text unique;

-- O aluno entra sem login (papel "anon"), então precisa poder buscar a turma
-- pelo código pra descobrir o id real dela. Essa policy só vale pro papel
-- "anon" - não afeta a policy que já restringe o professor a ver só as
-- turmas dele (essa é avaliada separadamente, pro papel "authenticated").
drop policy if exists "Qualquer um pode achar a turma pelo codigo" on public.turmas;
create policy "Qualquer um pode achar a turma pelo codigo"
  on public.turmas
  for select
  to anon
  using (true);
