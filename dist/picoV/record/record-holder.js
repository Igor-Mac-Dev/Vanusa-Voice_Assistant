import { CustomError } from '../../utils/error.js';
export default class RecordHolder {
    constructor() {
        this.recordC = [];
    }
    addRecord(frame) {
        this.recordC.push(frame);
    }
    getRecordC() {
        return this.recordC;
    }
    clearRecord() {
        this.recordC = [];
    }
}
export function convertRecordL(recordC) {
    try {
        if (recordC.length === 0) {
            return;
        }
        const totalLength = recordC.reduce((acc, frame) => acc + frame.length, 0);
        const output = new Int16Array(totalLength);
        let offset = 0;
        for (const frame of recordC) {
            for (let i = 0; i * 512 < frame.length; i++) {
                output.set(frame, offset);
                offset += frame.length;
            }
        }
        return output;
    }
    catch (error) {
        throw new CustomError('°Record holder failed: ' + error);
    }
}
//# sourceMappingURL=record-holder.js.map