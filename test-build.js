/**
 * Build Test Script
 * 
 * Runs build tests before pushing to prevent deployment failures.
 * Usage: node test-build.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Starting build tests...\n');

try {
  // Test client build
  console.log('1️⃣ Testing client build...');
  process.chdir(path.join(__dirname, 'client'));
  
  const buildOutput = execSync('npm run build', { 
    encoding: 'utf8', 
    timeout: 120000, // 2 minutes timeout
    stdio: 'inherit'
  });
  
  console.log('✅ Client build successful!\n');
  
  // Test server syntax
  console.log('2️⃣ Testing server syntax...');
  process.chdir(path.join(__dirname, 'server'));
  
  execSync('node -c index.js', { 
    encoding: 'utf8',
    stdio: 'inherit'
  });
  
  execSync('node -c routes/jobs.js', { 
    encoding: 'utf8',
    stdio: 'inherit'
  });
  
  console.log('✅ Server syntax check successful!\n');
  
  console.log('🎉 All build tests passed! Safe to push.');
  
} catch (error) {
  console.error('❌ Build test failed:', error.message);
  console.log('\n⚠️  Please fix the errors before pushing to avoid deployment failures.');
  process.exit(1);
}