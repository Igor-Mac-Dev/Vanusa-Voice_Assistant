import { Worker } from 'worker_threads';
import * as path from 'path';
import { CustomError } from '../utils/error.js';
import { command, record } from '../interfaces/types.js';

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

   public async start(): Promise<string> {
      try {
         this.control.postMessage('start');
         return new Promise<string>((resolve, reject) => {
            this.control.once('message', () => {
               this.control.removeAllListeners('error');
               resolve('started');
            });
            this.control.once('error', error => {
               this.control.removeAllListeners('message');
               reject('Control init failed.' + error);
            });
         });
      } catch (error) {
         throw new CustomError('*Control Handler starter failed: ', error);
      }
   }

   public async idle(): Promise<string> {
      this.control.postMessage('idle');
      return new Promise<string>((resolve, reject) => {
         this.control.once('message', message => {
            this.control.removeAllListeners('error');
            resolve(message);
         });
         this.control.once('error', error => {
            console.error('Communication error with voice controller: ', error);
            this.control.removeAllListeners('message');
            reject(error);
         });
      });
   }

   public async record(): Promise<record | [command, boolean] | string> {
      this.control.postMessage('record');

      return new Promise<record | [command, boolean] | string>(
         (resolve, reject) => {
            this.control.once('message', async message => {
               setTimeout(() => {
                  this.control.removeAllListeners('error');
               }, 500);
               resolve(message);
            });
            this.control.once('error', error => {
               console.error(
                  'Communication error with voice controller: ',
                  error,
               );
               this.control.removeAllListeners('message');
               reject(error);
            });
         },
      );
   }

   public async compositeCmd(): Promise<record | string> {
      try {
         this.control.postMessage('cmdrecord');
         return new Promise<string>((resolve, reject) => {
            this.control.once('message', message => {
               this.control.removeAllListeners('message');
               this.control.removeAllListeners('error');
               if (message === 'cancel') {
                  resolve('cancel');
               }
               resolve(message);
            });
            this.control.once('error', error => {
               console.error(
                  'Communication error with voice controller: ',
                  error,
               );
               this.control.removeAllListeners('message');
               this.control.removeAllListeners('error');
               reject(error);
            });
         });
      } catch (error) {
         throw new CustomError('*Control Handler compositeCmd failed: ', error);
      }
   }

   public async wait(): Promise<string> {
      try {
         this.control.postMessage('wait');
         this.control.removeAllListeners('message');
         return new Promise<string>((resolve, reject) => {
            this.control.once('message', message => {
               this.control.removeAllListeners('message');
               this.control.removeAllListeners('error');
               resolve(message);
            });
            this.control.once('error', error => {
               console.error(
                  'Communication error with voice controller: ',
                  error,
               );
               this.control.removeAllListeners('message');
               this.control.removeAllListeners('error');
               reject(error);
            });
         });
      } catch (error) {
         throw new CustomError('*Control Handler wait failed: ', error);
      }
   }

   public async abortInfinityRecord(): Promise<string> {
      this.control.postMessage('abortInfinityRecord');
      return new Promise<string>((resolve, reject) => {
         this.control.once('message', message => {
            this.control.removeAllListeners('error');
            resolve(message);
         });
         this.control.once('error', error => {
            this.control.removeAllListeners('message');
            reject(error);
         });
      });
   }

   public async abort() {}

   public async turnoff(): Promise<void> {
      try {
         await this.control.postMessage('turnoff');
         this.control.terminate();
      } catch (error) {
         throw new CustomError('*Control Handler turnoff failed: ', error);
      }
   }
}
