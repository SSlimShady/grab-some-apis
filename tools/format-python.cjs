#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

console.log('Formatting Python code in API directory...')

try {
  // Change to the API directory and run formatting
  const apiDir = path.join(__dirname, '..', 'apps', 'api')

  // Run the Poetry format script which handles everything
  execSync('poetry run format', {
    cwd: apiDir,
    stdio: 'inherit',
    timeout: 60000, // 60 seconds timeout
  })

  console.log('Python formatting completed successfully!')
} catch (error) {
  if (error.signal === 'SIGTERM' || error.signal === 'SIGKILL') {
    console.error('Python formatting was terminated (timeout or killed)')
  } else {
    console.error('Python formatting failed:', error.message)
  }
  process.exit(1)
}
