import { Worker } from 'worker_threads';
import * as path from 'path';
import { stt } from './stt-controller.js';
import { tts } from './tts-controller.js';
import { CustomError } from '../utils/error.js';

const control = new Worker(path.resolve('./dist/lib/recorder-worker.js'));

export const controlHandler: {
   [key: string]: (param1?: any, param2?: any) => any;
} = {
   start: async (): Promise<string> => {
      control.postMessage('start');
      return new Promise<string>((resolve, reject) => {
         control.once('message', () => {
            control.removeAllListeners('message');
            control.removeAllListeners('error');
            resolve('started');
         });
         control.once('error', error => {
            control.removeAllListeners('message');
            control.removeAllListeners('error');
            reject('Control init failed.' + error);
         });
      });
   },

   idle: async (): Promise<string> => {
      control.postMessage('idle');
      return new Promise<string>((resolve, reject) => {
         control.once('message', message => {
            control.removeAllListeners('message');
            control.removeAllListeners('error');
            resolve(message);
         });
         control.once('error', error => {
            console.error('Erro na comunicação com o worker:', error);
            control.removeAllListeners('message');
            control.removeAllListeners('error');
            reject(error);
         });
      });
   },

   record: async (): Promise<
      | { message: string; recC: Int16Array[]; recL: Int16Array }
      | [{ intent: string; [slot: string]: string }, boolean]
      | string
   > => {
      try {
         control.postMessage('record');

         return new Promise<
            | { message: string; recC: Int16Array[]; recL: Int16Array }
            | [{ intent: string; [slot: string]: string }, boolean]
            | string
         >((resolve, reject) => {
            control.once('message', async message => {
               control.removeAllListeners('message');
               control.removeAllListeners('error');
               resolve(message);
            });
            control.once('error', error => {
               console.error('Erro na comunicação com o worker:', error);
               control.removeAllListeners('message');
               control.removeAllListeners('error');
               reject(error);
            });
         });
      } catch (error) {
         throw new CustomError('*Record Handler failed: ' + error);
      }
   },

   compositeCmd: async (): Promise<string> => {
      control.postMessage('cmdrecord');
      return new Promise<string>((resolve, reject) => {
         control.once('message', message => {
            control.removeAllListeners('message');
            control.removeAllListeners('error');
            if (message === 'cancel') {
               resolve('cancel');
            }
            handlers.stt(message);
            resolve(message);
         });
         control.once('error', error => {
            console.error('Erro na comunicação com o worker:', error);
            control.removeAllListeners('message');
            control.removeAllListeners('error');
            reject(error);
         });
      });
   },

   wait: (): Promise<string> => {
      control.postMessage('wait');
      control.removeAllListeners('message');
      return new Promise<string>((resolve, reject) => {
         control.once('message', message => {
            control.removeAllListeners('message');
            control.removeAllListeners('error');
            resolve(message);
         });
         control.once('error', error => {
            console.error('Erro na comunicação com o worker:', error);
            control.removeAllListeners('message');
            control.removeAllListeners('error');
            reject(error);
         });
      });
   },

   abortInfinityRecord: (): void => {
      control.postMessage('abortWait');
   },

   abort: () => {},

   stt: async (recL: Int16Array, recC: Int16Array[]): Promise<string> => {
      try {
         const transcription = await stt(recL, recC);
         return transcription;
      } catch (error) {
         throw new CustomError('*STT Handler failed:' + error);
      }
   },

   cmd: () => {
      //cade o caldo
   },

   tts: async (input: string): Promise<string> => {
      const synth: string = await tts(input);
      if (synth === 'TTS_done') {
         return 'ok';
      } else {
         throw new CustomError('*Record Handler failed: ' + synth);
      }
   },
   turnoff: async (): Promise<void> => {
      await control.postMessage('turnoff');
      control.terminate();
   },
};
