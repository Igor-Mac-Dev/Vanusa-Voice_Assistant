import { readConfigFile } from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';
import CheetahStt from '../picoV/cheetah.js';
import LeopardStt from '../picoV/leopard.js';
import whisperStt from '../OpenAI/whisper.js';
import { CustomError } from '../utils/error.js';

const config: interfaces.config = readConfigFile();

export async function stt(
   recL: Int16Array,
   recC: Int16Array[],
): Promise<string> {
   try {
      switch (config.STT_ENGINE) {
         case 'Picovoice':
            if (config.LEOPARD_AVAILABLE) {
               const leopardStt = new LeopardStt();
               leopardStt.leopardInit();
               await leopardStt.processAudio(recL);
               leopardStt.leopardRelease();
               return leopardStt.text;
            } else if (config.CHEETAH_AVAILABLE) {
               const cheetahStt = new CheetahStt();
               cheetahStt.cheetahInit();
               await cheetahStt.processAudio(recC);
               cheetahStt.cheetahRelease();
               return cheetahStt.text;
            } else {
               return 'Picovoice_STT_limit_reached';
            }
            break;
         case 'Whisper':
            {
               const transcription = await whisperStt();
               return transcription;
            }
            break;
      }
   } catch (err) {
      throw new CustomError('*STT Handler failed: ' + err);
   }
}
