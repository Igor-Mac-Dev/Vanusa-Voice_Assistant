import { readConfigFile } from '../configuration/conf.js';
import CheetahStt from '../picoV/cheetah.js';
import LeopardStt from '../picoV/leopard.js';
import whisperStt from '../OpenAI/whisper.js';
import { resolve } from 'path';
const config = readConfigFile();
//  await stt(message[1].recL, message[1].recC);
export async function stt(recL, recC) {
    switch (config.STT_ENGINE) {
        case 'Picovoice':
            if (config.LEOPARD_AVAILABLE) {
                const leopardStt = new LeopardStt();
                leopardStt.leopardInit();
                await leopardStt.processAudio(recL);
                leopardStt.leopardRelease();
                resolve(leopardStt.text);
            }
            else if (config.CHEETAH_AVAILABLE) {
                const cheetahStt = new CheetahStt();
                cheetahStt.cheetahInit();
                await cheetahStt.processAudio(recC);
                cheetahStt.cheetahRelease();
                resolve(cheetahStt.text);
            }
            else {
                resolve('Picovoice_STT_limit_reached');
            }
            break;
        case 'Whisper':
            {
                const transcription = await whisperStt();
                resolve(transcription);
            }
            break;
    }
}
//# sourceMappingURL=stt-controller.js.map