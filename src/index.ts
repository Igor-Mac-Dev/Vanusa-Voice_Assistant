//  * Licensed under the  GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  * https://www.gnu.org/licenses/agpl-3.0.en.html

import { readConfigFile } from './configuration/conf.js';
import { handlers } from './workers/workers-handler.js';
import errorLog from './utils/error.js';
import { stopPm2 } from './utils/PM2-task-menager.js';
import process from 'node:process';
import completion from './OpenAI/completion.js';

(async (): Promise<void> => {
   try {
      await main();
   } catch (e) {
      errorLog(e);
      handlers.play_err();
   }
})();

type mainPhases =
   | 'start'
   | 'idle'
   | 'record'
   | 'wait'
   | 'compositeRecord'
   | 'stt'
   | 'tts'
   | 'cmd'
   | 'turnoff';
let mPhase: mainPhases = 'start';

const wwHandler = async (ww: string) => {
   switch (ww) {
      case 'record':
         await handlers.play_sucess();
         mPhase = 'record';
         const input = await handlers.record();
         console.log('input', input);
         goIdle();
         break;
      case 'repeat':
         handlers.play_output();
         break;
      case 'repeat_last':
         handlers.play_last();
         break;
      case 'cancel':
         handlers.abort();
         break;
      case 'loop':
         goIdle();
         break;
      default:
         console.log('Unknown message from control worker');
         break;
   }
};

const goIdle = async () => {
   const wakeWord: string = await handlers.idle();
   mPhase = 'idle';
   setTimeout(() => {
      wwHandler(wakeWord);
   }, 10);
};

const goWait = async () => {
   const cancel = await handlers.wait();
   if (cancel === 'cancel') {
      goIdle();
   } else if (cancel === 'loop') {
      goWait();
   }
};

async function main(): Promise<void> {
   const start = await handlers.start();
   console.log('startAAAAAAAAAAAAA');
   if (start === 'started') {
      handlers.play_start();
      goIdle();
   }

   // stt.on('message', message => {
   //    completion(event[1])
   // .then(result => {
   //    parentPort?.postMessage(['completion', result]);
   // })
   // .catch(err => {
   //    parentPort?.postMessage(['error', err]);
   // });
   // tts.postMessage(['tts', message[1]]);
   // });

   // tts.on('message', message => {
   //    console.log('tts parent Received: ', message);
   //    addToQueue('play');
   // });

   process.on('unhandledRejection', (reason, promise) => {
      errorLog('Promise rejected without catch:' + promise + ' ' + reason);
      console.log(process.listenerCount('message') + ' listeners');
      process.abort();
   });
}

// controll.on('message', message => {
//    console.log('controll parent Received: ', message);
// });

// function start(): void {}

// ,---.
// /__./|                     ,---,           ,--,
// ,---.;  ; |                 ,-+-. /  |        ,'_ /|    .--.--.
// /___/ \  | |    ,--.--.     ,--.'|'   |   .--. |  | :   /  /    '      ,--.--.
// \   ;  \ ' |   /       \   |   |  ,"' | ,'_ /| :  . |  |  :  /`./     /       \
// \   \  \: |  .--.  .-. |  |   | /  | | |  ' | |  . .  |  :  ;_      .--.  .-. |
// ;   \  ' .   \__\/: . .  |   | |  | | |  | ' |  | |   \  \    `.    \__\/: . .
// \   \   '   ," .--.; |  |   | |  |/  :  | : ;  ; |    `----.   \   ," .--.; |
// \   `  ;  /  /  ,.  |  |   | |--'   '  :  `--'   \  /  /`--'  /  /  /  ,.  |
// :   \ | ;  :   .'   \ |   |/       :  ,      .-./ '--'.     /  ;  :   .'   \
// '---"  |  ,     .-./ '---'         `--`----'       `--'---'   |  ,     .-./
//         `--`---'                                               `--`---'
