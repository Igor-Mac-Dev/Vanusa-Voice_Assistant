import { Porcupine } from '@picovoice/porcupine-node';
import { CustomError } from '../utils/error.js';
import { EventEmitter } from 'events';
import * as conf from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';

const config: interfaces.config = conf.readConfigFile();

export default class PorcupineDetector extends EventEmitter {
   protected useCase: number;
   private kwDetector: Porcupine | null = null;

   constructor(useCase) {
      super();
      this.useCase = useCase;
   }

   public porcupineInit(): void {
      let wakewords: string[] = [];
      const sensitivity: number[] = [];
      switch (this.useCase) {
         case 1:
            wakewords = [...config.PPN_WW, ...config.PPN_REPEAT];
            break;
         case 2:
            wakewords = [...config.PPN_CANCEL];
            break;
         default:
            throw new CustomError('°PPN invalid use case');
      }

      wakewords.forEach(() => {
         sensitivity.push(config.SENSITIVITY);
      });
      this.kwDetector = new Porcupine(
         config.PV_KEY,
         wakewords,
         sensitivity,
         config.PPN,
      );
   }

   public processFrame(frame: Int16Array): void {
      if (this.kwDetector) {
         const keyWordIndex: number = this.kwDetector.process(frame);
         if (keyWordIndex >= 0) {
            this.emit('PPN_keyword', keyWordIndex);
         }
      }
   }

   public porcupineRelease(): void {
      if (this.kwDetector) {
         this.kwDetector.release();
         this.kwDetector = null;
      }
   }
}
