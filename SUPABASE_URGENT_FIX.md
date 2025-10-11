## 🚨 **URGENT: Supabase Configuration Required**

The **400 Bad Request error** means your Supabase Dashboard needs to be updated with the correct redirect URLs.

### **Step-by-Step Fix:**

#### **1. Go to Your Supabase Dashboard**
- Visit: https://supabase.com/dashboard
- Select your project: `frrdjatgghbrtdtgslkw`

#### **2. Navigate to Authentication Settings**
- Go to **Authentication** → **URL Configuration**

#### **3. Update Site URL**
Set the **Site URL** to:
```
http://localhost:3001
```

#### **4. Update Redirect URLs**
Add this **Redirect URL**:
```
http://localhost:3001/auth/github/callback
```

**Important**: Make sure to **SAVE** the changes!

#### **5. GitHub App Settings** 
Your GitHub app should have this **Authorization callback URL**:
```
http://localhost:3001/auth/github/callback
```

### **Why This Error Happens:**
- Supabase validates redirect URLs for security
- The URL `http://localhost:3001/auth/github/callback` must be explicitly allowed
- Currently your Supabase project likely has different URLs configured

### **After Updating Supabase:**
1. Wait 1-2 minutes for changes to propagate
2. Try GitHub OAuth again
3. The 400 error should be resolved

**This is the ONLY thing preventing GitHub OAuth from working!**