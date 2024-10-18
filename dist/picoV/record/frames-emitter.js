import AudioInputReader from './audio-input-reader.js';
import { CustomError } from '../../utils/error.js';
export default class FramesEmitter extends AudioInputReader {
    constructor(frameLength = 512, sampleRate = 16000, infinity = false, durationInSeconds = 300, device = 0) {
        super(frameLength, sampleRate, infinity, durationInSeconds, device);
    }
    async startFramesEmittion() {
        try {
            await this.recorderInit();
            await this.startRecording();
            this.emit('REC_start');
            await this.framesEmiter();
        }
        catch (error) {
            this.emit('REC_failed', error);
        }
    }
    async framesEmiter() {
        try {
            if (!this.infinity) {
                for (let i = 0; i < this.calcFramesToRead; i++) {
                    const frame = await this.readAudioFrame();
                    if (frame) {
                        this.emit('frame', frame);
                    }
                    else {
                        this.emit('REC_cant_read');
                        break;
                    }
                }
            }
            else {
                while (this.infinity) {
                    const frame = await this.readAudioFrame();
                    if (frame) {
                        this.emit('frame', frame);
                    }
                    else {
                        this.emit('REC_cant_read');
                        break;
                    }
                }
            }
        }
        catch (err) {
            this.emit('REC_failed', new CustomError('°Record emission failed a: ' + err));
        }
        this.stopRecording();
        this.recorderRelease();
        this.emit('REC_stop');
    }
    setInfinityOn() {
        this.infinity = true;
    }
    setInfinityOff() {
        this.infinity = false;
    }
    stopTimedRecording() {
        this.calcFramesToRead = 0;
    }
}
//# sourceMappingURL=frames-emitter.js.map