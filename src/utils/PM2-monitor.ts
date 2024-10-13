import * as pm2 from 'pm2';
import * as path from 'path';

pm2.launchBus((err, bus) => {
   if (err) {
      console.error(err);
      return;
   }

   bus.on('process:exit', packet => {
      if (
         packet.process.name === 'app-main' &&
         packet.process.exit_code !== 0
      ) {
         console.log(`app-main crashed. Restarting in safe mode...`);
         pm2.start(
            {
               name: 'safe-Vanusa',
               script: path.resolve('./dist/safe-index.js'),
               autorestart: true,
               max_restarts: 3,
               restart_delay: 4000,
            },
            err => {
               if (err) {
                  console.error('Error starting safe.js:', err);
               }
            },
         );
      }
   });
});
