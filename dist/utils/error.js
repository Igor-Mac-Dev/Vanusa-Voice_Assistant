import * as fs from 'fs';
import * as path from 'path';
export default async function errorLog(err) {
    try {
        const logFilePath = path.resolve('logs/log.txt');
        const date = new Date(Date.now());
        const now = date.toLocaleString();
        if (!fs.existsSync(path.dirname(logFilePath))) {
            fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
        }
        if (fs.existsSync(logFilePath)) {
            const fileContent = fs.readFileSync(logFilePath, 'utf-8');
            const lines = fileContent.split('\n');
            if (lines.length > 1000) {
                const newContent = lines.slice(100).join('\n');
                fs.writeFileSync(logFilePath, newContent, 'utf-8');
            }
        }
        fs.appendFileSync(path.resolve(logFilePath), `\n ${now} - ERROR: ${formatError(err)}`, 'utf-8');
    }
    catch (e) {
        console.error('Error logging error:', e);
    }
}
export class CustomError extends Error {
    constructor(logMsg, error, fatal) {
        super(logMsg);
        this.fatal = fatal ?? false;
        if (error && typeof error === 'object' && 'fatal' in error) {
            this.fatal = error.fatal;
        }
        this.logMsg = logMsg;
        if (error instanceof Error) {
            this.logMsg += error.stack + '\n ' + error.message;
        }
        if (error instanceof CustomError) {
            console.log('saco' + JSON.stringify(error, getCircularReplacer(), 2));
            this.logMsg += JSON.stringify(error, getCircularReplacer(), 2);
        }
        if (error && typeof error === 'object') {
            try {
                const stringError = JSON.stringify(error, Object.getOwnPropertyNames(error));
                this.logMsg += stringError;
            }
            catch {
                this.logMsg += ' [Error serializing error object]';
            }
        }
        else {
            this.logMsg += error;
        }
    }
}
export function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    };
}
function formatError(err) {
    if (err instanceof CustomError) {
        return `LOG: ${err.logMsg}\nSTACK: ${err.stack || err.message}`.replace(/\\n/g, '\n');
    }
    if (err instanceof Error) {
        return `STACK: ${err.stack || err.message}`.replace(/\\n/g, '\n');
    }
    try {
        return `RAW ERROR: ${JSON.stringify(err, getCircularReplacer(), 2)}`.replace(/\\n/g, '\n');
    }
    catch (e) {
        return `Erro ao formatar erro: ${e}`;
    }
}
//# sourceMappingURL=error.js.map