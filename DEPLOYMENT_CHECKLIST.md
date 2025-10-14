# Production Deployment Checklist

## Pre-Deployment

### 1. Database Setup ✅

- [ ] **Run database migrations**
  ```bash
  # Connect to your production database
  psql -h your-production-host -U your-user -d your-database
  
  # Run the AI features schema
  \i database/ai_features_schema.sql
  ```

- [ ] **Verify tables created**
  ```sql
  -- Check all tables exist
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name LIKE 'ai_%' OR table_name LIKE '%_sessions';
  ```

- [ ] **Test database functions**
  ```sql
  -- Test metrics update function
  SELECT update_ai_features_metrics('test@example.com');
  
  -- Verify views work
  SELECT * FROM user_ai_features_summary LIMIT 1;
  ```

- [ ] **Create indexes** (already in schema, verify they exist)
  ```sql
  SELECT indexname FROM pg_indexes WHERE tablename LIKE 'ai_%';
  ```

### 2. Environment Variables ✅

- [ ] **Verify all required variables are set**
  ```env
  # Database
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  
  # Auth
  NEXTAUTH_URL=https://your-domain.com
  NEXTAUTH_SECRET=your-secret-key
  
  # API Keys
  GOOGLE_GEMINI_API_KEY=your-gemini-key
  ```

- [ ] **Test environment variables load correctly**
  ```bash
  npm run build
  # Check for any missing env var warnings
  ```

### 3. Code Quality ✅

- [ ] **TypeScript compilation**
  ```bash
  npm run type-check
  # Should have 0 errors
  ```

- [ ] **Linting**
  ```bash
  npm run lint
  # Fix any errors
  ```

- [ ] **Build succeeds**
  ```bash
  npm run build
  # Should complete without errors
  ```

- [ ] **Remove console.logs** (except error logging)
  ```bash
  # Search for console.log statements
  grep -r "console.log" src/
  # Remove or replace with proper logging
  ```

### 4. API Testing ✅

- [ ] **Test all endpoints locally**
  ```bash
  # Start dev server
  npm run dev
  
  # Test each endpoint
  curl http://localhost:3001/api/ai/coaching
  curl http://localhost:3001/api/ai/voice
  curl http://localhost:3001/api/ai/feedback
  curl http://localhost:3001/api/ai/prep
  curl http://localhost:3001/api/ai/metrics
  ```

- [ ] **Test authentication**
  - Login with test account
  - Verify API returns 401 without auth
  - Verify API returns data with auth

- [ ] **Test error handling**
  - Invalid requests return proper errors
  - Database errors are caught
  - User-friendly error messages

### 5. Frontend Testing ✅

- [ ] **Test all AI feature pages**
  - [ ] AI Coach page loads
  - [ ] Voice Analysis page loads
  - [ ] Smart Feedback page loads
  - [ ] Personalized Prep page loads

- [ ] **Test loading states**
  - Spinners show during data fetch
  - No layout shift

- [ ] **Test error states**
  - Error messages display correctly
  - Retry buttons work

- [ ] **Test empty states**
  - "No data" messages show
  - Call-to-action buttons work

- [ ] **Test data operations**
  - Create new sessions
  - Update existing data
  - Delete operations (if applicable)

### 6. Performance ✅

- [ ] **Run Lighthouse audit**
  - Performance score > 90
  - Accessibility score > 90
  - Best Practices score > 90
  - SEO score > 90

- [ ] **Check bundle size**
  ```bash
  npm run build
  # Check .next/static/chunks sizes
  # Ensure no huge bundles
  ```

- [ ] **Test on slow connection**
  - Enable throttling in DevTools
  - Verify loading states work
  - Check timeout handling

### 7. Security ✅

- [ ] **API routes protected**
  - All routes check authentication
  - User data is isolated
  - No data leakage between users

- [ ] **Environment secrets secure**
  - No secrets in client-side code
  - .env files not committed
  - Production secrets rotated

- [ ] **SQL injection prevention**
  - Using parameterized queries (Supabase)
  - No raw SQL with user input

- [ ] **XSS prevention**
  - User input sanitized
  - React escapes by default

## Deployment

### 1. Deploy Database Changes ✅

```bash
# Backup production database first
pg_dump -h your-host -U your-user -d your-database > backup.sql

# Run migrations
psql -h your-host -U your-user -d your-database < database/ai_features_schema.sql
```

### 2. Deploy Application ✅

**For Vercel:**
```bash
# Deploy to production
vercel --prod

# Or push to main branch (if auto-deploy enabled)
git push origin main
```

**For other platforms:**
```bash
# Build production bundle
npm run build

# Start production server
npm start
```

### 3. Verify Deployment ✅

- [ ] **Check deployment status**
  - Build completed successfully
  - No deployment errors
  - Environment variables loaded

- [ ] **Test production URL**
  - Site loads correctly
  - No 404 errors
  - SSL certificate valid

- [ ] **Test API endpoints**
  ```bash
  curl https://your-domain.com/api/ai/metrics
  # Should return 401 (unauthorized) or data if logged in
  ```

## Post-Deployment

### 1. Smoke Tests ✅

- [ ] **User authentication**
  - Login works
  - Logout works
  - Session persists

- [ ] **AI Features**
  - Navigate to each AI feature page
  - Verify data loads
  - Create test session
  - Verify metrics update

- [ ] **Navigation**
  - All links work
  - Breadcrumbs correct
  - No broken routes

### 2. Monitoring Setup ✅

- [ ] **Error tracking**
  - Set up Sentry or similar
  - Test error reporting
  - Configure alerts

- [ ] **Performance monitoring**
  - Set up analytics
  - Track page load times
  - Monitor API response times

- [ ] **Database monitoring**
  - Monitor query performance
  - Set up slow query alerts
  - Track connection pool

### 3. User Testing ✅

- [ ] **Test with real users**
  - Create test accounts
  - Have users try all features
  - Collect feedback

- [ ] **Monitor for issues**
  - Check error logs
  - Monitor performance
  - Watch for unusual patterns

### 4. Documentation ✅

- [ ] **Update README**
  - Deployment instructions
  - Environment setup
  - Troubleshooting guide

- [ ] **API documentation**
  - Endpoint descriptions
  - Request/response examples
  - Error codes

- [ ] **User guide**
  - How to use AI features
  - FAQ section
  - Support contact

## Rollback Plan

### If Issues Occur:

1. **Revert deployment**
   ```bash
   # Vercel
   vercel rollback
   
   # Or redeploy previous version
   git revert HEAD
   git push origin main
   ```

2. **Restore database**
   ```bash
   # Restore from backup
   psql -h your-host -U your-user -d your-database < backup.sql
   ```

3. **Notify users**
   - Post status update
   - Explain issue
   - Provide timeline

## Success Criteria

### Deployment is successful when:

- ✅ All API endpoints return correct data
- ✅ All pages load without errors
- ✅ User authentication works
- ✅ Database operations succeed
- ✅ No critical errors in logs
- ✅ Performance metrics acceptable
- ✅ Users can complete key workflows

## Common Issues & Solutions

### Issue: Database connection fails
**Solution:** 
- Verify connection string
- Check firewall rules
- Verify credentials

### Issue: API returns 500 errors
**Solution:**
- Check server logs
- Verify environment variables
- Test database queries

### Issue: Pages load slowly
**Solution:**
- Check bundle sizes
- Optimize images
- Enable caching
- Add loading states

### Issue: Authentication not working
**Solution:**
- Verify NEXTAUTH_URL
- Check session configuration
- Clear cookies and retry

## Maintenance

### Regular Tasks:

**Daily:**
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Review user feedback

**Weekly:**
- [ ] Database backup verification
- [ ] Security updates
- [ ] Performance optimization

**Monthly:**
- [ ] Dependency updates
- [ ] Security audit
- [ ] Database optimization
- [ ] Analytics review

## Support

### If you need help:

1. Check documentation in `/docs`
2. Review error logs
3. Check GitHub issues
4. Contact development team

---

## Sign-Off

### Developer
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Ready for deployment

**Name:** _________________  
**Date:** _________________

### DevOps
- [ ] Infrastructure ready
- [ ] Environment configured
- [ ] Monitoring set up
- [ ] Backup configured

**Name:** _________________  
**Date:** _________________

### Product Owner
- [ ] Features verified
- [ ] User acceptance complete
- [ ] Ready for production

**Name:** _________________  
**Date:** _________________

---

**Deployment Date:** _________________  
**Version:** 2.0  
**Status:** ☐ Pending ☐ In Progress ☐ Complete ☐ Rolled Back
