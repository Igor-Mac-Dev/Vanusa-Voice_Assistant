import { PvRecorder } from '@picovoice/pvrecorder-node';
import { CustomError } from '../../utils/error.js';
import { EventEmitter } from 'events';

export default class AudioInputReader extends EventEmitter {
   protected recorder: PvRecorder | null = null;
   protected infinity: boolean;
   private frameLength: number;
   private sampleRate: number;
   private durationInSeconds: number;
   private frameDuration: number;
   protected calcFramesToRead: number;
   private device: number;

   constructor(
      frameLength: number = 512,
      sampleRate: number = 16000,
      infinity: boolean = false,
      durationInSeconds: number = 300,
      device: number = 0,
   ) {
      super();
      this.frameLength = frameLength;
      this.sampleRate = sampleRate;
      this.infinity = infinity;
      this.durationInSeconds = durationInSeconds;
      this.device = device;
      this.frameDuration = this.frameLength / this.sampleRate;
      this.calcFramesToRead = Math.floor(
         this.durationInSeconds / this.frameDuration,
      );
   }

   protected recorderInit(): void {
      try {
         this.recorder = {};
         this.recorder = new PvRecorder(this.frameLength, this.device);
      } catch (err) {
         throw new CustomError('°Record failed to init:' + err);
      }
   }

   protected async startRecording(): Promise<void> {
      try {
         await this.recorder.start();
      } catch (err) {
         throw new CustomError('°Record failed to start:' + err);
      }
   }

   protected async readAudioFrame(): Promise<Int16Array | null> {
      try {
         const frame: Int16Array = await this.recorder.read();
         return frame;
      } catch (err) {
         throw new CustomError('°Record failed to read frame:' + err);
      }
   }

   protected stopRecording(): void {
      try {
         this.recorder.stop();
      } catch (err) {
         throw new CustomError('°Record failed to stop:' + err);
      }
   }

   protected recorderRelease(): void {
      try {
         this.recorder.release();
         this.recorder = {};
      } catch (err) {
         throw new CustomError('°Recorder failed to release:' + err);
      }
   }
}
