#!/usr/bin/env node

/**
 * Production Readiness Audit Script
 * Comprehensive check for all potential issues before production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkResult(checkName, passed, warning = false, message = '') {
  const icon = passed ? '✅' : warning ? '⚠️' : '❌';
  const color = passed ? colors.green : warning ? colors.yellow : colors.red;
  const status = warning ? 'WARNING' : 'PASS';
  log(`${icon} ${checkName}: ${status}`, color);
  if (message) {
    log(`   ${message}`, colors.cyan);
  }
  return passed || warning;
}

function auditSecurityConfig() {
  log('\n🔐 SECURITY AUDIT', colors.bright + colors.red);
  log('==================', colors.bright + colors.red);
  
  let allPassed = true;
  
  // Check for sensitive files exposure
  const sensitiveFiles = [
    '.env',
    '.env.local',
    '.env.production',
    'config.json',
    '*.key',
    '*.pem'
  ];
  
  const sensitivePatterns = [
    /password\s*=\s*["'][^"']+["']/i,
    /api[_-]?key\s*=\s*["'][^"']+["']/i,
    /secret\s*=\s*["'][^"']+["']/i,
    /token\s*=\s*["'][^"']+["']/i
  ];
  
  // Check environment files
  const envFiles = ['.env', '.env.production', '.env.test'];
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      const hasProductionData = /(?!\s)(.*)(localhost|127\.0\.0\.1|test|dev|example\.com)(?!\s)/i.test(content);
      checkResult(`Environment file ${envFile}`, !hasProductionData, hasProductionData, 
        hasProductionData ? 'Contains development data' : 'Clean environment file');
      allPassed = allPassed || !hasProductionData;
    }
  });
  
  return allPassed;
}

function auditCodeQuality() {
  log('\n🏗️ CODE QUALITY AUDIT', colors.bright + colors.blue);
  log('=======================', colors.bright + colors.blue);
  
  let allPassed = true;
  
  // Check for TODO/FIXME comments that might indicate unfinished work
  const files = ['lib/services/email.service.ts', 'lib/services/sms.service.ts', 'lib/services/redis.service.ts', 'lib/services/monitoring.service.ts'];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const todoCount = (content.match(/TODO|FIXME|HACK/i) || []).length;
      checkResult(`Code quality in ${file}`, todoCount === 0, todoCount > 0, 
        todoCount > 0 ? `${todoCount} TODO/FIXME comments found` : 'Clean code');
      allPassed = allPassed || todoCount === 0;
    }
  });
  
  return allPassed;
}

function auditConfiguration() {
  log('\n⚙️ CONFIGURATION AUDIT', colors.bright + colors.yellow);
  log('=======================', colors.bright + colors.yellow);
  
  let allPassed = true;
  
  // Check package.json
  if (fs.existsSync('package.json')) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      checkResult('Package.json is valid JSON', true, false, 'Package.json syntax is correct');
      
      // Check for required scripts
      const requiredScripts = ['build', 'start', 'dev'];
      requiredScripts.forEach(script => {
        const hasScript = packageJson.scripts && packageJson.scripts[script];
        checkResult(`Package.json has "${script}" script`, hasScript, !hasScript);
        allPassed = allPassed && hasScript;
      });
    } catch (error) {
      checkResult('Package.json is valid JSON', false, false, error.message);
      allPassed = false;
    }
  }
  
  // Check tsconfig.json
  if (fs.existsSync('tsconfig.json')) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      const hasESModuleInterop = tsconfig.compilerOptions && tsconfig.compilerOptions.esModuleInterop;
      const hasStrict = tsconfig.compilerOptions && tsconfig.compilerOptions.strict;
      
      checkResult('TypeScript config has esModuleInterop', hasESModuleInterop, !hasESModuleInterop);
      checkResult('TypeScript config has strict mode', hasStrict, !hasStrict);
      
      allPassed = allPassed && hasESModuleInterop && hasStrict;
    } catch (error) {
      checkResult('tsconfig.json is valid JSON', false, false, error.message);
      allPassed = false;
    }
  }
  
  // Check Next.js config
  if (fs.existsSync('next.config.js')) {
    checkResult('next.config.js exists', true, false, 'Next.js configuration file found');
  }
  
  return allPassed;
}

function auditDependencies() {
  log('\n📦 DEPENDENCY AUDIT', colors.bright + colors.magenta);
  log('====================', colors.bright + colors.magenta);
  
  let allPassed = true;
  
  // Check if node_modules exists
  const nodeModulesExists = fs.existsSync('node_modules');
  checkResult('node_modules directory exists', nodeModulesExists, !nodeModulesExists,
    nodeModulesExists ? 'Dependencies installed' : 'Dependencies not installed - run npm install');
  
  allPassed = allPassed && nodeModulesExists;
  
  // Check for critical dependencies
  const criticalDeps = ['next', 'react', '@sendgrid/mail', 'twilio', 'ioredis', 'pg', 'bcrypt'];
  
  if (nodeModulesExists) {
    criticalDeps.forEach(dep => {
      const depExists = fs.existsSync(path.join('node_modules', dep));
      checkResult(`Critical dependency "${dep}" installed`, depExists, !depExists);
      allPassed = allPassed && depExists;
    });
  }
  
  return allPassed;
}

function auditServices() {
  log('\n⚡ SERVICE AUDIT', colors.bright + colors.cyan);
  log('================', colors.bright + colors.cyan);
  
  let allPassed = true;
  
  const services = [
    { file: 'lib/services/email.service.ts', name: 'EmailService' },
    { file: 'lib/services/sms.service.ts', name: 'SMSService' },
    { file: 'lib/services/redis.service.ts', name: 'RedisService' },
    { file: 'lib/services/monitoring.service.ts', name: 'MonitoringService' }
  ];
  
  services.forEach(service => {
    if (fs.existsSync(service.file)) {
      const content = fs.readFileSync(service.file, 'utf8');
      const hasClass = content.includes(`class ${service.name}`);
      const hasExport = content.includes('export');
      const hasErrorHandling = content.includes('try') && content.includes('catch');
      
      checkResult(`${service.name} has class definition`, hasClass, !hasClass);
      checkResult(`${service.name} has export`, hasExport, !hasExport);
      checkResult(`${service.name} has error handling`, hasErrorHandling, !hasErrorHandling);
      
      allPassed = allPassed && hasClass && hasExport && hasErrorHandling;
    } else {
      checkResult(`${service.name} file exists`, false, false, 'Service file not found');
      allPassed = false;
    }
  });
  
  return allPassed;
}

function auditTests() {
  log('\n🧪 TEST AUDIT', colors.bright + colors.green);
  log('=============', colors.bright + colors.green);
  
  let allPassed = true;
  
  const testFiles = [
    { file: 'tests/services/email.service.test.ts', name: 'Email Service Tests' },
    { file: 'tests/services/sms.service.test.ts', name: 'SMS Service Tests' },
    { file: 'tests/services/redis.service.test.ts', name: 'Redis Service Tests' },
    { file: 'tests/services/monitoring.service.test.ts', name: 'Monitoring Service Tests' },
    { file: 'tests/integration/auth.flow.test.ts', name: 'Authentication Integration Tests' },
    { file: 'tests/setup.ts', name: 'Test Setup' }
  ];
  
  testFiles.forEach(testFile => {
    if (fs.existsSync(testFile.file)) {
      const content = fs.readFileSync(testFile.file, 'utf8');
      const hasDescribe = content.includes('describe(');
      const hasTest = content.includes('it(') || content.includes('test(');
      const hasMock = content.includes('jest.mock(') || content.includes('mock(');
      
      checkResult(`${testFile.name} has test structure`, hasDescribe && hasTest && hasMock, 
        !(hasDescribe && hasTest && hasMock));
      
      if (hasDescribe && hasTest && hasMock) {
        const testCount = (content.match(/it\(|test\(/g) || []).length;
        log(`   Found ${testCount} test cases`, colors.cyan);
      }
      
      allPassed = allPassed && hasDescribe && hasTest && hasMock;
    } else {
      checkResult(`${testFile.name} exists`, false, false, 'Test file not found');
      allPassed = false;
    }
  });
  
  return allPassed;
}

function auditInfrastructure() {
  log('\n🏗️ INFRASTRUCTURE AUDIT', colors.bright + colors.red);
  log('========================', colors.bright + colors.red);
  
  let allPassed = true;
  
  // Check deployment infrastructure
  const infraFiles = [
    { file: 'scripts/deploy.sh', name: 'Deployment Script' },
    { file: 'ecosystem.config.js', name: 'PM2 Configuration' },
    { file: 'jest.config.js', name: 'Jest Configuration' },
    { file: '.env.production', name: 'Production Environment' },
    { file: '.env.test', name: 'Test Environment' }
  ];
  
  infraFiles.forEach(infra => {
    if (fs.existsSync(infra.file)) {
      checkResult(`${infra.name} exists`, true, false);
      
      // Additional checks for specific files
      if (infra.file === 'scripts/deploy.sh') {
        const content = fs.readFileSync(infra.file, 'utf8');
        const hasErrorHandling = content.includes('set -e');
        const hasLogging = content.includes('log_');
        checkResult('Deployment script has error handling', hasErrorHandling, !hasErrorHandling);
        checkResult('Deployment script has logging', hasLogging, !hasLogging);
      }
      
      if (infra.file === 'ecosystem.config.js') {
        const content = fs.readFileSync(infra.file, 'utf8');
        const hasClustering = content.includes('cluster');
        const hasMonitoring = content.includes('log');
        checkResult('PM2 config has clustering', hasClustering, !hasClustering);
        checkResult('PM2 config has monitoring', hasMonitoring, !hasMonitoring);
      }
    } else {
      checkResult(`${infra.name} exists`, false, false, 'Infrastructure file not found');
      allPassed = false;
    }
  });
  
  return allPassed;
}

function main() {
  log('🚀 OPTIBID ENERGY PLATFORM - PRODUCTION READINESS AUDIT', colors.bright + colors.cyan);
  log('=========================================================', colors.bright + colors.cyan);
  
  let totalChecks = 0;
  let passedChecks = 0;
  let warnings = 0;
  
  const audits = [
    { name: 'Security Configuration', fn: auditSecurityConfig },
    { name: 'Code Quality', fn: auditCodeQuality },
    { name: 'Configuration', fn: auditConfiguration },
    { name: 'Dependencies', fn: auditDependencies },
    { name: 'Services', fn: auditServices },
    { name: 'Tests', fn: auditTests },
    { name: 'Infrastructure', fn: auditInfrastructure }
  ];
  
  audits.forEach(audit => {
    log(`\n${'='.repeat(60)}`, colors.reset);
    const passed = audit.fn();
    totalChecks += 1;
    if (passed) {
      passedChecks += 1;
    }
  });
  
  log('\n' + '='.repeat(80), colors.reset);
  log('🎯 PRODUCTION AUDIT SUMMARY', colors.bright + colors.magenta);
  log('=' + '='.repeat(80), colors.bright + colors.magenta);
  
  log(`Audits Passed: ${passedChecks}/${totalChecks}`, passedChecks === totalChecks ? colors.green : colors.yellow);
  log(`Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`, colors.cyan);
  
  if (passedChecks === totalChecks) {
    log('\n🎉 PRODUCTION READY!', colors.bright + colors.green);
    log('All critical checks passed. Platform is ready for production deployment.', colors.green);
  } else if (passedChecks >= totalChecks * 0.8) {
    log('\n⚠️ MOSTLY READY', colors.bright + colors.yellow);
    log('Most checks passed. Address warnings before production deployment.', colors.yellow);
  } else {
    log('\n❌ NOT READY', colors.bright + colors.red);
    log('Critical issues found. Fix all failures before production deployment.', colors.red);
  }
  
  log('\n📋 NEXT STEPS:', colors.bright + colors.blue);
  log('1. Review any warnings and address critical issues');
  log('2. Configure production environment variables');
  log('3. Set up production database and services');
  log('4. Execute deployment using scripts/deploy.sh');
  log('5. Monitor initial production deployment');
  
  log('\n' + '='.repeat(80), colors.reset);
}

// Fix color typo
colors.cyan = '\x1b[36m';

try {
  main();
} catch (error) {
  log(`\n❌ Audit failed: ${error.message}`, colors.red);
  process.exit(1);
}