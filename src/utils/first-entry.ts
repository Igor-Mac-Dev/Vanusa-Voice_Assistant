import { exec } from 'child_process';
import * as path from 'path';

function executeCommand(command: string): Promise<string> {
   return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
         if (error) {
            reject(`Error executing command "${command}": ${error.message}`);
            return;
         }
         if (stderr) {
            reject(`Command "${command}" stderr: ${stderr}`);
            return;
         }
         resolve(stdout);
      });
   });
}

async function startPm2() {
   try {
      const ecosystemPath = path.resolve('./dist/utils/first-entry.js');
      const ecosystemOutput = await executeCommand(
         `pm2 start ${ecosystemPath}`,
      );
      console.log(`PM2 start output: ${ecosystemOutput}`);

      const startupOutput = await executeCommand('pm2 startup');
      console.log(`PM2 startup output: ${startupOutput}`);

      const saveOutput = await executeCommand('pm2 save');
      console.log(`PM2 save output: ${saveOutput}`);
   } catch (error) {
      console.error(error);
   }
}

startPm2();
