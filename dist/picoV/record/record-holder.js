import { CustomError } from '../../utils/error.js';
export default class RecordHolder {
    constructor() {
        this.recordC = [];
        this.recordL = new Int16Array();
    }
    addRecord(frame) {
        this.recordC.push(frame);
    }
    setRecordL() {
        try {
            if (this.recordC.length === 0) {
                return;
            }
            const totalLength = this.recordC.reduce((acc, frame) => acc + frame.length, 0);
            const output = new Int16Array(totalLength);
            let offset = 0;
            for (const frame of this.recordC) {
                for (let i = 0; i * 512 < frame.length; i++) {
                    output.set(frame, offset);
                    offset += frame.length;
                }
            }
            this.recordL = output;
        }
        catch (error) {
            throw new CustomError('°Record holder failed: ' + error);
        }
    }
    getRecordC() {
        return this.recordC;
    }
    getRecordL() {
        return this.recordL;
    }
    clearRecord() {
        this.recordC = [];
        this.recordL = new Int16Array();
    }
}
//# sourceMappingURL=record-holder.js.map