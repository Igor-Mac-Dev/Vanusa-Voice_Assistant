import { parentPort } from 'worker_threads';
import * as conf from '../configuration/conf';
import * as interfaces from '../interfaces/config-json';
import OrcaTts from '../picoV/orca';
import novaTts from '../OpenAI/nova';
import gTts from '../G-voice/tts';

const config: interfaces.config = conf.readConfigFile();

parentPort?.on('message', async message => {
   console.log('child stt Received:', message);
});

async function tts(text: string): Promise<void> {
   switch (config.TTS_ENGINE) {
      case 'Picovoice':
         if (config.ORCA_AVAILABLE) {
            const orcaTts = new OrcaTts();

            await orcaTts.generateAudio(text, 1);

            parentPort?.postMessage({
               message: 'STT_done',
            });
         } else {
            parentPort?.postMessage('Picovoice_TTS_limit_reached');
         }
         break;
      case 'OpenAI':
         await novaTts(text);
         parentPort?.postMessage({
            message: 'STT_done',
         });

         break;
      case 'Google':
         await gTts(text);
         parentPort?.postMessage({
            message: 'STT_done',
         });

         break;
      default:
         parentPort?.postMessage('Selected_TTS_engine_not_available');
   }
}
