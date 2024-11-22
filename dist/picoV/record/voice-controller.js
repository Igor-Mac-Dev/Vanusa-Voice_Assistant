import FramesEmitter from './frames-emitter.js';
import PorcupineDetector from '../porcupin.js';
import CobraDetector from '../cobra.js';
import RecordHolder from './record-holder.js';
import RhinoSti from '../rhino/rhino.js';
import { readConfigFile } from '../../configuration/conf.js';
import makeWav from '../../utils/wav-maker.js';
export default class VoiceController {
    constructor() {
        this.config = readConfigFile();
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
        return this.rhino.getIntent();
    }
    removeAllListeners() {
        this.idleRec.removeAllListeners();
        this.sttRec.removeAllListeners();
        this.kwDetector.removeAllListeners();
        this.cancelDetector.removeAllListeners();
        this.cobra.removeAllListeners();
        this.rhino.removeAllListeners();
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
            this.idleRec.setInfinityOn();
            this.idleRec.startFramesEmittion();
            this.idleRec.once('REC_start', () => {
                this.kwDetector.porcupineInit();
            });
            this.idleRec.on('frame', frame => {
                this.kwDetector.processFrame(frame);
            });
            this.idleRec.once('REC_failed', err => {
                clearTimeout(memoryMercy);
                throw err;
            });
            this.kwDetector.once('PPN_keyword', async (kw) => {
                clearTimeout(memoryMercy);
                this.idleRec.setInfinityOff();
                this.kwDetector.porcupineRelease();
                switch (kw) {
                    case 3:
                        resolve('repeat');
                        break;
                    case 4:
                        resolve('repeat_last');
                        break;
                    default:
                        resolve('record');
                        break;
                }
            });
            const memoryMercy = setTimeout(() => {
                this.idleRec.setInfinityOff();
                this.kwDetector.porcupineRelease();
                resolve('loop');
            }, 600000);
        });
    }
    //////////////////////////////////////////////////////////////////////////////
    async recordPhase() {
        return new Promise(resolve => {
            this.phase = 'record';
            this.sttRec.startFramesEmittion();
            this.sttRec.once('REC_start', () => {
                this.cobra.cobraInit();
                this.cancelDetector.porcupineInit();
            });
            this.sttRec.on('frame', frame => {
                this.rec.addRecord(frame);
                this.rhino.processAudio(frame);
                this.cobra.processFrame(frame);
                this.cancelDetector.processFrame(frame);
            });
            this.sttRec.once('REC_failed', err => {
                console.error('REC_failed: ', err);
                throw err;
            });
            this.cancelDetector.once('PPN_keyword', () => {
                this.sttRec.stopTimedRecording();
                this.cobra.cobraRelease();
                this.cancelDetector.porcupineRelease();
                resolve('cancel');
            });
            this.cobra.once('COBRA_stoped_talk', async () => {
                this.sttRec.stopTimedRecording();
                this.rec.setRecordL();
                if (this.config.STT_ENGINE === 'Whisper')
                    await makeWav(this.rec.getRecordL());
                this.cobra.cobraRelease();
                this.cancelDetector.porcupineRelease();
                resolve('stt');
            });
            this.rhino.once('RHINO_cmd', () => {
                this.sttRec.stopTimedRecording();
                this.cobra.cobraRelease();
                this.cancelDetector.porcupineRelease();
                resolve('cmd');
            });
        });
    }
    //////////////////////////////////////////////////////////////////////////////
    async waitPhase() {
        return new Promise(resolve => {
            this.phase = 'wait';
            this.idleRec.startFramesEmittion();
            this.idleRec.once('REC_start', () => {
                this.cancelDetector.porcupineInit();
            });
            this.idleRec.on('frame', frame => {
                this.cancelDetector.processFrame(frame);
            });
            this.cancelDetector.once('PPN_keyword', async () => {
                clearTimeout(memoryMercy);
                this.idleRec.setInfinityOff();
                this.cancelDetector.porcupineRelease();
                resolve('cancel');
            });
            const memoryMercy = setTimeout(() => {
                this.idleRec.setInfinityOff();
                this.kwDetector.porcupineRelease();
                resolve('loop');
            }, 600000);
        });
    }
    //////////////////////////////////////////////////////////////////////////////
    async compositeRecordPhase() {
        return new Promise(resolve => {
            this.phase = 'compositeRecord';
            this.sttRec.startFramesEmittion();
            this.sttRec.once('REC_start', () => {
                this.cobra.cobraInit();
                this.cancelDetector.porcupineInit();
            });
            this.sttRec.on('frame', frame => {
                this.rec.addRecord(frame);
                this.cobra.processFrame(frame);
                this.cancelDetector.processFrame(frame);
            });
            this.sttRec.once('REC_failed', err => {
                throw err;
            });
            this.cancelDetector.once('PPN_keyword', () => {
                this.sttRec.stopTimedRecording();
                this.cobra.cobraRelease();
                this.cancelDetector.porcupineRelease();
                resolve('cancel');
            });
            this.cobra.once('COBRA_stoped_talk', async () => {
                this.sttRec.stopTimedRecording();
                this.rec.setRecordL();
                if (this.config.STT_ENGINE === 'Whisper')
                    await makeWav(this.rec.getRecordL());
                this.cobra.cobraRelease();
                this.cancelDetector.porcupineRelease();
                resolve('composite');
            });
        });
    }
    //////////////////////////////////////////////////////////////////////////////
    async turnoff() {
        return new Promise(resolve => {
            this.idleRec.setInfinityOff();
            this.cancelDetector.porcupineRelease();
            this.rhino.rhinoRelease();
            console.log('Turned off');
            resolve('finish');
        });
    }
}
//# sourceMappingURL=voice-controller.js.map