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

export async function startPm2() {
   try {
      const ecosystemPath = path.resolve('./ecosystem.config.js');
      const ecosystemOutput = await executeCommand(
         `pm2 start ${ecosystemPath}`,
      );
      console.log(`PM2 start output: ${ecosystemOutput}`);
   } catch (error) {
      console.error(error);
   }
}

export async function savePm2() {
   try {
      const startupOutput = await executeCommand('pm2 startup');
      console.log(`PM2 startup output: ${startupOutput}`);

      const saveOutput = await executeCommand('pm2 save');
      console.log(`PM2 save output: ${saveOutput}`);
   } catch (error) {
      console.error(error);
   }
}

export async function cleanPm2() {
   try {
      let cleanOutput = await executeCommand('pm2 delete Vanusa-main');
      console.log(`PM2 clean output: ${cleanOutput}`);
      cleanOutput = await executeCommand('pm2 delete node-red-V');
      console.log(`PM2 clean output: ${cleanOutput}`);
      cleanOutput = await executeCommand('pm2 delete Vanusa-safe');
      console.log(`PM2 clean output: ${cleanOutput}`);

      const saveOutput = await executeCommand('pm2 save');
      console.log(`PM2 save output: ${saveOutput}`);
   } catch (error) {
      console.error(error);
   }
}

export async function stopPm2() {
   try {
      let stopOutput = await executeCommand('pm2 stop Vanusa-main');
      console.log(`PM2 stop output: ${stopOutput}`);
      stopOutput = await executeCommand('pm2 stop node-red-V');
      console.log(`PM2 stop output: ${stopOutput}`);
      stopOutput = await executeCommand('pm2 stop Vanusa-safe');
      console.log(`PM2 stop output: ${stopOutput}`);
   } catch (error) {
      console.error(error);
   }
}
