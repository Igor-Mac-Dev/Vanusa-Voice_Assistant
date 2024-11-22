import { parentPort } from 'worker_threads';
import assert from 'node:assert';
import vm from 'node:vm';

const context = vm.createContext();

parentPort.once('message', value => {
   assert(value.hereIsYourPort instanceof MessagePort);
   value.hereIsYourPort.postMessage('the worker is sending this');
   //    value.hereIsYourPort.close();
   context.prntPort = value.hereIsYourPort;
   context.prntPort.on('message', value => {
      console.log('receivedAAA:', value);
      context.prntPort.postMessage('the worker is sending this context');
   });

   context.prntPort.postMessage('the worker is sending this AAAAAAAAAA');
});
