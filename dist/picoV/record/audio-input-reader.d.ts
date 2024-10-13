import { PvRecorder } from '@picovoice/pvrecorder-node';
import { EventEmitter } from 'events';
export default class AudioInputReader extends EventEmitter {
    protected recorder: PvRecorder | null;
    protected infinity: boolean;
    private frameLength;
    private sampleRate;
    private durationInSeconds;
    private frameDuration;
    protected calcFramesToRead: number;
    private device;
    constructor(frameLength?: number, sampleRate?: number, infinity?: boolean, durationInSeconds?: number, device?: number);
    protected recorderInit(): void;
    protected startRecording(): Promise<void>;
    protected readAudioFrame(): Promise<Int16Array | null>;
    protected stopRecording(): void;
    protected recorderRelease(): void;
}
