import ws, { WebSocketServer } from 'ws';
import * as portfinder from 'portfinder';
import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { EventEmitter } from 'events';

export default class RedController extends EventEmitter {
   private redServer: WebSocketServer | null = null;
   private connectedClient: ws | null = null;
   private processingCMD: boolean = false;
   private messages: string[] = [];

   constructor() {
      super();
   }

   public async startServer(): Promise<string> {
      return new Promise((resolve, reject) => {
         if (!this.redServer) {
            portfinder
               .getPortPromise()
               .then(fport => {
                  this.redServer = new WebSocketServer({ port: fport });
                  this.setFlow(fport);
                  this.redServer.on('connection', ws => {
                     this.connectedClient = ws;

                     const messageHandler = (message: string) => {
                        if (!this.processingCMD) {
                           //this is to receive and reproduce red messages not activated by the user with Vanusa
                           this.emit('REDmessage', message);
                        }
                     };

                     ws.once('message', () => {
                        resolve('started');
                        ws.on('message', messageHandler);
                     });

                     ws.on('close', () => {
                        ws.off('message', messageHandler);
                        this.connectedClient = null;
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

   public stopServer() {
      if (this.redServer) {
         this.redServer.close(() => {
            console.log('Server closed.');
            this.redServer = null;
            this.removeAllListeners('REDmessage');
         });
      } else {
         console.log('Cannot stop Red: Server is not running.');
      }
   }

   public sendRedMessage(
      message: string | { intent: string; [slot: string]: string },
   ): Promise<string> {
      this.processingCMD = true;
      return new Promise((resolve, reject) => {
         if (
            this.connectedClient &&
            this.connectedClient.readyState === this.connectedClient.OPEN
         ) {
            this.connectedClient.send(
               typeof message === 'string' ? message : JSON.stringify(message),
            );

            this.connectedClient.once('message', (response: string) => {
               console.log('Response received from Red client:', response);
               this.processingCMD = false;
               resolve(response);
            });

            this.connectedClient.once('error', (err: Error) => {
               this.processingCMD = false;
               reject(
                  'Error occurred while waiting for Red response: ' +
                     err.message,
               );
            });
         } else {
            this.processingCMD = false;
            reject('No Red client connected or client is not ready.');
         }
      });
   }

   private setFlow(port: number): void {
      const docsPath = path.resolve(
         path.join(homedir(), 'Documents'),
         'Vanusa',
      );
      const filePath = path.resolve('./.node-red/VoiceAssist.json');
      try {
         const flowData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
         flowData.forEach((node: any) => {
            if (
               node.type === 'websocket-listener' &&
               node.id === '9dca3b73347bd783' &&
               node.path.startsWith('ws://localhost:')
            ) {
               node.path = `ws://localhost:${port}`;
            }
            if (
               node.type === 'function' &&
               node.name === 'ENV_VARS' &&
               node.id === '3ad208dd7ae27c61'
            ) {
               node.func = `"//You can set your vars here if u want\nflow.set('CANCEL', false)\nflow.set('DOCS', ${docsPath})\nmsg.payload=\"Flow variables set.\"\nreturn msg;",`;
            }
         });
         fs.writeFileSync(filePath, JSON.stringify(flowData, null, 2), 'utf-8');
      } catch (error) {
         throw new Error('Error updating flow file: ' + error);
      }
   }

   public saveMessage(message: string): void {
      this.messages.push(message);
   }

   public isThereMessages(): boolean {
      return this.messages.length > 0;
   }

   public messageFlush(): string[] {
      const messages = this.messages;
      this.messages = [];
      return messages;
   }
}
