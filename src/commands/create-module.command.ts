import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Function to execute shell commands
const runCommand = (command: string): void => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
  }
};

// Function to create directories
const createDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
};

// Main function to generate module and folders
const createModule = (moduleName: string): void => {
  const modulePath = `modules/${moduleName}`;

  // Generate module, controller, and service using Nest CLI
  runCommand(`nest g module ${modulePath}`);
  runCommand(`nest g controller ${modulePath}`);
  runCommand(`nest g service ${modulePath}`);

  // Create additional folders inside the module
  const basePath = path.join(__dirname, '../src', modulePath);
  createDir(`${basePath}/dto`);
  createDir(`${basePath}/repositories`);
  createDir(`${basePath}/helpers`);
  createFile(`${basePath}/types.d.ts`, '// Type definitions go here\n');

  console.log(`Module ${moduleName} created with additional folders.`);
};

// Utility function to create a file with content
const createFile = (filePath: string, content: string): void => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${filePath}`);
  } else {
    console.log(`File already exists: ${filePath}`);
  }
};

// Get the module name from the command-line arguments
const moduleName = process.argv[2];
if (!moduleName) {
  console.error('Please provide a module name.');
  process.exit(1);
}

createModule(moduleName);
