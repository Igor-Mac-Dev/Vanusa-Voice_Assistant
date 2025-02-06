import * as fs from 'fs';
import * as path from 'path';
export default async function sucessLog(success) {
    const date = new Date(Date.now());
    const now = date.toLocaleString();
    fs.appendFile(path.resolve('logs/log.txt'), `\n${now} - Sucess: ${success}`, errr => {
        console.error(errr);
    });
}
//# sourceMappingURL=sucess.js.map