import { Orca } from '@picovoice/orca-node';
import { CustomError } from '../utils/error';
import * as conf from '../configuration/conf';
import * as interfaces from '../interfaces/config-json';
import makeWav from '../utils/wav-maker';

export default class OrcaTts {
   private config: interfaces.config = conf.readConfigFile();
   private orca: Orca | null = null;
   private wavBuffer: Int16Array = new Int16Array();

   private orcaInit(): void {
      try {
         this.orca = new Orca(this.config.PV_KEY);
      } catch (err) {
         throw new CustomError('°Orca failed to init:' + err);
      }
   }

   public async generateAudio(text: string, usecase: 1 | 2): Promise<void> {
      try {
         this.orcaInit();
         if (this.orca) {
            const pcmHolder = this.orca.synthesize(text);
            this.wavBuffer = pcmHolder.pcm;
            await makeWav(this.wavBuffer, 22000, usecase);
            this.orcaRelease();
         }
      } catch (err) {
         this.orcaRelease();
         throw new CustomError('°Orca failed to generate audio:' + err);
      }
   }

   private orcaRelease(): void {
      try {
         if (this.orca) {
            this.wavBuffer = new Int16Array();
            this.orca.release();
            this.orca = null;
         }
      } catch (err) {
         throw new CustomError('°Orca failed to release:' + err);
      }
   }
}
