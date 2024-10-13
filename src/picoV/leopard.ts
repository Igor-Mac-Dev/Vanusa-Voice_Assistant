import { Leopard } from '@picovoice/leopard-node';
import { CustomError } from '../utils/error';
import * as conf from '../configuration/conf';
import * as interfaces from '../interfaces/config-json';

const config: interfaces.config = conf.readConfigFile();

export default class LeopardStt {
   protected transcriptor: Leopard | null = null;
   public text: string = '';

   public leopardInit(): void {
      try {
         this.transcriptor = new Leopard(config.PV_KEY, {
            modelPath: config.LEOPARD,
         });
      } catch (err) {
         throw new CustomError('°Cheetah failed to init:' + err);
      }
   }

   public leopardRelease(): void {
      if (this.transcriptor) {
         try {
            this.text = '';
            this.transcriptor.release();
            this.transcriptor = null;
         } catch (err) {
            throw new CustomError('°Leopard failed to release:' + err);
         }
      }
   }

   public processAudio(record: Int16Array): void {
      if (this.transcriptor) {
         const result: { transcript: string; words: Array<{}> } =
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
