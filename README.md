# CreatorVault AI 🧠💼

CreatorVault AI is the **ultimate second brain for content creators, video editors, and agency owners**. Securely upload, organize, search, and automatically analyze your scripts, thumbnail references, brand assets, and content ideas in one centralized, encrypted digital vault.

---

## Key Features 🚀

- **🔒 Secure Private Storage**: Private files are encrypted and isolated under individual user-specific folders inside a secure Supabase Storage bucket.
- **📁 Structured Niche Categories**: Organize files under preconfigured categories: *Content Ideas, Scripts, Thumbnail References, Brand Assets, Research, and Inspiration*.
- **🔍 Advanced Query Engine**: Instant keyword search combined with interactive filters for category, file format, and date ranges.
- **✨ Creator Intelligence**: AI agent analyzing scripts for pacing/outlines and thumbnails for visual hierarchy, contrast, and click-through-rate (CTR) improvement suggestions.
- **⚡ Instant Skeleton Transitions**: Premium, zero-lag route transitions using tailor-made React loading skeletons.
- **🛡️ Production-Grade Security**: Auto-refreshing session cookie middleware, secure sign-in with Google, and open-redirect proof auth callbacks.

---

## Technology Stack 🛠️

- **Framework**: Next.js 16 (App Router)
- **UI & Logic**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Auth, and Storage)
- **AI Engine**: OpenAI GPT-4o (Vision + Chat Completions)

---

## Quick Start Guide ⚡

### 1. Configure Supabase Schema
Run the SQL script located in [supabase/setup.sql](file:///c:/Users/anshu/OneDrive/Desktop/vault%20ai/supabase/setup.sql) inside the Supabase SQL editor dashboard. This creates:
1. The `public.files` database table.
2. The private `creator-files` bucket for storage.
3. Strict Row-Level Security (RLS) policies ensuring users can only read, write, and delete their own assets.

### 2. Configure Google Cloud Console OAuth
1. Go to Google Cloud Console.
2. Set up an OAuth Consent Screen (External).
3. Create OAuth 2.0 Credentials (Web Client) and set the redirect URL using your Supabase project callback.
4. Enable the Google Provider in Supabase Auth Dashboard using the generated Client ID and Client Secret.

### 3. Environment Setup
Create a `.env.local` file at the root of the project:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

### 4. Running the Development Server
Install dependencies and run:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Production Security Model 🛡️

CreatorVault AI prioritizes absolute security for creator intellectual property:
- **Session Sync Middleware**: A Next.js middleware automatically intercepts and refreshes cookie sessions, guarding routes at the server level.
- **Strict RLS Policies**: Database rows are bound by `auth.uid() = user_id`. Storage items are locked in subfolders using matching user IDs (`creator-files/user_id/*`).
- **Phishing Protection**: Absolute sanitization on all authentication redirect paths ensures callbacks only route to verified internal pages.
- **Filename Sanitization**: Uploaded files undergo regex sanitization, replacing spaces and stripping special characters to maintain clean server paths.

---

## Deployment 🚀 (Recommended: Vercel)

1. Push your project code to a GitHub repository.
2. Connect your repository to Vercel.
3. Bind the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. Update the **Site URL** and **Redirect URLs** under **Authentication > URL Configuration** in your Supabase Dashboard to match your Vercel URL.
5. Deploy!
