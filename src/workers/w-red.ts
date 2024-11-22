import { parentPort } from 'worker_threads';
import ws, { WebSocketServer } from 'ws';
import * as portfinder from 'portfinder';
import fs from 'fs';
import path from 'path';

let redServer: WebSocketServer | null = null;
let connectedClient: ws | null = null;

parentPort?.on('message', async message => {
   let sig;
   console.log('red child Received:', message);
   switch (message) {
      case 'start':
         sig = await startServer();
         break;
      case 'cancel':
         sig = await sendRedMessage('cancel');
         break;
      case 'stop':
         await stopServer();
         sig = 'stopped';
         break;
      default:
         if (message.typeof === Array) {
            sig = await sendRedMessage(message);
         } else {
            sig = 'Red server called with unknow input';
         }
   }
   parentPort?.postMessage(sig);
});

const saveCurrentPort = (port: number) => {
   const filePath = path.resolve('./.node-red/VoiceAssist.json');
   try {
      const flowData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      flowData.forEach((node: any) => {
         if (
            node.type === 'websocket-listener' &&
            node.name === 'Vanusa-listener' &&
            node.path.startsWith('ws://localhost:')
         ) {
            node.path = `ws://localhost:${port}`;
         }
      });
      fs.writeFileSync(filePath, JSON.stringify(flowData, null, 2), 'utf-8');
   } catch (error) {
      throw new Error('Error updating flow file: ' + error);
   }
};

async function startServer(): Promise<string> {
   return new Promise((resolve, reject) => {
      if (!redServer) {
         portfinder
            .getPortPromise()
            .then(fport => {
               redServer = new WebSocketServer({ port: fport });
               saveCurrentPort(fport);
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
      } else {
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
   } else {
      console.log('Cannot stop Red: Server is not running.');
   }
}

function sendRedMessage(
   message: string | { intent: string; [slot: string]: string },
): Promise<string> {
   return new Promise((resolve, reject) => {
      if (
         connectedClient &&
         connectedClient.readyState === connectedClient.OPEN
      ) {
         connectedClient.send(
            typeof message === 'string' ? message : JSON.stringify(message),
         );

         connectedClient.once('message', (response: string) => {
            console.log('Response received from Red client:', response);
            resolve(response);
         });

         connectedClient.once('error', (err: Error) => {
            reject(
               'Error occurred while waiting for Red response: ' + err.message,
            );
         });
      } else {
         reject('No Red client connected or client is not ready.');
      }
   });
}
