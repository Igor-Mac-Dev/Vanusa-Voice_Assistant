import * as fs from 'fs';
import * as path from 'path';
export default async function errorLog(err) {
    try {
        const logFilePath = path.resolve('logs/log.txt');
        const logDir = path.dirname(logFilePath);
        const now = new Date().toLocaleString();
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        if (fs.existsSync(logFilePath)) {
            const fileContent = fs.readFileSync(logFilePath, 'utf-8').split('\n');
            if (fileContent.length > 1000) {
                fs.writeFileSync(logFilePath, fileContent.slice(100).join('\n'), 'utf-8');
            }
        }
        fs.appendFileSync(logFilePath, `\n${now} - ERROR: ${JSON.stringify(err, getCircularReplacer(), 2)}`, 'utf-8');
    }
    catch (e) {
        console.error('Error logging error:', e);
    }
}
export class CustomError extends Error {
    constructor(logMsg, error, fatal = false) {
        super();
        this.fatal = fatal;
        this.message = logMsg;
        if (error) {
            this.message += `${error.message}`;
        }
    }
}
export function getCircularReplacer() {
    const seen = new WeakSet();
    return (_key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value))
                return '[Circular]';
            seen.add(value);
        }
        return value;
    };
}
//# sourceMappingURL=error.js.map