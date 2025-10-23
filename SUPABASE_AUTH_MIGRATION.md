# 🔄 Migration Guide: NextAuth → Supabase Auth

**Date**: October 23, 2025  
**Time Required**: 2-3 hours  
**Difficulty**: Medium  
**Status**: ✅ **READY TO MIGRATE**

---

## 🎯 Why Migrate?

### **Benefits**
- ✅ **Unified System**: Auth + Database in one place
- ✅ **Simpler Code**: Less boilerplate, easier to maintain
- ✅ **Better Integration**: User IDs match perfectly with database
- ✅ **Auto Profiles**: Profiles created automatically on signup
- ✅ **Real-time**: Built-in presence and real-time features
- ✅ **Less Dependencies**: Remove NextAuth package

### **What Changes**
- ❌ Remove: NextAuth, next-auth package
- ✅ Add: Supabase Auth Helpers
- ✅ Update: All auth-related components
- ✅ Update: Database schema for UUID user_ids

---

## 📋 Migration Checklist

### **Phase 1: Database Setup** (30 minutes)

- [ ] **Step 1.1**: Run `COMPLETE_SCHEMA.sql` in Supabase (if not done)
- [ ] **Step 1.2**: Run `SUPABASE_AUTH_SCHEMA.sql` in Supabase
- [ ] **Step 1.3**: Verify tables created correctly
- [ ] **Step 1.4**: Test auto-profile trigger

### **Phase 2: Configure Supabase Auth** (15 minutes)

- [ ] **Step 2.1**: Go to Supabase Dashboard → Authentication → Providers
- [ ] **Step 2.2**: Enable GitHub provider
- [ ] **Step 2.3**: Add GitHub OAuth credentials:
  ```
  Client ID: <your-github-client-id>
  Client Secret: <your-github-client-secret>
  Callback URL: https://your-project.supabase.co/auth/v1/callback
  ```
- [ ] **Step 2.4**: Save and test in Supabase

### **Phase 3: Install Dependencies** (5 minutes)

- [ ] **Step 3.1**: Install Supabase Auth Helpers
  ```bash
  npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
  ```

- [ ] **Step 3.2**: Remove NextAuth (optional - do after testing)
  ```bash
  npm uninstall next-auth
  ```

### **Phase 4: Update Code** (60 minutes)

- [ ] **Step 4.1**: Replace `middleware.ts` with `middleware-supabase.ts`
  ```bash
  mv middleware.ts middleware-nextauth-backup.ts
  mv middleware-supabase.ts middleware.ts
  ```

- [ ] **Step 4.2**: Replace `src/app/layout.tsx` with `layout-supabase.tsx`
  ```bash
  mv src/app/layout.tsx src/app/layout-nextauth-backup.tsx
  mv src/app/layout-supabase.tsx src/app/layout.tsx
  ```

- [ ] **Step 4.3**: Update signin page
  ```bash
  # Use the new Supabase signin page
  # Navigate users to /auth/supabase-signin instead of /auth/signin
  ```

- [ ] **Step 4.4**: Update all components using `useSession` from next-auth
  - Replace: `import { useSession } from 'next-auth/react'`
  - With: `import { useUser } from '@/lib/supabase/supabase-provider'`

### **Phase 5: Update Components** (45 minutes)

Components that need updating:
- [ ] `src/components/layout/modern-layout.tsx` → Use `modern-layout-supabase.tsx`
- [ ] `src/components/navigation/top-bar.tsx`
- [ ] `src/app/dashboard/page.tsx`
- [ ] `src/app/profile/page.tsx`
- [ ] Any component using `useSession` or `session?.user`

### **Phase 6: Testing** (30 minutes)

- [ ] **Test 6.1**: Clear browser cache and cookies
- [ ] **Test 6.2**: Sign in with GitHub
- [ ] **Test 6.3**: Verify profile auto-created in Supabase
- [ ] **Test 6.4**: Navigate to protected pages
- [ ] **Test 6.5**: Test sign out
- [ ] **Test 6.6**: Test redirect after signin
- [ ] **Test 6.7**: Check console for errors

---

## 🚀 Step-by-Step Instructions

### **STEP 1: Database Migration**

#### **1.1 Run Complete Schema**
```bash
# If you haven't already:
1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Open: database/COMPLETE_SCHEMA.sql
4. Copy all contents
5. Paste in SQL Editor
6. Click "Run"
7. Wait for success message
```

#### **1.2 Run Supabase Auth Schema**
```bash
1. In Supabase SQL Editor
2. Open: database/SUPABASE_AUTH_SCHEMA.sql
3. Copy all contents
4. Paste in SQL Editor
5. Click "Run"
6. Wait for success message
```

#### **1.3 Verify Tables**
```sql
-- Run this query to check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see:
-- ✅ profiles (with UUID id)
-- ✅ interview_sessions
-- ✅ practice_attempts
-- ✅ etc.
```

#### **1.4 Test Auto-Profile Trigger**
```sql
-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Should return:
-- trigger_name: on_auth_user_created
-- event_manipulation: INSERT
-- event_object_table: users
```

---

### **STEP 2: Configure GitHub OAuth in Supabase**

#### **2.1 Get GitHub OAuth Credentials**
```bash
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: AI Interview Platform
   - Homepage URL: http://localhost:3001 (for dev)
   - Authorization callback URL: 
     https://your-project.supabase.co/auth/v1/callback
4. Click "Register application"
5. Copy Client ID
6. Generate new Client Secret and copy it
```

#### **2.2 Add to Supabase**
```bash
1. Go to Supabase Dashboard
2. Click "Authentication" → "Providers"
3. Find "GitHub" and click to expand
4. Toggle "Enable Sign in with GitHub"
5. Paste:
   - Client ID: <your-github-client-id>
   - Client Secret: <your-github-client-secret>
6. Click "Save"
```

---

### **STEP 3: Install Dependencies**

```bash
# Install Supabase Auth Helpers
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react

# Verify installation
npm list | grep supabase
# Should show:
# ├── @supabase/auth-helpers-nextjs@...
# ├── @supabase/auth-helpers-react@...
# └── @supabase/supabase-js@...
```

---

### **STEP 4: Update Files**

#### **4.1 Update Middleware**
```bash
# Backup old middleware
cp middleware.ts middleware-nextauth-backup.ts

# Use new Supabase middleware
cp middleware-supabase.ts middleware.ts
```

#### **4.2 Update Layout**
```bash
# Backup old layout
cp src/app/layout.tsx src/app/layout-nextauth-backup.tsx

# Use new Supabase layout
cp src/app/layout-supabase.tsx src/app/layout.tsx
```

#### **4.3 Update ModernLayout**
```bash
# Backup old layout
cp src/components/layout/modern-layout.tsx src/components/layout/modern-layout-nextauth-backup.tsx

# Use new Supabase layout
cp src/components/layout/modern-layout-supabase.tsx src/components/layout/modern-layout.tsx
```

---

### **STEP 5: Update Components**

#### **Pattern to Follow**

**Before (NextAuth):**
```typescript
import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Not signed in</div>
  
  const user = session?.user
  
  return <div>Hello {user?.name}</div>
}
```

**After (Supabase):**
```typescript
import { useUser } from '@/lib/supabase/supabase-provider'

export function MyComponent() {
  const user = useUser()
  
  if (!user) return <div>Loading...</div>
  
  return <div>Hello {user.user_metadata.name}</div>
}
```

#### **User Data Access**

**NextAuth:**
```typescript
session?.user?.name
session?.user?.email
session?.user?.image
```

**Supabase:**
```typescript
user?.user_metadata.name
user?.email
user?.user_metadata.avatar_url
user?.id  // UUID - perfect for database!
```

---

### **STEP 6: Update Environment Variables**

#### **Remove (NextAuth):**
```bash
# Delete these from .env.local:
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

#### **Keep (Supabase):**
```bash
# These stay the same:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

---

### **STEP 7: Update Navigation Links**

Update all signin links:

**Before:**
```typescript
<Link href="/auth/signin">Sign In</Link>
```

**After:**
```typescript
<Link href="/auth/supabase-signin">Sign In</Link>
```

---

## 🧪 Testing Guide

### **Test 1: Sign In Flow**
```bash
1. Clear browser cookies
2. Navigate to http://localhost:3001
3. Click "Sign In"
4. Should redirect to /auth/supabase-signin
5. Click "Continue with GitHub"
6. Authorize on GitHub
7. Should redirect back to /dashboard
8. ✅ PASS if you see dashboard
```

### **Test 2: Profile Auto-Creation**
```bash
1. After signing in, go to Supabase Dashboard
2. Click "Table Editor" → "profiles"
3. Should see your profile row with:
   - id: UUID (matches auth.users.id)
   - email: Your GitHub email
   - name: Your GitHub name
   - avatar_url: Your GitHub avatar
4. ✅ PASS if profile exists
```

### **Test 3: Protected Routes**
```bash
1. Sign out
2. Try to access /dashboard directly
3. Should redirect to /auth/supabase-signin
4. Sign in
5. Should redirect back to /dashboard
6. ✅ PASS if redirect works
```

### **Test 4: User Data Display**
```bash
1. Sign in
2. Navigate to /profile or /dashboard
3. Should see your:
   - Name
   - Email
   - Avatar
4. ✅ PASS if data displays correctly
```

### **Test 5: Interview Pages**
```bash
1. Navigate to /interview
2. Click "Start Audio Interview"
3. Should load without errors
4. User ID should be UUID
5. ✅ PASS if no errors
```

---

## 🔧 Troubleshooting

### **Issue 1: "Invalid login credentials"**
**Solution**: Check GitHub OAuth is configured correctly in Supabase

### **Issue 2: Profile not created**
**Solution**: Check trigger exists and is enabled
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### **Issue 3: Redirect loop**
**Solution**: Clear cookies and check middleware logic

### **Issue 4: User data not showing**
**Solution**: Check you're using `user.user_metadata` not `user.metadata`

### **Issue 5: Database errors**
**Solution**: Verify all user_id columns are UUID type

---

## 📊 Migration Progress Tracker

### **Database**
- [ ] COMPLETE_SCHEMA.sql run
- [ ] SUPABASE_AUTH_SCHEMA.sql run
- [ ] Tables verified
- [ ] Trigger tested

### **Supabase Config**
- [ ] GitHub OAuth enabled
- [ ] Credentials added
- [ ] Callback URL set

### **Code Updates**
- [ ] Dependencies installed
- [ ] Middleware updated
- [ ] Layout updated
- [ ] Components updated
- [ ] Environment variables updated

### **Testing**
- [ ] Sign in works
- [ ] Profile auto-created
- [ ] Protected routes work
- [ ] User data displays
- [ ] No console errors

---

## ✅ Post-Migration Cleanup

After everything works:

```bash
# 1. Remove NextAuth package
npm uninstall next-auth

# 2. Delete backup files
rm middleware-nextauth-backup.ts
rm src/app/layout-nextauth-backup.tsx
rm src/components/layout/modern-layout-nextauth-backup.tsx

# 3. Delete old NextAuth files
rm -rf src/app/api/auth/[...nextauth]
rm src/app/auth/signin/page.tsx  # Old NextAuth signin

# 4. Update package.json scripts if needed

# 5. Commit changes
git add .
git commit -m "Migrate from NextAuth to Supabase Auth"
```

---

## 🎉 Success Criteria

Migration is complete when:
- ✅ Users can sign in with GitHub
- ✅ Profiles auto-create in database
- ✅ Protected routes work correctly
- ✅ User data displays everywhere
- ✅ No console errors
- ✅ All tests pass
- ✅ NextAuth removed

---

## 📞 Need Help?

### **Common Questions**

**Q: Can I keep both NextAuth and Supabase Auth?**  
A: Not recommended. Choose one to avoid conflicts.

**Q: Will existing users lose data?**  
A: No, but they'll need to sign in again with GitHub.

**Q: What about existing interview data?**  
A: Run the migration SQL to convert user_ids to UUIDs.

**Q: Can I use other OAuth providers?**  
A: Yes! Supabase supports Google, Facebook, etc.

---

**Migration Guide Version**: 1.0  
**Last Updated**: October 23, 2025  
**Status**: ✅ READY TO USE

**Good luck with the migration!** 🚀
