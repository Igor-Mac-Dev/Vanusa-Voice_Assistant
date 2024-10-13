import { Cobra } from '@picovoice/cobra-node';
import { CustomError } from '../utils/error';
import { EventEmitter } from 'events';
import * as conf from '../configuration/conf';
import * as interfaces from '../interfaces/config-json';

const config: interfaces.config = conf.readConfigFile();

export default class CobraDetector extends EventEmitter {
   protected activityDetector: Cobra | null = null;
   protected average: number[] = [];
   protected stillTalking: number[] = [];

   constructor() {
      super();
      for (let i = 0; i < config.COBRA_LENGHT; i++) {
         this.stillTalking.push(1);
      }
   }

   public cobraInit(): void {
      try {
         this.activityDetector = new Cobra(config.PV_KEY);
      } catch (error) {
         this.emit(
            'COBRA_error',
            new CustomError('°COBRA failed to init:' + error),
         );
      }
   }

   public cobraRelease(): void {
      try {
         if (this.activityDetector) {
            this.activityDetector.release();
            this.activityDetector = null;
         }
      } catch (err) {
         throw new CustomError('°COBRA failed to release:' + err);
      }
   }

   public processFrame(frame: Int16Array): void {
      if (this.activityDetector) {
         try {
            const activityProbability: number =
               this.activityDetector.process(frame);
            this.average.push(Number(activityProbability.toFixed(2)));
            if (this.average.length >= 31) {
               const average: number =
                  this.average.reduce((a, b) => a + b) / 31;
               if (average > 0.6) {
                  this.stillTalking.splice(0, 1);
                  this.stillTalking.push(1);
               } else {
                  this.stillTalking.splice(0, 1);
                  this.stillTalking.push(0);
                  if (this.stillTalking.every(num => num === 0)) {
                     this.emit('COBRA_stoped_talk');
                     this.stillTalking = [];
                     for (let i = 0; i < config.COBRA_LENGHT; i++) {
                        this.stillTalking.push(1);
                     }
                  }
               }
               this.average = [];
            }
         } catch (error) {
            this.emit(
               'COBRA_error',
               new CustomError('COBRA process frame error: ' + error),
            );
         }
      }
   }
}
