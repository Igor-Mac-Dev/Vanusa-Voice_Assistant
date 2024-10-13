import { Orca } from '@picovoice/orca-node';
import { CustomError } from '../utils/error';
import * as conf from '../configuration/conf';
import makeWav from '../utils/wav-maker';
export default class OrcaTts {
    constructor() {
        this.config = conf.readConfigFile();
        this.orca = null;
        this.wavBuffer = new Int16Array();
    }
    orcaInit() {
        try {
            this.orca = new Orca(this.config.PV_KEY);
        }
        catch (err) {
            throw new CustomError('°Orca failed to init:' + err);
        }
    }
    async generateAudio(text, usecase) {
        try {
            this.orcaInit();
            if (this.orca) {
                const pcmHolder = this.orca.synthesize(text);
                this.wavBuffer = pcmHolder.pcm;
                await makeWav(this.wavBuffer, 22000, usecase);
                this.orcaRelease();
            }
        }
        catch (err) {
            this.orcaRelease();
            throw new CustomError('°Orca failed to generate audio:' + err);
        }
    }
    orcaRelease() {
        try {
            if (this.orca) {
                this.wavBuffer = new Int16Array();
                this.orca.release();
                this.orca = null;
            }
        }
        catch (err) {
            throw new CustomError('°Orca failed to release:' + err);
        }
    }
}
//# sourceMappingURL=orca.js.map