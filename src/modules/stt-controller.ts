import CheetahStt from '../picoV/cheetah.js';
import LeopardStt from '../picoV/leopard.js';
import whisperStt from '../OpenAI/whisper.js';
import { CustomError } from '../utils/error.js';
import makeWav from '../lib/wav-maker.js';
import { readConfigFile, createConfigFile } from '../configuration/conf.js';
import { config } from '../interfaces/config-json.js';
import { convertRecordL } from '../picoV/record/record-holder.js';

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

   public async start(): Promise<void> {
      try {
         await this.leopardStt.leopardInit();
         await this.cheetahStt.cheetahInit();
      } catch (err) {
         throw new CustomError('°Stt failed to start:', err, true);
      }
   }

   public stop(): void {
      try {
         this.leopardStt.leopardRelease();
         this.cheetahStt.cheetahRelease();
      } catch (err) {
         throw new CustomError('°Stt failed to stop:', err, true);
      }
   }

   public async stt(recC: Int16Array[]): Promise<string> {
      try {
         switch (this.config.STT_ENGINE) {
            case 'Picovoice':
               if (this.config.LEOPARD_AVAILABLE) {
                  const recL = convertRecordL(recC);
                  if (!recL) return 'Leopard failed to convert';
                  await this.leopardStt.processAudio(recL);
                  return this.leopardStt.text;
               } else if (this.config.CHEETAH_AVAILABLE) {
                  await this.cheetahStt.processAudio(recC);
                  return this.cheetahStt.text;
               } else {
                  return 'Picovoice_STT_limit_reached';
               }
            case 'Whisper': {
               const recL = convertRecordL(recC);
               if (!recL) return 'Whisper failed to convert';
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
