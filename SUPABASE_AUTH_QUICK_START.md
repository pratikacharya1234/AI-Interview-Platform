# ⚡ Supabase Auth Migration - Quick Start

**Time**: 30 minutes  
**Difficulty**: Easy with this guide

---

## 🚀 3-Step Migration

### **Step 1: Database (10 min)**

```bash
1. Open Supabase Dashboard → SQL Editor
2. Run: database/COMPLETE_SCHEMA.sql
3. Run: database/SUPABASE_AUTH_SCHEMA.sql
4. ✅ Done!
```

### **Step 2: Configure GitHub OAuth (10 min)**

```bash
1. Supabase Dashboard → Authentication → Providers
2. Enable "GitHub"
3. Add credentials:
   Client ID: <from GitHub>
   Client Secret: <from GitHub>
   Callback: https://your-project.supabase.co/auth/v1/callback
4. ✅ Done!
```

### **Step 3: Run Migration Script (10 min)**

```bash
# Run the automated script
./migrate-to-supabase-auth.sh

# Or manually:
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
cp middleware-supabase.ts middleware.ts
cp src/app/layout-supabase.tsx src/app/layout.tsx
cp src/components/layout/modern-layout-supabase.tsx src/components/layout/modern-layout.tsx

# Test
npm run dev
# Navigate to /auth/supabase-signin
```

---

## 📝 Files Created for You

### **Database**
- ✅ `database/SUPABASE_AUTH_SCHEMA.sql` - Auto-profile creation
- ✅ Profiles table with UUID
- ✅ Auto-create trigger

### **Auth Components**
- ✅ `src/lib/supabase/supabase-provider.tsx` - Auth provider
- ✅ `src/app/auth/supabase-signin/page.tsx` - New signin page
- ✅ `src/app/auth/callback/route.ts` - OAuth callback

### **Updated Files**
- ✅ `middleware-supabase.ts` - New middleware
- ✅ `src/app/layout-supabase.tsx` - New layout
- ✅ `src/components/layout/modern-layout-supabase.tsx` - New layout component

### **Guides**
- ✅ `SUPABASE_AUTH_MIGRATION.md` - Complete guide
- ✅ `migrate-to-supabase-auth.sh` - Automated script
- ✅ This file - Quick reference

---

## 🔄 Code Changes Needed

### **Before (NextAuth)**
```typescript
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
const userName = session?.user?.name
const userEmail = session?.user?.email
```

### **After (Supabase)**
```typescript
import { useUser } from '@/lib/supabase/supabase-provider'

const user = useUser()
const userName = user?.user_metadata.name
const userEmail = user?.email
const userId = user?.id  // Perfect UUID!
```

---

## ✅ Testing Checklist

- [ ] Sign in with GitHub works
- [ ] Profile auto-created in Supabase
- [ ] Dashboard loads with user data
- [ ] Protected routes redirect correctly
- [ ] User avatar displays
- [ ] No console errors

---

## 🎯 Key Benefits

| Feature | NextAuth | Supabase Auth |
|---------|----------|---------------|
| Setup | Complex | ✅ Simple |
| User ID | Email | ✅ UUID |
| Database | Separate | ✅ Integrated |
| Profiles | Manual | ✅ Automatic |
| Real-time | No | ✅ Yes |
| Code | More | ✅ Less |

---

## 📞 Quick Help

### **Issue: Can't sign in**
→ Check GitHub OAuth is enabled in Supabase

### **Issue: Profile not created**
→ Check trigger exists in database

### **Issue: Redirect loop**
→ Clear cookies and check middleware

### **Issue: User data not showing**
→ Use `user.user_metadata` not `user.metadata`

---

## 🎉 After Migration

Your app will have:
- ✅ Unified auth + database
- ✅ Auto-created profiles
- ✅ UUID user IDs everywhere
- ✅ Simpler codebase
- ✅ Better integration
- ✅ Real-time capabilities

---

**Ready? Run: `./migrate-to-supabase-auth.sh`** 🚀

**Full Guide**: See `SUPABASE_AUTH_MIGRATION.md`
