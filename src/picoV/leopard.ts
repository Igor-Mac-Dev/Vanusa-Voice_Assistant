import { Leopard } from '@picovoice/leopard-node';
import { CustomError } from '../utils/error.js';
import * as conf from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';

export default class LeopardStt {
   protected transcriptor: Leopard | null = null;
   public text: string = '';
   protected config: interfaces.config;

   constructor() {
      try {
         this.config = conf.readConfigFile();
      } catch (err) {
         throw new CustomError('°Leopard failed to init:', err);
      }
   }

   public leopardInit(): void {
      try {
         this.transcriptor = new Leopard(this.config.PV_KEY, {
            modelPath: this.config.LEOPARD,
         });
         this.text = '';
      } catch (err) {
         throw new CustomError('°Cheetah failed to init:', err);
      }
   }

   public leopardRelease(): void {
      if (this.transcriptor) {
         try {
            this.transcriptor.release();
            this.transcriptor = null;
         } catch (err) {
            throw new CustomError('°Leopard failed to release:', err);
         }
      }
   }

   public processAudio(record: Int16Array): void {
      if (this.transcriptor) {
         const result: { transcript: string; words: Array<object> } =
            this.transcriptor.process(record);
         if (
            typeof result.transcript === 'string' &&
            result.transcript.trim() !== ''
         ) {
            this.text = result.transcript;
         }
      }
   }
}
