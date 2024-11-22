import { Worker } from 'worker_threads';
import * as path from 'path';
export const stt = new Worker(path.resolve('./dist/workers/w-stt.js'));
export const tts = new Worker(path.resolve('./dist/workers/w-tts.js'));
export const red = new Worker(path.resolve('./dist/workers/w-red.js'));
export const speaker = new Worker(path.resolve('./dist/workers/w-speaker.js'));
const control = new Worker(path.resolve('./dist/workers/w-record.js'));
function setupMessageChannel(worker) {
    const { port1, port2 } = new MessageChannel();
    worker.postMessage({ port: port2 }, [port2]);
    return port1;
}
// Configura canais para cada worker
const controlPort = setupMessageChannel(control);
// Função genérica para esperar mensagens em um canal específico
async function awaitWorkerOk(port) {
    return new Promise(resolve => {
        port.once('message', message => {
            resolve(message);
        });
    });
}
// Exemplo de uso de canais no seu objeto `handlers`
export const handlers = {
    start: async () => {
        red.postMessage('start');
        controlPort.postMessage('start');
        const [controlOk, redOk] = await Promise.all([
            awaitWorkerOk(controlPort),
            awaitWorkerOk(red),
        ]);
        if (controlOk === 'started' && redOk === 'started') {
            return 'started';
        }
        else {
            return 'Control & Red init failed.';
        }
    },
    idle: async () => {
        controlPort.postMessage('idle');
        return new Promise((resolve, reject) => {
            controlPort.once('message', message => {
                resolve(message);
            });
            controlPort.once('error', error => {
                console.error('Erro na comunicação com o worker:', error);
                reject(error);
            });
        });
    },
    record: async () => {
        controlPort.postMessage('record');
        return new Promise((resolve, reject) => {
            let compCmd = false;
            let cmd = null;
            controlPort.once('message', async (message) => {
                if (Array.isArray(message)) {
                    compCmd = message[1];
                    if (compCmd) {
                        handlers.play_cmd();
                        controlPort.postMessage('cmdrecord');
                        cmd = message[0];
                        const compositeStt = await (async () => {
                            return new Promise(resolve => {
                                controlPort.once('message', message => {
                                    if (message === 'cancel') {
                                        resolve('cancel');
                                    }
                                    handlers.stt(message);
                                    resolve('ok');
                                });
                            });
                        })();
                        if (compositeStt === 'cancel') {
                            resolve('cancel');
                        }
                    }
                    else {
                        resolve(message[0]);
                    }
                }
                else {
                    handlers.stt(message);
                }
            });
            sttPort.once('message', message => {
                if (compCmd) {
                    resolve([cmd, message]);
                }
                else {
                    resolve(message);
                }
            });
        });
    },
    // Outras funções no objeto `handlers`...
};
//# sourceMappingURL=a.js.map