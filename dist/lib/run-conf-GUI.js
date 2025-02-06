import { spawn } from 'child_process';
import { resolve } from 'path';
import sucessLog from '../utils/sucess.js';
export default async function runConfGUI() {
    const serverPath = resolve('./dist/safe-index.js');
    const child = await spawn('node', [serverPath], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
        shell: false,
    });
    child.unref();
    sucessLog("*Sucess: GUI started at Vanusa's sleep.");
}
//# sourceMappingURL=run-conf-GUI.js.map