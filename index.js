#!/usr/bin/env node
// index.js - Node.js app for meeting intent detection, notifications, and Google Calendar integration
const fs = require('fs');
const os = require('os');
const path = require('path');
const open = (...args) => import('open').then(mod => mod.default(...args));
const readline = require('readline');
const notifier = require('node-notifier');
const { google } = require('googleapis');
const axios = require('axios');
const mic = require('mic');
const WebSocket = require('ws');
const { spawn, exec } = require('child_process');
require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const TOKEN_PATH = path.join(os.homedir(), '.plato_gcal_token');
const chrono = require('chrono-node');

// Use bundled terminal-notifier
notifier.options = {
  terminalNotifier: path.join(__dirname, 'bin/terminal-notifier')
};
console.log('Terminal notifier path:', path.join(__dirname, 'bin/terminal-notifier'));

// Launch bundled Vosk server
const voskDir = path.join(__dirname, 'vosk');
const voskServerPath = path.join(voskDir, 'vosk_server.py');
const voskProcess = spawn('python3', [voskServerPath], {
  cwd: voskDir,
  detached: true,
  stdio: 'ignore'
});
voskProcess.unref();

// --- Google OAuth2 flow ---
async function getNewToken() {
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'http://localhost:51739');
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  console.log('Opening browser for Google authentication...');
  await open(authUrl);
  console.log('If your browser did not open, visit this URL:\n' + authUrl);
  // Start a simple local server to receive the code
  const http = require('http');
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, 'http://localhost:51739');
      const code = url.searchParams.get('code');
      if (code) {
        res.end('Authentication successful! You can close this tab.');
        server.close();
        try {
          const { tokens } = await oAuth2Client.getToken(code);
          fs.writeFileSync(TOKEN_PATH, tokens.refresh_token, { encoding: 'utf-8' });
          console.log('Refresh token saved to', TOKEN_PATH);
          resolve(tokens.refresh_token);
        } catch (e) {
          reject(e);
        }
      } else {
        res.end('No code found.');
      }
    });
    server.listen(51739, () => {
      console.log('Waiting for Google authentication...');
    });
  });
}

function getOAuth2Client() {
  let refreshToken;
  try {
    refreshToken = fs.readFileSync(TOKEN_PATH, 'utf-8').trim();
  } catch (e) {
    return null;
  }
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  return oAuth2Client;
}

async function addCalendarEvent(eventDetails) {
  const auth = getOAuth2Client();
  if (!auth) throw new Error('No Google refresh token found.');
  const calendar = google.calendar({ version: 'v3', auth });

  // Use chrono-node to parse the date from eventDetails.text
  console.log('Event text for chrono-node:', eventDetails.text);
  let start = null;
  let chronoResult = null;
  try {
    chronoResult = chrono.parse(eventDetails.text, new Date(), { forwardDate: true });
    console.log('chrono-node parse result:', JSON.stringify(chronoResult, null, 2));
    if (chronoResult && chronoResult.length > 0 && chronoResult[0].start) {
      let chronoDate = chronoResult[0].start.date();
      // If chrono-node only found a date (implied hour), but LLM datetime has a time, use LLM's time
      if (
        chronoResult[0].start.knownValues &&
        !('hour' in chronoResult[0].start.knownValues) &&
        eventDetails.datetime
      ) {
        const llmDate = new Date(eventDetails.datetime);
        chronoDate.setHours(llmDate.getHours(), llmDate.getMinutes(), 0, 0);
        console.log('Used LLM time for chrono-node date:', chronoDate);
      }
      start = chronoDate;
    }
  } catch (e) {
    console.error('Chrono-node parsing error:', e);
  }
  // Fallback to LLM's datetime if chrono-node fails
  if (!start && eventDetails.datetime) {
    console.log('Falling back to LLM datetime:', eventDetails.datetime);
    start = new Date(eventDetails.datetime);
  }
  if (!start) throw new Error('Could not parse date/time from event.');
  const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1 hour
  const event = {
    summary: eventDetails.text || 'Meeting',
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
  };
  const res = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });
  return res.data;
}

// --- LLM intent detection (from intent-llm.js) ---
async function detectIntentWithOllama(transcript) {
  const now = new Date();
  const dateString = now.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
//   const prompt = `
// Today is ${dateString}.
// You are an assistant that extracts meeting scheduling intent from text. 
// If the text contains a suggestion to schedule a meeting (e.g., "let's meet next week at 2:00", "do you want to do a code review later at 7am"), 
// respond ONLY with a JSON object like:
// {"intent": "schedule_meeting", "datetime": "2024-06-20T14:00:00", "text": "<original text>"}
// If there is no scheduling intent, respond ONLY with: {"intent": "none"}
// Text: """${transcript}"""
// `;
  const prompt = `
  Today is ${dateString}.
  You are an assistant that extracts **event scheduling intent** from text.

  If the text contains a suggestion to plan or attend an event — formal or informal — such as:
  - meetings ("let's meet next week at 2:00")
  - casual plans ("want to grab coffee Friday?")
  - appointments ("can we do a call at 3?")
  - hangouts or meals ("dinner next Thursday?", "let's catch up this weekend")

  Respond ONLY with a JSON object like this:
  {"intent": "schedule_event", "datetime": "2024-06-20T14:00:00", "text": "<original text>"}

  If there is no event or time-based scheduling intent, respond ONLY with:
  {"intent": "none"}

  Text: """${transcript}"""
  `;
  const response = await axios.post('http://localhost:11434/api/generate', {
    model: 'mistral',
    prompt,
    stream: false
  });
  try {
    const result = JSON.parse(response.data.response.trim().split('\n').pop());
    return result;
  } catch (e) {
    return { intent: 'none' };
  }
}

// --- Microphone capture and Vosk transcription ---
function startVoskClient(onTranscript) {
  const ws = new WebSocket('ws://localhost:2700');
  ws.on('open', () => {
    console.log('Connected to Vosk server');
  });
  ws.on('message', async (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (e) {
      return;
    }
    const { type, text } = msg;
    if (type !== 'final' || !text || !text.trim()) return;
    onTranscript(text);
  });
  ws.on('close', () => {
    console.log('Vosk WebSocket closed. Reconnecting in 2s...');
    setTimeout(() => startVoskClient(onTranscript), 2000);
  });
  ws.on('error', (err) => {
    console.error('Vosk WebSocket error:', err);
  });
}

// --- Main logic ---
(async () => {
  // Test notification
  console.log('Testing notification system...');
  notifier.notify({
    title: 'Test Notification',
    message: 'Testing the notification system on startup',
    wait: true,
    timeout: 20
  }, (err, response, metadata) => {
    console.log('Test notification callback:', { err, response, metadata });
  });

  // 1. Ensure we have a refresh token
  let oAuth2Client = getOAuth2Client();
  if (!oAuth2Client) {
    try {
      await getNewToken();
    } catch (e) {
      console.error('Failed to authenticate with Google:', e);
      process.exit(1);
    }
  }

  // 2. Start listening for transcripts
  let lastEventText = '';
  startVoskClient(async (transcript) => {
    console.log('Transcript:', transcript);
    const result = await detectIntentWithOllama(transcript);
    console.log('LLM result:', result);
    if (result.intent === 'schedule_event' && result.text && result.text !== lastEventText) {
      console.log('Meeting intent detected, preparing notification...');
      lastEventText = result.text;
      // Try node-notifier first
      notifier.notify({
        title: 'PLATO: Meeting Detected!',
        message: result.text || 'A meeting was detected.',
        timeout: 30 // longer timeout, no 'wait'
      }, async (err, response, metadata) => {
        console.log('Notification callback triggered:', { err, response, metadata });
        // If notification was not shown or closed instantly, use osascript as fallback
        if (metadata && metadata.activationType === 'closed') {
          console.log('Notification closed instantly, trying osascript fallback...');
          exec(`osascript -e 'display notification "${result.text || 'A meeting was detected.'}" with title "PLATO: Meeting Detected!"'`);
        }
        if (err) {
          console.error('Notification error:', err);
        }
        if ((metadata && metadata.activationType === 'contentsClicked') || (metadata && metadata.activationValue === 'Add to GCal')) {
          console.log('Notification clicked, adding event to Google Calendar...');
          try {
            await addCalendarEvent(result);
            notifier.notify({ title: 'Meeting Added', message: 'Event added to Google Calendar.' });
          } catch (e) {
            notifier.notify({ title: 'Error', message: 'Could not add event to Google Calendar.' });
          }
        } else {
          console.log('Notification dismissed or timed out.');
        }
        lastEventText = '';
      });
    }
  });

  // 3. Start microphone capture (if needed for Vosk)
  // If your Vosk server needs a live audio stream, you can start it here:
  // const { startMicCapture } = require('./mic-capture');
  // startMicCapture('output.wav');
})(); 