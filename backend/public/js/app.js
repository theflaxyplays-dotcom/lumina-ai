let isSpeaking = false;
function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  isSpeaking = true;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'hi-IN';
  utt.rate = 1.0;
  utt.pitch = 1.05;
  utt.onend = () => { isSpeaking = false; };
  utt.onerror = () => { isSpeaking = false; };
  window.speechSynthesis.speak(utt);
}

const chatLog = document.getElementById('chatLog');
const userInput = document.getElementById('userInput');
const statusText = document.getElementById('statusText');
const orb = document.getElementById('orb');
const nativeStatus = document.getElementById('nativeStatus');

if (window.LuminaNative && nativeStatus) {
  nativeStatus.innerText = 'Native APK Connected';
}

function appendMessage(sender, text) {
  if (!chatLog) return;
  const div = document.createElement('div');
  div.className = sender === 'user' ? 'text-right' : 'text-left';
  
  const msgWrapper = document.createElement('div');
  msgWrapper.className = `inline-block px-3 py-2 rounded-xl text-left ${sender === 'user' ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/30' : 'bg-slate-800/80 text-slate-200 border border-slate-700'}`;
  
  const p = document.createElement('p');
  p.innerText = text;
  msgWrapper.appendChild(p);

  if (sender === 'lumina') {
    const btn = document.createElement('button');
    btn.className = 'text-xs text-cyan-400 mt-1 block hover:underline';
    btn.innerText = '🔊 Read Aloud';
    btn.onclick = () => speakText(text);
    msgWrapper.appendChild(btn);
  }

  div.appendChild(msgWrapper);
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

window.handleSend = async function() {
  if (!userInput) return;
  const prompt = userInput.value.trim();
  if (!prompt) return;

  appendMessage('user', prompt);
  userInput.value = '';
  if (statusText) statusText.innerText = 'Thinking...';
  if (orb) orb.classList.add('listening');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, persona: 'maya' })
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { success: true, response: 'Haan Flaxy, main active hoon! Boliye kya task karna hai?' };
    }

    if (orb) orb.classList.remove('listening');

    if (data && data.response) {
      appendMessage('lumina', data.response);
      if (orb) orb.classList.add('speaking');
      speakText(data.response);
      setTimeout(() => {
        if (orb) orb.classList.remove('speaking');
        if (statusText) statusText.innerText = '"Wake up Lumina"';
      }, 3000);
    }
  } catch (e) {
    if (orb) orb.classList.remove('listening');
    appendMessage('lumina', 'Haan Flaxy, main live hoon! Boliye kya kaam karna hai?');
    if (statusText) statusText.innerText = '"Wake up Lumina"';
  }
};

window.handleOrbClick = function() {
  if (statusText) statusText.innerText = 'Listening...';
  if (orb) orb.classList.add('listening');
  speakText('Boliye Flaxy...');
};

(function initVoiceWake() {
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Speech) return;
  const rec = new Speech();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = 'hi-IN';
  let isAwake = false;

  rec.onresult = (e) => {
    if (isSpeaking) return;
    for (let i = e.resultIndex; i < e.results.length; ++i) {
      const text = e.results[i][0].transcript.trim().toLowerCase();
      if (!isAwake && (text.includes('wake up lumina') || text.includes('hey lumina'))) {
        isAwake = true;
        if (statusText) statusText.innerText = 'Listening...';
        if (orb) orb.classList.add('listening');
        speakText('Lumina online, boliye...');
        continue;
      }
      if (isAwake && e.results[i].isFinal && text.length > 2) {
        isAwake = false;
        if (userInput) userInput.value = text;
        window.handleSend();
      }
    }
  };

  rec.onerror = () => setTimeout(() => { try { rec.start(); } catch(err){} }, 1500);
  rec.onend = () => setTimeout(() => { try { rec.start(); } catch(err){} }, 1000);
  try { rec.start(); } catch(err) {}
})();
