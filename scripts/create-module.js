const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute shell commands
const runCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
  }
};

// Function to create directories
const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
};

// Main function to generate module and folders
const createModule = (moduleName) => {
  const modulePath = `modules/${moduleName}`;

  // Generate module, controller, and service using Nest CLI
  runCommand(`nest g module ${modulePath}`);
  runCommand(`nest g controller ${modulePath}`);
  runCommand(`nest g service ${modulePath}`);

  // Create additional folders inside the module
  const basePath = path.join(__dirname, '../src', modulePath);
  createDir(`${basePath}/dto`);
  createDir(`${basePath}/interfaces`);
  createDir(`${basePath}/repositories`);
  createDir(`${basePath}/helpers`);

  console.log(`Module ${moduleName} created with additional folders.`);
};

// Get the module name from the command-line arguments
const moduleName = process.argv[2];
if (!moduleName) {
  console.error('Please provide a module name.');
  process.exit(1);
}

createModule(moduleName);
