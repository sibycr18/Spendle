-- Create a simple function that returns the current timestamp
create or replace function keepalive()
returns timestamptz
language sql
security definer
as $$
  select now();
$$;
