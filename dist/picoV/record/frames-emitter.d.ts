import AudioInputReader from './audio-input-reader';
export default class FramesEmitter extends AudioInputReader {
    constructor(frameLength?: number, sampleRate?: number, infinity?: boolean, durationInSeconds?: number, device?: number);
    startFramesEmittion(): Promise<void>;
    framesEmiter(): Promise<void>;
    setInfinityOn(): void;
    setInfinityOff(): void;
    stopTimedRecording(): void;
}
