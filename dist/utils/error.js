import * as fs from 'fs';
import * as path from 'path';
export default async function errorLog(err) {
    let date = new Date(Date.now());
    let now = date.toUTCString();
    fs.appendFile(path.resolve('log/log.txt'), `\n ${now} - ERROR: ${err}`, er => {
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