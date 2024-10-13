import { parentPort } from 'worker_threads';
import errorLog from '../utils/error';
import successLog from '../utils/sucess';
import completion from '../OpenAI/completion';

parentPort?.on('message', event => {
   console.log('child progress hand received:', event);

   if (Array.isArray(event)) {
      if (event[0] === 'error') {
         errorLog(event[1]);
      } else if (event[0] === 'success') {
         successLog(event[1]);
      } else if (event[0] === 'completion') {
         completion(event[1])
            .then(result => {
               parentPort?.postMessage(['completion', result]);
            })
            .catch(err => {
               parentPort?.postMessage(['error', err]);
            });
      } else if (event[0] === 'abort') {
      } else {
         console.log('Unknown utils event received:', event);
      }
   } else {
      console.log('Invalid utils event received:', event);
   }
});
