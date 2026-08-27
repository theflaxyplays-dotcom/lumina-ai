import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { routeLuminaRequest } from './core/router.js';
import { LuminaSelfEvolutionEngine } from './core/self_learning_agent.js';
import { MemoryManager } from './core/memory_manager.js';
import { SkillsManager } from './core/skills_manager.js';
import { SystemDiagnostics } from './core/system_diagnostics.js';
import { LicenseManager } from './core/license_manager.js';
import { UniversalTerminal } from './tools/universal_terminal.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const memory = new MemoryManager();
const evolution = new LuminaSelfEvolutionEngine(config.githubToken, config.githubOwner, config.githubRepo);
const skills = new SkillsManager();
const diagnostics = new SystemDiagnostics();
const licenses = new LicenseManager();
const terminal = new UniversalTerminal();

// 1. Primary Chat Route
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, persona = 'maya', context = {} } = req.body || {};
    if (!prompt) {
      return res.status(200).json({ success: true, response: 'Haan Flaxy, main active hoon! Boliye kya task karna hai?', modelUsed: 'Lumina Core' });
    }

    const memoryContext = memory.getMemoryPromptContext();
    const matchedSkill = skills.findMatchingSkill(prompt);
    
    const result = await routeLuminaRequest(prompt, { 
      ...context, 
      persona, 
      memoryContext,
      skillInstruction: matchedSkill ? matchedSkill.instructions : null 
    });
    
    memory.addTurn('user', prompt);
    memory.addTurn('lumina', result.text);
    
    res.status(200).json({ success: true, response: result.text, modelUsed: result.modelUsed });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(200).json({ 
      success: true, 
      response: 'Haan Flaxy, main live aur active hoon! Boliye kya help chahiye?', 
      modelUsed: 'Lumina Core' 
    });
  }
});

// 2. Self-Evolution / GitHub Repo Integration
app.post('/api/evolve', async (req, res) => {
  try {
    const { repoUrl, featureName } = req.body;
    const result = await evolution.autoIntegrateRepo(repoUrl, featureName);
    res.json({ success: true, message: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Diagnostics Telemetry
app.get('/api/diagnostics', (req, res) => {
  res.json({ success: true, data: diagnostics.getVitals() });
});

// 4. Memory Backup & Restore
app.get('/api/backup', (req, res) => {
  res.json({ success: true, memory: memory.exportMemory() });
});

app.post('/api/restore', (req, res) => {
  const { data } = req.body;
  const ok = memory.importMemory(data);
  res.json({ success: ok, message: ok ? 'Memory restored successfully' : 'Failed to restore' });
});

// 5. Native Android Notification Interceptor Webhook
app.post('/api/native/notification', async (req, res) => {
  try {
    const { sender, message, package: pkg } = req.body || {};
    console.log(`[Notification Intercept] From: ${sender} via ${pkg}: ${message}`);
    
    const replyPrompt = `Incoming notification from ${sender}: "${message}". Generate a polite, context-aware reply in 1 short sentence.`;
    const aiReply = await routeLuminaRequest(replyPrompt, { persona: 'maya' });
    
    res.json({ success: true, shouldReply: true, suggestedReply: aiReply.text });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 6. Universal Terminal Command Execution
app.post('/api/terminal', async (req, res) => {
  try {
    const { command, args } = req.body;
    const output = await terminal.execute(command, args);
    res.json({ success: true, output });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(config.port, () => {
  console.log(`🌟 Lumina AI Production Server running on port ${config.port}`);
});
