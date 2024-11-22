import { audioPlayer, audioPlayerStop } from '../utils/audio-player.js';
import { parentPort } from 'worker_threads';
import * as path from 'path';

let audioQueue: string[] = [];
let audioPlaying: boolean = false;

parentPort?.on('message', async message => {
   console.log('child speaker Received:', message);
   addToQueue(message);
});

async function addToQueue(instruct: string): Promise<void> {
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
   }
   if (!audioPlaying) {
      await playNextAudio();
      parentPort?.postMessage('audio_queue_done');
   }
}

async function playNextAudio(): Promise<void> {
   if (audioQueue.length > 0) {
      audioPlaying = true;
      await audioPlayer(audioQueue[0]);
      audioQueue.shift();
      await playNextAudio();
   }
   audioPlaying = false;
}
