# Supabase Edge Functions

## ⚠️ IMPORTANT: VSCode Errors Can Be Ignored

The TypeScript errors you see in VSCode for files in this directory are **false positives** and can be safely ignored.

### Why These Errors Appear:
- These are **Supabase Edge Functions** that run on Deno runtime
- They use Deno-specific imports (URLs instead of npm packages)
- VSCode tries to validate them as regular TypeScript files
- They are NOT part of the Next.js build

### What These Functions Do:
- **update-leaderboard**: Updates user rankings in the database
- Run on Supabase's servers, not in your Next.js app
- Triggered by database events or scheduled jobs

### These Files Are:
- ✅ **Excluded from Next.js build** (see tsconfig.json)
- ✅ **Valid Deno/Supabase code**
- ✅ **Working correctly on Supabase**
- ✅ **NOT affecting your production deployment**

### To Deploy These Functions:
```bash
# Install Supabase CLI
npm install -g supabase

# Deploy functions to Supabase
supabase functions deploy update-leaderboard
```

### To Disable VSCode Errors:
Add to your VSCode settings.json:
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "supabase/functions/**": true
  }
}
```

## Summary:
**These errors do NOT affect your production deployment to Vercel.**
Your Next.js app will build and deploy successfully regardless of these Deno-specific files.
