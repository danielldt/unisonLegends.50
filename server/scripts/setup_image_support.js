const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');



// Ensure the dist/utils/db directory exists
const distDir = path.join(__dirname, '../dist/utils/db');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  
}

// Copy the SQL file to the dist directory
const srcSqlFile = path.join(__dirname, '../src/utils/db/add_image_url.sql');
const destSqlFile = path.join(__dirname, '../dist/utils/db/add_image_url.sql');

if (fs.existsSync(srcSqlFile)) {
  fs.copyFileSync(srcSqlFile, destSqlFile);
  
} else {
  console.error(`Error: SQL file not found at ${srcSqlFile}`);
  process.exit(1);
}

// Step 1: Compile TypeScript files

try {
  execSync('npx tsc', { stdio: 'inherit' });
  
} catch (error) {
  console.error('Error compiling TypeScript:', error);
  process.exit(1);
}

// Step 2: Create default images

try {
  execSync('node dist/utils/db/create_default_images.js', { stdio: 'inherit' });
  
} catch (error) {
  console.error('Error creating default images:', error);
  process.exit(1);
}

// Step 3: Run database setup

try {
  execSync('node dist/utils/db/setup_images.js', { stdio: 'inherit' });
  
} catch (error) {
  console.error('Error setting up database:', error);
  process.exit(1);
}





 