import { Porcupine } from '@picovoice/porcupine-node';
import { CustomError } from '../utils/error.js';
import { EventEmitter } from 'events';
import * as conf from '../configuration/conf.js';
const config = conf.readConfigFile();
export default class PorcupineDetector extends EventEmitter {
    constructor(useCase) {
        super();
        this.kwDetector = null;
        this.useCase = useCase;
    }
    porcupineInit() {
        let wakewords = [];
        const sensitivity = [];
        switch (this.useCase) {
            case 1:
                wakewords = [...config.PPN_WW, ...config.PPN_REPEAT];
                break;
            case 2:
                wakewords = [...config.PPN_CANCEL];
                break;
            default:
                throw new CustomError('°PPN invalid use case');
        }
        wakewords.forEach(() => {
            sensitivity.push(config.SENSITIVITY);
        });
        this.kwDetector = new Porcupine(config.PV_KEY, wakewords, sensitivity, config.PPN);
    }
    processFrame(frame) {
        if (this.kwDetector) {
            const keyWordIndex = this.kwDetector.process(frame);
            if (keyWordIndex >= 0) {
                this.emit('PPN_keyword', keyWordIndex);
            }
        }
    }
    porcupineRelease() {
        if (this.kwDetector) {
            this.kwDetector.release();
            this.kwDetector = null;
        }
    }
}
//# sourceMappingURL=porcupin.js.map