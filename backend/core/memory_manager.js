import fs from 'fs';
import path from 'path';

export class MemoryManager {
  constructor() {
    this.memoryFile = path.join(process.cwd(), 'lumina_user_memory.json');
    this.memory = this.loadMemory();
    this.workingBuffer = [];
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        return JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
      }
    } catch (e) {}
    return { 
      userProfile: { name: 'Flaxy', home: 'Nepanagar, MP', location: 'Bhopal / Indore, MP' }, 
      facts: ['User operates Mahakal Balloon Decoration & Events', 'Enrolled in B.Com Computer Application'], 
      contacts: { 'rohit': '7489129400' } 
    };
  }

  saveMemory() {
    try {
      fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2), 'utf8');
    } catch (e) {}
  }

  addTurn(role, text) {
    this.workingBuffer.push({ role, text, time: new Date().toISOString() });
    if (this.workingBuffer.length > 20) this.workingBuffer.shift();
  }

  getMemoryPromptContext() {
    return `User: ${this.memory.userProfile.name}, Home: ${this.memory.userProfile.home}. Known Facts: ${this.memory.facts.join('; ')}`;
  }

  exportMemory() {
    return this.memory;
  }

  importMemory(data) {
    if (data && typeof data === 'object') {
      this.memory = data;
      this.saveMemory();
      return true;
    }
    return false;
  }
}
