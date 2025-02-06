import FramesEmitter from '../picoV/record/frames-emitter.js';
import PorcupineDetector from '../picoV/porcupin.js';
import CobraDetector from '../picoV/cobra.js';
import RecordHolder from '../picoV/record/record-holder.js';
import RhinoSti from '../picoV/rhino.js';
import { readConfigFile } from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';
import { CustomError } from '../utils/error.js';
import makeWav from '../lib/wav-maker.js';
import { error } from 'console';

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

   private removeAllListenners() {
      this.idleRec.removeAllListeners();
      this.sttRec.removeAllListeners();
      this.kwDetector.removeAllListeners();
      this.cancelDetector.removeAllListeners();
      this.cobra.removeAllListeners();
      this.rhino.removeAllListeners();
   }

   public async start(): Promise<string> {
      try {
         await this.rhino.rhinoInit();
         return 'started';
      } catch (error) {
         throw new CustomError('*Voice Controller start failed: ', error);
      }
   }

   //////////////////////////////////////////////////////////////////////////////

   public stopInfinityRecord(): Promise<string> {
      this.idleRec.emit('InfinityOff');
      return new Promise<string>((resolve, reject) => {
         this.idleRec.once('REC_stop', () => {
            console.log('REC_stop');
            this.idleRec.removeAllListeners('error');
            resolve('stop');
         });
         this.idleRec.once('error', error => {
            this.idleRec.removeAllListeners('REC_stop');
            reject(
               new CustomError(
                  '*Voice Controller stopInfinityRecord failed: ',
                  error,
               ),
            );
         });
      });
   }

   //////////////////////////////////////////////////////////////////////////////

   public async idlePhase(): Promise<string> {
      this.removeAllListenners();
      return new Promise<string>((resolve, reject) => {
         try {
            let memoryMercy: NodeJS.Timeout | null = null;
            this.phase = 'idle';
            this.idleRec.setInfinityOn();
            const release = () => {
               this.idleRec.setInfinityOff();
               this.kwDetector.porcupineRelease();
               if (memoryMercy) clearTimeout(memoryMercy);
            };
            this.idleRec.startFramesEmittion();

            this.idleRec.once('REC_failed', error => {
               release();
               reject(
                  new CustomError(
                     '*Voice Controller idlePhase failed: ',
                     error,
                  ),
               );
            });

            this.idleRec.once('REC_cant_read', () => {
               release();
               reject(
                  new CustomError(
                     '*Voice Controller idlePhase failed: ',
                     error,
                  ),
               );
            });

            this.idleRec.once('REC_start', () => {
               this.kwDetector.porcupineInit();
            });

            this.idleRec.on('frame', frame => {
               try {
                  this.kwDetector.processFrame(frame);
               } catch (error) {
                  this.idleRec.emit(
                     'REC_failed',
                     new CustomError('*Frame processing failed: ', error),
                  );
               }
            });

            this.kwDetector.once('PPN_keyword', async kw => {
               console.log('KW' + kw);
               release();
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

            memoryMercy = setTimeout(() => {
               this.idleRec.setInfinityOff();
               this.kwDetector.porcupineRelease();
               resolve('loop');
            }, 600000);

            this.idleRec.once('InfinityOff', () => {
               release();
               resolve('remote-stop');
            });
         } catch (error) {
            reject(
               new CustomError('*Voice Controller idlePhase failed: ', error),
            );
         }
      });
   }

   //////////////////////////////////////////////////////////////////////////////
   public async recordPhase(): Promise<string> {
      this.removeAllListenners();

      return new Promise<string>((resolve, reject) => {
         try {
            this.phase = 'record';
            const release = () => {
               this.sttRec.stopTimedRecording();
               this.cobra.cobraRelease();
               this.cancelDetector.porcupineRelease();
            };

            this.sttRec.once('REC_failed', error => {
               release();
               reject(
                  new CustomError(
                     '*Voice Controller recordPhase failed: ',
                     error,
                  ),
               );
            });

            this.sttRec.once('REC_cant_read', () => {
               release();
               reject(
                  new CustomError(
                     '*Voice Controller recordPhase failed: ',
                     error,
                  ),
               );
            });

            this.sttRec.startFramesEmittion();

            this.sttRec.once('REC_start', () => {
               this.cobra.cobraInit();
               this.cancelDetector.porcupineInit();
            });

            this.sttRec.on('frame', frame => {
               try {
                  this.rec.addRecord(frame);
                  this.rhino.processAudio(frame);
                  this.cobra.processFrame(frame);
                  this.cancelDetector.processFrame(frame);
               } catch (error) {
                  this.sttRec.emit(
                     'REC_failed',
                     new CustomError('*Frame processing failed: ', error),
                  );
               }
            });

            this.cancelDetector.once('PPN_keyword', () => {
               release();
               resolve('cancel');
            });

            this.cobra.once('COBRA_stoped_talk', async () => {
               release();
               this.rec.setRecordL();
               if (this.config.STT_ENGINE === 'Whisper')
                  await makeWav(this.rec.getRecordL());
               resolve('stt');
            });

            this.rhino.once('RHINO_cmd', () => {
               release();
               resolve('cmd');
            });
         } catch (error) {
            reject(
               new CustomError('*Voice Controller recordPhase failed: ', error),
            );
         }
      });
   }

   //////////////////////////////////////////////////////////////////////////////

   public async waitPhase(): Promise<string> {
      this.removeAllListenners();
      return new Promise<string>((resolve, reject) => {
         try {
            let memoryMercy: NodeJS.Timeout | null = null;
            this.phase = 'wait';

            this.idleRec.once('REC_failed', error => {
               release();
               reject(
                  new CustomError(
                     '*Voice Controller idlePhase failed: ',
                     error,
                  ),
               );
            });

            this.idleRec.once('REC_cant_read', () => {
               release();
               reject(
                  new CustomError(
                     '*Voice Controller idlePhase failed: ',
                     error,
                  ),
               );
            });

            const release = () => {
               this.cancelDetector.porcupineRelease();
               this.idleRec.setInfinityOff();
               if (memoryMercy) clearTimeout(memoryMercy);
            };
            this.idleRec.startFramesEmittion();

            this.idleRec.once('REC_start', () => {
               this.cancelDetector.porcupineInit();
            });

            this.idleRec.on('frame', frame => {
               try {
                  this.cancelDetector.processFrame(frame);
               } catch (error) {
                  this.idleRec.emit(
                     'REC_failed',
                     new CustomError('*Frame processing failed: ', error),
                  );
               }
            });

            this.cancelDetector.once('PPN_keyword', async () => {
               release();
               resolve('cancel');
            });

            this.idleRec.once('InfinityOff', () => {
               release();
               resolve('remote-stop');
            });

            memoryMercy = setTimeout(() => {
               this.idleRec.setInfinityOff();
               this.kwDetector.porcupineRelease();
               resolve('loop');
            }, 60000);
         } catch (error) {
            reject(
               new CustomError('*Voice Controller waitPhase failed: ', error),
            );
         }
      });
   }

   //////////////////////////////////////////////////////////////////////////////

   public async compositeRecordPhase(): Promise<string> {
      this.removeAllListenners();
      return new Promise<string>((resolve, reject) => {
         try {
            this.phase = 'compositeRecord';
            const release = () => {
               this.sttRec.stopTimedRecording();
               this.cobra.cobraRelease();
               this.cancelDetector.porcupineRelease();
            };

            this.sttRec.once('REC_failed', error => {
               release();
               reject(
                  new CustomError(
                     '*Voice Controller compositeRecordPhase failed: ',
                     error,
                  ),
               );
            });

            this.sttRec.once('REC_cant_read', () => {
               release();
               reject(
                  new CustomError(
                     '*Voice Controller compositeRecordPhase failed: ',
                     error,
                  ),
               );
            });

            this.sttRec.startFramesEmittion();

            this.sttRec.once('REC_start', () => {
               this.cobra.cobraInit();
               this.cancelDetector.porcupineInit();
            });

            this.sttRec.on('frame', frame => {
               try {
                  this.rec.addRecord(frame);
                  this.cobra.processFrame(frame);
                  this.cancelDetector.processFrame(frame);
               } catch (error) {
                  this.sttRec.emit(
                     'REC_failed',
                     new CustomError('*Frame processing failed: ', error),
                  );
               }
            });

            this.cancelDetector.once('PPN_keyword', () => {
               release();
               resolve('cancel');
            });

            this.cobra.once('COBRA_stoped_talk', async () => {
               release();
               this.rec.setRecordL();
               resolve('composite');
            });
         } catch (error) {
            reject(
               new CustomError('*Voice Controller recordPhase failed: ', error),
            );
         }
      });
   }

   //////////////////////////////////////////////////////////////////////////////

   public async turnoff(): Promise<string> {
      this.removeAllListenners();
      try {
         return new Promise<string>(resolve => {
            // this.idleRec.emit('InfinityOff'); // Quando essa etapa chega o programa está em wait
            this.cancelDetector.porcupineRelease();
            this.rhino.rhinoRelease();
            this.removeAllListenners();
            resolve('finish');
         });
      } catch (error) {
         throw new CustomError('*IdleController turnoff failed: ', error);
      }
   }
}
