import ws, { RawData, WebSocketServer } from 'ws';
import * as portfinder from 'portfinder';
import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import { command } from '../interfaces/types.js';
import errorLog from '../utils/error.js';
import { readConfigFile } from '../configuration/conf.js';
import { config } from '../interfaces/config-json.js';
import { CustomError } from '../utils/error.js';

export default class RedController extends EventEmitter {
   private redServer: WebSocketServer | null = null;
   private connectedClient: ws | null = null;
   private processingCMD: boolean = false;
   private messages: string[] = [];
   private redPort: number = 21105;
   private config!: config;
   private restart: () => void;
   private failed: boolean = false;

   constructor(restart: () => void) {
      super();
      try {
         console.log('corno');
         this.setRedPort();
         this.config = readConfigFile();
         this.restart = restart;
      } catch (err) {
         errorLog(new CustomError('°RedController failed to init:', err, true));
      }
   }

   public async startServer(): Promise<string> {
      try {
         return new Promise((resolve, reject) => {
            if (!this.redServer) {
               portfinder
                  .getPortPromise()
                  .then(fport => {
                     this.setFlow(fport);
                     this.redServer = new WebSocketServer({ port: fport });
                     this.redServer.on('connection', ws => {
                        this.connectedClient = ws;

                        const messageHandler = (message: RawData) => {
                           if (!this.processingCMD) {
                              //this is to receive and reproduce red messages not activated by the user with Vanusa
                              const msgObj = this.parseHexToObject(message);
                              if (msgObj) this.emit('REDmessage', message);
                           }
                        };

                        ws.once('message', () => {
                           ws.on('message', messageHandler);
                           this.redPort = this.setRedPort();
                           resolve('started');
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
      } catch (error) {
         throw new CustomError('*Red Controller startServer failed: ', error);
      }
   }

   public async stopServer(): Promise<void> {
      try {
         if (this.redServer) {
            this.redServer.close(() => {
               console.log('Server closed.');
               this.redServer = null;
               this.removeAllListeners('REDmessage');
            });
         } else {
            console.log('Cannot stop Red: Server is not running.');
         }
      } catch (error) {
         throw new CustomError('*Red Controller stopServer failed: ', error);
      }
   }

   public sendRedMessage(message: string | command): Promise<string> {
      try {
         this.processingCMD = true;
         return new Promise((resolve, reject) => {
            if (
               this.connectedClient &&
               this.connectedClient.readyState === this.connectedClient.OPEN
            ) {
               this.connectedClient.send(
                  typeof message === 'string'
                     ? JSON.stringify({ payload: message })
                     : JSON.stringify(message),
               );

               this.connectedClient.once('message', (response: RawData) => {
                  console.log('Response received from Red client:', response);
                  const parsedResponse = this.parseHexToObject(response);
                  this.processingCMD = false;
                  if (parsedResponse?.error) {
                     errorLog(
                        '*Red response msg obj reported an error: ' +
                           parsedResponse.error,
                     );
                  }
                  if (parsedResponse?.cmd_response) {
                     if (parsedResponse?.error) {
                        resolve(
                           parsedResponse.cmd_response +
                              this.config.LANGUAGE ===
                              'en'
                              ? ' but there was an error, check the log'
                              : ' mas houve um erro, cheque o log',
                        );
                     }
                     resolve(parsedResponse.cmd_response);
                  } else {
                     resolve(
                        parsedResponse?.error ? 'RED_sucess' : 'RED_error',
                     );
                  }
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
      } catch (error) {
         this.processingCMD = false;
         throw new CustomError(
            'Error occurred while sending message to Red: ' + error,
         );
      }
   }

   private parseHexToObject(bufferMsg: RawData): { [key: string]: any } | null {
      try {
         const jsonString = bufferMsg.toString('utf-8');
         const sanitizedString = jsonString.trim();
         return JSON.parse(sanitizedString);
      } catch (error) {
         console.error('Error parsing Red buffer message:', error);
         return null;
      }
   }

   private setFlow(port: number): void {
      let docsPath = path.resolve(path.join(homedir(), 'Documents'), 'Vanusa');
      docsPath = docsPath.replace(/\\/g, '\\\\');
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
               node.func = `flow.set('CANCEL', false)\nflow.set('DOCS', '${docsPath}')\nmsg.payload=\"Flow variables set.\"\nreturn msg;\n\n//You can set your vars here if u want`;
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

   public getRedPort(): number {
      return this.redPort;
   }

   private setRedPort(): number {
      try {
         const fileContent = readFileSync(
            path.resolve('./ecosystem.config.cjs'),
            'utf-8',
         );
         const portMatch = fileContent.match(/-p\s(\d+)/);

         if (portMatch && portMatch[1]) {
            return parseInt(portMatch[1], 10);
         }

         throw new Error('Port number not found in configuration file');
      } catch (error) {
         console.error('Error reading configuration file:', error);
         throw error;
      }
   }
}
