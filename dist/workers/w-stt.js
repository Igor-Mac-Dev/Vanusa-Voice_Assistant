import { parentPort } from 'worker_threads';
import { readConfigFile } from '../configuration/conf.js';
import CheetahStt from '../picoV/cheetah.js';
import LeopardStt from '../picoV/leopard.js';
import whisperStt from '../OpenAI/whisper.js';
const config = readConfigFile();
parentPort?.on('message', async (message) => {
    console.log('child stt Received:', message);
    await stt(message[1].recL, message[1].recC);
});
async function stt(recL, recC) {
    switch (config.STT_ENGINE) {
        case 'Picovoice':
            if (config.LEOPARD_AVAILABLE) {
                const leopardStt = new LeopardStt();
                leopardStt.leopardInit();
                await leopardStt.processAudio(recL);
                parentPort?.postMessage({
                    message: 'transcription',
                    text: leopardStt.text,
                });
                leopardStt.leopardRelease();
            }
            else if (config.CHEETAH_AVAILABLE) {
                const cheetahStt = new CheetahStt();
                cheetahStt.cheetahInit();
                await cheetahStt.processAudio(recC);
                parentPort?.postMessage({
                    message: 'transcription',
                    text: cheetahStt.text,
                });
                cheetahStt.cheetahRelease();
            }
            else {
                parentPort?.postMessage('Picovoice_STT_limit_reached');
            }
            break;
        case 'Whisper': {
            const transcription = await whisperStt();
            parentPort?.postMessage({
                message: 'transcription',
                text: transcription,
            });
            break;
        }
    }
}
//# sourceMappingURL=w-stt.js.map