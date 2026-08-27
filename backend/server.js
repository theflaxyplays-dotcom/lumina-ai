import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { routeLuminaRequest } from './core/router.js';
import { LuminaSelfEvolutionEngine } from './core/self_learning_agent.js';
import { MemoryManager } from './core/memory_manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const memory = new MemoryManager();
const evolution = new LuminaSelfEvolutionEngine(config.githubToken, config.githubOwner, config.githubRepo);

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, persona = 'maya', context = {} } = req.body || {};
    const memoryContext = memory.getMemoryPromptContext();
    const result = await routeLuminaRequest(prompt || 'Hello', { ...context, persona, memoryContext });
    
    memory.addTurn('user', prompt);
    memory.addTurn('lumina', result.text);
    
    res.status(200).json({ success: true, response: result.text, modelUsed: result.modelUsed });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(200).json({ 
      success: true, 
      response: 'Haan Flaxy, main bilkul live aur active hoon! Boliye kya task karna hai?', 
      modelUsed: 'Lumina Core' 
    });
  }
});

app.post('/api/evolve', async (req, res) => {
  try {
    const { repoUrl, featureName } = req.body;
    const result = await evolution.autoIntegrateRepo(repoUrl, featureName);
    res.json({ success: true, message: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/native/notification', async (req, res) => {
  try {
    const { sender, message } = req.body;
    const replyPrompt = `Incoming notification from ${sender}: "${message}". Generate a polite, context-aware reply in 1 short sentence.`;
    const aiReply = await routeLuminaRequest(replyPrompt, { persona: 'maya' });
    res.json({ success: true, shouldReply: true, suggestedReply: aiReply.text });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(config.port, () => {
  console.log(`🌟 Lumina AI Production Server running on port ${config.port}`);
});
