# 🔐 Supabase Setup Guide

## ⚠️ **Critical: Email Confirmation Settings**

Your demo login is failing because Supabase has email confirmation enabled. You need to configure this in Supabase.

---

## 🚀 **Quick Fix: Disable Email Confirmation (For Development)**

### **Step 1: Go to Supabase Dashboard**
1. Visit https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Settings**

### **Step 2: Disable Email Confirmation**
1. Scroll to **"Email Auth"** section
2. Find **"Confirm email"** toggle
3. **Turn it OFF** (for development/testing)
4. Click **Save**

This allows users to sign up and log in immediately without email verification.

---

## 🎯 **Alternative: Create Demo User Manually**

If you want to keep email confirmation enabled, create the demo user manually:

### **Option 1: Via Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Fill in:
   - Email: `demo.user@aiinterview.app`
   - Password: `DemoPass123!`
   - Auto Confirm User: ✅ **Check this box**
4. Click **Create user**

### **Option 2: Via SQL**
Run this in Supabase SQL Editor:

```sql
-- Create a demo user with confirmed email
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'demo.user@aiinterview.app',
    crypt('DemoPass123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);
```

---

## 📧 **Email Settings Explained**

### **Confirm Email** (Currently Enabled)
- ✅ **ON**: Users must verify email before logging in
- ❌ **OFF**: Users can log in immediately after signup

**Recommendation**: 
- **Development**: Turn OFF
- **Production**: Turn ON

### **Email Templates**
You can customize email templates in:
**Authentication** → **Email Templates**

Templates available:
- Confirmation email
- Magic link
- Password reset
- Email change

---

## 🔒 **Production Settings**

For production, you should:

### **1. Enable Email Confirmation** ✅
- Prevents fake accounts
- Verifies real email addresses
- Better security

### **2. Configure Email Provider**
Default: Supabase SMTP (limited to 3 emails/hour)

**Recommended**: Use your own SMTP
1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure:
   - SMTP Host (e.g., smtp.gmail.com)
   - SMTP Port (587 for TLS)
   - SMTP Username
   - SMTP Password
   - Sender email
   - Sender name

**Popular Options**:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **AWS SES** (very cheap, high limits)
- **Gmail SMTP** (free, but limited)

### **3. Set Up Custom Domain**
1. Go to **Project Settings** → **Auth**
2. Add your domain to **Site URL**
3. Add redirect URLs to **Redirect URLs**

Example:
```
Site URL: https://your-domain.com
Redirect URLs:
  - https://your-domain.com/auth/callback
  - http://localhost:3000/auth/callback (for dev)
```

---

## 🧪 **Testing Authentication**

### **Test Email Signup**
1. Use a real email address
2. Sign up
3. Check email for confirmation link
4. Click link to confirm
5. Sign in

### **Test Demo Account**
1. Click "Try Demo Account"
2. Should log in immediately (if email confirmation is OFF)
3. Or check email for confirmation (if email confirmation is ON)

### **Test GitHub OAuth**
1. Configure GitHub OAuth in Supabase:
   - Go to **Authentication** → **Providers**
   - Enable **GitHub**
   - Add GitHub Client ID and Secret
2. Click "Continue with GitHub"
3. Authorize app
4. Should redirect to dashboard

---

## 🐛 **Common Issues**

### **Issue 1: "Email address is invalid"**
**Cause**: Supabase rejects certain email domains (like `example.com`)

**Fix**: Use a real domain or configure allowed domains
- Go to **Authentication** → **Settings**
- Check **Email Domain Allowlist**

### **Issue 2: "Email not confirmed"**
**Cause**: Email confirmation is enabled

**Fix**: 
- Disable email confirmation (dev)
- Or manually confirm user in dashboard
- Or click confirmation link in email

### **Issue 3: "Too many requests"**
**Cause**: Supabase SMTP rate limit (3 emails/hour)

**Fix**: Configure custom SMTP provider

### **Issue 4: "Invalid redirect URL"**
**Cause**: Callback URL not in allowed list

**Fix**: Add to **Redirect URLs** in Auth settings

---

## 📝 **Environment Variables**

Make sure these are set in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

And in Vercel (for production):
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all the above variables

---

## ✅ **Quick Checklist**

- [ ] Disable email confirmation (for dev)
- [ ] Create demo user manually (if needed)
- [ ] Configure SMTP (for production)
- [ ] Add redirect URLs
- [ ] Test email signup
- [ ] Test demo login
- [ ] Test GitHub OAuth (if configured)
- [ ] Run database schema (`READY_TO_RUN.sql`)

---

## 🎯 **Recommended Setup**

### **For Development**
```
✅ Email confirmation: OFF
✅ Demo user: Created manually
✅ SMTP: Use Supabase default
✅ Redirect URLs: localhost:3000
```

### **For Production**
```
✅ Email confirmation: ON
✅ Demo user: Remove or keep with confirmed email
✅ SMTP: Custom provider (SendGrid/Mailgun)
✅ Redirect URLs: your-domain.com
✅ Custom domain configured
```

---

## 🆘 **Still Having Issues?**

1. **Check Supabase Logs**
   - Dashboard → Logs → Auth Logs
   - Look for failed login attempts

2. **Check Browser Console**
   - F12 → Console
   - Look for auth errors

3. **Verify Environment Variables**
   - Make sure all are set correctly
   - Restart dev server after changes

4. **Test with Real Email**
   - Use your own email
   - Check spam folder for confirmation email

---

**🎯 Next Step: Go to Supabase Dashboard and disable email confirmation for development!**
