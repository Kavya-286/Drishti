// Simple build script for the server
const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
const serverDir = path.join(distDir, 'server');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
}

// Copy Python ML files
const mlFiles = ['server/ml_validator.py', 'start_ml_backend.py'];
mlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const fileName = path.basename(file);
        fs.copyFileSync(file, path.join(serverDir, fileName));
        console.log(`Copied ${file} to dist/server/`);
    }
});

// Create a simple Node.js server entry point
const serverCode = `
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../')));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Drishti API is running' });
});

// Serve the main HTML file for all routes (SPA behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
    console.log(\`Visit http://localhost:\${PORT} to view the application\`);
});
`;

fs.writeFileSync(path.join(serverDir, 'node-build.js'), serverCode);
console.log('Created node-build.js server file');

console.log('Build completed successfully!');
