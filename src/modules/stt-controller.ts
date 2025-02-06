import CheetahStt from '../picoV/cheetah.js';
import LeopardStt from '../picoV/leopard.js';
import whisperStt from '../OpenAI/whisper.js';
import { CustomError } from '../utils/error.js';
import makeWav from '../lib/wav-maker.js';
import { readConfigFile, createConfigFile } from '../configuration/conf.js';
import { config } from '../interfaces/config-json.js';

export default class SttControll {
   private config: config;
   private leopardStt: LeopardStt;
   private cheetahStt: CheetahStt;

   constructor() {
      try {
         this.config = readConfigFile();
         this.leopardStt = new LeopardStt();
         this.cheetahStt = new CheetahStt();
      } catch (err) {
         throw new CustomError('°SttControll failed to init:', err, true);
      }
   }

   public async stt(recL: Int16Array, recC: Int16Array[]): Promise<string> {
      try {
         switch (this.config.STT_ENGINE) {
            case 'Picovoice':
               if (this.config.LEOPARD_AVAILABLE) {
                  this.leopardStt.leopardInit();
                  await this.leopardStt.processAudio(recL);
                  this.leopardStt.leopardRelease();
                  return this.leopardStt.text;
               } else if (this.config.CHEETAH_AVAILABLE) {
                  this.cheetahStt.cheetahInit();
                  await this.cheetahStt.processAudio(recC);
                  this.cheetahStt.cheetahRelease();
                  return this.cheetahStt.text;
               } else {
                  return 'Picovoice_STT_limit_reached';
               }
            case 'Whisper': {
               await makeWav(recL);
               const transcription = await whisperStt();
               return transcription;
            }
         }
      } catch (err) {
         throw new CustomError('*STT Handler failed: ', err);
      }
   }

   public setUnavailable(choice: 'leopard' | 'cheetah') {
      try {
         const Unavailable: config = { ...this.config };
         if (choice === 'leopard') Unavailable.LEOPARD_AVAILABLE = false;
         else Unavailable.CHEETAH_AVAILABLE = false;
         createConfigFile(Unavailable);
      } catch (err) {
         throw new CustomError(
            '°TTS failed to set Orca unavailable:',
            err,
            true,
         );
      }
   }
}
