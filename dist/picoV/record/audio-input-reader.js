import { PvRecorder } from '@picovoice/pvrecorder-node';
import { CustomError } from '../../utils/error';
import { EventEmitter } from 'events';
export default class AudioInputReader extends EventEmitter {
    constructor(frameLength = 512, sampleRate = 16000, infinity = false, durationInSeconds = 300, device = 0) {
        super();
        this.recorder = null;
        this.frameLength = frameLength;
        this.sampleRate = sampleRate;
        this.infinity = infinity;
        this.durationInSeconds = durationInSeconds;
        this.device = device;
        this.frameDuration = this.frameLength / this.sampleRate;
        this.calcFramesToRead = Math.floor(this.durationInSeconds / this.frameDuration);
    }
    recorderInit() {
        try {
            this.recorder = {};
            this.recorder = new PvRecorder(this.frameLength, this.device);
        }
        catch (err) {
            throw new CustomError('°Record failed to init:' + err);
        }
    }
    async startRecording() {
        try {
            await this.recorder.start();
        }
        catch (err) {
            throw new CustomError('°Record failed to start:' + err);
        }
    }
    async readAudioFrame() {
        try {
            const frame = await this.recorder.read();
            return frame;
        }
        catch (err) {
            throw new CustomError('°Record failed to read frame:' + err);
        }
    }
    stopRecording() {
        try {
            this.recorder.stop();
        }
        catch (err) {
            throw new CustomError('°Record failed to stop:' + err);
        }
    }
    recorderRelease() {
        try {
            this.recorder.release();
            this.recorder = {};
        }
        catch (err) {
            throw new CustomError('°Recorder failed to release:' + err);
        }
    }
}
//# sourceMappingURL=audio-input-reader.js.map