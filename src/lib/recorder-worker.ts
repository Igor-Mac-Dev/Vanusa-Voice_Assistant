import { parentPort } from 'worker_threads';
import VoiceController from './voice-controller.js';

const voiceControl: VoiceController = new VoiceController();

parentPort?.on('message', async message => {
   console.log('recorder child Received:', message);
   voiceControl.removeAllListenners();
   const sig = await switchController(message);
   console.log('log sig w-record ' + sig);
   sendSig(sig);
});

async function switchController(
   input:
      | 'idle'
      | 'record'
      | 'wait'
      | 'start'
      | 'turnoff'
      | 'cmdrecord'
      | 'abortInfinityRecord',
): Promise<string> {
   switch (input) {
      case 'start':
         return await voiceControl.start();
      case 'idle':
         return await voiceControl.idlePhase();
      case 'record':
         return await voiceControl.recordPhase();
      case 'cmdrecord':
         return await voiceControl.compositeRecordPhase();
      case 'wait':
         return await voiceControl.waitPhase();
      case 'turnoff':
         return await voiceControl.turnoff();
      case 'abortInfinityRecord':
         voiceControl.stopInfinityRecord();
         return 'stoped';
      default:
         return 'ºController Message Receiver failed';
   }
}

function sendSig(sig: string) {
   let intent:
      | [
           {
              intent: string;
              [slot: string]: string;
           },
           boolean,
        ]
      | null = null;
   switch (sig) {
      case 'stt':
         parentPort?.postMessage({
            message: 'stt',
            recC: voiceControl.rec.getRecordC(),
            recL: voiceControl.rec.getRecordL(),
         });
         break;
      case 'cmd':
         intent = voiceControl.getIntent();
         parentPort?.postMessage(intent);
         break;
      case 'composite':
         parentPort?.postMessage({
            message: 'composite',
            recC: voiceControl.rec.getRecordC(),
            recL: voiceControl.rec.getRecordL(),
         });
         break;
      case 'stoped':
         // Only stops the infinity record
         break;
      default:
         parentPort?.postMessage(sig);
         break;
   }
   voiceControl.rec.clearRecord();
}

//parentPort?.postMessage({ error: err.message, stack: err.stack });
