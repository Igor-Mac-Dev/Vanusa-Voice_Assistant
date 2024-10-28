import { parentPort } from 'worker_threads';
import ws, { WebSocketServer } from 'ws';
import * as portfinder from 'portfinder';

let redServer: WebSocketServer | null = null;
let connectedClient: ws | null = null;

parentPort?.on('message', async message => {
   console.log('red child Received:', message);
   const sig = await switchServer(message);
   sendParent(sig);
});

async function switchServer(
   input: [string, { intent: string; [slot: string]: string }?],
): Promise<string> {
   switch (input[0]) {
      case 'start':
         return await startServer();
      case 'send':
         if (input[1]) {
            return await sendRedMessage(input[1]);
         }
         return 'Red server called with invalid send request';
         break;
      default:
         return 'Red server called with unknow input';
   }
}

async function startServer(): Promise<string> {
   return new Promise((resolve, reject) => {
      if (!redServer) {
         portfinder
            .getPortPromise()
            .then(fport => {
               redServer = new WebSocketServer({ port: fport });
               let firstMessage = true;
               console.log(
                  `Voice assistant WebSocket server is running on ws://localhost:${fport}`,
               );
               redServer.on('connection', ws => {
                  connectedClient = ws;

                  ws.on('message', message => {
                     console.log('Received:', message.toString());
                     ws.send('Echo: ' + message);
                     if (firstMessage) {
                        firstMessage = false;
                        resolve('started');
                     } else {
                        console.log('Sending to parent:', message);
                        parentPort?.postMessage(JSON.parse(message));
                     }
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

function sendParent(sig: string) {
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
