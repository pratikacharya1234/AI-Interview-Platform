# 🚀 Quick Fix Guide - 3 Steps to Fix Your App

## The Problem
Error: `Failed to load interviews` - Database schema mismatch

## The Solution (3 Steps)

### Step 1: Open Supabase SQL Editor
Go to your Supabase project → SQL Editor

### Step 2: Drop Old Tables (⚠️ This deletes all data)
```sql
-- Copy and paste the entire contents of:
database/drop_all_tables.sql

-- Then click RUN
```

### Step 3: Create New Tables
```sql
-- Copy and paste the entire contents of:
database/create_all_tables.sql

-- Then click RUN
```

## ✅ Done!

Your app is now fixed. Test by:
1. Sign in to your app
2. Go to `/interview/history`
3. Should see "No Interviews Yet" instead of error

## What Was Fixed?

- ✅ All user IDs now use UUID (matching Supabase auth)
- ✅ Added missing columns to interview_sessions
- ✅ Auto-create profile on user signup
- ✅ Proper foreign key relationships
- ✅ All API routes now work correctly

## Files Changed

1. **`database/create_all_tables.sql`** - Fixed schema
2. **`database/drop_all_tables.sql`** - Clean drop script
3. **`src/lib/supabase/database.ts`** - Updated types

## Need More Details?

See `COMPLETE_FIX_SUMMARY.md` for full documentation.

---

**That's it! Your database is now properly configured and all pages should work.**
