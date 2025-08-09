import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Comprehensive API endpoints to support the frontend
app.get('/api/auth/user', (req, res) => {
  res.json({ user: null, isAuthenticated: false });
});

app.post('/api/features/config', (req, res) => {
  res.json({
    payments: { enabled: false },
    chat: { enabled: true },
    imageUpload: { enabled: true },
    adminPanel: { enabled: false },
    analytics: { enabled: false },
    notifications: { enabled: true },
    search: { enabled: true },
    favorites: { enabled: true }
  });
});

app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Vehicles', slug: 'vehicles', parentId: null },
    { id: 2, name: 'Electronics', slug: 'electronics', parentId: null },
    { id: 3, name: 'Real Estate', slug: 'real-estate', parentId: null },
    { id: 4, name: 'Jobs', slug: 'jobs', parentId: null },
    { id: 5, name: 'Services', slug: 'services', parentId: null }
  ]);
});

app.get('/api/listings', (req, res) => {
  res.json([]);
});

app.get('/api/tenders/public', (req, res) => {
  res.json([]);
});

app.get('/api/tenders/categories', (req, res) => {
  res.json([]);
});

app.get('/api/environment', (req, res) => {
  res.json({ environment: 'development' });
});

app.post('/api/errors/frontend', (req, res) => {
  console.log('Frontend error logged:', req.body);
  res.json({ logged: true });
});

// Catch all for other API routes (removed wildcard to avoid path parsing issues)

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start API server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`);
});

console.log('Starting Vite development server from client directory...');

// Start Vite dev server from client directory
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: path.join(__dirname, '..', 'client'),
  stdio: 'inherit'
});

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
});

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite:', err);
});