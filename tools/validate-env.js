#!/usr/bin/env node

/**
 * Environment Validation and Health Check
 *
 * This script validates your environment configuration and checks
 * if all required services are accessible.
 */

import { readFileSync, existsSync } from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const ENV_FILE = '.env'

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function parseEnvFile() {
  if (!existsSync(ENV_FILE)) {
    return null
  }

  const envContent = readFileSync(ENV_FILE, 'utf8')
  const env = {}

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]*?)=["']?(.*?)["']?$/)
    if (match) {
      env[match[1].trim()] = match[2].trim()
    }
  })

  return env
}

async function checkDockerService(service) {
  try {
    const { stdout } = await execAsync(
      `docker compose ps ${service} --format json`
    )
    if (stdout.trim()) {
      const status = JSON.parse(stdout)
      return status.State === 'running'
    }
    return false
  } catch (_error) {
    return false
  }
}

async function _checkPostgresConnection(url) {
  try {
    // This would require pg module in a real implementation
    // For now, just check if the URL format is valid
    return url && (url.includes('postgresql://') || url.includes('postgres://'))
  } catch (_error) {
    return false
  }
}

async function _checkRedisConnection(url) {
  try {
    // This would require redis module in a real implementation
    // For now, just check if the URL format is valid
    return (
      url &&
      (url.includes('redis://') ||
        url.includes('rediss://') ||
        url.includes('http'))
    )
  } catch (_error) {
    return false
  }
}

async function validateEnvironment() {
  log('\n🔍 Environment Validation Report\n', colors.bold + colors.blue)

  // Check if .env exists
  const env = parseEnvFile()
  if (!env) {
    log('❌ No .env file found', colors.red)
    log('💡 Run: cp .env.example .env', colors.yellow)
    return
  }

  log('📄 Environment file: Found', colors.green)

  // Check core configuration
  const dbMode = env.DB_MODE
  const redisMode = env.REDIS_MODE

  if (!dbMode || !redisMode) {
    log('❌ Missing core configuration (DB_MODE or REDIS_MODE)', colors.red)
    log('💡 Run: pnpm env:local or pnpm env:cloud', colors.yellow)
    return
  }

  log(`📊 Database mode: ${dbMode}`, colors.blue)
  log(`📊 Redis mode: ${redisMode}`, colors.blue)

  // Validate database configuration
  if (dbMode === 'local') {
    log('\n🐘 PostgreSQL (Local Docker):', colors.bold)
    const isRunning = await checkDockerService('postgres')
    if (isRunning) {
      log('  ✅ Container is running', colors.green)
    } else {
      log('  ❌ Container is not running', colors.red)
      log('  💡 Run: pnpm postgres:up', colors.yellow)
    }
  } else if (dbMode === 'supabase') {
    log('\n🏗️  Supabase PostgreSQL:', colors.bold)
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      log('  ✅ Configuration found', colors.green)
      log(`  📍 URL: ${env.SUPABASE_URL}`, colors.blue)
    } else {
      log('  ❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY', colors.red)
      log('  💡 Add your Supabase credentials to .env', colors.yellow)
    }
  }

  // Validate Redis configuration
  if (redisMode === 'local') {
    log('\n🔴 Redis (Local Docker):', colors.bold)
    const isRunning = await checkDockerService('redis')
    if (isRunning) {
      log('  ✅ Container is running', colors.green)
    } else {
      log('  ❌ Container is not running', colors.red)
      log('  💡 Run: pnpm redis:up', colors.yellow)
    }
  } else if (redisMode === 'upstash') {
    log('\n☁️  Upstash Redis:', colors.bold)
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      log('  ✅ Configuration found', colors.green)
      log(`  📍 URL: ${env.UPSTASH_REDIS_REST_URL}`, colors.blue)
    } else {
      log(
        '  ❌ Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN',
        colors.red
      )
      log('  💡 Add your Upstash credentials to .env', colors.yellow)
    }
  }

  // Check generated URLs
  log('\n🔗 Generated URLs:', colors.bold)
  if (env.DATABASE_URL) {
    log(`  📦 DATABASE_URL: ${env.DATABASE_URL}`, colors.green)
  } else {
    log('  ❌ DATABASE_URL not set', colors.red)
  }

  if (env.REDIS_URL) {
    log(`  📦 REDIS_URL: ${env.REDIS_URL}`, colors.green)
  } else {
    log('  ❌ REDIS_URL not set', colors.red)
  }

  // Docker status
  log('\n🐳 Docker Status:', colors.bold)
  try {
    await execAsync('docker --version')
    log('  ✅ Docker is available', colors.green)

    const { stdout } = await execAsync('docker compose ps --format json')
    const services = stdout.trim()
      ? JSON.parse(`[${stdout.trim().split('\n').join(',')}]`)
      : []

    if (services.length > 0) {
      log('  📋 Running services:', colors.blue)
      services.forEach(service => {
        const status = service.State === 'running' ? '✅' : '❌'
        log(`    ${status} ${service.Service} (${service.State})`)
      })
    } else {
      log('  ℹ️  No Docker services running', colors.yellow)
    }
  } catch (_error) {
    log('  ❌ Docker not available or not running', colors.red)
  }

  // Recommendations
  log('\n💡 Recommendations:', colors.bold + colors.yellow)

  if (dbMode === 'local' && redisMode === 'local') {
    log('  🚀 Ready for local development!')
    log('  📝 Run: pnpm dev:local')
  } else if (dbMode === 'supabase' && redisMode === 'upstash') {
    log('  ☁️  Ready for cloud development!')
    log('  📝 Run: pnpm dev:cloud')
  } else {
    log('  🔀 Hybrid configuration detected')
    if (dbMode === 'supabase' && redisMode === 'local') {
      log('  📝 Run: pnpm dev:supabase')
    } else if (dbMode === 'local' && redisMode === 'upstash') {
      log('  📝 Run: pnpm dev:upstash')
    }
  }

  log('\n✨ Environment validation complete!\n', colors.bold + colors.green)
}

// Health check function
async function healthCheck() {
  log('\n🏥 Health Check\n', colors.bold + colors.blue)

  const env = parseEnvFile()
  if (!env) {
    log('❌ No .env file found', colors.red)
    return
  }

  // Check individual services
  const checks = []

  if (env.DB_MODE === 'local') {
    checks.push({
      name: 'PostgreSQL Container',
      check: async () => await checkDockerService('postgres'),
      fix: 'pnpm postgres:up',
    })
  }

  if (env.REDIS_MODE === 'local') {
    checks.push({
      name: 'Redis Container',
      check: async () => await checkDockerService('redis'),
      fix: 'pnpm redis:up',
    })
  }

  for (const { name, check, fix } of checks) {
    const isHealthy = await check()
    if (isHealthy) {
      log(`✅ ${name}: Healthy`, colors.green)
    } else {
      log(`❌ ${name}: Unhealthy`, colors.red)
      log(`   💡 Fix: ${fix}`, colors.yellow)
    }
  }

  log('\n🏁 Health check complete!\n', colors.bold + colors.green)
}

function showHelp() {
  log(
    '🔧 Environment Validator and Health Checker\n',
    colors.bold + colors.blue
  )
  log('Usage:')
  log('  node tools/validate-env.js [command]\n')
  log('Commands:')
  log('  validate    Full environment validation (default)')
  log('  health      Quick health check of running services')
  log('  help        Show this help\n')
  log('Examples:')
  log('  node tools/validate-env.js')
  log('  node tools/validate-env.js health')
  log('  pnpm env:check')
}

async function main() {
  const command = process.argv[2] || 'validate'

  switch (command) {
    case 'health':
      await healthCheck()
      break
    case 'help':
      showHelp()
      break
    case 'validate':
    default:
      await validateEnvironment()
      break
  }
}

main().catch(error => {
  log(`❌ Error: ${error.message}`, colors.red)
  process.exit(1)
})
