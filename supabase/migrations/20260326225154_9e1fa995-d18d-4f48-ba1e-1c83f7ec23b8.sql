
create table public.missions (
  id uuid default gen_random_uuid() primary key,
  accident_id uuid references public.accident_reports(id),
  target_lat double precision not null,
  target_lon double precision not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table public.esp32_location (
  id uuid default gen_random_uuid() primary key,
  mission_id uuid references public.missions(id),
  lat double precision not null,
  lon double precision not null,
  updated_at timestamptz default now()
);

-- Disable RLS as requested for ESP32 direct access
alter table public.missions enable row level security;
alter table public.esp32_location enable row level security;

-- Allow anyone to read/write missions (ESP32 uses anon key)
create policy "Anyone can read missions" on public.missions for select using (true);
create policy "Anyone can insert missions" on public.missions for insert with check (true);
create policy "Anyone can update missions" on public.missions for update using (true);

-- Allow anyone to read/write esp32_location (ESP32 uses anon key)
create policy "Anyone can read esp32_location" on public.esp32_location for select using (true);
create policy "Anyone can insert esp32_location" on public.esp32_location for insert with check (true);

-- Enable realtime for esp32_location and missions
ALTER PUBLICATION supabase_realtime ADD TABLE public.esp32_location;
ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;
