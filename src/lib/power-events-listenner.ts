import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { CustomError } from '../utils/error.js';
import { exec } from 'child_process';

class PowerEventsMenager {
   private serviceName: string = 'VANUSA_PowerMonitorService';

   public startService(): Promise<void> {
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

   public stopService(): Promise<void> {
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
   private ws: WebSocket | null = null;
   private hasSuspended: boolean = false;
   private serviceMenager: PowerEventsMenager;
   constructor() {
      super();
      try {
         this.serviceMenager = new PowerEventsMenager();
      } catch (err) {
         throw new CustomError(
            'Error connecting to the PowerMonitorService:',
            err,
         );
      }
   }

   public async startPowerMonitor(): Promise<void> {
      try {
         // await this.serviceMenager.startService();
         this.ws = new WebSocket('ws://127.0.0.1:18080');
         this.ws.on('open', () => {
            this.emit('open');
         });

         this.ws.on('message', data => {
            if (data.toString() === 'suspend') {
               this.emit('suspend');
            } else if (data.toString() === 'resume') {
               this.emit('resume');
            }
         });

         this.ws.on('close', () => {
            this.emit('close');
         });

         this.ws.on('error', err => {
            this.emit('error', err);
         });
      } catch (err) {
         throw new CustomError(
            'Error setting up PowerMonitorService listeners: ',
            err,
         );
      }
   }

   public async stopPowerMonitor(): Promise<void> {
      try {
         this.ws?.close();
         this.ws?.removeAllListeners();
         this.ws?.terminate();
         this.serviceMenager.stopService();
      } catch (err) {
         throw new CustomError(
            'Error closing PowerMonitorService connection: ',
            err,
         );
      }
   }

   public suspend(): void {
      this.hasSuspended = true;
   }

   public resume(): void {
      this.hasSuspended = false;
   }

   public getPowerStatus(): boolean {
      return this.hasSuspended;
   }
}
