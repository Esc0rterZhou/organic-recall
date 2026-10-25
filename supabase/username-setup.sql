-- Email-free accounts. Run before deploying functions/username-auth/index.ts.
-- New registrations are handled only by the server function; passwords remain
-- managed by Supabase Auth. No mail sender is required.
create table if not exists public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
 recovery_hash text not null check (recovery_hash ~ '^[a-f0-9]{64}$'),
 recovery_lock uuid,
 recovery_lock_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from public,anon,authenticated;
grant select(user_id,username) on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant usage on schema public to authenticated;
drop policy if exists "Read own username" on public.profiles;
create policy "Read own username" on public.profiles for select to authenticated using((select auth.uid())=user_id);

create table if not exists public.learning_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{}'::jsonb check(octet_length(data::text)<2000000),
 revision bigint not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.learning_state enable row level security;
revoke all on public.learning_state from public,anon,authenticated;
grant select on public.learning_state to authenticated;
grant all on public.learning_state to service_role;
drop policy if exists "Read own SJTU progress" on public.learning_state;
drop policy if exists "Read own progress" on public.learning_state;
create policy "Read own progress" on public.learning_state for select to authenticated
using((select auth.uid())=user_id and exists(select 1 from public.profiles p where p.user_id=(select auth.uid())));

create or replace function public.save_recall_state(payload jsonb,expected_revision bigint,expected_user uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid; current_row public.learning_state;
begin
 uid:=auth.uid();
 if uid is null or expected_user is null or uid<>expected_user or not exists(select 1 from public.profiles p where p.user_id=uid) then raise exception 'Account required' using errcode='42501'; end if;
 if jsonb_typeof(payload) is distinct from 'object' or payload->>'version' is distinct from '3' or octet_length(payload::text)>=2000000 then raise exception 'Invalid progress payload'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into current_row from public.learning_state where user_id=uid for update;
 if found and current_row.revision<>expected_revision then return jsonb_build_object('conflict',true,'revision',current_row.revision,'data',current_row.data); end if;
 insert into public.learning_state as s(user_id,data,revision,updated_at) values(uid,payload,1,now())
 on conflict(user_id) do update set data=excluded.data,revision=s.revision+1,updated_at=now() returning * into current_row;
 return jsonb_build_object('conflict',false,'revision',current_row.revision);
end; $$;
revoke all on function public.save_recall_state(jsonb,bigint,uuid) from public,anon;
grant execute on function public.save_recall_state(jsonb,bigint,uuid) to authenticated;

create table if not exists public.auth_rate_limits(bucket text primary key,started_at timestamptz not null default now(),attempts integer not null default 0);
alter table public.auth_rate_limits enable row level security;
revoke all on public.auth_rate_limits from public,anon,authenticated;
grant all on public.auth_rate_limits to service_role;
create or replace function public.take_auth_attempt(bucket_id text,max_attempts integer,window_seconds integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare count integer;
begin
 delete from public.auth_rate_limits where started_at<now()-interval '2 days';
 insert into public.auth_rate_limits as r(bucket,started_at,attempts) values(bucket_id,now(),1)
 on conflict(bucket) do update set
 attempts=case when r.started_at<now()-make_interval(secs=>window_seconds) then 1 else r.attempts+1 end,
 started_at=case when r.started_at<now()-make_interval(secs=>window_seconds) then now() else r.started_at end returning attempts into count;
 return count<=max_attempts;
end; $$;
revoke all on function public.take_auth_attempt(text,integer,integer) from public,anon,authenticated;
grant execute on function public.take_auth_attempt(text,integer,integer) to service_role;

create or replace function public.claim_recovery(account_username text,code_hash text,nonce uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid;
begin
 update public.profiles set recovery_lock=nonce,recovery_lock_at=now()
 where username=account_username and recovery_hash=code_hash and (recovery_lock is null or recovery_lock_at<now()-interval '90 seconds') returning user_id into uid;
 return uid;
end; $$;
create or replace function public.finish_recovery(account_id uuid,nonce uuid,new_hash text)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 update public.profiles set recovery_hash=new_hash,recovery_lock=null,recovery_lock_at=null where user_id=account_id and recovery_lock=nonce;
 return found;
end; $$;
create or replace function public.release_recovery(account_id uuid,nonce uuid)
returns void language sql security definer set search_path='' as $$
 update public.profiles set recovery_lock=null,recovery_lock_at=null where user_id=account_id and recovery_lock=nonce;
$$;
revoke all on function public.claim_recovery(text,text,uuid),public.finish_recovery(uuid,uuid,text),public.release_recovery(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_recovery(text,text,uuid),public.finish_recovery(uuid,uuid,text),public.release_recovery(uuid,uuid) to service_role;
