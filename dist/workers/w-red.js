import { parentPort } from 'worker_threads';
import { Server } from 'ws';
import * as portfinder from 'portfinder';
let redServer;
let connectedClient = null;
parentPort?.on('message', async (message) => {
    console.log('recorder child Received:', message);
    const sig = await switchController(message);
    sendSig(sig);
});
async function switchController(input) {
    switch (input) {
        case 'start':
            return await startServer();
    }
}
async function startServer() {
    if (!redServer) {
        portfinder
            .getPortPromise()
            .then(port => {
            redServer = new Server({ port });
            console.log(`Voice assistant WebSocket server is running on ws://localhost:${port}`);
            redServer.on('connection', ws => {
                connectedClient = ws;
                ws.on('message', message => {
                    console.log('Received:', message.toString());
                    ws.send('Echo: ' + message);
                });
                ws.on('close', () => {
                    connectedClient = null;
                    console.log('Voice assistant Client disconnected');
                });
                ws.send('*ping*');
            });
        })
            .catch(err => {
            console.error(err);
        });
    }
    else {
        console.log('Server is already running.');
    }
}
function stopServer() {
    if (redServer) {
        redServer.close(() => {
            console.log('Server closed.');
            redServer = null;
        });
    }
    else {
        console.log('Server is not running.');
    }
}
function sendRedMessage(message) {
    connectedClient.send(message);
}
parentPort?.on('message', message => {
    console.log('Received from parent:', message);
});
function sendSig(sig) {
    switch (sig) {
        case 'stt':
            parentPort?.postMessage({
                message: 'stt',
                recC: voiceControl.rec.getRecordC(),
                recL: voiceControl.rec.getRecordL(),
            });
            break;
        case 'cmd':
            parentPort?.postMessage([voiceControl.getIntent()]);
            break;
        default:
            parentPort?.postMessage(sig);
            break;
    }
}
//# sourceMappingURL=w-red.js.map