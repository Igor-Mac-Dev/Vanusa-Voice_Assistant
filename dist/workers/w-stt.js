import { parentPort } from 'worker_threads';
import * as conf from '../configuration/conf';
import CheetahStt from '../picoV/cheetah';
import LeopardStt from '../picoV/leopard';
import whisperStt from '../OpenAI/whisper';
const config = conf.readConfigFile();
parentPort?.on('message', async (message) => {
    console.log('child stt Received:', message);
});
async function stt(recL, recC) {
    try {
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
            case 'whisper':
                const transcription = await whisperStt();
                parentPort?.postMessage({
                    message: 'transcription',
                    text: transcription,
                });
                break;
        }
    }
    catch (err) {
        throw err;
    }
}
//# sourceMappingURL=w-stt.js.map