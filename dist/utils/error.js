import * as fs from 'fs';
import * as path from 'path';
export default async function errorLog(err) {
    const date = new Date(Date.now());
    const now = date.toUTCString();
    fs.appendFile(path.resolve('logs/log.txt'), `\n ${now} - ERROR: ${err}`, er => {
        if (er) {
            console.error(er);
        }
    });
}
export class CustomError extends Error {
    constructor(logMsg) {
        super();
        this.logMsg = logMsg;
    }
}
//# sourceMappingURL=error.js.map