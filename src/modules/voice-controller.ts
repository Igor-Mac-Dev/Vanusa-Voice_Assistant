import FramesEmitter from '../picoV/record/frames-emitter.js';
import PorcupineDetector from '../picoV/porcupin.js';
import CobraDetector from '../picoV/cobra.js';
import RecordHolder from '../picoV/record/record-holder.js';
import RhinoSti from '../picoV/rhino.js';
import { readConfigFile } from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';
import { CustomError } from '../utils/error.js';
import { command } from '../interfaces/types.js';
import { error } from 'node:console';
import SttControll from './stt-controller.js';

export default class VoiceController {
   private config: interfaces.config;
   private idleRec: FramesEmitter;
   private sttRec: FramesEmitter;
   private kwDetector: PorcupineDetector;
   private cancelDetector: PorcupineDetector;
   private cobra: CobraDetector;
   private rec: RecordHolder;
   private rhino: RhinoSti;
   private phase: 'idle' | 'record' | 'wait' | 'compositeRecord' | undefined;
   private sttCtrl!: SttControll;
   private transcription: string | undefined;

   constructor() {
      try {
         this.config = readConfigFile();
         this.idleRec = new FramesEmitter(
            this.config.FRAME_LENGHT,
            this.config.SAMPLE_RATE,
            true,
            0,
            this.config.SELECTED_DEVICE,
         );
         this.sttRec = new FramesEmitter(
            this.config.FRAME_LENGHT,
            this.config.SAMPLE_RATE,
            false,
            this.config.RECORD_TIME,
            this.config.SELECTED_DEVICE,
         );
         this.kwDetector = new PorcupineDetector(1);
         this.cancelDetector = new PorcupineDetector(2);
         this.cobra = new CobraDetector();
         this.rec = new RecordHolder();
         this.rhino = new RhinoSti();
         this.sttCtrl = new SttControll();
      } catch (err) {
         throw new CustomError(
            'Problem starting voice controller: ',
            err,
            true,
         );
      }
   }

   public getIntent(): [command, boolean] {
      return this.rhino.getIntent();
   }

   public getTranscription(): string | undefined {
      const trnscrpt = this.transcription;
      this.transcription = undefined;
      return trnscrpt;
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
         console.log(error);
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
            resolve('remote-stop');
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
      return new Promise<string>((resolve, reject) => {
         try {
            let memoryMercy: NodeJS.Timeout | null = null;
            this.phase = 'idle';
            this.idleRec.setInfinityOn();
            const release = async () => {
               if (memoryMercy) clearTimeout(memoryMercy);
               await this.idleRec.setInfinityOff();
               await this.kwDetector.porcupineRelease();
               await this.removeAllListenners();
            };
            this.idleRec.startFramesEmittion();

            this.idleRec.once('REC_failed', async error => {
               await release();
               reject(
                  new CustomError(
                     '*Voice Controller idlePhase failed: ',
                     error,
                  ),
               );
            });

            this.idleRec.once('REC_cant_read', async error => {
               await release();
               reject(
                  new CustomError(
                     '*Voice Controller idlePhase failed: ',
                     error,
                  ),
               );
            });

            this.idleRec.once('REC_start', async () => {
               await this.kwDetector.porcupineInit();
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
      return new Promise<string>((resolve, reject) => {
         try {
            this.phase = 'record';
            const release = async () => {
               await this.sttCtrl.stop();
               await this.sttRec.stopTimedRecording();
               await this.cobra.cobraRelease();
               await this.cancelDetector.porcupineRelease();
               await this.rec.clearRecord();
               await this.removeAllListenners();
            };

            this.sttRec.once('REC_failed', async error => {
               await release();
               reject(
                  new CustomError(
                     '*Voice Controller recordPhase failed: ',
                     error,
                  ),
               );
            });

            this.sttRec.once('REC_cant_read', async () => {
               await release();
               reject(
                  new CustomError(
                     '*Voice Controller recordPhase failed: ',
                     error,
                  ),
               );
            });

            this.sttCtrl.start();
            this.sttRec.startFramesEmittion();

            this.sttRec.once('REC_start', async () => {
               await this.cobra.cobraInit();
               await this.cancelDetector.porcupineInit();
            });

            this.sttRec.on('frame', async frame => {
               try {
                  await this.rec.addRecord(frame);
                  await this.rhino.processAudio(frame);
                  await this.cobra.processFrame(frame);
                  await this.cancelDetector.processFrame(frame);
               } catch (error) {
                  this.sttRec.emit(
                     'REC_failed',
                     new CustomError('*Frame processing failed: ', error),
                  );
               }
            });

            this.cancelDetector.once('PPN_keyword', async () => {
               await release();
               resolve('cancel');
            });

            this.cobra.once('COBRA_stoped_talk', async () => {
               this.transcription = this.cobra.talked
                  ? await this.sttCtrl.stt(this.rec.getRecordC())
                  : '';
               await release();
               resolve('stt');
            });

            this.rhino.once('RHINO_cmd', async () => {
               await release();
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
      return new Promise<string>((resolve, reject) => {
         try {
            let memoryMercy: NodeJS.Timeout | null = null;
            this.phase = 'wait';
            const release = async () => {
               if (memoryMercy) clearTimeout(memoryMercy);
               await this.cancelDetector.porcupineRelease();
               await this.idleRec.setInfinityOff();
               await this.removeAllListenners();
            };

            this.idleRec.once('REC_failed', async error => {
               await release();
               reject(
                  new CustomError(
                     '*Voice Controller idlePhase failed: ',
                     error,
                  ),
               );
            });

            this.idleRec.once('REC_cant_read', async error => {
               await release();
               reject(
                  new CustomError(
                     '*Voice Controller idlePhase failed: ',
                     error,
                  ),
               );
            });

            this.idleRec.startFramesEmittion();

            this.idleRec.once('REC_start', async () => {
               await this.cancelDetector.porcupineInit();
            });

            this.idleRec.on('frame', frame => {
               try {
                  this.cancelDetector.processFrame(frame);
                  console.log('cancel?');
               } catch (error) {
                  this.idleRec.emit(
                     'REC_failed',
                     new CustomError('*Frame processing failed: ', error),
                  );
               }
            });

            this.cancelDetector.once('PPN_keyword', async () => {
               await release();
               console.log('cancel!');
               resolve('cancel');
            });

            this.idleRec.once('InfinityOff', async () => {
               await release();
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
      return new Promise<string>((resolve, reject) => {
         try {
            this.phase = 'compositeRecord';
            const release = async () => {
               await this.sttRec.stopTimedRecording();
               await this.cobra.cobraRelease();
               await this.cancelDetector.porcupineRelease();
               await this.rec.clearRecord();
               await this.sttCtrl.stop();
               await this.removeAllListenners();
            };

            this.sttRec.once('REC_failed', async error => {
               await release();
               reject(
                  new CustomError(
                     '*Voice Controller compositeRecordPhase failed: ',
                     error,
                  ),
               );
            });

            this.sttRec.once('REC_cant_read', async error => {
               await release();
               reject(
                  new CustomError(
                     '*Voice Controller compositeRecordPhase failed: ',
                     error,
                  ),
               );
            });

            this.sttCtrl.start();
            this.sttRec.startFramesEmittion();

            this.sttRec.once('REC_start', async () => {
               await this.cobra.cobraInit();
               await this.cancelDetector.porcupineInit();
            });

            this.sttRec.on('frame', async frame => {
               try {
                  await this.rec.addRecord(frame);
                  await this.cancelDetector.processFrame(frame);
                  await this.cobra.processFrame(frame);
               } catch (error) {
                  this.sttRec.emit(
                     'REC_failed',
                     new CustomError('*Frame processing failed: ', error),
                  );
               }
            });

            this.cancelDetector.once('PPN_keyword', async () => {
               await release();
               resolve('cancel');
            });

            this.cobra.once('COBRA_stoped_talk', async () => {
               this.transcription = this.cobra.talked
                  ? await this.sttCtrl.stt(this.rec.getRecordC())
                  : '';
               await release();
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
            // Quando essa etapa chega o programa está em wait
            this.stopInfinityRecord();
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
