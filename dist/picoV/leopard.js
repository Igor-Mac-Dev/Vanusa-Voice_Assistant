import { Leopard } from '@picovoice/leopard-node';
import { CustomError } from '../utils/error.js';
import * as conf from '../configuration/conf.js';
const config = conf.readConfigFile();
export default class LeopardStt {
    constructor() {
        this.transcriptor = null;
        this.text = '';
    }
    leopardInit() {
        try {
            this.transcriptor = new Leopard(config.PV_KEY, {
                modelPath: config.LEOPARD,
            });
        }
        catch (err) {
            throw new CustomError('°Cheetah failed to init:' + err);
        }
    }
    leopardRelease() {
        if (this.transcriptor) {
            try {
                this.text = '';
                this.transcriptor.release();
                this.transcriptor = null;
            }
            catch (err) {
                throw new CustomError('°Leopard failed to release:' + err);
            }
        }
    }
    processAudio(record) {
        if (this.transcriptor) {
            const result = this.transcriptor.process(record);
            if (typeof result.transcript === 'string' &&
                result.transcript.trim() !== '') {
                this.text = result.transcript;
            }
        }
    }
}
//# sourceMappingURL=leopard.js.map