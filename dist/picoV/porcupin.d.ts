import { EventEmitter } from 'events';
export default class PorcupineDetector extends EventEmitter {
    protected useCase: number;
    private kwDetector;
    constructor(useCase: any);
    porcupineInit(): void;
    processFrame(frame: Int16Array): void;
    porcupineRelease(): void;
}
