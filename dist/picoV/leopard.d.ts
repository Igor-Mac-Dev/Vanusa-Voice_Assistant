import { Leopard } from '@picovoice/leopard-node';
export default class LeopardStt {
    protected transcriptor: Leopard | null;
    text: string;
    leopardInit(): void;
    leopardRelease(): void;
    processAudio(record: Int16Array): void;
}
