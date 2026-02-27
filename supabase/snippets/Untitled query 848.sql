create table private_event_members (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(event_id) on delete cascade,
  email text not null
);

create unique index unique_event_email
on private_event_members (event_id, email);