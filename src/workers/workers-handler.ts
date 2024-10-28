import { Worker } from 'worker_threads';
import * as path from 'path';

export const control = new Worker(path.resolve('./dist/workers/w-record.js'));
export const stt = new Worker(path.resolve('./dist/workers/w-stt.js'));
export const tts = new Worker(path.resolve('./dist/workers/w-tts.js'));
export const speaker = new Worker(path.resolve('./dist/workers/w-speaker.js'));
export const utils = new Worker(path.resolve('./dist/workers/w-utils.js'));
export const red = new Worker(path.resolve('./dist/workers/w-red.js'));

control.on('message', message => {
   console.log('control parent Received: ', message);
});

stt.on('message', message => {
   console.log('stt parent Received: ', message);
});

tts.on('message', message => {
   console.log('tts parent Received: ', message);
});

speaker.on('message', message => {
   console.log('speaker parent Received: ', message);
});

utils.on('message', message => {
   console.log('utils parent Received: ', message);
});

red.on('message', message => {
   console.log('red parent Received: ', message);
});

export async function awaitWorkerOk(worker: Worker): Promise<string> {
   return new Promise(resolve => {
      worker.on('message', message => {
         resolve(message);
      });
   });
}

/////////////////////////////////////////////////////////////////////

export const handlers: { [key: string]: (param1?: any, param2?: any) => void } =
   {
      start: () => {
         control.postMessage('start');
         red.postMessage(['start']);
      },
      idle: () => {
         control.postMessage('idle');
      },
      record: () => {
         control.postMessage('record');
      },
      wait: () => {
         control.postMessage('wait');
      },
      abort: () => {
         stt.postMessage('abort');
         tts.postMessage('abort');
         speaker.postMessage('abort');
         utils.postMessage('abort');
         red.postMessage('abort');
      },
      stt: (recL: Int16Array, recC: Int16Array[]) => {
         stt.postMessage(['stt', recL, recC]);
      },
      cmd: () => {
         //cade o caldo
      },
      completion: input => {
         utils.postMessage(['completion', input]);
      },
      tts: (input: string, usecase: 1 | 2) => {
         tts.postMessage(['tts', input, usecase]);
      },
      play_output: () => {
         speaker.postMessage('play');
      },
      play_last: () => {
         speaker.postMessage('play_last');
      },
      play_start: () => {
         speaker.postMessage('play_start');
      },
      play_msg: () => {
         speaker.postMessage('play_cmd');
      },
      error: err => {
         utils.postMessage(['error', err]);
         speaker.postMessage('play_err');
      },
      sucess: (sucess?: string) => {
         if (sucess) {
            utils.postMessage(['success', sucess]);
         }
         speaker.postMessage('play_sucess');
      },
   };
