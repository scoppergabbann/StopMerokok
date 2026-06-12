create table if not exists feedback_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  category text not null default 'bug'
    check (category in ('bug', 'idea', 'confusing', 'other')),
  severity text not null default 'medium'
    check (severity in ('low', 'medium', 'high')),
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'resolved', 'archived')),
  title text not null check (char_length(title) between 3 and 100),
  message text not null check (char_length(message) between 10 and 1200),
  page_url text,
  contact text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feedback_reports_created_at_idx
on feedback_reports (created_at desc);

create index if not exists feedback_reports_status_idx
on feedback_reports (status, created_at desc);

create index if not exists feedback_reports_reporter_idx
on feedback_reports (reporter_id, created_at desc);

alter table feedback_reports enable row level security;

drop policy if exists "feedback_reports own read" on feedback_reports;
create policy "feedback_reports own read"
on feedback_reports for select
using (auth.uid() = reporter_id);

drop policy if exists "feedback_reports own insert" on feedback_reports;
create policy "feedback_reports own insert"
on feedback_reports for insert
with check (auth.uid() = reporter_id);
