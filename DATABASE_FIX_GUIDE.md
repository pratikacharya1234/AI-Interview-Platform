# 🔧 Database Errors - Quick Fix Guide

**Issue**: Supabase 400/401/404 errors  
**Cause**: Missing database tables (`profiles`, `practice_attempts`)  
**Status**: ✅ **FIX READY**

---

## 🐛 Errors You're Seeing

```
❌ Failed to load resource: 400 (Bad Request)
❌ Failed to load resource: 401 (Unauthorized)
❌ Failed to load resource: 404 (Not Found)
❌ Error fetching attempts: Object
❌ Error loading profile: Object
❌ Error creating profile: Object
```

### **Root Cause**
Your Supabase database is missing critical tables:
1. ❌ `profiles` table - User profiles
2. ❌ `practice_attempts` table - Practice question attempts

---

## ✅ Quick Fix (5 Minutes)

### **Step 1: Open Supabase SQL Editor**
```bash
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New query"
```

### **Step 2: Run Complete Schema**
```bash
1. Open file: database/COMPLETE_SCHEMA.sql
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. Wait for "Success" message
```

### **Step 3: Verify Tables Created**
```bash
1. Go to "Table Editor" in Supabase
2. You should see these tables:
   ✅ profiles
   ✅ practice_attempts
   ✅ interview_sessions
   ✅ interview_responses
   ✅ interview_feedback
   ✅ voice_analytics
   ✅ achievements
   ✅ user_progress
   ✅ leaderboard
   ✅ streaks
```

### **Step 4: Refresh Your App**
```bash
1. Go back to your app
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Sign in again
4. Errors should be gone! ✅
```

---

## 📊 What Was Fixed

### **New Tables Created**

#### **1. `profiles` Table** ✅
- Stores user profile information
- Links to NextAuth authentication
- Tracks user statistics and preferences
- **Fixes**: 400/401 errors on profile operations

#### **2. `practice_attempts` Table** ✅
- Stores practice question attempts
- Tracks scores and feedback
- Links to user profiles
- **Fixes**: 404 errors on practice attempts

#### **3. Other Tables** ✅
- `interview_sessions` - Interview data
- `interview_responses` - Interview transcripts
- `interview_feedback` - AI feedback
- `voice_analytics` - Voice analysis
- `achievements` - Gamification
- `user_progress` - Skill tracking
- `leaderboard` - Rankings
- `streaks` - Daily streaks

---

## 🔍 Verify Fix Worked

### **Check 1: No Console Errors**
```bash
1. Open browser console (F12)
2. Refresh page
3. Should see NO Supabase errors
4. ✅ If no errors, fix worked!
```

### **Check 2: Profile Loads**
```bash
1. Navigate to /dashboard
2. Your profile should load
3. No "Error loading profile" messages
4. ✅ If profile loads, fix worked!
```

### **Check 3: Database Tables**
```bash
1. Go to Supabase → Table Editor
2. Click on "profiles" table
3. Should see your user row
4. ✅ If row exists, fix worked!
```

---

## 🚨 If Errors Persist

### **Issue 1: "Permission denied" errors**
**Solution**: RLS policies are too strict

```sql
-- Run this in Supabase SQL Editor to make policies more permissive
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attempts DISABLE ROW LEVEL SECURITY;

-- Or update policies to be more permissive (already in COMPLETE_SCHEMA.sql)
```

### **Issue 2: "Table already exists" errors**
**Solution**: Some tables exist but are missing columns

```sql
-- Drop and recreate (WARNING: This deletes data!)
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS practice_attempts CASCADE;

-- Then run COMPLETE_SCHEMA.sql again
```

### **Issue 3: Still getting 401 errors**
**Solution**: Check Supabase API keys

```bash
# Verify in .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Get correct keys from:
# Supabase Dashboard → Settings → API
```

---

## 📝 Understanding the Errors

### **400 Bad Request**
- **Meaning**: Invalid query or missing columns
- **Cause**: Table structure doesn't match code expectations
- **Fix**: Run COMPLETE_SCHEMA.sql to create proper structure

### **401 Unauthorized**
- **Meaning**: Permission denied by Row Level Security (RLS)
- **Cause**: RLS policies too restrictive
- **Fix**: COMPLETE_SCHEMA.sql has permissive policies

### **404 Not Found**
- **Meaning**: Table or endpoint doesn't exist
- **Cause**: Missing `practice_attempts` table
- **Fix**: COMPLETE_SCHEMA.sql creates the table

---

## 🎯 What Changed

### **Before (Broken)**
```
❌ profiles table: MISSING
❌ practice_attempts table: MISSING
❌ RLS policies: TOO STRICT
❌ Permissions: NOT GRANTED
```

### **After (Fixed)**
```
✅ profiles table: CREATED
✅ practice_attempts table: CREATED
✅ RLS policies: PERMISSIVE
✅ Permissions: GRANTED TO ALL
```

---

## 🔐 Security Note

The new schema uses **permissive RLS policies** to avoid auth issues during development. This means:

- ✅ **Development**: Works great, no permission issues
- ⚠️ **Production**: You may want to tighten security

### **For Production (Optional)**

Update RLS policies to be more restrictive:

```sql
-- Example: Restrict profile access to owner only
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    USING (id = current_user_id());  -- Replace with your auth logic
```

---

## ✅ Verification Checklist

After running the fix:

- [ ] Ran `COMPLETE_SCHEMA.sql` in Supabase
- [ ] Saw "Success" message in SQL Editor
- [ ] Verified tables exist in Table Editor
- [ ] Refreshed app (hard refresh)
- [ ] No console errors
- [ ] Profile loads on dashboard
- [ ] Can access interview pages
- [ ] No 400/401/404 errors

---

## 📚 Files Reference

### **Database Files**
1. **`database/COMPLETE_SCHEMA.sql`** ⭐ **USE THIS**
   - Complete schema with ALL tables
   - Includes profiles and practice_attempts
   - Permissive RLS policies
   - Ready to run

2. **`database/READY_TO_RUN.sql`** ⚠️ **INCOMPLETE**
   - Missing profiles table
   - Missing practice_attempts table
   - Don't use this one

---

## 🚀 Quick Command Reference

### **Run Schema**
```sql
-- Copy contents of database/COMPLETE_SCHEMA.sql
-- Paste in Supabase SQL Editor
-- Click "Run"
```

### **Check Tables**
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### **Check Profiles Table**
```sql
-- View profiles
SELECT * FROM profiles LIMIT 10;
```

### **Check Practice Attempts**
```sql
-- View practice attempts
SELECT * FROM practice_attempts LIMIT 10;
```

---

## 🎉 Success!

After running the fix:
- ✅ No more Supabase errors
- ✅ Profile loads correctly
- ✅ Practice attempts work
- ✅ All database operations functional

---

## 📞 Still Having Issues?

### **Debug Steps**

1. **Check Supabase Connection**
   ```javascript
   // In browser console
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

2. **Check Table Exists**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM profiles LIMIT 1;
   ```

3. **Check RLS Policies**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

4. **Check Permissions**
   ```sql
   -- In Supabase SQL Editor
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'profiles';
   ```

---

**Fix Created**: October 23, 2025  
**Status**: ✅ READY TO APPLY  
**Time to Fix**: ~5 minutes

**Run `COMPLETE_SCHEMA.sql` and you're good to go!** 🚀
