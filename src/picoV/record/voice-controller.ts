import FramesEmitter from './frames-emitter';
import PorcupineDetector from '../porcupin';
import CobraDetector from '../cobra';
import RecordHolder from './record-holder';
import RhinoSti from '../rhino/rhino';
import * as conf from '../../configuration/conf';
import * as interfaces from '../../interfaces/config-json';
import makeWav from '../../utils/wav-maker';

export default class VoiceController {
   protected config: interfaces.config = conf.readConfigFile();
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
      return [this.rhino.getIntent()[0], this.rhino.getIntent()[1]];
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
         this.idleRec.startFramesEmittion();

         this.idleRec.on('REC_start', () => {
            this.kwDetector.porcupineInit();
         });

         this.idleRec.on('frame', frame => {
            this.kwDetector.processFrame(frame);
         });

         this.idleRec.on('REC_failed', err => {
            throw err;
         });

         this.kwDetector.on('PPN_keyword', async kw => {
            this.idleRec.setInfinityOff();
            this.kwDetector.porcupineRelease();
            switch (kw) {
               // case 3:
               //     resolve('repeat');
               //  case 4:
               //     resolve('repeat_last');
               case 1:
                  resolve('repeat');
                  break;
               case 2:
                  resolve('repeat_last');
                  break;
               default:
                  resolve('record');
                  break;
            }
         });
      });
   }

   //////////////////////////////////////////////////////////////////////////////
   public async recordPhase(): Promise<string> {
      return new Promise<string>(resolve => {
         this.phase = 'record';
         this.sttRec.startFramesEmittion();

         this.sttRec.on('REC_start', () => {
            this.rec.clearRecord();
            this.cobra.cobraInit();
            this.cancelDetector.porcupineInit();
         });

         this.sttRec.on('frame', frame => {
            this.rec.addRecord(frame);
            this.rhino.processAudio(frame);
            this.cobra.processFrame(frame);
            this.cancelDetector.processFrame(frame);
         });

         this.sttRec.on('REC_failed', err => {
            throw err;
         });

         this.cancelDetector.on('PPN_keyword', () => {
            this.sttRec.stopTimedRecording();
            this.cobra.cobraRelease();
            this.cancelDetector.porcupineRelease();
            resolve('cancel');
         });

         this.cobra.on('COBRA_stoped_talk', async () => {
            this.sttRec.stopTimedRecording();
            this.rec.setRecordL();
            await makeWav(this.rec.getRecordL());
            this.cobra.cobraRelease();
            this.cancelDetector.porcupineRelease();
            resolve('stt');
         });

         this.rhino.on('RHINO_cmd', () => {
            this.sttRec.stopTimedRecording();
            resolve('cmd'); //logica composit ak
         });
      });
   }

   //////////////////////////////////////////////////////////////////////////////
   public async waitPhase(): Promise<string> {
      return new Promise<string>(resolve => {
         this.phase = 'wait';
         this.idleRec.startFramesEmittion();

         this.idleRec.on('REC_start', () => {
            this.cancelDetector.porcupineInit();
         });

         this.idleRec.on('frame', frame => {
            this.cancelDetector.processFrame(frame);
         });

         this.cancelDetector.on('PPN_keyword', async () => {
            this.idleRec.setInfinityOff();
            this.cancelDetector.porcupineRelease();
            resolve('cancel');
         });
      });
   }

   //////////////////////////////////////////////////////////////////////////////
   public async compositeRecordPhase(): Promise<string> {
      return new Promise<string>(resolve => {
         this.phase = 'compositeRecord';
         this.sttRec.startFramesEmittion();

         this.sttRec.on('REC_start', () => {
            this.rec.clearRecord();
            this.cobra.cobraInit();
            this.cancelDetector.porcupineInit();
         });

         this.sttRec.on('frame', frame => {
            this.rec.addRecord(frame);
            this.rhino.processAudio(frame);
            this.cobra.processFrame(frame);
            this.cancelDetector.processFrame(frame);
         });

         this.sttRec.on('REC_failed', err => {
            throw err;
         });

         this.cancelDetector.on('PPN_keyword', () => {
            this.sttRec.stopTimedRecording();
            this.cobra.cobraRelease();
            this.cancelDetector.porcupineRelease();
            resolve('cancel');
         });

         this.cobra.on('COBRA_stoped_talk', async () => {
            this.sttRec.stopTimedRecording();
            this.rec.setRecordL();
            await makeWav(this.rec.getRecordL());
            this.cobra.cobraRelease();
            this.cancelDetector.porcupineRelease();
            resolve('stt');
         });
      });
   }

   //////////////////////////////////////////////////////////////////////////////

   public async cancel(turnoff?: boolean): Promise<string> {
      return new Promise<string>(resolve => {
         switch (this.phase) {
            case 'idle':
               this.idleRec.setInfinityOff();
               this.kwDetector.porcupineRelease();
               break;
            case 'record':
               this.sttRec.stopTimedRecording();
               this.cobra.cobraRelease();
               this.cancelDetector.porcupineRelease();
               this.rec.clearRecord();
               break;
            case 'wait':
               this.idleRec.setInfinityOff();
               this.cancelDetector.porcupineRelease();
               break;
            case 'compositeRecord':
               this.sttRec.stopTimedRecording();
               this.cobra.cobraRelease();
               this.cancelDetector.porcupineRelease();
               this.rec.clearRecord();
               break;
         }
         if (turnoff) {
            this.rhino.rhinoRelease();
         }
      });
   }

   //////////////////////////////////////////////////////////////////////////////
}
