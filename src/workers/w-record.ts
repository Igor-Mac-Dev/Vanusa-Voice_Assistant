import { parentPort } from 'worker_threads';
import VoiceController from '../picoV/record/voice-controller';

const voiceControl: VoiceController = new VoiceController();

parentPort?.on('message', async message => {
   console.log('recorder child Received:', message);
   const sig = await switchController(message);
   sendSig(sig);
});

async function switchController(
   input: 'idle' | 'record' | 'wait' | 'abort' | 'start' | 'turnoff',
): Promise<string> {
   switch (input) {
      case 'start':
         return await voiceControl.start();
      case 'idle':
         return await voiceControl.idlePhase();
      case 'record':
         return await voiceControl.recordPhase();
      case 'wait':
         return await voiceControl.waitPhase();
      case 'abort':
         return await voiceControl.cancel();
      default:
         return 'ºController Message Receiver failed';
   }
}

function sendSig(sig: string) {
   switch (sig) {
      case 'stt':
         parentPort?.postMessage({
            message: 'stt',
            recC: voiceControl.rec.getRecordC(),
            recL: voiceControl.rec.getRecordL(),
         });
         break;
      case 'cmd':
         parentPort?.postMessage([voiceControl.getIntent()]);
         break;
      default:
         parentPort?.postMessage(sig);
         break;
   }
}

//parentPort?.postMessage({ error: err.message, stack: err.stack });
