-- Run this in your Supabase SQL editor

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  height_cm integer not null,
  birth_date date not null,
  gender text not null check (gender in ('male', 'female')),
  start_weight_kg decimal(5,2) not null,
  current_weight_kg decimal(5,2) not null,
  goal_weight_kg decimal(5,2) not null,
  last_weigh_in date,
  last_photo_date date,
  created_at timestamptz default now()
);

-- DAILY LOGS
create table daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null default current_date,
  kcal_intake integer not null,
  kcal_burned integer not null,
  bmr integer not null,
  deficit_kcal integer not null,
  weight_change_g decimal(8,2) not null,
  calculated_weight_kg decimal(5,2) not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- WEIGH-INS (every 15 days real scale)
create table weigh_ins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null default current_date,
  weight_kg decimal(5,2) not null,
  note text,
  created_at timestamptz default now()
);

-- PHOTOS (every 31 days)
create table progress_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null default current_date,
  front_url text,
  left_url text,
  right_url text,
  weight_at_photo decimal(5,2),
  created_at timestamptz default now()
);

-- RLS Policies
alter table profiles enable row level security;
alter table daily_logs enable row level security;
alter table weigh_ins enable row level security;
alter table progress_photos enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own logs" on daily_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on daily_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own logs" on daily_logs for update using (auth.uid() = user_id);

create policy "Users can view own weigh-ins" on weigh_ins for select using (auth.uid() = user_id);
create policy "Users can insert own weigh-ins" on weigh_ins for insert with check (auth.uid() = user_id);

create policy "Users can view own photos" on progress_photos for select using (auth.uid() = user_id);
create policy "Users can insert own photos" on progress_photos for insert with check (auth.uid() = user_id);
create policy "Users can update own photos" on progress_photos for update using (auth.uid() = user_id);

-- Storage bucket for photos
insert into storage.buckets (id, name, public) values ('progress-photos', 'progress-photos', false);

create policy "Users can upload own photos" on storage.objects
  for insert with check (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own photos" on storage.objects
  for select using (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own photos" on storage.objects
  for delete using (auth.uid()::text = (storage.foldername(name))[1]);
