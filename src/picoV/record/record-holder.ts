import { CustomError } from '../../utils/error.js';

export default class RecordHolder {
   protected recordC: Int16Array[] = [];

   constructor() {}

   public addRecord(frame: Int16Array): void {
      this.recordC.push(frame);
   }

   public getRecordC(): Int16Array[] {
      return this.recordC;
   }

   public clearRecord(): void {
      this.recordC = [];
   }
}

export function convertRecordL(recordC: Int16Array[]): Int16Array | undefined {
   try {
      if (recordC.length === 0) {
         return;
      }
      const totalLength: number = recordC.reduce(
         (acc, frame) => acc + frame.length,
         0,
      );
      const output: Int16Array = new Int16Array(totalLength);
      let offset: number = 0;
      for (const frame of recordC) {
         for (let i = 0; i * 512 < frame.length; i++) {
            output.set(frame, offset);
            offset += frame.length;
         }
      }
      return output;
   } catch (error) {
      throw new CustomError('°Record holder failed: ' + error);
   }
}
