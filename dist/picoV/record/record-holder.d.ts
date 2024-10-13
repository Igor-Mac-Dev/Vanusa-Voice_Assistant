export default class RecordHolder {
    protected recordC: Int16Array[];
    protected recordL: Int16Array;
    constructor();
    addRecord(frame: Int16Array): void;
    setRecordL(): void;
    getRecordC(): Int16Array[];
    getRecordL(): Int16Array;
    clearRecord(): void;
}
