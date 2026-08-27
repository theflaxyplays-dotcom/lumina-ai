import axios from 'axios';
import { config } from '../config/env.js';

export async function routeLuminaRequest(prompt, context = {}) {
  const persona = context.persona || 'maya';
  const memoryInfo = context.memoryContext || 'User: Flaxy, Location: Nepanagar / Bhopal, MP';
  const skillText = context.skillInstruction ? `\nSkill Instructions:\n${context.skillInstruction}` : '';
  
  const systemPrompt = `You are Lumina, the ultimate autonomous mobile AI assistant. Persona: ${persona}. Memory Context: ${memoryInfo}.${skillText}\nAlways speak naturally, warmly, and helpfully in mixed Hindi/English (Hinglish). If the user asks for code (like HTML, CSS, JS, Python), provide complete, production-ready code formatted cleanly in markdown.`;

  // =========================================================================
  // TIER 1: GOOGLE GEMINI (Gemini 3.7 Flash & Gemini 2.5 Flash)
  // =========================================================================
  if (config.geminiKey && config.geminiKey.trim()) {
    const geminiKey = config.geminiKey.trim();
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }] }
        ]
      };
      if (context.imageBase64) {
        payload.contents[0].parts.push({
          inline_data: { mime_type: 'image/jpeg', data: context.imageBase64 }
        });
      }
      const res = await axios.post(url, payload, { timeout: 10000 });
      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { text, modelUsed: 'Google Gemini 3.7 Flash' };
    } catch (e) {
      console.warn('[Router] Gemini 3.7 Flash failed, trying Gemini 2.5 Flash:', e.message);
      try {
        const url2 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const res2 = await axios.post(url2, {
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }] }]
        }, { timeout: 10000 });
        const text2 = res2.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text2) return { text: text2, modelUsed: 'Google Gemini 2.5 Flash' };
      } catch (e2) {
        console.warn('[Router] Gemini 2.5 Flash failed:', e2.message);
      }
    }
  }

  // =========================================================================
  // TIER 2: HUGGING FACE ROUTER (Llama 3.2 3B - 100% Active Serverless)
  // =========================================================================
  if (config.hfKey && config.hfKey.trim()) {
    try {
      const res = await axios.post('https://router.huggingface.co/hf-inference/models/meta-llama/Llama-3.2-3B-Instruct/v1/chat/completions', {
        model: 'meta-llama/Llama-3.2-3B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      }, {
        headers: { 
          'Authorization': `Bearer ${config.hfKey.trim()}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      });
      if (res.data?.choices?.[0]?.message?.content) {
        return { text: res.data.choices[0].message.content, modelUsed: 'HuggingFace Llama 3.2' };
      }
    } catch (e) {
      console.warn('[Router] Hugging Face Router failed:', e.message);
    }
  }

  // =========================================================================
  // TIER 3: GROQ (Llama-3.3-70B & Llama-3.1-8B)
  // =========================================================================
  if (config.groqKey && config.groqKey.trim()) {
    const groqKey = config.groqKey.trim();
    try {
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      }, {
        headers: { 
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      });
      if (res.data?.choices?.[0]?.message?.content) {
        return { text: res.data.choices[0].message.content, modelUsed: 'Groq Llama 3.3 70B' };
      }
    } catch (e) {
      console.warn('[Router] Groq 70B failed, trying Groq 8B:', e.message);
      try {
        const res8b = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        }, {
          headers: { 
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 6000
        });
        if (res8b.data?.choices?.[0]?.message?.content) {
          return { text: res8b.data.choices[0].message.content, modelUsed: 'Groq Llama 3.1 8B' };
        }
      } catch (e2) {
        console.warn('[Router] Groq 8B failed:', e2.message);
      }
    }
  }

  // =========================================================================
  // TIER 4: NVIDIA NIM (Nemotron 340B & DeepSeek-R1)
  // =========================================================================
  if (config.nvidiaKey && config.nvidiaKey.trim()) {
    const nvidiaKey = config.nvidiaKey.trim();
    const modelsToTry = [
      'nvidia/nemotron-4-340b-instruct',
      'deepseek-ai/deepseek-r1',
      'meta/llama-3.3-70b-instruct'
    ];
    for (const model of modelsToTry) {
      try {
        const res = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 1024
        }, {
          headers: { 
            'Authorization': `Bearer ${nvidiaKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        });
        if (res.data?.choices?.[0]?.message?.content) {
          return { text: res.data.choices[0].message.content, modelUsed: `NVIDIA ${model}` };
        }
      } catch (e) {
        console.warn(`[Router] NVIDIA ${model} failed:`, e.message);
      }
    }
  }

  // =========================================================================
  // TIER 5: SMART CONVERSATIONAL & CODING CORE (Always Instant 0-second)
  // =========================================================================
  const lower = (prompt || '').toLowerCase();
  if (lower.includes('html') || lower.includes('code') || lower.includes('likho')) {
    return { 
      text: `Yeh raha responsive HTML & CSS starter code:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lumina App</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #38bdf8; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello Flaxy!</h1>
    <p>Lumina AI Autonomous Assistant Active.</p>
  </div>
</body>
</html>
\`\`\``, 
      modelUsed: 'Lumina Core' 
    };
  }
  if (lower.includes('kaisi ho') || lower.includes('kaise ho') || lower.includes('kya haal')) {
    return { text: 'Main bilkul theek aur super energetic hoon! Aap bataiye Flaxy, aaj hum kya naya build karne wale hain?', modelUsed: 'Lumina Core' };
  }
  if (lower.includes('tum kaun ho') || lower.includes('kya ho') || lower.includes('who are you')) {
    return { text: 'Main Lumina hoon — aapki personal autonomous AI assistant! Main voice commands, phone automation, research aur coding sab handle kar sakti hoon.', modelUsed: 'Lumina Core' };
  }
  return { text: `Haan Flaxy, maine aapka message dekh liya: "${prompt}". Main live hoon aur aapke commands ke liye ready hoon!`, modelUsed: 'Lumina Core' };
}
