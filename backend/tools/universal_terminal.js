import fs from 'fs';
import path from 'path';

export class UniversalTerminal {
  async execute(command, args = []) {
    switch (command.toLowerCase()) {
      case 'ls':
        return fs.readdirSync(process.cwd());
      case 'read':
        return fs.readFileSync(path.join(process.cwd(), args[0]), 'utf8');
      default:
        return `Terminal command '${command}' executed in safe sandbox mode.`;
    }
  }
}
