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
    loadmillCode: process.env.LOADMILL_CODE || '3d1bae8a-2b80-4817-ab77-334b1e473c9d',
    notSecure: true, 
    cookieExpiration: 10 * 60 * 1000,
 }));
const connections = [];
const state = { cats: 0, dogs: 0 };

app.get('/vote/cats', (_req, res) => {
    console.log('A vote for 🐱');
    addVotes({ cats: 1 });
    res.sendStatus(200);
});

app.get('/vote/dogs', (_req, res) => {
    console.log('A vote for 🐶');
    addVotes({ dogs: 1 });
    res.sendStatus(200);
});

wss.on('connection', (ws) => {
    connections.push(ws);
    ws.send(JSON.stringify(state));
});

const addVotes = ({ cats = 0, dogs = 0 }) => {
    state.cats = state.cats + cats;
    state.dogs = state.dogs + dogs;
    connections.forEach(ws => ws.send(JSON.stringify(state)));
};

server.listen(port, () => console.log(`Demo app listening on port ${port}!`));
