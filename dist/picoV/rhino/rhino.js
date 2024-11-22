import { Rhino } from '@picovoice/rhino-node';
import { CustomError } from '../../utils/error.js';
import { readConfigFile } from '../../configuration/conf.js';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs from 'fs';
export default class RhinoSti extends EventEmitter {
    constructor() {
        super();
        this.intentDetector = {};
        this.config = readConfigFile();
        this.modelPath = undefined;
        this.intent = {
            intent: '',
            slots: '',
        };
        this.isComposite = false;
        const rhinosArray = fs.readdirSync(path.resolve('assets/models/Rhino/' + this.config.LANGUAGE));
        const compositArray = [];
        for (let i = 0; i < rhinosArray.length; i++) {
            if (rhinosArray[i].substring(0, 2) === 'C_') {
                compositArray.push(i);
            }
            rhinosArray[i] = path.join(path.resolve('assets/models/Rhino/'), this.config.LANGUAGE, rhinosArray[i]);
        }
        this.rhinos = rhinosArray;
        this.compositeCmds = compositArray;
        if (this.config.LANGUAGE === 'pt') {
            this.modelPath = path.join(path.resolve('assets/models'), 'rhino_params_pt.pv');
        }
    }
    rhinoInit() {
        try {
            for (let i = 0; i < this.rhinos.length; i++) {
                if (this.compositeCmds.includes(i)) {
                    this.intentDetector[`!${i}rhin`] = new Rhino(this.config.PV_KEY, this.rhinos[i], this.config.SENSITIVITY, 0.9, true, this.modelPath);
                }
                else {
                    this.intentDetector[`${i}rhin`] = new Rhino(this.config.PV_KEY, this.rhinos[i], this.config.SENSITIVITY, 0.9, true, this.modelPath);
                }
            }
        }
        catch (err) {
            throw new CustomError('°Rhino failed to init:' + err);
        }
    }
    processAudio(frame) {
        try {
            for (const [name, Rhino] of Object.entries(this.intentDetector)) {
                const result = Rhino.process(frame);
                if (result) {
                    const inference = Rhino.getInference();
                    if (inference.intent) {
                        this.intent.intent = inference.intent;
                        if (name.substring(0, 1) === '!') {
                            this.isComposite = true;
                        }
                        else {
                            this.isComposite = false;
                        }
                        if (inference.slots) {
                            this.intent.slots = JSON.stringify(inference.slots);
                        }
                        this.emit('RHINO_cmd', this.intent);
                    }
                }
            }
        }
        catch (err) {
            throw new CustomError('°Rhino failed to process audio:' + err);
        }
    }
    getIntent() {
        const result = [
            this.intent,
            this.isComposite,
        ];
        this.isComposite = false;
        this.intent = {
            intent: '',
            slots: '',
        };
        return result;
    }
    rhinoRelease() {
        try {
            for (const [name, rhino] of Object.entries(this.intentDetector)) {
                rhino.release();
            }
            this.intentDetector = {};
        }
        catch (err) {
            throw new CustomError('°Rhino failed to release:' + err);
        }
    }
}
//# sourceMappingURL=rhino.js.map