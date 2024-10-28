import { parentPort } from 'worker_threads';
import { readConfigFile } from '../configuration/conf.js';
import OrcaTts from '../picoV/orca.js';
import novaTts from '../OpenAI/nova.js';
import gTts from '../G-voice/tts.js';
const config = readConfigFile();
parentPort?.on('message', async (message) => {
    console.log('child stt Received:', message);
    await tts(message[1]);
});
async function tts(text) {
    switch (config.TTS_ENGINE) {
        case 'Picovoice':
            if (config.ORCA_AVAILABLE) {
                const orcaTts = new OrcaTts();
                await orcaTts.generateAudio(text, 1);
                parentPort?.postMessage({
                    message: 'TTS_done',
                });
            }
            else {
                parentPort?.postMessage('Picovoice_TTS_limit_reached');
            }
            break;
        case 'OpenAI':
            await novaTts(text);
            parentPort?.postMessage({
                message: 'TTS_done',
            });
            break;
        case 'Google':
            await gTts(text);
            parentPort?.postMessage({
                message: 'TTS_done',
            });
            break;
        default:
            parentPort?.postMessage('Selected_TTS_engine_not_available');
    }
}
//# sourceMappingURL=w-tts.js.map