import { readConfigFile } from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';
import OrcaTts from '../picoV/orca.js';
import novaTts from '../OpenAI/nova.js';
import gTts from '../G-voice/tts.js';

const config: interfaces.config = readConfigFile();

export async function tts(text: string): Promise<string> {
   switch (config.TTS_ENGINE) {
      case 'Picovoice':
         if (config.ORCA_AVAILABLE) {
            const orcaTts = new OrcaTts();

            await orcaTts.generateAudio(text, 1);
            return 'TTS_done';
         } else {
            return 'Picovoice TTS limit reached';
         }
         break;
      case 'OpenAI':
         await novaTts(text);
         return 'TTS_done';
         break;
      case 'Google':
         await gTts(text);
         return 'TTS_done';
         break;
      default:
         return 'Selected TTS engine not available';
   }
}
