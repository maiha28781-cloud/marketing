-- Create task_comments table
create table if not exists public.task_comments (
    id uuid default gen_random_uuid() primary key,
    task_id uuid references public.tasks(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete set null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.task_comments enable row level security;

-- Policies
-- Everyone can read comments for tasks they can see (public read access is already enabled for tasks)
create policy "Authenticated users can view task comments"
    on public.task_comments for select
    to authenticated
    using (true);

-- Authenticated users can create comments
create policy "Authenticated users can insert task comments"
    on public.task_comments for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table public.task_comments;
