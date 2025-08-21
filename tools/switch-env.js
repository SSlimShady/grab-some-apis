#!/usr/bin/env node

/**
 * Environment Configuration Switcher
 *
 * This script helps you switch between different service configurations:
 * - Database: Local PostgreSQL vs Supabase
 * - Redis: Local Redis vs Upstash
 *
 * Usage:
 *   node tools/switch-env.js --db=local --redis=upstash
 *   node tools/switch-env.js --db=supabase --redis=local
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'

const ENV_FILE = '.env'
const ENV_EXAMPLE_FILE = '.env.example'

// Configuration presets
const PRESETS = {
  'full-local': {
    DB_MODE: 'local',
    REDIS_MODE: 'local',
    description: 'Local PostgreSQL + Local Redis (Docker)',
  },
  'full-cloud': {
    DB_MODE: 'supabase',
    REDIS_MODE: 'upstash',
    description: 'Supabase PostgreSQL + Upstash Redis (Cloud)',
  },
  'hybrid-supabase': {
    DB_MODE: 'supabase',
    REDIS_MODE: 'local',
    description: 'Supabase PostgreSQL + Local Redis',
  },
  'hybrid-upstash': {
    DB_MODE: 'local',
    REDIS_MODE: 'upstash',
    description: 'Local PostgreSQL + Upstash Redis',
  },
}

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {}

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=')
      options[key] = value
    }
  })

  return options
}

function updateEnvFile(updates) {
  let envContent = ''

  // Read existing .env file or create from example
  if (existsSync(ENV_FILE)) {
    envContent = readFileSync(ENV_FILE, 'utf8')
  } else if (existsSync(ENV_EXAMPLE_FILE)) {
    envContent = readFileSync(ENV_EXAMPLE_FILE, 'utf8')
    console.log('📄 Created .env from .env.example')
  } else {
    console.error('❌ No .env or .env.example file found')
    process.exit(1)
  }

  // Update environment variables
  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm')
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}="${value}"`)
    } else {
      envContent += `\n${key}="${value}"`
    }
  })

  writeFileSync(ENV_FILE, envContent)
}

function showCurrentConfig() {
  if (!existsSync(ENV_FILE)) {
    console.log('📄 No .env file found. Current configuration unknown.')
    return
  }

  const envContent = readFileSync(ENV_FILE, 'utf8')
  const dbMode = envContent.match(/^DB_MODE="?([^"\\n]+)"?/m)?.[1] || 'unknown'
  const redisMode =
    envContent.match(/^REDIS_MODE="?([^"\\n]+)"?/m)?.[1] || 'unknown'

  console.log('📊 Current Configuration:')
  console.log(`   Database: ${dbMode}`)
  console.log(`   Redis: ${redisMode}`)

  // Find matching preset
  const preset = Object.entries(PRESETS).find(
    ([, config]) => config.DB_MODE === dbMode && config.REDIS_MODE === redisMode
  )

  if (preset) {
    console.log(`   Preset: ${preset[0]} (${preset[1].description})`)
  }
}

function showHelp() {
  console.log('🔧 Environment Configuration Switcher')
  console.log('')
  console.log('Usage:')
  console.log('  node tools/switch-env.js [options]')
  console.log('  node tools/switch-env.js --preset=<preset-name>')
  console.log('')
  console.log('Options:')
  console.log('  --db=<mode>        Database mode: local | supabase')
  console.log('  --redis=<mode>     Redis mode: local | upstash')
  console.log('  --preset=<name>    Use predefined configuration')
  console.log('  --status           Show current configuration')
  console.log('  --help             Show this help')
  console.log('')
  console.log('Available Presets:')
  Object.entries(PRESETS).forEach(([name, config]) => {
    console.log(`  ${name.padEnd(16)} ${config.description}`)
  })
  console.log('')
  console.log('Examples:')
  console.log('  node tools/switch-env.js --preset=full-local')
  console.log('  node tools/switch-env.js --db=supabase --redis=local')
  console.log('  node tools/switch-env.js --status')
}

function main() {
  const options = parseArgs()

  if (options.help) {
    showHelp()
    return
  }

  if (options.status) {
    showCurrentConfig()
    return
  }

  if (options.preset) {
    const preset = PRESETS[options.preset]
    if (!preset) {
      console.error(`❌ Unknown preset: ${options.preset}`)
      console.log('Available presets:', Object.keys(PRESETS).join(', '))
      process.exit(1)
    }

    updateEnvFile({
      DB_MODE: preset.DB_MODE,
      REDIS_MODE: preset.REDIS_MODE,
    })

    console.log(`✅ Switched to preset: ${options.preset}`)
    console.log(`   ${preset.description}`)
    return
  }

  const updates = {}

  if (options.db) {
    if (!['local', 'supabase'].includes(options.db)) {
      console.error('❌ Invalid db mode. Use: local | supabase')
      process.exit(1)
    }
    updates.DB_MODE = options.db
  }

  if (options.redis) {
    if (!['local', 'upstash'].includes(options.redis)) {
      console.error('❌ Invalid redis mode. Use: local | upstash')
      process.exit(1)
    }
    updates.REDIS_MODE = options.redis
  }

  if (Object.keys(updates).length === 0) {
    console.log('ℹ️  No changes specified. Use --help for usage information.')
    showCurrentConfig()
    return
  }

  updateEnvFile(updates)

  console.log('✅ Environment updated:')
  Object.entries(updates).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`)
  })

  // Show recommended npm script
  const dbMode = updates.DB_MODE || 'current'
  const redisMode = updates.REDIS_MODE || 'current'

  if (dbMode === 'local' && redisMode === 'local') {
    console.log('\n🚀 Recommended: pnpm dev:local')
  } else if (dbMode === 'supabase' && redisMode === 'local') {
    console.log('\n🚀 Recommended: pnpm dev:supabase')
  } else if (dbMode === 'local' && redisMode === 'upstash') {
    console.log('\n🚀 Recommended: pnpm dev:upstash')
  } else if (dbMode === 'supabase' && redisMode === 'upstash') {
    console.log('\n🚀 Recommended: pnpm dev:cloud')
  }
}

main()
