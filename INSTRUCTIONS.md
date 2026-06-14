# CreatorVault AI - Setup and Deployment Instructions

This guide outlines the steps required to set up Google OAuth authentication, configure Supabase tables, set up local environment variables, and deploy CreatorVault AI to production.

---

## 1. Google Cloud Console Setup

To enable "Sign in with Google," you must configure an OAuth Client in the Google Cloud Console.

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown in the top-left and select **New Project**.
3. Name your project (e.g., `CreatorVault AI`) and click **Create**.

### Step 2: Configure the OAuth Consent Screen
1. In the left-hand navigation menu, select **APIs & Services** > **OAuth consent screen**.
2. Select **External** as the User Type and click **Create**.
3. Fill in the required fields under **App Information**:
   - **App name**: `CreatorVault AI`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **Save and Continue** (you can skip the Scopes and Test Users screens for now).

### Step 3: Create OAuth 2.0 Credentials
1. In the left-hand navigation, click **Credentials**.
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. Set the **Application type** to **Web application**.
4. Set the **Name** to `CreatorVault Web Client`.
5. Under **Authorized redirect URIs**, add the callback URL from your Supabase Project:
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard).
   - Go to **Authentication** > **Providers** > **Google**.
   - Copy the **Callback URL** (it looks like `https://yeckuoflttfhqzttthyl.supabase.co/auth/v1/callback`).
   - Paste this URL into the **Authorized redirect URIs** field in the Google Cloud Console.
6. Click **Create**.
7. Copy the generated **Client ID** and **Client Secret**.

---

## 2. Supabase Integration Setup

To connect Google OAuth with Supabase:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) for the project `yeckuoflttfhqzttthyl`.
2. Navigate to **Authentication** > **Providers** > **Google**.
3. Toggle Google provider to **Enabled**.
4. Paste the **Client ID** and **Client Secret** copied from the Google Cloud Console.
5. Click **Save**.

---

## 3. Database & Storage Setup

Run the SQL script located in `supabase/setup.sql` in your Supabase SQL Editor:
1. Navigate to the **SQL Editor** tab in Supabase.
2. Click **New Query**.
3. Copy and paste the entire contents of [setup.sql](file:///c:/Users/anshu/OneDrive/Desktop/vault%20ai/supabase/setup.sql).
4. Click **Run**.

This script sets up:
- The `files` database table.
- Row-Level Security (RLS) policies ensuring users can only read, write, and delete their own files.
- The `creator-files` private storage bucket.
- Storage RLS policies securing user upload folders (structured as `creator-files/user_id/*`).

---

## 4. Local Development

### Step 1: Environment Variables
Create a file named `.env.local` at the root of the project:
```env
NEXT_PUBLIC_SUPABASE_URL=https://yeckuoflttfhqzttthyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
*Replace `YOUR_SUPABASE_ANON_KEY` with the **anon / public** key found in your Supabase Dashboard under **Project Settings** > **API**.*

### Step 2: Install Dependencies and Run
1. Run `npm install` to install dependencies.
2. Start the development server using:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Production Deployment

### Local/Production URLs Summary

| Setting / URL Type | Local Value | Production Value |
|---|---|---|
| Site URL (Supabase Auth) | `http://localhost:3000` | `https://your-domain.vercel.app` |
| Redirect URI (Google OAuth) | `https://yeckuoflttfhqzttthyl.supabase.co/auth/v1/callback` | Same (Supabase handles callback redirecting) |
| Next.js Environment URL | `.env.local` | Production environment dashboard settings |

### Step 1: Configure Supabase Site URL
1. Go to your **Supabase Dashboard** > **Authentication** > **URL Configuration**.
2. Set the **Site URL** to your production URL (e.g., `https://your-domain.vercel.app`).
3. Add `http://localhost:3000/**` and `https://your-domain.vercel.app/**` to the **Redirect URLs** list.

### Step 2: Build and Deploy (Vercel recommended)
1. Push your code to a GitHub repository.
2. Import the repository into **Vercel** or your hosting provider of choice.
3. Configure the environment variables in your deployment dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy the application.
