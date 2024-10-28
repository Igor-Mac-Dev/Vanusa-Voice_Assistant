import { exec } from 'child_process';
import * as path from 'path';

const options = {
   detached: true,
   stdio: 'ignore',
   windowsHide: true,
};

function executeCommand(command: string): Promise<string> {
   return new Promise((resolve, reject) => {
      exec(command, options, (error, stdout, stderr) => {
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
      const ecosystemPath = path.resolve('./ecosystem.config.cjs');
      await executeCommand(`pm2 start ${ecosystemPath}`);
   } catch (error) {
      console.error(error);
   }
}

export async function savePm2() {
   try {
      await executeCommand('pm2 save');
   } catch (error) {
      console.error(error);
   }
}

export async function cleanPm2() {
   try {
      await executeCommand('pm2 delete Vanusa-main');
      await executeCommand('pm2 delete V-node-red');
      await executeCommand('pm2 delete Vanusa-monitor');
      await executeCommand('pm2 save --force');
   } catch (error) {
      console.error(error);
   }
}

export async function stopPm2() {
   try {
      await executeCommand('pm2 stop Vanusa-main V-node-red Vanusa-monitor');
   } catch (error) {
      console.error(error);
   }
}
