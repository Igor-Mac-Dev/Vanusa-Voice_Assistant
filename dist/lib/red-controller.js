import { WebSocketServer } from 'ws';
import * as portfinder from 'portfinder';
import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
let redServer = null;
let connectedClient = null;
const setFlow = (port) => {
    const docsPath = path.resolve(path.join(homedir(), 'Documents'), 'Vanusa');
    const filePath = path.resolve('./.node-red/VoiceAssist.json');
    try {
        const flowData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        flowData.forEach((node) => {
            if (node.type === 'websocket-listener' &&
                node.id === '9dca3b73347bd783' &&
                node.path.startsWith('ws://localhost:')) {
                node.path = `ws://localhost:${port}`;
            }
            if (node.type === 'function' &&
                node.name === 'ENV_VARS' &&
                node.id === '3ad208dd7ae27c61') {
                node.func = `"//You can set your vars here if u want\nflow.set('CANCEL', false)\nflow.set('DOCS', ${docsPath})\nmsg.payload=\"Flow variables set.\"\nreturn msg;",`;
            }
        });
        fs.writeFileSync(filePath, JSON.stringify(flowData, null, 2), 'utf-8');
    }
    catch (error) {
        throw new Error('Error updating flow file: ' + error);
    }
};
export async function startServer() {
    return new Promise((resolve, reject) => {
        if (!redServer) {
            portfinder
                .getPortPromise()
                .then(fport => {
                redServer = new WebSocketServer({ port: fport });
                setFlow(fport);
                redServer.on('connection', ws => {
                    connectedClient = ws;
                    ws.once('message', message => {
                        resolve('started');
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
export function stopServer() {
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
export function sendRedMessage(message) {
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
//# sourceMappingURL=red-controller.js.map