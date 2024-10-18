import { parentPort } from 'worker_threads';
import { Server } from 'ws';
import * as portfinder from 'portfinder';
let redServer;
let connectedClient = null;
parentPort?.on('message', async (message) => {
    console.log('recorder child Received:', message);
    const sig = await switchServer(message);
    sendParent(sig);
});
async function switchServer(input) {
    switch (input[0]) {
        case 'start':
            return await startServer();
        case 'send':
            return await sendRedMessage(input[1]);
        default:
            return 'Red server called with unknow input';
    }
}
async function startServer() {
    return new Promise((resolve, reject) => {
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
                        resolve('sucess');
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
            reject('Server is already running.');
        }
    });
}
function stopServer() {
    if (redServer) {
        redServer.close(() => {
            console.log('Server closed.');
            redServer = null;
        });
    }
    else {
        console.log('Cannot stop Red: Server is not running.');
    }
}
function sendRedMessage(message) {
    return new Promise((resolve, reject) => {
        if (connectedClient &&
            connectedClient.readyState === connectedClient.OPEN) {
            connectedClient.send(typeof message === 'string' ? message : JSON.stringify(message));
            connectedClient.once('message', (response) => {
                console.log('Response received from Red client:', response);
                resolve(response);
            });
            connectedClient.once('error', (err) => {
                reject('Error occurred while waiting for Red response: ' + err.message);
            });
        }
        else {
            reject('No Red client connected or client is not ready.');
        }
    });
}
parentPort?.on('message', message => {
    console.log('Received from parent:', message);
});
function sendParent(sig) {
    switch (sig) {
        case 'stt':
            break;
        case 'cmd':
            parentPort?.postMessage('a');
            break;
        default:
            parentPort?.postMessage(sig);
            break;
    }
}
//# sourceMappingURL=w-red.js.map