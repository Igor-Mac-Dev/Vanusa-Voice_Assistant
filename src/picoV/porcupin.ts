import { Porcupine } from '@picovoice/porcupine-node';
import { CustomError } from '../utils/error.js';
import { EventEmitter } from 'events';
import * as conf from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';

export default class PorcupineDetector extends EventEmitter {
   protected useCase: number;
   private kwDetector: Porcupine | null = null;
   protected config: interfaces.config;

   constructor(useCase: number) {
      super();
      this.useCase = useCase;
      this.config = conf.readConfigFile();
   }

   public porcupineInit(): void {
      let wakewords: string[] = [];
      const sensitivity: number[] = [];
      switch (this.useCase) {
         case 1:
            wakewords = [...this.config.PPN_WW, ...this.config.PPN_REPEAT];
            break;
         case 2:
            wakewords = [...this.config.PPN_CANCEL];
            break;
         default:
            throw new CustomError('°PPN invalid use case');
      }

      wakewords.forEach(() => {
         sensitivity.push(this.config.SENSITIVITYWW);
      });
      this.kwDetector = new Porcupine(
         this.config.PV_KEY,
         wakewords,
         sensitivity,
         this.config.PPN,
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
