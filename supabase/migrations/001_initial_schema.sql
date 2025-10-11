-- =============================================
-- AI Interview Platform - Supabase Database Schema
-- Production-ready schema with RLS policies
-- =============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================
-- USERS TABLE (extends auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  github_username text unique,
  github_data jsonb default '{}',
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced', 'expert')) default 'beginner',
  preferences jsonb default '{}',
  interview_count integer default 0,
  total_score integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================
-- INTERVIEWS TABLE
-- =============================================
create table public.interviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  type text check (type in ('technical', 'behavioral', 'system-design')) not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) default 'medium',
  status text check (status in ('scheduled', 'in-progress', 'completed', 'cancelled')) default 'scheduled',
  duration_minutes integer default 60,
  questions jsonb default '[]',
  ai_analysis jsonb default '{}',
  performance_score integer check (performance_score >= 0 and performance_score <= 100),
  feedback text,
  improvement_areas text[],
  strengths text[],
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================
-- INTERVIEW QUESTIONS BANK
-- =============================================
create table public.interview_questions (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  subcategory text,
  content text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) not null,
  type text check (type in ('technical', 'behavioral', 'system-design')) not null,
  expected_answer text,
  evaluation_criteria jsonb default '{}',
  tags text[] default '{}',
  usage_count integer default 0,
  is_active boolean default true,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- =============================================
-- INTERVIEW RESPONSES
-- =============================================
create table public.interview_responses (
  id uuid default gen_random_uuid() primary key,
  interview_id uuid references public.interviews(id) on delete cascade not null,
  question_id uuid references public.interview_questions(id),
  question_text text not null,
  user_response text not null,
  response_time_seconds integer,
  ai_score integer check (ai_score >= 0 and ai_score <= 100),
  ai_feedback jsonb default '{}',
  improvement_suggestions text[],
  created_at timestamp with time zone default now()
);

-- =============================================
-- PERFORMANCE METRICS
-- =============================================
create table public.performance_metrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  interview_id uuid references public.interviews(id) on delete cascade not null,
  metric_type text not null,
  score integer check (score >= 0 and score <= 100) not null,
  details jsonb default '{}',
  improvement_areas text[],
  strengths text[],
  recorded_at timestamp with time zone default now()
);

-- =============================================
-- GITHUB REPOSITORIES (for analysis)
-- =============================================
create table public.github_repositories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  repo_id integer not null,
  name text not null,
  full_name text not null,
  description text,
  language text,
  languages jsonb default '{}',
  stargazers_count integer default 0,
  forks_count integer default 0,
  size integer default 0,
  topics text[] default '{}',
  created_at_github timestamp with time zone,
  updated_at_github timestamp with time zone,
  pushed_at timestamp with time zone,
  ai_analysis jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, repo_id)
);

-- =============================================
-- STUDY PLANS (AI generated)
-- =============================================
create table public.study_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  focus_areas text[] not null,
  estimated_hours integer,
  plan_data jsonb not null,
  progress jsonb default '{}',
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
create index idx_profiles_email on public.profiles(email);
create index idx_profiles_github_username on public.profiles(github_username);
create index idx_profiles_skill_level on public.profiles(skill_level);

-- Interviews indexes
create index idx_interviews_user_id on public.interviews(user_id);
create index idx_interviews_status on public.interviews(status);
create index idx_interviews_type on public.interviews(type);
create index idx_interviews_created_at on public.interviews(created_at desc);

-- Interview questions indexes
create index idx_interview_questions_category_type on public.interview_questions(category, type);
create index idx_interview_questions_difficulty on public.interview_questions(difficulty);
create index idx_interview_questions_active on public.interview_questions(is_active);

-- Interview responses indexes
create index idx_interview_responses_interview_id on public.interview_responses(interview_id);
create index idx_interview_responses_user_score on public.interview_responses(ai_score desc);

-- Performance metrics indexes
create index idx_performance_metrics_user_id on public.performance_metrics(user_id);
create index idx_performance_metrics_interview_id on public.performance_metrics(interview_id);
create index idx_performance_metrics_recorded_at on public.performance_metrics(recorded_at desc);

-- GitHub repositories indexes
create index idx_github_repositories_user_id on public.github_repositories(user_id);
create index idx_github_repositories_language on public.github_repositories(language);
create index idx_github_repositories_stars on public.github_repositories(stargazers_count desc);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_responses enable row level security;
alter table public.performance_metrics enable row level security;
alter table public.github_repositories enable row level security;
alter table public.study_plans enable row level security;

-- Profiles policies
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Interviews policies
create policy "Users can view own interviews" 
  on public.interviews for select 
  using (auth.uid() = user_id);

create policy "Users can insert own interviews" 
  on public.interviews for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own interviews" 
  on public.interviews for update 
  using (auth.uid() = user_id);

-- Interview questions policies (public read, admin write)
create policy "Anyone can view active questions" 
  on public.interview_questions for select 
  using (is_active = true);

-- Interview responses policies
create policy "Users can view own responses" 
  on public.interview_responses for select 
  using (
    auth.uid() = (
      select user_id from public.interviews 
      where id = interview_responses.interview_id
    )
  );

create policy "Users can insert own responses" 
  on public.interview_responses for insert 
  with check (
    auth.uid() = (
      select user_id from public.interviews 
      where id = interview_responses.interview_id
    )
  );

-- Performance metrics policies
create policy "Users can view own performance" 
  on public.performance_metrics for select 
  using (auth.uid() = user_id);

create policy "Users can insert own performance" 
  on public.performance_metrics for insert 
  with check (auth.uid() = user_id);

-- GitHub repositories policies
create policy "Users can view own repositories" 
  on public.github_repositories for select 
  using (auth.uid() = user_id);

create policy "Users can insert own repositories" 
  on public.github_repositories for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own repositories" 
  on public.github_repositories for update 
  using (auth.uid() = user_id);

-- Study plans policies
create policy "Users can view own study plans" 
  on public.study_plans for select 
  using (auth.uid() = user_id);

create policy "Users can insert own study plans" 
  on public.study_plans for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own study plans" 
  on public.study_plans for update 
  using (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_profiles_updated_at 
  before update on public.profiles 
  for each row execute procedure update_updated_at_column();

create trigger update_interviews_updated_at 
  before update on public.interviews 
  for each row execute procedure update_updated_at_column();

create trigger update_github_repositories_updated_at 
  before update on public.github_repositories 
  for each row execute procedure update_updated_at_column();

create trigger update_study_plans_updated_at 
  before update on public.study_plans 
  for each row execute procedure update_updated_at_column();

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update interview count on profile
create or replace function public.update_interview_count()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    update public.profiles 
    set interview_count = interview_count + 1
    where id = new.user_id;
  elsif old.status = 'completed' and new.status != 'completed' then
    update public.profiles 
    set interview_count = interview_count - 1
    where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update interview count
create trigger on_interview_status_change
  after update on public.interviews
  for each row execute procedure public.update_interview_count();

-- =============================================
-- DATA INITIALIZATION
-- =============================================

-- Note: Interview questions should be populated through the admin interface
-- or imported from a curated question bank after deployment

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- User performance summary view
create or replace view user_performance_summary as
select 
  p.id as user_id,
  p.email,
  p.full_name,
  p.skill_level,
  p.interview_count,
  coalesce(avg(i.performance_score), 0) as avg_score,
  coalesce(max(i.performance_score), 0) as best_score,
  count(distinct i.id) filter (where i.status = 'completed') as completed_interviews,
  count(distinct i.id) filter (where i.created_at >= now() - interval '30 days') as interviews_last_30_days
from public.profiles p
left join public.interviews i on p.id = i.user_id
group by p.id, p.email, p.full_name, p.skill_level, p.interview_count;

-- Recent interview activity view
create or replace view recent_interview_activity as
select 
  i.id,
  i.user_id,
  p.full_name as user_name,
  i.title,
  i.type,
  i.difficulty,
  i.status,
  i.performance_score,
  i.created_at,
  i.completed_at,
  extract(epoch from (coalesce(i.completed_at, now()) - i.started_at))/60 as duration_minutes
from public.interviews i
join public.profiles p on i.user_id = p.id
order by i.created_at desc;

-- Question usage statistics view
create or replace view question_usage_stats as
select 
  q.id,
  q.category,
  q.subcategory,
  q.content,
  q.difficulty,
  q.type,
  q.usage_count,
  count(r.id) as response_count,
  coalesce(avg(r.ai_score), 0) as avg_score
from public.interview_questions q
left join public.interview_responses r on q.id = r.question_id
where q.is_active = true
group by q.id, q.category, q.subcategory, q.content, q.difficulty, q.type, q.usage_count
order by q.usage_count desc, q.created_at desc;