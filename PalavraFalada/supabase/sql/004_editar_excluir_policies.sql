-- Rode isso no SQL editor do Supabase, depois do 003_tarefas_select_anon.sql.
-- Adiciona as policies de UPDATE/DELETE que faltam pro professor poder
-- editar/excluir as próprias turmas e tarefas (hoje só existe SELECT/INSERT).
--
-- Seguro rodar de novo mesmo se já tiver rodado antes.

drop policy if exists "Professor atualiza as proprias turmas" on public.turmas;
create policy "Professor atualiza as proprias turmas"
  on public.turmas
  for update
  to authenticated
  using (professor_id = auth.uid())
  with check (professor_id = auth.uid());

drop policy if exists "Professor exclui as proprias turmas" on public.turmas;
create policy "Professor exclui as proprias turmas"
  on public.turmas
  for delete
  to authenticated
  using (professor_id = auth.uid());

drop policy if exists "Professor atualiza tarefas das proprias turmas" on public.tarefas;
create policy "Professor atualiza tarefas das proprias turmas"
  on public.tarefas
  for update
  to authenticated
  using (
    exists (
      select 1 from public.turmas
      where turmas.id = tarefas.turma_id
        and turmas.professor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.turmas
      where turmas.id = tarefas.turma_id
        and turmas.professor_id = auth.uid()
    )
  );

drop policy if exists "Professor exclui tarefas das proprias turmas" on public.tarefas;
create policy "Professor exclui tarefas das proprias turmas"
  on public.tarefas
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.turmas
      where turmas.id = tarefas.turma_id
        and turmas.professor_id = auth.uid()
    )
  );
