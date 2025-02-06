import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { CustomError } from '../utils/error.js';
import { exec } from 'child_process';
class PowerEventsMenager {
    constructor() {
        this.serviceName = 'VANUSA_PowerMonitorService';
    }
    startService() {
        return new Promise((resolve, reject) => {
            exec(`sc start ${this.serviceName}`, error => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    stopService() {
        return new Promise((resolve, reject) => {
            exec(`sc stop ${this.serviceName}`, error => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
}
export default class PowerEvents extends EventEmitter {
    constructor() {
        super();
        this.ws = null;
        this.hasSuspended = false;
        try {
            this.serviceMenager = new PowerEventsMenager();
        }
        catch (err) {
            throw new CustomError('Error connecting to the PowerMonitorService:', err);
        }
    }
    async startPowerMonitor() {
        try {
            // await this.serviceMenager.startService();
            this.ws = new WebSocket('ws://127.0.0.1:18080');
            this.ws.on('open', () => {
                this.emit('open');
            });
            this.ws.on('message', data => {
                if (data.toString() === 'suspend') {
                    this.emit('suspend');
                }
                else if (data.toString() === 'resume') {
                    this.emit('resume');
                }
            });
            this.ws.on('close', () => {
                this.emit('close');
            });
            this.ws.on('error', err => {
                this.emit('error', err);
            });
        }
        catch (err) {
            throw new CustomError('Error setting up PowerMonitorService listeners: ', err);
        }
    }
    async stopPowerMonitor() {
        try {
            this.ws?.close();
            this.ws?.removeAllListeners();
            this.ws?.terminate();
            this.serviceMenager.stopService();
        }
        catch (err) {
            throw new CustomError('Error closing PowerMonitorService connection: ', err);
        }
    }
    suspend() {
        this.hasSuspended = true;
    }
    resume() {
        this.hasSuspended = false;
    }
    getPowerStatus() {
        return this.hasSuspended;
    }
}
//# sourceMappingURL=power-events-listenner.js.map