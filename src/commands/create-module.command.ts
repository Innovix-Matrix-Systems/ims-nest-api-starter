import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import * as fs from 'fs';
import { Command, Positional } from 'nestjs-command';
import * as path from 'path';

@Injectable()
export class CreateModuleCommand {
  @Command({
    command: 'create:module <moduleName>',
    describe: 'Create a new module with a predefined structure',
  })
  async run(
    @Positional({
      name: 'moduleName',
      describe: 'The name of the module',
      type: 'string',
    })
    moduleName: string

  ): Promise<void> {

    if (!moduleName) {
      console.error('Please provide a module name.');
      process.exit(1);
    }

    // Make sure the path points to the 'src' directory, not 'dist'
    const modulePath = path.join(process.cwd(), 'src/modules', moduleName);
    const relativePath = `modules/${moduleName}`;

    // Generate module, controller, and service using Nest CLI
    this.runCommand(`nest g module ${relativePath}`);
    this.runCommand(`nest g controller ${relativePath}`);
    this.runCommand(`nest g service ${relativePath}`);

    // Create additional folders inside the module
    this.createDir(`${modulePath}/dto`);
    this.createDir(`${modulePath}/repositories`);
    this.createFile(
      `${modulePath}/types.d.ts`,
      '// Type definitions go here\n',
    );

    console.log(`Module ${moduleName} created with additional folders.`);
  }

  // Utility function to run shell commands
  runCommand(command: string): void {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error executing command: ${command}`, error);
    }
  }

  // Utility function to create a directory if it doesn't exist
  createDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } else {
      console.log(`Directory already exists: ${dirPath}`);
    }
  }

  // Utility function to create a file with content
  createFile(filePath: string, content: string): void {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(`Created file: ${filePath}`);
    } else {
      console.log(`File already exists: ${filePath}`);
    }
  }
}
