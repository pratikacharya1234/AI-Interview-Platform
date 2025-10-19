# 🚀 Quick Start Guide

## Option 1: Use Email Authentication (Simplest - No Setup Required!)

### Step 1: Start the application
```bash
npm run dev
```

### Step 2: Create an account
1. Go to http://localhost:3000/auth/signin
2. Click **"Continue with Email"**
3. Enter any email (e.g., test@example.com)
4. Enter a password (minimum 6 characters)
5. Click **"Don't have an account? Sign up"**
6. Click **"Create Account"**
7. You'll be automatically signed in!

### Step 3: Use the Demo Account
1. Click **"Try Demo Account"**
2. It will automatically create and sign you in

---

## Option 2: Setup Supabase Tables (For Full Features)

### Step 1: Go to your Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**

### Step 2: Run this SQL
```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);
```

### Step 3: That's it! 
The app will now work with full profile support.

---

## Option 3: Enable GitHub Login (Optional)

### Step 1: Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: AI Interview Platform
   - **Homepage URL**: http://localhost:3000
   - **Callback URL**: http://localhost:3000/api/auth/callback/github
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"**
7. Copy the **Client Secret**

### Step 2: Update .env.local
```env
GITHUB_CLIENT_ID=your-actual-client-id
GITHUB_CLIENT_SECRET=your-actual-client-secret
NEXTAUTH_SECRET=any-random-string-here
```

### Step 3: Restart the app
```bash
npm run dev
```

---

## 🎉 You're Ready!

### What Works Now:
✅ Email sign up and sign in  
✅ Demo account  
✅ All interview features  
✅ Practice questions  
✅ Dashboard access  

### Test Accounts:
- **Demo**: Automatically created when you click "Try Demo Account"
- **Your Account**: Use any email you want

### Common Issues:

**"Invalid login credentials"**
- You haven't created an account yet
- Click "Don't have an account? Sign up" first

**"profiles table not found"**
- This is okay! The app works without it
- Run the SQL above if you want profile features

**GitHub login not working**
- Make sure you added the correct Client ID and Secret
- The callback URL must match exactly

---

## Need Help?

1. **Email login issues**: Just create a new account
2. **GitHub login issues**: Use email login instead
3. **Database issues**: The app works without the database tables

The app is designed to work even if some features aren't configured!
