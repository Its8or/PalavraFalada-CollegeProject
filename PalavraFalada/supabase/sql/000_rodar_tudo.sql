-- Cola esse arquivo inteiro no SQL Editor do Supabase e roda de uma vez.
-- Junta os arquivos 001 a 004 num só. Seguro rodar de novo mesmo que parte
-- (ou tudo) já tenha sido aplicado antes - nada aqui quebra se já existir.

-- ===================== 001: tabela "alunos" =====================
create table if not exists public.alunos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  turma_id uuid not null references public.turmas(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.alunos enable row level security;

drop policy if exists "Aluno pode se cadastrar em uma turma" on public.alunos;
create policy "Aluno pode se cadastrar em uma turma"
  on public.alunos for insert to anon, authenticated with check (true);

drop policy if exists "Professor ve alunos das proprias turmas" on public.alunos;
create policy "Professor ve alunos das proprias turmas"
  on public.alunos for select to authenticated
  using (
    exists (
      select 1 from public.turmas
      where turmas.id = alunos.turma_id and turmas.professor_id = auth.uid()
    )
  );

-- ===================== 002: código curto da turma =====================
alter table public.turmas add column if not exists codigo text unique;

drop policy if exists "Qualquer um pode achar a turma pelo codigo" on public.turmas;
create policy "Qualquer um pode achar a turma pelo codigo"
  on public.turmas for select to anon using (true);

-- ===================== 003: aluno lê as tarefas =====================
drop policy if exists "Aluno pode ler as tarefas da turma" on public.tarefas;
create policy "Aluno pode ler as tarefas da turma"
  on public.tarefas for select to anon using (true);

-- ===================== 004: editar/excluir turmas e tarefas =====================
drop policy if exists "Professor atualiza as proprias turmas" on public.turmas;
create policy "Professor atualiza as proprias turmas"
  on public.turmas for update to authenticated
  using (professor_id = auth.uid()) with check (professor_id = auth.uid());

drop policy if exists "Professor exclui as proprias turmas" on public.turmas;
create policy "Professor exclui as proprias turmas"
  on public.turmas for delete to authenticated
  using (professor_id = auth.uid());

drop policy if exists "Professor atualiza tarefas das proprias turmas" on public.tarefas;
create policy "Professor atualiza tarefas das proprias turmas"
  on public.tarefas for update to authenticated
  using (
    exists (
      select 1 from public.turmas
      where turmas.id = tarefas.turma_id and turmas.professor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.turmas
      where turmas.id = tarefas.turma_id and turmas.professor_id = auth.uid()
    )
  );

drop policy if exists "Professor exclui tarefas das proprias turmas" on public.tarefas;
create policy "Professor exclui tarefas das proprias turmas"
  on public.tarefas for delete to authenticated
  using (
    exists (
      select 1 from public.turmas
      where turmas.id = tarefas.turma_id and turmas.professor_id = auth.uid()
    )
  );

-- ===================== 005: grants do Data API =====================
-- As RLS policies só entram em ação DEPOIS que o Postgres confere se o role
-- (anon/authenticated) tem GRANT de acesso na tabela. Se a tabela estiver
-- marcada como "API Disabled" no Dashboard (Table Editor > tabela), o
-- SELECT/INSERT/UPDATE nem chegam a avaliar as policies - só devolvem vazio,
-- sem erro nenhum. GRANT não duplica, seguro rodar de novo.
grant select on public.turmas to anon;
grant select on public.tarefas to anon;
grant insert on public.alunos to anon;

grant select, insert, update, delete on public.turmas to authenticated;
grant select, insert, update, delete on public.tarefas to authenticated;
grant select on public.alunos to authenticated;

-- Se der erro de "column codigo does not exist" ou "relation turmas does
-- not exist", significa que a tabela "turmas" no seu projeto ainda não
-- tem a estrutura esperada (id, nome, professor_id) - me avisa.
