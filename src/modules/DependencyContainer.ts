import SttControll from '../modules/stt-controller.js';
import { command } from '../interfaces/types.js';
import AudioScheduler from '../modules/speaker-controller.js';
import errorLog, { CustomError } from '../utils/error.js';
import rhinoHandler from '../modules/rhino-controller.js';
import OAIcompletion from '../OpenAI/completion.js';
import TtsControll from '../modules/tts-controller.js';
import PhaseMenager from '../lib/phase-menager.js';
import controlHandler from './main-controller.js';
import PowerEvents from '../lib/power-events-listenner.js';
import sucessLog from '../utils/sucess.js';

export default class DependencyContainer {
   private controlStarted: unknown;
   private errorStarting: boolean = false;
   private error: CustomError | null = null;
   private restart!: () => void;
   public control!: controlHandler;
   public rhino!: rhinoHandler;
   public player!: AudioScheduler;
   public OAIComp!: OAIcompletion;
   public sttCtrl!: SttControll;
   public ttsCtrl!: TtsControll;
   public phaseMenager!: PhaseMenager;
   public powerEvents!: PowerEvents;


   constructor(
      restart: () => void,
      sendToRED: (msg: command) => Promise<string>,
   ) {
      try {
         this.control = new controlHandler();
         this.rhino = new rhinoHandler(sendToRED);
         this.player = new AudioScheduler();
         this.OAIComp = new OAIcompletion();
         this.sttCtrl = new SttControll();
         this.ttsCtrl = new TtsControll();
         this.phaseMenager = new PhaseMenager();
         this.powerEvents = new PowerEvents();
         this.restart = restart;
      } catch (err) {
         this.error = new CustomError('Error starting dependencies: ' + err);
         this.errorStarting = true;
      }
   }
   public async startDependencies(): Promise<void> {
      try {
         if (this.errorStarting) {
            await errorLog(this.error);
            this.restart();
         }
         this.controlStarted = await this.control.start();
         
      if (this.controlStarted === 'started') {
         this.player.play_start();
      } else {
         throw new CustomError('Error starting Vanusa voice controller', '', true);
      }
         await this.powerEvents.startPowerMonitor();
      } catch (err) {
         console.log(err);
         await errorLog(new CustomError('Error starting dependencies: ', err));
         this.restart();
      }
   }

   public async stopDependencies(): Promise<void> {
      try {
         await this.control.turnoff();
         await this.rhino.killRhino();
         await this.player.stopAudio();
         this.OAIComp.stopOpenAI();
         this.powerEvents.stopPowerMonitor();
      } catch (err) {
         await errorLog(new CustomError('Error starting dependencies: ', err));
      }
   }

   public async setListeners(
      pause: () => void,
      resume: () => void,
   ): Promise<void> {
      try {
         this.powerEvents.on('open', () => {
            sucessLog('PowerEvents opened');
         });
         this.powerEvents.on('suspend', async () => {
            try {
               pause();
            } catch (err) {
               await errorLog(new CustomError('Error pausing Vanusa: ', err));
               if ((err as any).fatal) {
                  this.restart();
               }
            }
         });

         this.powerEvents.on('resume', async () => {
            try {
               resume();
            } catch (err) {
               await errorLog(new CustomError('Error resuming Vanusa: ', err));
               if ((err as any).fatal) {
                  this.restart();
               }
            }
         });
         this.powerEvents.on('close', () => {
            sucessLog('PowerEvents closed');
         });
         this.powerEvents.on('error', err => {
            errorLog(new CustomError('PowerEvents error: ', err));
         });
      } catch (err) {
         await errorLog(
            new CustomError('Error setting dependencies listeners: ', err),
         );
      }
   }
}
