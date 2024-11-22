import { Worker } from 'worker_threads';
import * as path from 'path';
import { rejects } from 'assert';
import { Console } from 'console';

export const stt = new Worker(path.resolve('./dist/workers/w-stt.js'));
export const tts = new Worker(path.resolve('./dist/workers/w-tts.js'));
export const red = new Worker(path.resolve('./dist/workers/w-red.js'));
export const speaker = new Worker(path.resolve('./dist/workers/w-speaker.js'));
const control = new Worker(path.resolve('./dist/workers/w-record.js'));

// control.on('message', message => {
//    console.log('control parent Received: '); //, message);
// });

// control.on('error', error => {
//    console.error('Erro na comunicação com o worker:', error);
// });

stt.on('message', message => {
   console.log('stt parent Received: ', message);
});

speaker.on('message', message => {
   console.log('speaker parent Received: ', message);
});

tts.on('message', message => {
   console.log('tts parent Received: ', message);
});

red.on('message', message => {
   console.log('red parent Received: ', message);
});

async function awaitWorkerOk(worker: Worker): Promise<string> {
   return new Promise(resolve => {
      worker.once('message', message => {
         resolve(message);
      });
   });
}

/////////////////////////////////////////////////////////////////////

export const handlers: { [key: string]: (param1?: any, param2?: any) => void } =
   {
      start: async (): Promise<string> => {
         red.postMessage('start');
         control.postMessage('start');
         const [controllOk, redOk] = await Promise.all([
            awaitWorkerOk(control),
            awaitWorkerOk(red),
         ]);
         control.removeAllListeners('message');
         if (controllOk === 'started' && redOk === 'started') {
            return 'started';
         } else {
            console.log('PULTA');
            return 'Control & Red init failed.';
         }
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

      record: async (): Promise<string | Array<any>> => {
         control.postMessage('record');

         return new Promise<string | Array<any>>((resolve, reject) => {
            let compCmd = false;
            let cmd: { intent: string; [slot: string]: string } | null = null;

            control.once('message', async message => {
               console.log('control message', message);
               if (Array.isArray(message)) {
                  compCmd = message[1];

                  if (compCmd) {
                     handlers.play_cmd();
                     control.postMessage('cmdrecord');
                     cmd = message[0];
                     const compositeStt = await (async (): Promise<string> => {
                        return new Promise<string>(resolve => {
                           control.once('message', message => {
                              control.removeAllListeners('message');
                              if (message === 'cancel') {
                                 resolve('cancel');
                              }
                              handlers.stt(message);
                              resolve('ok');
                           });
                        });
                     })();

                     if (compositeStt === 'cancel') {
                        resolve('cancel');
                     }
                  } else {
                     resolve(message[0]);
                  }
               } else {
                  handlers.stt(message);
               }
            });

            stt.once('message', message => {
               stt.removeAllListeners('message');
               if (compCmd) {
                  resolve([cmd, message]);
               } else {
                  resolve(message);
               }
            });
         });
      },

      wait: () => {
         control.postMessage('wait');
         control.removeAllListeners('message');
      },
      abort: () => {
         stt.postMessage('abort');
         tts.postMessage('abort');
         speaker.postMessage('abort');
         red.postMessage('abort');
      },
      stt: (recL: Int16Array, recC: Int16Array[]) => {
         stt.postMessage(['stt', recL, recC]);
      },
      cmd: () => {
         //cade o caldo
      },
      tts: (input: string, usecase: 1 | 2) => {
         tts.postMessage(['tts', input, usecase]);
      },
      play_output: async () => {
         speaker.postMessage('play');
      },
      play_last: async () => {
         speaker.postMessage('play_last');
      },
      play_start: async () => {
         speaker.postMessage('play_start');
      },
      play_cmd: async () => {
         speaker.postMessage('play_cmd');
      },
      play_sucess: async () => {
         speaker.postMessage('play_sucess');
      },
      play_err: async () => {
         speaker.postMessage('play_err');
      },
      turnoff: () => {
         control.postMessage('turnoff');
      },
   };
