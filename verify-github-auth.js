#!/usr/bin/env node

/**
 * GitHub OAuth Configuration Verification Script
 * 
 * This script checks if your GitHub OAuth is properly configured
 * Run: node verify-github-auth.js
 */

require('dotenv').config({ path: '.env.local' });

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

console.log('\n' + chalk.bold(chalk.blue('='.repeat(60))));
console.log(chalk.bold(chalk.blue('  GitHub OAuth Configuration Verification')));
console.log(chalk.bold(chalk.blue('='.repeat(60))) + '\n');

let hasErrors = false;
let hasWarnings = false;

// Check required environment variables
const requiredVars = {
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
  'GITHUB_CLIENT_ID': process.env.GITHUB_CLIENT_ID,
  'GITHUB_CLIENT_SECRET': process.env.GITHUB_CLIENT_SECRET,
};

console.log(chalk.bold('1. Checking Required Environment Variables:\n'));

for (const [key, value] of Object.entries(requiredVars)) {
  if (!value || value.includes('your-') || value === 'generate-a-secure-random-string-here') {
    console.log(`   ${chalk.red('✗')} ${key}: ${chalk.red('NOT SET or using placeholder')}`);
    hasErrors = true;
  } else {
    const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`   ${chalk.green('✓')} ${key}: ${chalk.green('SET')} (${displayValue})`);
  }
}

// Check NEXTAUTH_URL format
console.log('\n' + chalk.bold('2. Validating NEXTAUTH_URL:\n'));

if (process.env.NEXTAUTH_URL) {
  const url = process.env.NEXTAUTH_URL;
  
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
    console.log(`   ${chalk.green('✓')} Using local development URL: ${url}`);
  } else if (url.startsWith('https://')) {
    console.log(`   ${chalk.green('✓')} Using production URL: ${url}`);
  } else if (url.startsWith('http://') && !url.includes('localhost')) {
    console.log(`   ${chalk.yellow('⚠')} Using HTTP (not HTTPS) for non-local URL: ${url}`);
    hasWarnings = true;
  } else {
    console.log(`   ${chalk.red('✗')} Invalid URL format: ${url}`);
    hasErrors = true;
  }
  
  // Check for trailing slash
  if (url.endsWith('/')) {
    console.log(`   ${chalk.yellow('⚠')} URL has trailing slash - should be removed`);
    hasWarnings = true;
  }
} else {
  console.log(`   ${chalk.red('✗')} NEXTAUTH_URL is not set`);
  hasErrors = true;
}

// Check NEXTAUTH_SECRET strength
console.log('\n' + chalk.bold('3. Validating NEXTAUTH_SECRET:\n'));

if (process.env.NEXTAUTH_SECRET) {
  const secret = process.env.NEXTAUTH_SECRET;
  
  if (secret.length < 32) {
    console.log(`   ${chalk.yellow('⚠')} Secret is too short (${secret.length} chars). Recommended: 32+ characters`);
    hasWarnings = true;
  } else {
    console.log(`   ${chalk.green('✓')} Secret length is adequate (${secret.length} chars)`);
  }
  
  if (secret === 'your-secret-key-here' || secret.includes('your-')) {
    console.log(`   ${chalk.red('✗')} Using placeholder secret - generate a real one!`);
    hasErrors = true;
  }
} else {
  console.log(`   ${chalk.red('✗')} NEXTAUTH_SECRET is not set`);
  hasErrors = true;
}

// Check GitHub OAuth configuration
console.log('\n' + chalk.bold('4. GitHub OAuth Configuration:\n'));

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

if (githubClientId && !githubClientId.includes('your-')) {
  console.log(`   ${chalk.green('✓')} GitHub Client ID is set`);
  
  // Check if it looks like a valid GitHub Client ID (usually starts with specific patterns)
  if (githubClientId.length < 20) {
    console.log(`   ${chalk.yellow('⚠')} Client ID seems short - verify it's correct`);
    hasWarnings = true;
  }
} else {
  console.log(`   ${chalk.red('✗')} GitHub Client ID is not properly set`);
  hasErrors = true;
}

if (githubClientSecret && !githubClientSecret.includes('your-')) {
  console.log(`   ${chalk.green('✓')} GitHub Client Secret is set`);
  
  if (githubClientSecret.length < 30) {
    console.log(`   ${chalk.yellow('⚠')} Client Secret seems short - verify it's correct`);
    hasWarnings = true;
  }
} else {
  console.log(`   ${chalk.red('✗')} GitHub Client Secret is not properly set`);
  hasErrors = true;
}

// Expected callback URL
console.log('\n' + chalk.bold('5. Expected GitHub OAuth Callback URL:\n'));

if (process.env.NEXTAUTH_URL) {
  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/github`;
  console.log(`   ${chalk.blue('→')} ${callbackUrl}`);
  console.log(`\n   ${chalk.yellow('Make sure this EXACTLY matches the callback URL in your GitHub OAuth App!')}`);
}

// Summary
console.log('\n' + chalk.bold(chalk.blue('='.repeat(60))));
console.log(chalk.bold('Summary:\n'));

if (hasErrors) {
  console.log(chalk.red('✗ Configuration has ERRORS - GitHub login will NOT work'));
  console.log(chalk.yellow('\nTo fix:'));
  console.log('1. Create a GitHub OAuth App at: https://github.com/settings/developers');
  console.log('2. Update .env.local with the Client ID and Secret');
  console.log('3. Generate NEXTAUTH_SECRET with: openssl rand -base64 32');
  console.log('4. Run this script again to verify\n');
} else if (hasWarnings) {
  console.log(chalk.yellow('⚠ Configuration has WARNINGS - review the issues above'));
  console.log(chalk.green('✓ GitHub login should work, but consider fixing warnings\n'));
} else {
  console.log(chalk.green('✓ All checks passed! GitHub OAuth should work correctly\n'));
}

console.log(chalk.bold(chalk.blue('='.repeat(60))) + '\n');

// Exit with appropriate code
process.exit(hasErrors ? 1 : 0);
