
-- Create avatars bucket
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Allow authenticated users to upload their own avatars
create policy "Users can upload their own avatar"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own avatar
create policy "Users can update their own avatar"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow anyone to view avatars (public bucket)
create policy "Anyone can view avatars"
on storage.objects for select
using (bucket_id = 'avatars');
