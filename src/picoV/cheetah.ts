import { Cheetah } from '@picovoice/cheetah-node';
import { CustomError } from '../utils/error.js';
import * as conf from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';

export default class CheetahStt {
   protected transcriptor: Cheetah | null = null;
   public text: string = '';
   protected config: interfaces.config;

   constructor() {
      try {
         this.config = conf.readConfigFile();
      } catch (err) {
         throw new CustomError('°Leopard failed to init:', err);
      }
   }

   public cheetahInit(): void {
      try {
         this.transcriptor = new Cheetah(this.config.PV_KEY, {
            modelPath: this.config.CHEETAH,
            libraryPath: undefined,
            endpointDurationSec: 10,
            enableAutomaticPunctuation: false,
         });
         this.text = '';
      } catch (err) {
         throw new CustomError('°Cheetah failed to init: ', err);
      }
   }

   public cheetahRelease(): void {
      try {
         if (this.transcriptor) {
            this.transcriptor.release();
            this.transcriptor = null;
         }
      } catch (err) {
         throw new CustomError('°Cheetah failed to release: ', err);
      }
   }

   public processAudio(record: Array<Int16Array>): void {
      if (this.transcriptor) {
         try {
            for (let i = 0; i < record.length; i++) {
               const result = this.transcriptor.process(record[i]);
               if (typeof result[0] === 'string' && result[0].trim() !== '') {
                  this.text += result[0];
               }
            }
            const flush = this.transcriptor.flush();
            if (flush.trim() !== '') {
               this.text += flush;
            }
         } catch (err) {
            throw new CustomError('°Cheetah failed to process audio: ', err);
         }
      } else {
         console.log('Cheetah not available, please init it');
      }
   }

   public turnoff(): void {
      if (this.transcriptor) {
         this.transcriptor.release();
         this.transcriptor = null;
      }
   }
}
