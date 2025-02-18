import { Worker } from 'worker_threads';
import * as path from 'path';
import { CustomError } from '../utils/error.js';
export default class controlHandler {
    constructor() {
        try {
            this.control = new Worker(path.resolve('./dist/modules/recorder-worker.js'));
        }
        catch (err) {
            throw new CustomError('°Control Handler failed to init:', err, true);
        }
    }
    workerRequest(input, callback) {
        this.control.postMessage(input);
        return new Promise((resolve, reject) => {
            const onMessage = (message, wTransferable) => {
                if (message.caller === input.caller) {
                    const response = wTransferable
                        ? callback(message.wMessage, wTransferable)
                        : callback(message.wMessage);
                    this.control.removeListener('error', onError);
                    resolve(response);
                }
            };
            const onError = (error) => {
                if (error.caller === input.caller) {
                    this.control.removeListener('message', onMessage);
                    reject(`${error.caller} failed: ${error.error}`);
                }
            };
            this.control.once('message', onMessage);
            this.control.once('error', onError);
        });
    }
    async start() {
        const callback = (message) => {
            return message;
        };
        try {
            return this.workerRequest({ request: 'start', caller: 'Start' }, callback);
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
            return this.workerRequest({ request: 'idle', caller: 'Idle' }, callback);
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
            return this.workerRequest({ request: 'record', caller: 'Record' }, callback);
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
            return this.workerRequest({ request: 'cmdrecord', caller: 'CmdRecord' }, callback);
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
            return this.workerRequest({ request: 'wait', caller: 'Wait' }, callback);
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
            return this.workerRequest({ request: 'abortInfinityRecord', caller: 'AbortInfinityRecord' }, callback);
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
            return this.workerRequest({ request: 'abortInfinityRecord', caller: 'AbortInfinityRecord' }, callback);
        }
        catch (error) {
            throw new CustomError('*Control Handler turnoff failed: ', error);
        }
    }
}
//# sourceMappingURL=main-controller.js.map