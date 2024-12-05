import { readConfigFile } from '../configuration/conf.js';
import OrcaTts from '../picoV/orca.js';
import novaTts from '../OpenAI/nova.js';
import gTts from '../G-voice/tts.js';
import { resolve } from 'path';
const config = readConfigFile();
// await tts(message[1]);
export async function tts(text) {
    switch (config.TTS_ENGINE) {
        case 'Picovoice':
            if (config.ORCA_AVAILABLE) {
                const orcaTts = new OrcaTts();
                await orcaTts.generateAudio(text, 1);
                resolve('TTS_done');
            }
            else {
                resolve('Picovoice_TTS_limit_reached');
            }
            break;
        case 'OpenAI':
            await novaTts(text);
            resolve('TTS_done');
            break;
        case 'Google':
            await gTts(text);
            resolve('TTS_done');
            break;
        default:
            resolve('Selected_TTS_engine_not_available');
    }
}
//# sourceMappingURL=tts-controller.js.map