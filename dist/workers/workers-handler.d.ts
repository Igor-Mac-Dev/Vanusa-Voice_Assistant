import { Worker } from 'worker_threads';
export declare const controll: Worker;
export declare const stt: Worker;
export declare const tts: Worker;
export declare const speaker: Worker;
export declare const utils: Worker;
export declare const red: Worker;
export declare const handlers: {
    [key: string]: (param1?: any, param2?: any) => void;
};
