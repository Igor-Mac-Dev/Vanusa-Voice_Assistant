import os from 'os';
import path from 'path';
import { Worker } from 'worker_threads';
import vm from 'node:vm';

// Caminho da pasta Documentos de forma multiplataforma
const documentosPath = path.join(os.homedir(), 'Documents');

console.log(`A pasta Documentos do usuário está em: ${documentosPath}`);

const myPromise = new Promise((resolve, reject) => {
   setTimeout(() => {
      resolve('foo');
   }, 300);
});

myPromise
   .then(value => `${value} and bar`)
   .then(value => `${value} and bar again`)
   .then(value => `${value} and again`)
   .then(value => `${value} and again`)
   .then(value => {
      console.log(value);
   })
   .catch(err => {
      console.error(err);
   });

const context = vm.createContext();
const worker = new Worker('./sla.js');
const subChannel = new MessageChannel();

worker.postMessage({ hereIsYourPort: subChannel.port1 }, [subChannel.port1]);

context.port = subChannel.port2;

const code = `
   async function teste() {
      return new Promise(resolve => {
         port.postMessage('the CONTEXT is sending this');
         // Aguarda a mensagem chegar pela porta
         port.once('message', value => {
            console.log('CONTEXT received:', value);
            resolve('sim');
         });
      });
   }
   
   (async () => {
      let result = await teste();
      console.log('CONTEXT:', result);
   })();
   `;

vm.runInContext(code, context);

console.log('PEITIN');
