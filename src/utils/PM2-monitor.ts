import pm2 from 'pm2';
import { resolve } from 'path';
import errorLog from './error.js';
import AudioScheduler from '../modules/speaker-controller.js';

const player = new AudioScheduler();

const play_err = async () => {
   try {
      player.addToQueue('play_cursed');
   } catch (e) {
      errorLog('play_output failed: ' + e);
   }
};

async function setupBus() {
   return new Promise((resolve, reject) => {
      pm2.launchBus((err, bus) => {
         if (err) {
            reject(err);
         } else {
            resolve(bus);
         }
      });
   });
}

async function monitorProcess() {
   try {
      const bus = await setupBus();

      bus.on('process:exit', async (packet: any) => {
         if (
            packet.process.name === 'Vanusa-main' &&
            packet.process.exit_code !== 0
         ) {
            play_err();
            await errorLog(`^App-main crashed. Restarting in safe mode!`);
            player.once('Audio_Queue_End', () => {
               pm2.start(
                  {
                     name: 'Vanusa-safe',
                     script: resolve('./dist/safe-index.js'),
                     autorestart: true,
                     max_restarts: 3,
                     restart_delay: 4000,
                  },
                  err => {
                     if (err) {
                        errorLog(
                           '*Error starting safe.js with monitorProcess: ' +
                              err,
                        );
                     }
                  },
               );
            });
         }
      });
   } catch (err) {
      errorLog('Error launching PM2 bus: ' + err);
   }
}

await monitorProcess();
