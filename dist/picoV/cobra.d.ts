import { Cobra } from '@picovoice/cobra-node';
import { EventEmitter } from 'events';
export default class CobraDetector extends EventEmitter {
    protected activityDetector: Cobra | null;
    protected average: number[];
    protected stillTalking: number[];
    constructor();
    cobraInit(): void;
    cobraRelease(): void;
    processFrame(frame: Int16Array): void;
}
