import { parentPort } from 'worker_threads';
import VoiceController from './voice-controller.js';
import errorLog, { CustomError } from '../utils/error.js';

const voiceControl: VoiceController = new VoiceController();
parentPort?.postMessage('ready');
console.log('testa');

parentPort?.on(
   'message',
   async (message: {
      request:
         | 'start'
         | 'idle'
         | 'record'
         | 'wait'
         | 'cmdrecord'
         | 'abortInfinityRecord'
         | 'turnoff';
      caller: string;
   }) => {
      try {
         console.log('msg received by worker: ' + JSON.stringify(message));
         const sig = await switchController(message.request);
         console.log('worker sending to ' + message.caller + ' sig: ' + sig);
         sendSig(sig, message.caller);
      } catch (err) {
         errorLog(
            new CustomError(
               'Trying to send message with VoiceController error: ' + err,
            ),
         );
         console.log('error');
         parentPort?.postMessage({
            message: 'error',
            error: new CustomError('*Recorder Worker error: ', err),
         });
      }
   },
);

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
         return await voiceControl.stopInfinityRecord();
      default:
         return 'ºController Message Receiver failed';
   }
}

function sendSig(sig: string, caller: string) {
   try {
      console.log('sending sig');
      switch (sig) {
         case 'stt':
            parentPort?.postMessage({
               wMessage: voiceControl.getTranscription()?.trim(),
               caller: caller,
            });
            break;
         case 'cmd':
            parentPort?.postMessage({
               wMessage: voiceControl.getIntent(),
               caller: caller,
            });
            break;
         case 'composite':
            parentPort?.postMessage({
               wMessage: voiceControl.getTranscription()?.trim(),
               caller: caller,
            });
            break;
         default:
            parentPort?.postMessage({ wMessage: sig, caller: caller });
            break;
      }
   } catch (err) {
      throw new CustomError('*Recorder Worker sendSig failed: ', err);
   }
}
