//  * Licensed under the  GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  * https://www.gnu.org/licenses/agpl-3.0.en.html

import RedController from './lib/red-controller.js';
import { readConfigFile } from './configuration/conf.js';
import AudioScheduler from './lib/speaker-controller.js';
import { controlHandler } from './lib/main-controller.js';
import rhinoHandler from './lib/rhino-controller.js';
import successLog from './utils/sucess.js';
import errorLog, { CustomError } from './utils/error.js';
import { stopPm2 } from './utils/PM2-task-menager.js';
import process, { abort } from 'node:process';
import completion from './OpenAI/completion.js';
import { mainPhases, subPhases } from './interfaces/types.js';


const red = new RedController();
await red.startServer();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function main(): Promise<void> {
   mPhase = 'start';
   const start = await controlHandler.start();

   red.on('REDmessage', message => {
      successLog('Receiveid form Red:' + message);
      if (mPhase === 'idle') {
         reproduceRedMessages(message);
      } else {
         red.saveMessage(message);
      }
   });

   process.on('unhandledRejection', (reason, promise) => {
      errorLog('Promise rejected without catch:' + promise + ' ' + reason);
      console.log(process.listenerCount('message') + ' listeners');
      process.abort();
   });

   if (start === 'started') {
      play_start();
      player.once('AudioQueueEnd', () => {
         goIdle();
      });
   } else {
      throw new Error('Error starting server'); //// TODO: break process here
   }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let mPhase: mainPhases;
let sPhase: subPhases;
let abortCurrentPhase: boolean = false;

const player = new AudioScheduler();

const play_output = async () => {
   player.addToQueue('play');
};
const play_last = async () => {
   player.addToQueue('play_last');
};
const play_start = async () => {
   player.addToQueue('play_start');
};
const play_cmd = async () => {
   player.addToQueue('play_cmd');
};
const play_sucess = async () => {
   player.addToQueue('play_sucess');
};
const play_err = async () => {
   player.addToQueue('play_err');
};

const goIdle = async (): Promise<void> => {
   try {
   if (red.isThereMessages()) {
      reproduceRedMessages();
   }
   if (mPhase === 'wait') {
   controlHandler.abortWait();
   }
   mPhase = 'idle';
   const wakeWord: string = await controlHandler.idle();
   setTimeout(() => {
      wwHandler(wakeWord);
   }, 10);
} catch (error) {
   throw new CustomError('goIdle failed: ' + error);
}
};

const wwHandler = async (ww: string) => {
   try {
   switch (ww) {
      case 'record':
         await play_sucess();
         player.once('Audio_Queue_End', async () => {
            mPhase = 'record';
            const input: { message: string; recC: Int16Array[]; recL: Int16Array }
            | [{ intent: string; [slot: string]: string }, boolean]
            | string = await controlHandler.record();
            console.log('input ', input);
            if (input === 'cancel') {
               await play_err();
               player.once('Audio_Queue_End', () => {
               goIdle();
               });
            } else {
               if (typeof input != 'string') {
                  goWait();
                  goInputHandle(input);
               }
            }
         });
         break;
      case 'repeat':
         // mPhase = 'wait';
         goWait();
         play_output();
         player.once('Audio_Queue_End', async () => {
            goIdle();
         });
         break;
      case 'repeat_last':
         play_last();
         player.once('Audio_Queue_End', () => {
            goIdle();
         });
         goWait();
         break;
      case 'cancel':
         goIdle();
         break;
      case 'loop':
         goIdle();
         break;
      default:
         console.log('Unknown message from control worker');
         break;
   }
   } catch (error) {
      throw new CustomError('Wake Word Handler failed: ' + error);
   }
};

const goInputHandle = async (input: { message: string; recC: Int16Array[]; recL: Int16Array }
   | [{ intent: string; [slot: string]: string }, boolean]): Promise<void> => {

   }else if (Array.isArray(input)) {
      if (input[1]){
      composite
      }else {
      rhinoHandler(input);
      }
   }
   {
      play_sucess();
      player.once('Audio_Queue_End', () => {
      goStt(input);
      });
   }
}

const goWait = async () => {
   const cancel: string = await controlHandler.wait();
   if (cancel === 'cancel') {
      abortCurrentPhase = true;
      goIdle();
   } else if (cancel === 'loop') {
      goWait();
   }  else {
      goIdle();
   }
};

const reproduceRedMessages = async (message?: string) => {
   if (message) {
      console.log('Reproducing RED message:', message);
   }
   const messages = red.messageFlush();
   for (const message of messages) {
      console.log('Reproducing RED message:', message);
   }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(async (): Promise<void> => {
   try {
      await main();
   } catch (e) {
      errorLog(e);
      controlHandler.play_err();
   }
})();

console.log('end');
