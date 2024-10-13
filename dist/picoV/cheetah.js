import { Cheetah } from '@picovoice/cheetah-node';
import { CustomError } from '../utils/error';
import * as conf from '../configuration/conf';
const config = conf.readConfigFile();
export default class CheetahStt {
    constructor() {
        this.transcriptor = null;
        this.text = '';
        this.available = config.CHEETAH_AVAILABLE;
    }
    cheetahInit() {
        try {
            this.transcriptor = new Cheetah(config.PV_KEY, {
                modelPath: config.CHEETAH,
                libraryPath: undefined,
                endpointDurationSec: 10,
                enableAutomaticPunctuation: true,
            });
        }
        catch (err) {
            throw new CustomError('°Cheetah failed to init: ' + err);
        }
    }
    cheetahRelease() {
        try {
            if (this.transcriptor) {
                this.text = '';
                this.transcriptor.release();
                this.transcriptor = null;
            }
        }
        catch (err) {
            throw new CustomError('°Cheetah failed to release: ' + err);
        }
    }
    processAudio(record) {
        if (this.transcriptor) {
            try {
                for (let i = 0; i < record.length; i++) {
                    const result = this.transcriptor.process(record[i]);
                    if (typeof result[0] === 'string' && result[0].trim() !== '') {
                        this.text += result[0];
                    }
                }
                const flush = this.transcriptor.flush();
                if (flush.trim() !== '') {
                    this.text += flush;
                }
            }
            catch (err) {
                throw new CustomError('°Cheetah failed to process audio: ' + err);
            }
        }
        else {
            console.log('Cheetah not available, please init it');
        }
    }
}
//# sourceMappingURL=cheetah.js.map