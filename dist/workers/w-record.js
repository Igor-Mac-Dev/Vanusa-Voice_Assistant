import { parentPort } from 'worker_threads';
import VoiceController from '../picoV/record/voice-controller';
let voiceControl = new VoiceController();
parentPort?.on('message', async (message) => {
    console.log('recorder child Received:', message);
    let sig = await switchController(message);
    sendSig(sig);
});
async function switchController(input) {
    try {
        switch (input) {
            case 'start':
                try {
                    return await voiceControl.start();
                }
                catch (err) {
                    throw err;
                }
            case 'idle':
                try {
                    return await voiceControl.idlePhase();
                }
                catch (err) {
                    throw err;
                }
            case 'record':
                try {
                    return await voiceControl.recordPhase();
                }
                catch (err) {
                    throw err;
                }
            case 'wait':
                try {
                    return await voiceControl.waitPhase();
                }
                catch (err) {
                    throw err;
                }
            case 'abort':
                try {
                    return await voiceControl.cancel();
                }
                catch (err) {
                    throw err;
                }
            default:
                return 'ºController Message Receiver failed';
        }
    }
    catch (err) {
        throw err;
    }
}
function sendSig(sig) {
    try {
        switch (sig) {
            case 'stt':
                parentPort?.postMessage({
                    message: 'stt',
                    recC: voiceControl.rec.getRecordC(),
                    recL: voiceControl.rec.getRecordL(),
                });
                break;
            case 'cmd':
                console.log;
                parentPort?.postMessage([voiceControl.getIntent()]);
                break;
            default:
                parentPort?.postMessage(sig);
                break;
        }
    }
    catch (err) {
        throw err;
    }
}
//parentPort?.postMessage({ error: err.message, stack: err.stack });
//# sourceMappingURL=w-record.js.map