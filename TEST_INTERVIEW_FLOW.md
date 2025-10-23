# 🧪 Interview Flow Testing Guide

**Date**: October 23, 2025  
**Purpose**: Verify all interview pages work correctly after authentication fixes

---

## 🚀 Quick Start Testing

### Prerequisites
```bash
# 1. Start the development server
npm run dev

# 2. Open browser to
http://localhost:3001

# 3. Have GitHub account ready for OAuth
```

---

## ✅ Test Scenarios

### **Test 1: Unauthenticated User Flow**

#### Steps:
1. Open browser in **incognito/private mode**
2. Navigate to: `http://localhost:3001/interview`
3. **Expected Result**: 
   - ✅ Redirected to `/auth/signin?redirect=%2Finterview`
   - ✅ See GitHub signin button
4. Click "Continue with GitHub"
5. **Expected Result**:
   - ✅ GitHub OAuth flow starts
   - ✅ After authorization, redirected back to `/interview`
   - ✅ Interview page loads with sidebar
6. **Status**: ⬜ Not Tested | ✅ PASS | ❌ FAIL

---

### **Test 2: Authenticated User Direct Access**

#### Steps:
1. Ensure you're signed in
2. Navigate to: `http://localhost:3001/interview`
3. **Expected Result**:
   - ✅ Page loads immediately
   - ✅ No redirects
   - ✅ Sidebar visible
   - ✅ Three interview cards displayed (Audio, Text, Video)
4. **Status**: ⬜ Not Tested | ✅ PASS | ❌ FAIL

---

### **Test 3: Voice/Audio Interview Setup**

#### Steps:
1. From `/interview`, click "Start Audio Interview"
2. **Expected Result**:
   - ✅ Redirected to `/interview/audio`
   - ✅ Setup form displayed
3. Fill in the form:
   - Position: "Senior Software Engineer"
   - Company: "Tech Corp"
   - Experience: "Mid-Level"
   - Tech Stack: Add "React", "Node.js", "TypeScript" (press Enter after each)
4. **Expected Result**:
   - ✅ Tech stack badges appear
   - ✅ No errors
5. Click "Start Voice Interview"
6. **Expected Result**:
   - ✅ Interview session starts
   - ✅ No authentication errors
   - ✅ Vapi agent initializes
7. **Status**: ⬜ Not Tested | ✅ PASS | ❌ FAIL

---

### **Test 4: Text Interview Flow**

#### Steps:
1. Navigate to `/interview`
2. Click "Start Text Interview"
3. **Expected Result**:
   - ✅ Redirected to `/interview/text`
   - ✅ Text interview interface loads
   - ✅ No authentication errors
4. **Status**: ⬜ Not Tested | ✅ PASS | ❌ FAIL

---

### **Test 5: Video Interview Flow**

#### Steps:
1. Navigate to `/interview`
2. Click "Start Video Interview"
3. **Expected Result**:
   - ✅ Redirected to `/interview/video`
   - ✅ Video interview interface loads
   - ✅ Camera permission request (if first time)
   - ✅ No authentication errors
4. **Status**: ⬜ Not Tested | ✅ PASS | ❌ FAIL

---

### **Test 6: Interview History Access**

#### Steps:
1. Click sidebar menu item "Interviews" → "History"
2. **Expected Result**:
   - ✅ Redirected to `/interview/history`
   - ✅ Page loads with past interviews (or empty state)
   - ✅ No authentication errors
3. **Status**: ⬜ Not Tested | ✅ PASS | ❌ FAIL

---

### **Test 7: Company-Specific Interviews**

#### Steps:
1. Click sidebar menu item "Practice" → "Company Specific"
2. **Expected Result**:
   - ✅ Redirected to `/interview/company`
   - ✅ Company cards displayed (Google, Amazon, etc.)
   - ✅ Search and filters work
3. Click on any company card "Start Interview"
4. **Expected Result**:
   - ✅ Redirected to `/interview?company=<company-id>`
   - ✅ No errors
4. **Status**: ⬜ Not Tested | ✅ PASS | ❌ FAIL

---

### **Test 8: AI Personas**

#### Steps:
1. Click sidebar menu item "Practice" → "AI Personas"
2. **Expected Result**:
   - ✅ Redirected to `/interview/persona`
   - ✅ Persona cards displayed (Friendly Mentor, Technical Expert, etc.)
   - ✅ Difficulty filters work
3. Click on any persona "Start Interview"
4. **Expected Result**:
   - ✅ Redirected to `/interview?persona=<persona-id>`
   - ✅ No errors
4. **Status**: ⬜ Not Tested | ✅ PASS | ❌ FAIL

---

### **Test 9: Session Persistence**

#### Steps:
1. Start any interview
2. Refresh the page (F5 or Cmd+R)
3. **Expected Result**:
   - ✅ Session persists
   - ✅ No re-authentication required
   - ✅ Page loads normally
4. **Status**: ⬜ Not Tested | ✅ PASS | ❌ FAIL

---

### **Test 10: Deep Link Access**

#### Steps:
1. Copy URL: `http://localhost:3001/interview/voice`
2. Open in new tab (while signed in)
3. **Expected Result**:
   - ✅ Page loads directly
   - ✅ No redirect to signin
   - ✅ No redirect loops
4. **Status**: ⬜ Not Tested | ✅ PASS | ❌ FAIL

---

## 🐛 Common Issues & Solutions

### Issue 1: "Redirecting to signin" loop
**Symptoms**: Page keeps redirecting between `/interview` and `/auth/signin`

**Solution**:
- Clear browser cookies and cache
- Check that `NEXTAUTH_URL` matches your dev URL
- Verify `NEXTAUTH_SECRET` is set and 32+ characters

### Issue 2: "Session not found" error
**Symptoms**: Can't access interview pages even after signin

**Solution**:
- Check browser console for NextAuth errors
- Verify GitHub OAuth is configured correctly
- Check that callback URL matches: `http://localhost:3001/api/auth/callback/github`

### Issue 3: Voice interview doesn't start
**Symptoms**: Setup form works but interview doesn't start

**Solution**:
- Check that `NEXT_PUBLIC_VAPI_WEB_TOKEN` is set
- Check that `NEXT_PUBLIC_VAPI_WORKFLOW_ID` is set
- Verify Supabase connection (check console for errors)

### Issue 4: "Failed to create interview session"
**Symptoms**: Error when clicking "Start Interview"

**Solution**:
- Check Supabase connection
- Verify `interview_sessions` table exists
- Check user has proper permissions

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Unauthenticated Flow | ⬜ | |
| 2. Authenticated Access | ⬜ | |
| 3. Voice Interview | ⬜ | |
| 4. Text Interview | ⬜ | |
| 5. Video Interview | ⬜ | |
| 6. Interview History | ⬜ | |
| 7. Company-Specific | ⬜ | |
| 8. AI Personas | ⬜ | |
| 9. Session Persistence | ⬜ | |
| 10. Deep Link Access | ⬜ | |

**Overall Status**: ⬜ Not Started | 🟡 In Progress | ✅ All Pass | ❌ Some Failures

---

## 🔍 Debugging Checklist

If tests fail, check these items:

### Environment Variables
```bash
# Check .env.local file has all required variables
cat .env.local | grep -E "NEXTAUTH|GITHUB|SUPABASE|VAPI|GOOGLE"
```

### Required Variables:
- ✅ `NEXTAUTH_URL=http://localhost:3001`
- ✅ `NEXTAUTH_SECRET=<32+ char string>`
- ✅ `GITHUB_CLIENT_ID=<your-github-client-id>`
- ✅ `GITHUB_CLIENT_SECRET=<your-github-secret>`
- ✅ `NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>`
- ✅ `NEXT_PUBLIC_VAPI_WEB_TOKEN=<your-vapi-token>`
- ✅ `NEXT_PUBLIC_VAPI_WORKFLOW_ID=<your-workflow-id>`
- ✅ `GOOGLE_GENERATIVE_AI_API_KEY=<your-gemini-key>`

### Browser Console
```javascript
// Check session
fetch('/api/auth/session').then(r => r.json()).then(console.log)

// Check Supabase connection
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### Server Logs
Look for these messages in terminal:
- ✅ "No authenticated user, redirecting to signin" (middleware working)
- ✅ "Sign in successful! Redirecting..." (auth working)
- ❌ "NextAuth token check error" (auth issue)
- ❌ "Failed to create interview session" (database issue)

---

## 🚀 Production Testing

Before deploying, test on production build:

```bash
# Build for production
npm run build

# Start production server
npm start

# Test all scenarios above on http://localhost:3000
```

### Production-Specific Checks:
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Update GitHub OAuth callback URL to production domain
- [ ] Test authentication flow on production URL
- [ ] Verify all environment variables are set in deployment platform
- [ ] Test interview flows on production
- [ ] Check error tracking (Sentry, etc.)

---

## 📝 Test Report Template

```markdown
## Test Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: Development / Production
**Browser**: Chrome / Firefox / Safari / Edge

### Test Results:
- Test 1: ✅ PASS / ❌ FAIL - [Notes]
- Test 2: ✅ PASS / ❌ FAIL - [Notes]
- Test 3: ✅ PASS / ❌ FAIL - [Notes]
...

### Issues Found:
1. [Issue description]
   - Severity: Critical / High / Medium / Low
   - Steps to reproduce: ...
   - Expected: ...
   - Actual: ...

### Overall Assessment:
✅ Ready for production
🟡 Minor issues, can deploy with monitoring
❌ Critical issues, do not deploy

### Recommendations:
- [Recommendation 1]
- [Recommendation 2]
```

---

## ✅ Sign-Off

Once all tests pass:

- [ ] All 10 test scenarios completed
- [ ] No critical issues found
- [ ] Environment variables verified
- [ ] Production build tested
- [ ] Documentation updated
- [ ] Team notified

**Approved By**: _______________  
**Date**: _______________

---

**Testing Guide Created**: October 23, 2025  
**Last Updated**: October 23, 2025  
**Version**: 1.0
