import FramesEmitter from '../picoV/record/frames-emitter.js';
import PorcupineDetector from '../picoV/porcupin.js';
import CobraDetector from '../picoV/cobra.js';
import RecordHolder from '../picoV/record/record-holder.js';
import RhinoSti from '../picoV/rhino.js';
import { readConfigFile } from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';
import makeWav from '../utils/wav-maker.js';

export default class VoiceController {
   protected config: interfaces.config = readConfigFile();
   protected idleRec = new FramesEmitter(
      this.config.FRAME_LENGHT,
      this.config.SAMPLE_RATE,
      true,
      0,
      this.config.SELECTED_DEVICE,
   );
   protected sttRec = new FramesEmitter(
      this.config.FRAME_LENGHT,
      this.config.SAMPLE_RATE,
      false,
      this.config.RECORD_TIME,
      this.config.SELECTED_DEVICE,
   );
   protected kwDetector = new PorcupineDetector(1);
   protected cancelDetector = new PorcupineDetector(2);
   protected cobra = new CobraDetector();
   public rec = new RecordHolder();
   protected rhino = new RhinoSti();
   protected phase: 'idle' | 'record' | 'wait' | 'compositeRecord' | undefined;

   public getIntent(): [{ intent: string; [slot: string]: string }, boolean] {
      return this.rhino.getIntent();
   }

   public removeAllListenners() {
      this.idleRec.removeAllListeners();
      this.sttRec.removeAllListeners();
      this.kwDetector.removeAllListeners();
      this.cancelDetector.removeAllListeners();
      this.cobra.removeAllListeners();
      this.rhino.removeAllListeners();
   }

   public async start(): Promise<string> {
      return new Promise<string>(resolve => {
         this.rhino.rhinoInit();
         resolve('started');
      });
   }

   //////////////////////////////////////////////////////////////////////////////
   public async idlePhase(): Promise<string> {
      return new Promise<string>(resolve => {
         this.phase = 'idle';
         this.idleRec.setInfinityOn();
         this.idleRec.startFramesEmittion();

         this.idleRec.once('REC_start', () => {
            this.kwDetector.porcupineInit();
         });

         this.idleRec.on('frame', frame => {
            this.kwDetector.processFrame(frame);
         });

         this.idleRec.once('REC_failed', err => {
            clearTimeout(memoryMercy);
            throw err;
         });

         this.idleRec.once('setInfinityOff', () => {
            clearTimeout(memoryMercy);
            resolve('ok');
         });

         this.kwDetector.once('PPN_keyword', async kw => {
            clearTimeout(memoryMercy);
            this.idleRec.setInfinityOff();
            this.kwDetector.porcupineRelease();
            switch (kw) {
               case 3:
                  resolve('repeat');
                  break;
               case 4:
                  resolve('repeat_last');
                  break;
               default:
                  resolve('record');
                  break;
            }
         });

         const memoryMercy = setTimeout(() => {
            this.idleRec.setInfinityOff();
            this.kwDetector.porcupineRelease();
            resolve('loop');
         }, 600000);
      });
   }

   //////////////////////////////////////////////////////////////////////////////
   public async recordPhase(): Promise<string> {
      return new Promise<string>(resolve => {
         this.phase = 'record';
         this.sttRec.startFramesEmittion();

         this.sttRec.once('REC_start', () => {
            this.cobra.cobraInit();
            this.cancelDetector.porcupineInit();
         });

         this.sttRec.on('frame', frame => {
            this.rec.addRecord(frame);
            this.rhino.processAudio(frame);
            this.cobra.processFrame(frame);
            this.cancelDetector.processFrame(frame);
         });

         this.sttRec.once('REC_failed', err => {
            console.error('REC_failed: ', err);
            throw err;
         });

         this.cancelDetector.once('PPN_keyword', () => {
            this.sttRec.stopTimedRecording();
            this.cobra.cobraRelease();
            this.cancelDetector.porcupineRelease();
            resolve('cancel');
         });

         this.cobra.once('COBRA_stoped_talk', async () => {
            this.sttRec.stopTimedRecording();
            this.rec.setRecordL();
            if (this.config.STT_ENGINE === 'Whisper')
               await makeWav(this.rec.getRecordL());
            this.cobra.cobraRelease();
            this.cancelDetector.porcupineRelease();
            resolve('stt');
         });

         this.rhino.once('RHINO_cmd', () => {
            this.sttRec.stopTimedRecording();
            this.cobra.cobraRelease();
            this.cancelDetector.porcupineRelease();
            resolve('cmd');
         });
      });
   }

   //////////////////////////////////////////////////////////////////////////////

   public async waitPhase(): Promise<string> {
      return new Promise<string>(resolve => {
         this.phase = 'wait';
         this.idleRec.startFramesEmittion();

         this.idleRec.once('REC_start', () => {
            this.cancelDetector.porcupineInit();
         });

         this.idleRec.on('frame', frame => {
            this.cancelDetector.processFrame(frame);
         });

         this.cancelDetector.once('PPN_keyword', async () => {
            clearTimeout(memoryMercy);
            this.idleRec.setInfinityOff();
            this.cancelDetector.porcupineRelease();
            resolve('cancel');
         });

         this.idleRec.once('setInfinityOff', () => {
            clearTimeout(memoryMercy);
            resolve('ok');
         });

         const memoryMercy = setTimeout(() => {
            this.idleRec.setInfinityOff();
            this.kwDetector.porcupineRelease();
            resolve('loop');
         }, 600000);
      });
   }

   //////////////////////////////////////////////////////////////////////////////

   public stopInfinityRecord(): void {
      this.idleRec.emit('setInfinityOff');
   }

   //////////////////////////////////////////////////////////////////////////////
   public async compositeRecordPhase(): Promise<string> {
      return new Promise<string>(resolve => {
         this.phase = 'compositeRecord';
         this.sttRec.startFramesEmittion();

         this.sttRec.once('REC_start', () => {
            this.cobra.cobraInit();
            this.cancelDetector.porcupineInit();
         });

         this.sttRec.on('frame', frame => {
            this.rec.addRecord(frame);
            this.cobra.processFrame(frame);
            this.cancelDetector.processFrame(frame);
         });

         this.sttRec.once('REC_failed', err => {
            throw err;
         });

         this.cancelDetector.once('PPN_keyword', () => {
            this.sttRec.stopTimedRecording();
            this.cobra.cobraRelease();
            this.cancelDetector.porcupineRelease();
            resolve('cancel');
         });

         this.cobra.once('COBRA_stoped_talk', async () => {
            this.sttRec.stopTimedRecording();
            this.rec.setRecordL();
            if (this.config.STT_ENGINE === 'Whisper')
               await makeWav(this.rec.getRecordL());
            this.cobra.cobraRelease();
            this.cancelDetector.porcupineRelease();
            resolve('composite');
         });
      });
   }

   //////////////////////////////////////////////////////////////////////////////

   public async turnoff(): Promise<string> {
      return new Promise<string>(resolve => {
         this.idleRec.emit('setInfinityOff'); // Quando essa etapa chega o programa está em wait
         this.cancelDetector.porcupineRelease();
         this.rhino.rhinoRelease();
         this.removeAllListenners();
         resolve('finish');
      });
   }
}
