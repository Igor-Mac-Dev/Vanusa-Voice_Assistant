import { Rhino } from '@picovoice/rhino-node';
import { CustomError } from '../../utils/error';
import * as conf from '../../configuration/conf';
import * as interfaces from '../../interfaces/config-json';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs from 'fs';

export default class RhinoSti extends EventEmitter {
   protected rhinos: string[];
   protected compositeCmds: number[];
   protected intentDetector: { [name: string]: Rhino } = {};
   protected config: interfaces.config = conf.readConfigFile();
   protected modelPath: string | undefined = undefined;
   protected intent: { intent: string; [slot: string]: string } = {
      intent: '',
      slot: '',
   };
   protected isComposite: boolean = false;

   constructor() {
      super();
      const rhinosArray: string[] = fs.readdirSync(
         path.resolve('assets/models/Rhino/' + this.config.LANGUAGE),
      );
      const compositArray: number[] = [];
      for (let i = 0; i < rhinosArray.length; i++) {
         if (rhinosArray[i].substring(0, 2) === 'C_') {
            compositArray.push(i);
         }
         rhinosArray[i] = path.join(
            path.resolve('assets/models/Rhino/'),
            this.config.LANGUAGE,
            rhinosArray[i],
         );
      }
      this.rhinos = rhinosArray;
      this.compositeCmds = compositArray;
      if (this.config.LANGUAGE === 'pt') {
         this.modelPath = path.join(
            path.resolve('assets/models'),
            'rhino_params_pt.pv',
         );
      }
   }

   public rhinoInit(): void {
      try {
         for (let i = 0; i < this.rhinos.length; i++) {
            if (this.compositeCmds.includes(i)) {
               this.intentDetector[`!${i}rhin`] = new Rhino(
                  this.config.PV_KEY,
                  this.rhinos[i],
                  this.config.SENSITIVITY[0],
                  0.6,
                  true,
                  this.modelPath,
               );
            } else {
               this.intentDetector[`${i}rhin`] = new Rhino(
                  this.config.PV_KEY,
                  this.rhinos[i],
                  this.config.SENSITIVITY[0],
                  0.6,
                  true,
                  this.modelPath,
               );
            }
         }
      } catch (err) {
         throw new CustomError('°Rhino failed to init:' + err);
      }
   }

   public processAudio(frame: Int16Array): void {
      try {
         for (const [name, rhino] of Object.entries(this.intentDetector)) {
            const result = rhino.process(frame);
            if (result) {
               const inference = rhino.getInference();
               if (inference.intent) {
                  this.intent.intent = inference.intent;
                  if (name.substring(0, 1) === '!') {
                     this.isComposite = true;
                  } else {
                     this.isComposite = false;
                  }
                  if (inference.slots) {
                     this.intent.slot = JSON.stringify(inference.slots);
                  }
                  this.emit('RHINO_cmd', this.intent);
               }
            }
         }
      } catch (err) {
         throw new CustomError('°Rhino failed to process audio:' + err);
      }
   }

   public getIntent(): [{ intent: string; [slot: string]: string }, boolean] {
      const result: [{ intent: string; [slot: string]: string }, boolean] = [
         this.intent,
         this.isComposite,
      ];
      this.intentDetector = {};
      this.isComposite = false;
      return result;
   }

   public rhinoRelease(): void {
      try {
         for (const [name, rhino] of Object.entries(this.intentDetector)) {
            rhino.release();
         }
         this.intentDetector = {};
      } catch (err) {
         throw new CustomError('°Rhino failed to release:' + err);
      }
   }
}
