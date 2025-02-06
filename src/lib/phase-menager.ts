import { mainPhases, subPhases } from '../interfaces/types.js';
import errorLog from '../utils/error.js';

export default class PhaseMenager {
   protected mPhase: mainPhases = 'start';
   protected abruptMainChange: boolean = false;
   protected sPhase: subPhases | undefined;
   protected abruptSubChange: boolean = false;
   protected abortCurrentPhase: boolean = false;

   public getPhase(): mainPhases {
      return this.mPhase;
   }

   public getSubPhase(): subPhases | undefined {
      return this.sPhase;
   }

   public setPhase(phase: mainPhases, caller: string): void {
      if (this.abruptMainChange) {
         errorLog(
            `Possible Error: Abrupt phase change of ${this.mPhase} to ${phase} by ${caller}`,
         );
      }
      this.mPhase = phase;
      this.abruptMainChange = true;
      setTimeout(() => {
         this.abruptMainChange = false;
      }, 500);
   }

   public setSubPhase(phase: subPhases | undefined, caller: string): void {
      if (this.abruptSubChange) {
         errorLog(
            `Possible Error: Abrupt sub-phase change of ${this.sPhase} to ${phase} by ${caller}`,
         );
      }
      this.sPhase = phase;
      this.abruptSubChange = true;
      setTimeout(() => {
         this.abruptSubChange = false;
      }, 500);
   }

   public getAbortCurrentPhase(): boolean {
      return this.abortCurrentPhase;
   }

   public setAbortCurrentPhaseTrue(): void {
      this.abortCurrentPhase = true;
   }

   public setAbortCurrentPhaseFalse(): void {
      this.abortCurrentPhase = false;
   }
}
