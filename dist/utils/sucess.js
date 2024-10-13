import * as fs from 'fs';
import * as path from 'path';
export default async function successLog(success) {
    let date = new Date(Date.now());
    let now = date.toUTCString();
    fs.appendFile(path.resolve('log/log.txt'), `\n${now} - Sucess: ${success}`, errr => {
        console.error(errr);
    });
}
//# sourceMappingURL=sucess.js.map