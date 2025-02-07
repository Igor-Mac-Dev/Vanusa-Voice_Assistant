import { readConfigFile } from './configuration/conf.js';
import * as pm2 from './utils/PM2-task-menager.js';
import ConfServer from './modules/config-server.js';
import * as path from 'node:path';
import * as fs from 'node:fs';
const confPath = path.resolve('./dist/process-files/conf.json');
let shouldClean;
import errorLog, { CustomError } from './utils/error.js';
main();
async function main() {
    try {
        await pm2.stopPm2();
        const confGUI = new ConfServer();
        if (fs.existsSync(confPath)) {
            const oldConfig = readConfigFile();
            shouldClean = oldConfig.AUTO_START;
        }
        const GUI = await confGUI.startConfServer();
        confGUI.stopConfServer();
        let configs;
        if (GUI !== 'exit')
            configs = readConfigFile();
        else
            configs = { AUTO_START: false };
        console.log(GUI);
        switch (GUI) {
            case 'ok_conf':
                if (!configs.AUTO_START && shouldClean) {
                    await pm2.cleanPm2();
                }
                await pm2.startPm2();
                if (configs.AUTO_START) {
                    await pm2.savePm2();
                }
                break;
            case 'cancel':
                if (fs.existsSync(confPath)) {
                    await pm2.startPm2();
                }
                break;
            case 'exit':
                await pm2.startPm2();
                if (!configs.AUTO_START && shouldClean) {
                    await pm2.cleanPm2();
                }
                else if (configs.AUTO_START) {
                    await pm2.savePm2();
                    await pm2.stopPm2();
                }
                else {
                    await pm2.stopPm2();
                }
                break;
            default:
                console.log('Unknown GUI error.');
                break;
        }
    }
    catch (err) {
        console.log('Error starting the conf server: ' + err);
        await errorLog(new CustomError('Error starting the conf server: ' + err));
    }
    finally {
        process.exit(0);
    }
}
//# sourceMappingURL=safe-index.js.map