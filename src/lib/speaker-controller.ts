import { audioPlayer, audioPlayerStop } from '../utils/audio-player.js';
import * as path from 'path';
import EventEmitter from 'events';

export default class AudioScheduler extends EventEmitter {
   private audioQueue: string[] = [];
   private audioPlaying: boolean = false;

   constructor() {
      super();
   }

   public async addToQueue(instruct: string, message?: string): Promise<void> {
      switch (instruct) {
         case 'play_start':
            this.audioQueue.push(path.resolve('assets/beeps/init.wav'));
            break;
         case 'play':
            this.audioQueue.push(
               path.resolve('./dist/process-files/output.wav'),
            );
            break;
         case 'play_last':
            this.audioQueue.push(
               path.resolve('dist/process-files/output_last.wav'),
            );
            break;
         case 'play_err':
            this.audioQueue.push(path.resolve('assets/beeps/err.wav'));
            break;
         case 'play_sucess':
            this.audioQueue.push(path.resolve('assets/beeps/sucess.wav'));
            break;
         case 'play_cmd':
            this.audioQueue.push(path.resolve('assets/beeps/cmd.wav'));
            break;
         case 'play_msg':
            if (message) {
               this.audioQueue.push(
                  path.resolve('assets/std-msgs/' + message + '.wav'),
               );
            } else {
               this.audioQueue.push(path.resolve('assets/beeps/err.wav'));
            }
            break;
      }
      if (!this.audioPlaying) {
         await this.playNextAudio();
      }
   }

   public stopAudio() {
      audioPlayerStop();
      this.audioQueue = [];
      this.audioPlaying = false;
   }

   private async playNextAudio(): Promise<void> {
      if (this.audioQueue.length > 0) {
         this.audioPlaying = true;
         await audioPlayer(this.audioQueue[0]);
         this.audioQueue.shift();
         await this.playNextAudio();
      }
      this.audioPlaying = false;
      this.emit('Audio_Queue_End');
   }
}
