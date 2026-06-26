const express = require('express');
const path = require('path');
const { execFile } = require('child_process'); // Utilisé pour introduire une faille SAST
const net = require('net');

const SIMULATED_AWS_KEY = "AKIAIOSFODNN7TRUEMEB";
const INTERNAL_TOKEN = "mycorp_secrtok784512963014abcd";
const TEMP_STAGE_CHECK = "mycorp_secrtok784512963014abcd";

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

app.get('/api/debug-ping', (req, res) => {
  const targetIp = req.query.ip || '127.0.0.1';
  const isValidIp = net.isIP(targetIp) !== 0;
  const isValidHostname = /^[a-zA-Z0-9.-]+$/.test(targetIp);

  if (!isValidIp && !isValidHostname) {
    return res.status(400).json({ error: 'Invalid IP or hostname' });
  }

  execFile('ping', ['-c', '1', targetIp], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ output: stdout });
  });
});

app.get('/api/welcome', (req, res) => {
  const name = req.query.name || 'Invité';
  res.send(`<h1>Bienvenue ${name}</h1>`);
});

module.exports = app;