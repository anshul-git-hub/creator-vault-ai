-- Create the files table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    category TEXT NOT NULL,
    ai_summary TEXT,
    file_size BIGINT,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure file_size column exists for existing tables (Phase 2 Upgrade)
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Enable Row Level Security (RLS)
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on public.files table if they exist
DROP POLICY IF EXISTS "Users can select their own files" ON public.files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;

-- Create RLS Policies for files table
CREATE POLICY "Users can select their own files" 
ON public.files 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" 
ON public.files 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" 
ON public.files 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" 
ON public.files 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);


-- Create the storage bucket 'creator-files' (private bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-files', 'creator-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage objects (per-user folders structure: bucket/user_id/filename)

-- Drop all possible storage policy variations to ensure clean update
DROP POLICY IF EXISTS "Allow authenticated users to upload files to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read files from their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files in their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files from their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to access their own folder" ON storage.objects;

-- 1. INSERT policy: Allow uploading files ONLY if the bucket is 'creator-files' and the first folder in the path is the user's ID
CREATE POLICY "Allow authenticated users to upload files to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'creator-files' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. SELECT policy: Allow downloading/viewing files ONLY if the bucket is 'creator-files' and the first folder is the user's ID
CREATE POLICY "Allow authenticated users to read files from their own folder"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'creator-files' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. UPDATE policy: Allow updating files ONLY if the bucket is 'creator-files' and the first folder is the user's ID
CREATE POLICY "Allow authenticated users to update files in their own folder"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'creator-files' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'creator-files' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. DELETE policy: Allow deleting files ONLY if the bucket is 'creator-files' and the first folder is the user's ID
CREATE POLICY "Allow authenticated users to delete files from their own folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'creator-files' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =========================================================================
-- Phase 2 Upgrade: User Profiles Table & Security Policies
-- =========================================================================

-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    profession TEXT NOT NULL,
    creator_type TEXT NOT NULL,
    working_style TEXT NOT NULL,
    goals TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create RLS Policies for profiles table
CREATE POLICY "Users can select their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

