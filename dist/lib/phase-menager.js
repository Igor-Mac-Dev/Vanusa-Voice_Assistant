import errorLog from '../utils/error.js';
export default class PhaseMenager {
    constructor() {
        this.mPhase = 'start';
        this.abruptMainChange = false;
        this.abruptSubChange = false;
        this.abortCurrentPhase = false;
    }
    getPhase() {
        return this.mPhase;
    }
    getSubPhase() {
        return this.sPhase;
    }
    setPhase(phase, caller) {
        if (this.abruptMainChange) {
            errorLog(`Possible Error: Abrupt phase change of ${this.mPhase} to ${phase} by ${caller}`);
        }
        this.mPhase = phase;
        this.abruptMainChange = true;
        setTimeout(() => {
            this.abruptMainChange = false;
        }, 500);
    }
    setSubPhase(phase, caller) {
        if (this.abruptSubChange) {
            errorLog(`Possible Error: Abrupt sub-phase change of ${this.sPhase} to ${phase} by ${caller}`);
        }
        this.sPhase = phase;
        this.abruptSubChange = true;
        setTimeout(() => {
            this.abruptSubChange = false;
        }, 500);
    }
    getAbortCurrentPhase() {
        return this.abortCurrentPhase;
    }
    setAbortCurrentPhaseTrue() {
        this.abortCurrentPhase = true;
    }
    setAbortCurrentPhaseFalse() {
        this.abortCurrentPhase = false;
    }
}
//# sourceMappingURL=phase-menager.js.map