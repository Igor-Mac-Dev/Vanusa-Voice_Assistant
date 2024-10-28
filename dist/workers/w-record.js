import { parentPort } from 'worker_threads';
import VoiceController from '../picoV/record/voice-controller.js';
const voiceControl = new VoiceController();
parentPort?.on('message', async (message) => {
    console.log('recorder child Received:', message);
    const sig = await switchController(message);
    sendSig(sig);
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
            return await voiceControl.recordPhase();
        case 'wait':
            return await voiceControl.waitPhase();
        case 'abort':
            return await voiceControl.cancel();
        default:
            return 'ºController Message Receiver failed';
    }
}
function sendSig(sig) {
    switch (sig) {
        case 'stt':
            parentPort?.postMessage({
                message: 'stt',
                recC: voiceControl.rec.getRecordC(),
                recL: voiceControl.rec.getRecordL(),
            });
            break;
        case 'cmd':
            parentPort?.postMessage([voiceControl.getIntent()]);
            break;
        default:
            parentPort?.postMessage(sig);
            break;
    }
}
//parentPort?.postMessage({ error: err.message, stack: err.stack });
//# sourceMappingURL=w-record.js.map