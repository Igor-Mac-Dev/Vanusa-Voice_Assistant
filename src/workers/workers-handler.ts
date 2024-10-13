import { Worker } from 'worker_threads';
import * as path from 'path';
import { error } from 'console';

export const controll = new Worker(path.resolve('./dist/workers/w-record.js'));
export const stt = new Worker(path.resolve('./dist/workers/w-stt.js'));
export const tts = new Worker(path.resolve('./dist/workers/w-tts.js'));
export const speaker = new Worker(path.resolve('./dist/workers/w-speaker.js'));
export const utils = new Worker(path.resolve('./dist/workers/w-utils.js'));
export const red = new Worker(path.resolve('./disr/workers/w-red.js'));

controll.on('message', message => {
   console.log('controll parent Received: ', message);
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

/////////////////////////////////////////////////////////////////////

export const handlers: { [key: string]: (param1?: any, param2?: any) => void } =
   {
      start: () => {
         controll.postMessage('start');
         red.postMessage('start');
      },
      idle: () => {
         controll.postMessage('idle');
      },
      record: () => {
         controll.postMessage('record');
      },
      wait: () => {
         controll.postMessage('wait');
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
      sucess: sucess => {
         utils.postMessage(['success', sucess]);
         speaker.postMessage('play_sucess');
      },
   };
