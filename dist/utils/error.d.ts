export default function errorLog(err: unknown): Promise<void>;
export declare class CustomError extends Error {
    readonly logMsg: string;
    constructor(logMsg: string);
}
