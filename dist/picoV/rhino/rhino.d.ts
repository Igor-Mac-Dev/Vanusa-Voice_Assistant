import { Rhino } from '@picovoice/rhino-node';
import * as interfaces from '../../interfaces/config-json';
import { EventEmitter } from 'events';
export default class RhinoSti extends EventEmitter {
    protected rhinos: string[];
    protected compositeCmds: number[];
    protected intentDetector: {
        [name: string]: Rhino;
    };
    protected config: interfaces.config;
    protected modelPath: string | undefined;
    protected intent: {
        intent: string;
        [slot: string]: string;
    };
    protected isComposite: boolean;
    constructor();
    rhinoInit(): void;
    processAudio(frame: Int16Array): void;
    getIntent(): [{
        intent: string;
        [slot: string]: string;
    }, boolean];
    rhinoRelease(): void;
}
