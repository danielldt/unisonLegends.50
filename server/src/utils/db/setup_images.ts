import { AppDataSource } from "../../config/database";
import * as fs from 'fs';
import * as path from 'path';

// Initialize database connection
async function initDatabase() {
  try {
    await AppDataSource.initialize();
    
    return true;
  } catch (error) {
    console.error("Error initializing database connection:", error);
    return false;
  }
}

// Create image directories
function createImageDirectories() {
  const directories = [
    './public/images/items',
    './public/images/spells'
  ];

  directories.forEach(dir => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      
    } else {
      
    }
  });
}

// Execute SQL from file
async function executeSql() {
  try {
    const sqlFilePath = path.join(__dirname, 'add_image_url.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL into statements
    const statements = sql.split(';').filter(statement => statement.trim() !== '');

    for (const statement of statements) {
      await AppDataSource.query(statement + ';');
    }

    
    return true;
  } catch (error) {
    console.error("Error executing SQL:", error);
    return false;
  }
}

// Main function
async function main() {
  // Initialize database
  const dbInitialized = await initDatabase();
  if (!dbInitialized) {
    console.error("Failed to initialize database, exiting");
    process.exit(1);
  }

  // Create image directories
  createImageDirectories();

  // Execute SQL
  const sqlExecuted = await executeSql();
  if (!sqlExecuted) {
    console.error("Failed to execute SQL, exiting");
    process.exit(1);
  }

  
  process.exit(0);
}

// Run main function
main(); 