import fs from 'fs';
import path from 'path';

export class SkillsManager {
  constructor() {
    this.skillsDir = path.join(process.cwd(), 'skills');
    this.skills = this.loadSkills();
  }

  loadSkills() {
    const list = [];
    try {
      if (fs.existsSync(this.skillsDir)) {
        const files = fs.readdirSync(this.skillsDir);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(this.skillsDir, file), 'utf8');
            list.push({ filename: file, instructions: content });
          }
        }
      }
    } catch (e) {}
    return list;
  }

  findMatchingSkill(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes('leave') || lower.includes('application') || lower.includes('chutti')) {
      return this.skills.find(s => s.filename.includes('leave'));
    }
    return null;
  }
}
