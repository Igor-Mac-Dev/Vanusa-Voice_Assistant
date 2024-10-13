import AudioInputReader from './audio-input-reader';
import { CustomError } from '../../utils/error';

export default class FramesEmitter extends AudioInputReader {
   constructor(
      frameLength: number = 512,
      sampleRate: number = 16000,
      infinity: boolean = false,
      durationInSeconds: number = 300,
      device: number = 0,
   ) {
      super(frameLength, sampleRate, infinity, durationInSeconds, device);
   }

   public async startFramesEmittion(): Promise<void> {
      try {
         await this.recorderInit();
         await this.startRecording();
         this.emit('REC_start');
         await this.framesEmiter();
      } catch (error) {
         this.emit('REC_failed', error);
      }
   }

   public async framesEmiter(): Promise<void> {
      try {
         if (!this.infinity) {
            for (let i = 0; i < this.calcFramesToRead; i++) {
               const frame = await this.readAudioFrame();
               if (frame) {
                  this.emit('frame', frame);
               } else {
                  this.emit('REC_cant_read');
                  break;
               }
            }
         } else {
            while (this.infinity) {
               const frame = await this.readAudioFrame();
               if (frame) {
                  this.emit('frame', frame);
               } else {
                  this.emit('REC_cant_read');
                  break;
               }
            }
         }
      } catch (err) {
         this.emit(
            'REC_failed',
            new CustomError('°Record emission failed a: ' + err),
         );
      }
      this.stopRecording();
      this.recorderRelease();
      this.emit('REC_stop');
   }

   public setInfinityOn(): void {
      this.infinity = true;
   }
   public setInfinityOff(): void {
      this.infinity = false;
   }

   public stopTimedRecording(): void {
      this.calcFramesToRead = 0;
   }
}
