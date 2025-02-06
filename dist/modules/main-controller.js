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
    async start() {
        try {
            this.control.postMessage('start');
            return new Promise((resolve, reject) => {
                this.control.once('message', () => {
                    this.control.removeAllListeners('error');
                    resolve('started');
                });
                this.control.once('error', error => {
                    this.control.removeAllListeners('message');
                    reject('Control init failed.' + error);
                });
            });
        }
        catch (error) {
            throw new CustomError('*Control Handler starter failed: ', error);
        }
    }
    async idle() {
        this.control.postMessage('idle');
        return new Promise((resolve, reject) => {
            this.control.once('message', message => {
                this.control.removeAllListeners('error');
                resolve(message);
            });
            this.control.once('error', error => {
                console.error('Communication error with voice controller: ', error);
                this.control.removeAllListeners('message');
                reject(error);
            });
        });
    }
    async record() {
        this.control.postMessage('record');
        return new Promise((resolve, reject) => {
            this.control.once('message', async (message) => {
                setTimeout(() => {
                    this.control.removeAllListeners('error');
                }, 500);
                resolve(message);
            });
            this.control.once('error', error => {
                console.error('Communication error with voice controller: ', error);
                this.control.removeAllListeners('message');
                reject(error);
            });
        });
    }
    async compositeCmd() {
        try {
            this.control.postMessage('cmdrecord');
            return new Promise((resolve, reject) => {
                this.control.once('message', message => {
                    this.control.removeAllListeners('message');
                    this.control.removeAllListeners('error');
                    if (message === 'cancel') {
                        resolve('cancel');
                    }
                    resolve(message);
                });
                this.control.once('error', error => {
                    console.error('Communication error with voice controller: ', error);
                    this.control.removeAllListeners('message');
                    this.control.removeAllListeners('error');
                    reject(error);
                });
            });
        }
        catch (error) {
            throw new CustomError('*Control Handler compositeCmd failed: ', error);
        }
    }
    async wait() {
        try {
            this.control.postMessage('wait');
            this.control.removeAllListeners('message');
            return new Promise((resolve, reject) => {
                this.control.once('message', message => {
                    this.control.removeAllListeners('message');
                    this.control.removeAllListeners('error');
                    resolve(message);
                });
                this.control.once('error', error => {
                    console.error('Communication error with voice controller: ', error);
                    this.control.removeAllListeners('message');
                    this.control.removeAllListeners('error');
                    reject(error);
                });
            });
        }
        catch (error) {
            throw new CustomError('*Control Handler wait failed: ', error);
        }
    }
    async abortInfinityRecord() {
        this.control.postMessage('abortInfinityRecord');
        return new Promise((resolve, reject) => {
            this.control.once('message', message => {
                this.control.removeAllListeners('error');
                resolve(message);
            });
            this.control.once('error', error => {
                this.control.removeAllListeners('message');
                reject(error);
            });
        });
    }
    async abort() { }
    async turnoff() {
        try {
            await this.control.postMessage('turnoff');
            this.control.terminate();
        }
        catch (error) {
            throw new CustomError('*Control Handler turnoff failed: ', error);
        }
    }
}
//# sourceMappingURL=main-controller.js.map