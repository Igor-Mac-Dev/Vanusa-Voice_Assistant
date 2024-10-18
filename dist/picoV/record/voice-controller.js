import FramesEmitter from './frames-emitter.js';
import PorcupineDetector from '../porcupin.js';
import CobraDetector from '../cobra.js';
import RecordHolder from './record-holder.js';
import RhinoSti from '../rhino/rhino.js';
import * as conf from '../../configuration/conf.js';
import makeWav from '../../utils/wav-maker.js';
export default class VoiceController {
    constructor() {
        this.config = conf.readConfigFile();
        this.idleRec = new FramesEmitter(this.config.FRAME_LENGHT, this.config.SAMPLE_RATE, true, 0, this.config.SELECTED_DEVICE);
        this.sttRec = new FramesEmitter(this.config.FRAME_LENGHT, this.config.SAMPLE_RATE, false, this.config.RECORD_TIME, this.config.SELECTED_DEVICE);
        this.kwDetector = new PorcupineDetector(1);
        this.cancelDetector = new PorcupineDetector(2);
        this.cobra = new CobraDetector();
        this.rec = new RecordHolder();
        this.rhino = new RhinoSti();
        //////////////////////////////////////////////////////////////////////////////
    }
    getIntent() {
        return [this.rhino.getIntent()[0], this.rhino.getIntent()[1]];
    }
    async start() {
        return new Promise(resolve => {
            this.rhino.rhinoInit();
            resolve('started');
        });
    }
    //////////////////////////////////////////////////////////////////////////////
    async idlePhase() {
        return new Promise(resolve => {
            this.phase = 'idle';
            this.idleRec.startFramesEmittion();
            this.idleRec.on('REC_start', () => {
                this.kwDetector.porcupineInit();
            });
            this.idleRec.on('frame', frame => {
                this.kwDetector.processFrame(frame);
            });
            this.idleRec.on('REC_failed', err => {
                throw err;
            });
            this.kwDetector.on('PPN_keyword', async (kw) => {
                this.idleRec.setInfinityOff();
                this.kwDetector.porcupineRelease();
                switch (kw) {
                    // case 3:
                    //     resolve('repeat');
                    //  case 4:
                    //     resolve('repeat_last');
                    case 1:
                        resolve('repeat');
                        break;
                    case 2:
                        resolve('repeat_last');
                        break;
                    default:
                        resolve('record');
                        break;
                }
            });
        });
    }
    //////////////////////////////////////////////////////////////////////////////
    async recordPhase() {
        return new Promise(resolve => {
            this.phase = 'record';
            this.sttRec.startFramesEmittion();
            this.sttRec.on('REC_start', () => {
                this.rec.clearRecord();
                this.cobra.cobraInit();
                this.cancelDetector.porcupineInit();
            });
            this.sttRec.on('frame', frame => {
                this.rec.addRecord(frame);
                this.rhino.processAudio(frame);
                this.cobra.processFrame(frame);
                this.cancelDetector.processFrame(frame);
            });
            this.sttRec.on('REC_failed', err => {
                throw err;
            });
            this.cancelDetector.on('PPN_keyword', () => {
                this.sttRec.stopTimedRecording();
                this.cobra.cobraRelease();
                this.cancelDetector.porcupineRelease();
                resolve('cancel');
            });
            this.cobra.on('COBRA_stoped_talk', async () => {
                this.sttRec.stopTimedRecording();
                this.rec.setRecordL();
                await makeWav(this.rec.getRecordL());
                this.cobra.cobraRelease();
                this.cancelDetector.porcupineRelease();
                resolve('stt');
            });
            this.rhino.on('RHINO_cmd', () => {
                this.sttRec.stopTimedRecording();
                resolve('cmd'); //logica composit ak
            });
        });
    }
    //////////////////////////////////////////////////////////////////////////////
    async waitPhase() {
        return new Promise(resolve => {
            this.phase = 'wait';
            this.idleRec.startFramesEmittion();
            this.idleRec.on('REC_start', () => {
                this.cancelDetector.porcupineInit();
            });
            this.idleRec.on('frame', frame => {
                this.cancelDetector.processFrame(frame);
            });
            this.cancelDetector.on('PPN_keyword', async () => {
                this.idleRec.setInfinityOff();
                this.cancelDetector.porcupineRelease();
                resolve('cancel');
            });
        });
    }
    //////////////////////////////////////////////////////////////////////////////
    async compositeRecordPhase() {
        return new Promise(resolve => {
            this.phase = 'compositeRecord';
            this.sttRec.startFramesEmittion();
            this.sttRec.on('REC_start', () => {
                this.rec.clearRecord();
                this.cobra.cobraInit();
                this.cancelDetector.porcupineInit();
            });
            this.sttRec.on('frame', frame => {
                this.rec.addRecord(frame);
                this.rhino.processAudio(frame);
                this.cobra.processFrame(frame);
                this.cancelDetector.processFrame(frame);
            });
            this.sttRec.on('REC_failed', err => {
                throw err;
            });
            this.cancelDetector.on('PPN_keyword', () => {
                this.sttRec.stopTimedRecording();
                this.cobra.cobraRelease();
                this.cancelDetector.porcupineRelease();
                resolve('cancel');
            });
            this.cobra.on('COBRA_stoped_talk', async () => {
                this.sttRec.stopTimedRecording();
                this.rec.setRecordL();
                await makeWav(this.rec.getRecordL());
                this.cobra.cobraRelease();
                this.cancelDetector.porcupineRelease();
                resolve('stt');
            });
        });
    }
    //////////////////////////////////////////////////////////////////////////////
    async cancel(turnoff) {
        return new Promise(resolve => {
            switch (this.phase) {
                case 'idle':
                    this.idleRec.setInfinityOff();
                    this.kwDetector.porcupineRelease();
                    break;
                case 'record':
                    this.sttRec.stopTimedRecording();
                    this.cobra.cobraRelease();
                    this.cancelDetector.porcupineRelease();
                    this.rec.clearRecord();
                    break;
                case 'wait':
                    this.idleRec.setInfinityOff();
                    this.cancelDetector.porcupineRelease();
                    break;
                case 'compositeRecord':
                    this.sttRec.stopTimedRecording();
                    this.cobra.cobraRelease();
                    this.cancelDetector.porcupineRelease();
                    this.rec.clearRecord();
                    break;
            }
            if (turnoff) {
                this.rhino.rhinoRelease();
            }
        });
    }
}
//# sourceMappingURL=voice-controller.js.map