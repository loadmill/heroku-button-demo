const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { expressRecorder } = require('@loadmill/node-recorder');

const port = process.env.PORT || process.argv[2] || 8000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));
app.use(expressRecorder({ 
    loadmillCode: process.env.LOADMILL_CODE || '9c18750e-5978-4540-b953-e339c07f5e99',
    notSecure: true, 
    cookieExpiration: 10 * 60 * 1000,
    basePath: 'https://loadmill-node-recorder-demo.herokuapp.com'
 }));
const connections = [];
const state = { AMG: 0, EQC: 0 };

app.get('/vote/AMG', (_req, res) => {
    console.log('A vote for 🐱');
    addVotes({ AMG: 1 });
    res.sendStatus(200);
});

app.get('/vote/EQC', (_req, res) => {
    console.log('A vote for 🐶');
    addVotes({ EQC: 1 });
    res.sendStatus(200);
});

wss.on('connection', (ws) => {
    connections.push(ws);
    ws.send(JSON.stringify(state));
});

const addVotes = ({ AMG = 0, EQC = 0 }) => {
    state.AMG = state.AMG + AMG;
    state.EQC = state.EQC + EQC;
    connections.forEach(ws => ws.send(JSON.stringify(state)));
};

server.listen(port, () => console.log(`Demo app listening on port ${port}!`));
