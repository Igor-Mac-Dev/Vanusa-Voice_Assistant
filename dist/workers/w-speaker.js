import { audioPlayer, audioPlayerStop } from '../speak/audio-player';
import { parentPort } from 'worker_threads';
import * as path from 'path';
let audioQueue = [];
let audioPlaying = false;
parentPort?.on('message', async (message) => {
    console.log('child speaker Received:', message);
    addToQueue(message);
});
async function addToQueue(instruct) {
    switch (instruct) {
        case 'play_start':
            audioQueue.push(path.resolve('assets/beeps/init.wav'));
            break;
        case 'play':
            audioQueue.push(path.resolve('./dist/process-files/output.wav'));
            break;
        case 'play_last':
            audioQueue.push(path.resolve('dist/process-files/output_last.wav'));
            break;
        case 'play_err':
            audioQueue.push(path.resolve('assets/beeps/err.wav'));
            break;
        case 'play_sucess':
            audioQueue.push(path.resolve('assets/beeps/sucess.wav'));
            break;
        case 'play_cmd':
            audioQueue.push(path.resolve('assets/beeps/cmd.wav'));
            break;
        case 'stop':
            audioPlayerStop();
            audioQueue = [];
            audioPlaying = false;
            return;
        default:
            audioQueue.push(path.resolve('assets/std-msgs/' + instruct + '.wav'));
            break;
    }
    if (!audioPlaying) {
        await playNextAudio();
        parentPort?.postMessage('audio_queue_done');
    }
}
async function playNextAudio() {
    if (audioQueue.length > 0) {
        audioPlaying = true;
        await audioPlayer(audioQueue[0]);
        audioQueue.shift();
        await playNextAudio();
    }
    audioPlaying = false;
}
//# sourceMappingURL=w-speaker.js.map