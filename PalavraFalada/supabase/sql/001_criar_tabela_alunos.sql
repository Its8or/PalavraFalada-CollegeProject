-- Rode isso no SQL editor do Supabase (Dashboard > SQL Editor).
-- Cria a tabela "alunos" que hoje não existe no schema, então as telas
-- de alunos (app/(professor)/turma/[id]/alunos.tsx e turmas.tsx) sempre
-- caem no fallback de "cadastro ainda não disponível".

create table if not exists public.alunos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  turma_id uuid not null references public.turmas(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.alunos enable row level security;

-- O aluno entra só escaneando o QR Code + digitando o nome, sem login/auth,
-- então o insert precisa ser permitido pro papel "anon" (chave anon do app).
create policy "Aluno pode se cadastrar em uma turma"
  on public.alunos
  for insert
  to anon, authenticated
  with check (true);

-- Professor só enxerga os alunos das turmas que são dele, mesmo padrão
-- já usado na tabela "turmas" (professor_id = auth.uid()).
create policy "Professor ve alunos das proprias turmas"
  on public.alunos
  for select
  to authenticated
  using (
    exists (
      select 1 from public.turmas
      where turmas.id = alunos.turma_id
        and turmas.professor_id = auth.uid()
    )
  );
