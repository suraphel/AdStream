import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Vite development server...');

// Start Vite dev server
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
});

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite:', err);
});