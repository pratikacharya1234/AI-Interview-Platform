# 🎤 Audio Interview Testing Guide

## Quick Test Steps

### 1. Start the Application
```bash
npm run dev
```

### 2. Sign In
- Go to http://localhost:3000/auth/signin
- Use one of these options:
  - **Demo Account**: Click "Try Demo Account"
  - **Email**: Create account with any email/password

### 3. Access Audio Interview
- After login, go to: http://localhost:3000/interview/audio
- Or click "Audio Interview" from the navigation

### 4. Test the Setup Page
You should see:
- ✅ Form for company details
- ✅ Position input
- ✅ Job description textarea
- ✅ Experience level selector
- ✅ Interview type options
- ✅ Focus areas checkboxes

### 5. Start Interview
1. Fill in required fields:
   - Company: "Test Company"
   - Position: "Software Engineer"
   - Job Description: "Build web applications"
2. Select experience level
3. Choose interview type
4. Select at least one focus area
5. Click "Start Interview"

---

## Troubleshooting

### "Not authenticated" or Redirect to Sign In
**Solution:**
1. Clear browser cookies
2. Sign in again
3. Check console for auth errors

### "Profile not found" Error
**Solution:**
- This is okay! The app creates profile automatically
- Just refresh the page

### Microphone Not Working
**Solution:**
1. Allow microphone permissions when prompted
2. Check browser settings
3. Use Chrome/Edge for best compatibility
4. Must use HTTPS in production (localhost is fine)

### Speech Recognition Not Working
**Solution:**
- Use Chrome or Edge browser
- Check microphone is working
- Speak clearly and close to mic

---

## What Should Work

### ✅ Authentication
- Sign in redirects to audio interview
- User profile loads or creates automatically
- Session persists across refreshes

### ✅ Setup Phase
- Form validation
- Error messages for missing fields
- Configuration saved to state

### ✅ Interview Phase
- Questions generated (if API key set)
- Fallback questions if no API
- Microphone recording
- Speech-to-text (Chrome/Edge)
- Timer display
- Progress tracking

### ✅ Results Phase
- Score calculation
- Feedback generation
- Download report option
- Restart interview option

---

## Console Checks

Open browser console (F12) and check for:

### Good Signs ✅
```
Auth check successful
Profile loaded/created
Speech recognition initialized
```

### Issues to Fix ❌
```
"profiles table not found" - Run SQL setup
"Invalid API key" - Add AI API keys
"Microphone access denied" - Grant permissions
```

---

## Production Testing

For production deployment:

1. **Environment Variables Set?**
   ```
   NEXT_PUBLIC_SUPABASE_URL ✓
   NEXT_PUBLIC_SUPABASE_ANON_KEY ✓
   NEXTAUTH_URL ✓
   NEXTAUTH_SECRET ✓
   ```

2. **HTTPS Enabled?**
   - Required for microphone access
   - Vercel/Netlify provide automatically

3. **Database Tables Created?**
   - Run setup SQL in Supabase
   - Or app works without them (with limitations)

---

## Expected Flow

```
Sign In
   ↓
Audio Interview Page
   ↓
Setup Form (Company, Position, etc.)
   ↓
Start Interview
   ↓
First Question Appears
   ↓
Click Mic to Record
   ↓
Speak Your Answer
   ↓
Stop Recording
   ↓
Next Question
   ↓
Complete Interview
   ↓
View Results
```

---

## Quick Debug Commands

```bash
# Check if running
curl http://localhost:3000/api/health

# Check auth
curl http://localhost:3000/api/auth/session

# Clear Next.js cache
rm -rf .next
npm run dev
```

The audio interview should now be working! Test it step by step.
