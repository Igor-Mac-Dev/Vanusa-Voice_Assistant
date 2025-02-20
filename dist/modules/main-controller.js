import { Worker } from 'worker_threads';
import * as path from 'path';
import { CustomError } from '../utils/error.js';
export default class controlHandler {
    constructor() {
        this.ready = false;
        try {
            this.control = new Worker(path.resolve('./dist/modules/recorder-worker.js'));
            this.control.once('message', message => {
                if (message === 'ready') {
                    setTimeout(() => {
                        this.ready = true;
                    }, 100);
                }
                else {
                    throw new CustomError('Control Handler failed to init: ', message, true);
                }
            });
            this.control.on('message', message => {
                console.log('control global listenner: ' + JSON.stringify(message));
                console.log('listns ' + this.control.listenerCount('message'));
            });
        }
        catch (err) {
            throw new CustomError('°Control Handler failed to init:', err, true);
        }
    }
    workerRequest(input, callback) {
        return new Promise((resolve, reject) => {
            const onMessage = (message, wTransferable) => {
                console.log(`control message: ${JSON.stringify(message)}`);
                if (message.caller === input.caller) {
                    this.control.removeListener('error', onError);
                    this.control.removeListener('message', onMessage);
                    const response = wTransferable
                        ? callback(message.wMessage, wTransferable)
                        : callback(message.wMessage);
                    console.log(`resolving: ${response}`);
                    resolve(response);
                }
            };
            const onError = (error) => {
                if (error.caller === input.caller) {
                    this.control.removeListener('message', onMessage);
                    reject(`${error.caller} failed: ${error.error}`);
                }
            };
            this.control.on('message', onMessage);
            console.log('setin listns ' +
                input.caller +
                this.control.listenerCount('message'));
            this.control.on('error', onError);
            console.log('msg sent:', JSON.stringify(input));
            this.control.postMessage(input);
        });
    }
    async waitForReady() {
        if (this.ready)
            return;
        return new Promise(resolve => {
            const checkReady = () => {
                if (this.ready) {
                    resolve();
                }
                else {
                    setTimeout(checkReady, 50);
                }
            };
            checkReady();
        });
    }
    async start() {
        const callback = (message) => {
            console.log('callback fds ' + JSON.stringify(message));
            return message;
        };
        try {
            await this.waitForReady();
            return await this.workerRequest({ request: 'start', caller: 'Start' }, callback);
        }
        catch (error) {
            throw new CustomError('*Control Handler starter failed: ', error);
        }
    }
    async idle() {
        const callback = (message) => {
            return message;
        };
        try {
            return await this.workerRequest({ request: 'idle', caller: 'Idle' }, callback);
        }
        catch (error) {
            throw new CustomError('*Control Handler starter failed: ', error);
        }
    }
    async record() {
        const callback = (message) => {
            return message;
        };
        try {
            return await this.workerRequest({ request: 'record', caller: 'Record' }, callback);
        }
        catch (error) {
            throw new CustomError('*Control Handler starter failed: ', error);
        }
    }
    async compositeCmd() {
        const callback = (message) => {
            return message;
        };
        try {
            return await this.workerRequest({ request: 'cmdrecord', caller: 'CmdRecord' }, callback);
        }
        catch (error) {
            throw new CustomError('*Control Handler compositeCmd failed: ', error);
        }
    }
    async wait() {
        const callback = (message) => {
            return message;
        };
        try {
            return await this.workerRequest({ request: 'wait', caller: 'Wait' }, callback);
        }
        catch (error) {
            throw new CustomError('*Control Handler wait failed: ', error);
        }
    }
    async abortInfinityRecord() {
        const callback = (message) => {
            return message;
        };
        try {
            return await this.workerRequest({ request: 'abortInfinityRecord', caller: 'AbortInfinityRecord' }, callback);
        }
        catch (error) {
            throw new CustomError('*Control Handler wait failed: ', error);
        }
    }
    async abort() { }
    async turnoff() {
        const callback = (message) => {
            return message;
        };
        try {
            return await this.workerRequest({ request: 'abortInfinityRecord', caller: 'AbortInfinityRecord' }, callback);
        }
        catch (error) {
            throw new CustomError('*Control Handler turnoff failed: ', error);
        }
    }
}
//# sourceMappingURL=main-controller.js.map