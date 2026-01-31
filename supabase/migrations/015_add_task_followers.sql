-- Create task_followers table
create table if not exists public.task_followers (
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (task_id, user_id)
);

-- RLS
alter table public.task_followers enable row level security;

-- Policy: Allow authenticated users to view followers
create policy "Authenticated users view followers"
  on public.task_followers for select
  using (auth.uid() is not null);

-- Policy: Allow authenticated users to follow (insert)
create policy "Authenticated users can follow"
  on public.task_followers for insert
  with check (auth.uid() is not null);

-- Policy: Allow users to unfollow (delete) themselves or others (if admin/creator? Let's keep it simple: allow delete)
create policy "Authenticated users can unfollow"
  on public.task_followers for delete
  using (auth.uid() is not null);

-- Realtime
alter publication supabase_realtime add table public.task_followers;
