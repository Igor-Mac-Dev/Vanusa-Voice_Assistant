import { readConfigFile } from './configuration/conf.js';
import {
   handlers,
   awaitWorkerOk,
   control,
   stt,
   tts,
   speaker,
   utils,
   red,
} from './workers/workers-handler.js';
import { stopPm2 } from './utils/PM2-task-menager.js';
import process from 'node:process';

process.on('unhandledRejection', (reason, promise) => {
   handlers.error('Promise rejected without catch:' + promise + ' ' + reason);
});

(async (): Promise<void> => {
   try {
      await main();
   } catch (e) {
      handlers.error(e);
   }
})();

type voicePhases = 'idle' | 'record' | 'wait' | 'compositeRecord' | null;
type mainPhases =
   | 'start'
   | 'idle'
   | 'record'
   | 'wait'
   | 'compositeRecord'
   | 'stt'
   | 'tts'
   | 'cmd';

async function main(): Promise<void> {
   let mPhase: mainPhases = 'start';
   let vPhase: voicePhases = null;

   handlers.start();
   const [controllOk, redOk] = await Promise.all([
      awaitWorkerOk(control),
      awaitWorkerOk(red),
   ]);
   if (controllOk === 'started' && redOk === 'started') {
      handlers.play_start();
      console.log('Control & Red init ok.');
      mPhase = 'idle';
      vPhase = 'idle';
      handlers.idle();
   } else {
      throw new Error('Control & Red init failed.');
   }

   control.on('message', async message => {
      switch (message) {
         case 'record':
            await handlers.sucess();
            mPhase = 'record';
            vPhase = 'record';
            handlers.record();
            control.once('message', message => {
               console.log(' Received:', message);
               handlers.stt(message);
            });
            break;
         case 'repeat':
            handlers.play_output();
            break;
         case 'repeat_last':
            handlers.play_last();
            break;
         default:
            console.log('Unknown message from control worker: ' + message);
            break;
      }

      // stt.on('message', message => {
      //    utils.postMessage(['completion', message.text]);
      // });

      utils.on('message', message => {
         console.log('utils parent Received: ', message);
         if (message[0] === 'completion') {
            tts.postMessage(['tts', message[1]]);
         }
      });
      tts.on('message', message => {
         console.log('tts parent Received: ', message);
         speaker.postMessage('play');
      });
   });
   console.log('Main loop started.');
}

// controll.on('message', message => {
//    console.log('controll parent Received: ', message);
// });

// function start(): void {}
