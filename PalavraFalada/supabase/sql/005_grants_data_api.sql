-- Rode isso no SQL editor do Supabase, depois do 000_rodar_tudo.sql (ou dos 001-004).
--
-- As RLS policies só entram em ação DEPOIS que o Postgres confere se o "role"
-- (anon/authenticated) tem GRANT de acesso na tabela. Se a tabela estiver
-- marcada como "API Disabled" pro Data API (banner no Dashboard > Table
-- Editor > turmas), o SELECT nem chega a avaliar as policies - só devolve
-- vazio, sem erro nenhum. É basicamente uma segunda camada de permissão,
-- separada das RLS policies.
--
-- Seguro rodar de novo mesmo se já tiver rodado antes (GRANT não duplica).

-- Aluno (anon) precisa achar a turma pelo código e ler as tarefas dela
grant select on public.turmas to anon;
grant select on public.tarefas to anon;

-- Aluno (anon) precisa se cadastrar na tabela alunos ao entrar numa turma
grant insert on public.alunos to anon;

-- Professor (authenticated) precisa editar/excluir turmas e tarefas,
-- e ver a lista de alunos das próprias turmas
grant select, insert, update, delete on public.turmas to authenticated;
grant select, insert, update, delete on public.tarefas to authenticated;
grant select on public.alunos to authenticated;
