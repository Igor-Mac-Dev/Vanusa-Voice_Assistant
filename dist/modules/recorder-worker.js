import { parentPort } from 'worker_threads';
import VoiceController from './voice-controller.js';
import errorLog, { CustomError } from '../utils/error.js';
const voiceControl = new VoiceController();
parentPort?.on('message', async (message) => {
    try {
        const sig = await switchController(message);
        sendSig(sig);
    }
    catch (err) {
        errorLog(new CustomError('Trying to send message with VoiceController error: ' + err));
        parentPort?.postMessage({
            message: 'error',
            error: new CustomError('*Recorder Worker error: ', err),
        });
    }
});
async function switchController(input) {
    switch (input) {
        case 'start':
            return await voiceControl.start();
        case 'idle':
            return await voiceControl.idlePhase();
        case 'record':
            return await voiceControl.recordPhase();
        case 'cmdrecord':
            return await voiceControl.compositeRecordPhase();
        case 'wait':
            return await voiceControl.waitPhase();
        case 'turnoff':
            return await voiceControl.turnoff();
        case 'abortInfinityRecord':
            return await voiceControl.stopInfinityRecord();
        default:
            return 'ºController Message Receiver failed';
    }
}
function sendSig(sig) {
    try {
        let intent = null;
        switch (sig) {
            case 'stt':
                parentPort?.postMessage({
                    message: 'stt',
                    recC: voiceControl.rec.getRecordC(),
                    recL: voiceControl.rec.getRecordL(),
                });
                break;
            case 'cmd':
                intent = voiceControl.getIntent();
                parentPort?.postMessage(intent);
                break;
            case 'composite':
                parentPort?.postMessage({
                    message: 'composite',
                    recC: voiceControl.rec.getRecordC(),
                    recL: voiceControl.rec.getRecordL(),
                });
                break;
            default:
                parentPort?.postMessage(sig);
                break;
        }
        voiceControl.rec.clearRecord();
    }
    catch (err) {
        throw new CustomError('*Recorder Worker sendSig failed: ', err);
    }
}
//# sourceMappingURL=recorder-worker.js.map