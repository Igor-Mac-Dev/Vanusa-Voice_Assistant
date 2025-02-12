import errorLog, { CustomError, getCircularReplacer } from './utils/error.js';
import DependencyContainer from './modules/DependencyContainer.js';
import process from 'node:process';

function test(fodase) {
   console.log(fodase);
   errorLog(fodase);
   try {
      const container = new DependencyContainer();
      container.startDependencies();
   } catch (er) {
      errorLog(er);
   }

   process.on('unhandledRejection', async (reason, promise) => {
      await errorLog(
         `Promise rejected without catch:
${reason instanceof Error ? reason.stack || reason.message : reason}`,
      );
   });

   async function puta() {
      return new Promise((resolve, reject) => {
         setTimeout(() => {
            reject('cornop');
         }, 1000);
      });
   }

   puta();
}

test(new CustomError('Teste ', new Error('Teste'), true));
