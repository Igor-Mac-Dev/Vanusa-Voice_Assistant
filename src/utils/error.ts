import * as fs from 'fs';
import * as path from 'path';

export default async function errorLog(err: unknown): Promise<void> {
   const date = new Date(Date.now());
   const now = date.toUTCString();
   fs.appendFile(
      path.resolve('log/log.txt'),
      `\n ${now} - ERROR: ${err}`,
      er => {
         if (er) {
            console.error(er);
         }
      },
   );
}

export class CustomError extends Error {
   public readonly logMsg: string;

   constructor(logMsg: string) {
      super();
      this.logMsg = logMsg;
   }
}
