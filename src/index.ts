import * as config from './configuration/conf';
import * as workers from './workers/workers-handler';
import * as pm2 from 'pm2';

(async (): Promise<void> => {
   try {
      await main();
   } catch (e) {
      workers.handlers.error(e);
   }
})();

async function main(): Promise<void> {
   workers.handlers.start();
}

workers.controll.on('message', message => {
   console.log('controll parent Received: ', message);
});

function start(): void {}
