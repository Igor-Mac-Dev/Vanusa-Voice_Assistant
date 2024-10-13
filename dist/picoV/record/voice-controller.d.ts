import FramesEmitter from './frames-emitter';
import PorcupineDetector from '../porcupin';
import CobraDetector from '../cobra';
import RecordHolder from './record-holder';
import RhinoSti from '../rhino/rhino';
import * as interfaces from '../../interfaces/config-json';
export default class VoiceController {
    protected config: interfaces.config;
    protected idleRec: FramesEmitter;
    protected sttRec: FramesEmitter;
    protected kwDetector: PorcupineDetector;
    protected cancelDetector: PorcupineDetector;
    protected cobra: CobraDetector;
    rec: RecordHolder;
    protected rhino: RhinoSti;
    protected phase: 'idle' | 'record' | 'wait' | 'compositeRecord' | undefined;
    getIntent(): [{
        intent: string;
        [slot: string]: string;
    }, boolean];
    start(): Promise<string>;
    idlePhase(): Promise<string>;
    recordPhase(): Promise<string>;
    waitPhase(): Promise<string>;
    compositeRecordPhase(): Promise<string>;
    cancel(turnoff?: boolean): Promise<string>;
}
