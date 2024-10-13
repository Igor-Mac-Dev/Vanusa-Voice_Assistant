import { Cheetah } from '@picovoice/cheetah-node';
export default class CheetahStt {
    protected transcriptor: Cheetah | null;
    text: string;
    private available;
    cheetahInit(): void;
    cheetahRelease(): void;
    processAudio(record: Array<Int16Array>): void;
}
