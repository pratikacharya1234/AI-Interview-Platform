## 🔍 **GitHub OAuth Debugging Guide**

### **Current Configuration:**
- **Application URL**: `http://localhost:3001`
- **GitHub Callback**: `http://localhost:3001/auth/github/callback`
- **Error**: `400 Bad Request` from Supabase

### **Debugging Steps:**

#### **1. Check Current Supabase Settings**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select project: `frrdjatgghbrtdtgslkw` 
3. Go to **Authentication** → **URL Configuration**
4. Check what **Site URL** and **Redirect URLs** are currently set

#### **2. Required Supabase Settings**
**Site URL:**
```
http://localhost:3001
```

**Redirect URLs (add this):**
```
http://localhost:3001/auth/github/callback
```

#### **3. GitHub App Settings**
Your GitHub app should have:
```
Authorization callback URL: http://localhost:3001/auth/github/callback
```

#### **4. Test the Flow**
1. Update Supabase settings
2. Wait 2 minutes for propagation
3. Try GitHub OAuth again
4. Should redirect successfully

### **Common Issues:**
- ❌ **Wrong port**: Using 3000 instead of 3001
- ❌ **Missing URL**: Redirect URL not added to Supabase
- ❌ **Typo**: Incorrect callback path
- ❌ **Not saved**: Forgot to save Supabase settings

### **Expected Flow:**
1. Click "Sign in with GitHub"
2. Redirect to GitHub OAuth
3. GitHub redirects to: `http://localhost:3001/auth/github/callback`
4. Callback page processes auth
5. Redirect to dashboard

**The 400 error will disappear once Supabase is configured correctly!**