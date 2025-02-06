import { readConfigFile, createConfigFile } from '../configuration/conf.js';
import { CustomError } from '../utils/error.js';
import * as interfaces from '../interfaces/config-json.js';
import OrcaTts from '../picoV/orca.js';
import novaTts, { rhinovaTts } from '../OpenAI/nova.js';
import gTts from '../Google/tts.js';

export default class TtsControll {
   private config: interfaces.config = readConfigFile();
   private orcaTts = new OrcaTts();
   private gTTS = new gTts();

   constructor() {
      try {
         this.config = readConfigFile();
         this.orcaTts = new OrcaTts();
         this.gTTS = new gTts();
      } catch (err) {
         throw new CustomError('°TTS failed to init:', err, true);
      }
   }
   public async tts(text: string): Promise<string> {
      try {
         switch (this.config.TTS_ENGINE) {
            case 'Picovoice':
               if (this.config.ORCA_AVAILABLE) {
                  await this.orcaTts.generateAudio(text, 1);
                  return 'TTS_done';
               } else {
                  throw new CustomError('Picovoice TTS limit reached');
               }
            case 'OpenAI':
               await novaTts(text);
               return 'TTS_done';
            case 'Google':
               await this.gTTS.tts(text);
               return 'TTS_done';
            default:
               return 'Selected TTS engine not available';
         }
      } catch (error) {
         throw new CustomError('TTS failed: ', error);
      }
   }

   public async rhinoTts(text: string, path: string): Promise<string> {
      try {
         switch (this.config.TTS_ENGINE) {
            case 'Picovoice':
               if (!this.config.ORCA_AVAILABLE)
                  throw new CustomError(
                     'Picovoice TTS limit reached',
                     '',
                     true,
                  );
               await this.orcaTts.generateRhinoAudio(text, path);
               return 'TTS_done';
            case 'OpenAI':
               await rhinovaTts(text, path);
               return 'TTS_done';
            case 'Google':
               await this.gTTS.rhinoTts(text, path);
               return 'TTS_done';
            default:
               throw new CustomError('Selected TTS engine not available');
         }
      } catch (error) {
         throw new CustomError('Rhino TTS failed: ', error);
      }
   }

   public setUnavailable() {
      try {
         const orcaUnavailable: interfaces.config = { ...this.config };
         orcaUnavailable.ORCA_AVAILABLE = false;
         createConfigFile(orcaUnavailable);
      } catch (err) {
         throw new CustomError(
            '°TTS failed to set Orca unavailable:',
            err,
            true,
         );
      }
   }
}
