import { Worker } from 'worker_threads';
import * as path from 'path';
import { CustomError } from '../utils/error.js';
import { command } from '../interfaces/types.js';

export default class controlHandler {
   private control: Worker;

   constructor() {
      try {
         this.control = new Worker(
            path.resolve('./dist/modules/recorder-worker.js'),
         );
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
      this.control.postMessage(input);
      return new Promise<string>((resolve, reject) => {
         const onMessage = (
            message: { wMessage: string; caller: string },
            wTransferable?: any,
         ): void => {
            if (message.caller === input.caller) {
               const response = wTransferable
                  ? callback(message.wMessage, wTransferable)
                  : callback(message.wMessage);
               this.control.removeListener('error', onError);
               resolve(response);
            }
         };

         const onError = (error: { caller: string; error: Error }) => {
            if (error.caller === input.caller) {
               this.control.removeListener('message', onMessage);
               reject(`${error.caller} failed: ${error.error}`);
            }
         };

         this.control.once('message', onMessage);
         this.control.once('error', onError);
      });
   }

   public async start(): Promise<string> {
      const callback = (message: string): string => {
         return message;
      };
      try {
         return this.workerRequest(
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
         return this.workerRequest(
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
         return this.workerRequest(
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
         return this.workerRequest(
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
         return this.workerRequest(
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
         return this.workerRequest(
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
         return this.workerRequest(
            { request: 'abortInfinityRecord', caller: 'AbortInfinityRecord' },
            callback,
         );
      } catch (error) {
         throw new CustomError('*Control Handler turnoff failed: ', error);
      }
   }
}
