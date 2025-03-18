const { execSync } = require('child_process');

const runCommand = (command, errorMessage) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ ${errorMessage || `Command failed: ${command}`}`);
    process.exit(1);
  }
};

const steps = [
  {
    name: '📦 Installing dependencies',
    command: 'npm ci'
  },
  {
    name: '🏗️  Building application',
    command: 'NEXT_LINT_DURING_BUILD=false npm run build',
    errorMessage: 'Build failed - check TypeScript errors'
  },
  {
    name: '🧪 Running unit and integration tests',
    command: 'npm run test'
  },
  {
    name: '📊 Generating coverage report',
    command: 'npm run test:coverage'
  },
  {
    name: '🔄 Running E2E tests',
    command: 'npm run dev & npx wait-on http://localhost:3000 && npm run test:e2e'
  }
];

console.log('🚀 Running workflow steps locally...\n');

for (const step of steps) {
  console.log(`\n${step.name}...`);
  runCommand(step.command, step.errorMessage);
}