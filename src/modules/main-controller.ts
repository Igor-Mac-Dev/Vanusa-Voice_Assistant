import { Worker } from 'worker_threads';
import * as path from 'path';
import { CustomError } from '../utils/error.js';
import { command } from '../interfaces/types.js';

export default class controlHandler {
   private control: Worker;
   private ready: boolean = false;

   constructor() {
      try {
         this.control = new Worker(
            path.resolve('./dist/modules/recorder-worker.js'),
         );
         this.control.once('message', message => {
            if (message === 'ready') {
               setTimeout(() => {
                  this.ready = true;
               }, 100);
            } else {
               throw new CustomError(
                  'Control Handler failed to init: ',
                  message,
                  true,
               );
            }
         });
         this.control.on('message', message => {
            console.log('control global listenner: ' + JSON.stringify(message));
            console.log('listns ' + this.control.listenerCount('message'));
         });
      } catch (err) {
         throw new CustomError('°Control Handler failed to init:', err, true);
      }
   }

   protected workerRequest(
      input: {
         request:
            | 'idle'
            | 'record'
            | 'wait'
            | 'start'
            | 'turnoff'
            | 'cmdrecord'
            | 'abortInfinityRecord';
         caller: string;
      },
      callback: (message: string, transferable?: any) => any,
   ): Promise<string> {
      return new Promise<string>((resolve, reject) => {
         const onMessage = (
            message: { wMessage: string; caller: string },
            wTransferable?: any,
         ): void => {
            console.log(`control message: ${JSON.stringify(message)}`);

            if (message.caller === input.caller) {
               this.control.removeListener('error', onError);
               this.control.removeListener('message', onMessage);

               const response = wTransferable
                  ? callback(message.wMessage, wTransferable)
                  : callback(message.wMessage);

               console.log(`resolving: ${response}`);

               resolve(response);
            }
         };

         const onError = (error: { caller: string; error: Error }) => {
            if (error.caller === input.caller) {
               this.control.removeListener('message', onMessage);
               reject(`${error.caller} failed: ${error.error}`);
            }
         };

         this.control.on('message', onMessage);
         console.log(
            'setin listns ' +
               input.caller +
               this.control.listenerCount('message'),
         );
         this.control.on('error', onError);

         console.log('msg sent:', JSON.stringify(input));
         this.control.postMessage(input);
      });
   }

   private async waitForReady(): Promise<void> {
      if (this.ready) return;

      return new Promise(resolve => {
         const checkReady = () => {
            if (this.ready) {
               resolve();
            } else {
               setTimeout(checkReady, 50);
            }
         };
         checkReady();
      });
   }

   public async start(): Promise<string> {
      const callback = (message: string): string => {
         console.log('callback fds ' + JSON.stringify(message));
         return message;
      };
      try {
         await this.waitForReady();
         return await this.workerRequest(
            { request: 'start', caller: 'Start' },
            callback,
         );
      } catch (error) {
         throw new CustomError('*Control Handler starter failed: ', error);
      }
   }

   public async idle(): Promise<string> {
      const callback = (message: string): string => {
         return message;
      };
      try {
         return await this.workerRequest(
            { request: 'idle', caller: 'Idle' },
            callback,
         );
      } catch (error) {
         throw new CustomError('*Control Handler starter failed: ', error);
      }
   }

   public async record(): Promise<string | [command, boolean]> {
      const callback = (
         message: string | [command, boolean],
      ): string | [command, boolean] => {
         return message;
      };
      try {
         return await this.workerRequest(
            { request: 'record', caller: 'Record' },
            callback,
         );
      } catch (error) {
         throw new CustomError('*Control Handler starter failed: ', error);
      }
   }

   public async compositeCmd(): Promise<string> {
      const callback = (message: string): string => {
         return message;
      };
      try {
         return await this.workerRequest(
            { request: 'cmdrecord', caller: 'CmdRecord' },
            callback,
         );
      } catch (error) {
         throw new CustomError('*Control Handler compositeCmd failed: ', error);
      }
   }

   public async wait(): Promise<string> {
      const callback = (message: string): string => {
         return message;
      };
      try {
         return await this.workerRequest(
            { request: 'wait', caller: 'Wait' },
            callback,
         );
      } catch (error) {
         throw new CustomError('*Control Handler wait failed: ', error);
      }
   }

   public async abortInfinityRecord(): Promise<string> {
      const callback = (message: string): string => {
         return message;
      };
      try {
         return await this.workerRequest(
            { request: 'abortInfinityRecord', caller: 'AbortInfinityRecord' },
            callback,
         );
      } catch (error) {
         throw new CustomError('*Control Handler wait failed: ', error);
      }
   }

   public async abort() {}

   public async turnoff(): Promise<string> {
      const callback = (message: string): string => {
         return message;
      };
      try {
         return await this.workerRequest(
            { request: 'abortInfinityRecord', caller: 'AbortInfinityRecord' },
            callback,
         );
      } catch (error) {
         throw new CustomError('*Control Handler turnoff failed: ', error);
      }
   }
}
