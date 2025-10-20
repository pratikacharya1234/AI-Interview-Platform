# 🔧 Deployment Issues & Fixes

**Date**: October 19, 2024  
**Status**: ⚠️ NEEDS DATABASE MIGRATION

---

## 🐛 Current Issues

### 1. **Database Schema Not Applied** ❌
**Error**: 
```
Failed to fetch interviews: column interview_sessions.interview_type does not exist
```

**Cause**: The production database schema hasn't been applied to your Supabase database.

**Fix**: Apply the database schema in Supabase SQL Editor

---

### 2. **Authentication Redirect Issue** ⚠️
**Error**:
```
No authenticated user, redirecting to signin
Authentication error: AuthSessionMissingError: Auth session missing!
```

**Cause**: Users not logged in, middleware redirecting to `/auth/signin`

**Fix**: Ensure you're logged in or testing with proper auth

---

### 3. **Multiple Supabase Instances** ⚠️
**Warning**:
```
Multiple GoTrueClient instances detected in the same browser context
```

**Cause**: Multiple Supabase client instances being created

**Fix**: This is a warning, not critical, but should be optimized

---

## ✅ CRITICAL FIX REQUIRED

### **Apply Database Schema to Supabase**

You MUST run the database schema in your Supabase project:

#### **Step 1: Go to Supabase Dashboard**
1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**

#### **Step 2: Run the Schema**
Copy and paste the entire contents of:
```
database/voice_interview_production_schema.sql
```

Or run these key commands:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create interview_sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    interview_type VARCHAR(50) NOT NULL DEFAULT 'voice',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    questions JSONB DEFAULT '[]',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    overall_score DECIMAL(5,2),
    feedback_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create interview_responses table
CREATE TABLE IF NOT EXISTS interview_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confidence DECIMAL(3,2),
    stage VARCHAR(50),
    analysis JSONB,
    sequence_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview FOREIGN KEY (interview_id) 
        REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- Create interview_feedback table
CREATE TABLE IF NOT EXISTS interview_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_id UUID NOT NULL,
    user_id UUID NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL,
    hiring_recommendation TEXT,
    scores JSONB NOT NULL DEFAULT '[]',
    strengths JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]',
    detailed_feedback TEXT,
    recommendations JSONB DEFAULT '[]',
    transcript TEXT,
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_feedback FOREIGN KEY (interview_id) 
        REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id 
    ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status 
    ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_responses_interview_id 
    ON interview_responses(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id 
    ON interview_feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_user_id 
    ON interview_feedback(user_id);
```

#### **Step 3: Verify Tables Created**
Run this query to check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('interview_sessions', 'interview_responses', 'interview_feedback');
```

You should see all 3 tables listed.

---

## 🔐 Authentication Setup

### **Option 1: Sign Up (Recommended for Testing)**
1. Go to your deployed site
2. Click "Get Started" or "Sign Up"
3. Create an account with email/password
4. Verify email if required
5. Log in

### **Option 2: Use GitHub OAuth**
1. Ensure GitHub OAuth is configured in Supabase
2. Click "Sign in with GitHub"
3. Authorize the application

### **Option 3: Test User (Development)**
Create a test user in Supabase:
```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);
```

---

## 🔍 Debugging Steps

### **1. Check Database Connection**
```sql
-- In Supabase SQL Editor
SELECT NOW();
```
If this works, your database is connected.

### **2. Check Tables Exist**
```sql
SELECT * FROM interview_sessions LIMIT 1;
```
If you get "relation does not exist", run the schema.

### **3. Check Authentication**
Open browser console and check:
```javascript
// Should show your session
console.log(await supabase.auth.getSession())
```

### **4. Clear Browser Cache**
- Clear cookies
- Clear local storage
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## 📝 Environment Variables Checklist

Ensure these are set in Vercel:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# NextAuth (REQUIRED)
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key

# GitHub OAuth (OPTIONAL)
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret

# Vapi (REQUIRED for voice interviews)
NEXT_PUBLIC_VAPI_WEB_TOKEN=your-vapi-token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your-workflow-id

# Gemini AI (REQUIRED)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key
```

---

## 🚀 Quick Fix Steps

### **Immediate Actions (5 minutes)**

1. **Apply Database Schema**
   - Go to Supabase SQL Editor
   - Run `database/voice_interview_production_schema.sql`
   - Verify tables created

2. **Create Test User**
   - Sign up on your site
   - Or use GitHub OAuth
   - Or create user via SQL

3. **Clear Browser Data**
   - Clear cookies and cache
   - Hard refresh page

4. **Test Again**
   - Log in
   - Navigate to dashboard
   - Check for errors

---

## ✅ Success Indicators

After applying fixes, you should see:
- ✅ No "column does not exist" errors
- ✅ No authentication errors
- ✅ Dashboard loads successfully
- ✅ Can create/view interviews
- ✅ No console errors

---

## 🆘 Still Having Issues?

### **Check Supabase Logs**
1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Look for errors

### **Check Vercel Logs**
1. Go to Vercel Dashboard
2. Select your deployment
3. Click "Logs" tab
4. Look for runtime errors

### **Common Issues**

| Error | Solution |
|-------|----------|
| Column does not exist | Apply database schema |
| Auth session missing | Log in or create account |
| Multiple clients warning | Ignore (non-critical) |
| Failed to fetch | Check API routes and env vars |
| CORS errors | Check Supabase settings |

---

## 📞 Support

If you're still stuck:
1. Check Supabase documentation
2. Check Next.js documentation
3. Review error logs carefully
4. Ensure all env vars are set

---

**Priority**: Apply database schema FIRST, then test authentication!

🎯 **Most Critical**: Run the SQL schema in Supabase!
