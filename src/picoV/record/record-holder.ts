import { CustomError } from '../../utils/error.js';

export default class RecordHolder {
   protected recordC: Int16Array[] = [];
   protected recordL: Int16Array = new Int16Array();

   constructor() {}

   public addRecord(frame: Int16Array): void {
      this.recordC.push(frame);
   }

   public setRecordL(): void {
      try {
         if (this.recordC.length === 0) {
            return;
         }
         const totalLength: number = this.recordC.reduce(
            (acc, frame) => acc + frame.length,
            0,
         );
         const output: Int16Array = new Int16Array(totalLength);
         let offset: number = 0;
         for (const frame of this.recordC) {
            for (let i = 0; i * 512 < frame.length; i++) {
               output.set(frame, offset);
               offset += frame.length;
            }
         }
         this.recordL = output;
      } catch (error) {
         throw new CustomError('°Record holder failed: ' + error);
      }
   }

   public getRecordC(): Int16Array[] {
      return this.recordC;
   }

   public getRecordL(): Int16Array {
      return this.recordL;
   }

   public clearRecord(): void {
      this.recordC = [];
      this.recordL = new Int16Array();
   }
}
