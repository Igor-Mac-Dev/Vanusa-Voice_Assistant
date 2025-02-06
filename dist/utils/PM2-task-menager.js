import { exec } from 'child_process';
import * as path from 'path';
const options = {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
};
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing command "${command}": ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Command "${command}" stderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
}
async function isProcessRunning(processName) {
    try {
        const output = await executeCommand('pm2 list --no-color');
        return output.includes(processName) && output.includes('online');
    }
    catch (error) {
        console.error('error:' + error);
        return false;
    }
}
export async function startPm2() {
    try {
        const ecosystemPath = path.resolve('./ecosystem.config.cjs');
        await executeCommand(`pm2 start ${ecosystemPath}`);
    }
    catch (error) {
        console.error(error);
    }
}
export async function savePm2() {
    try {
        await executeCommand('pm2 save');
    }
    catch (error) {
        console.error(error);
    }
}
export async function cleanPm2() {
    try {
        await executeCommand('pm2 delete Vanusa-main');
        await executeCommand('pm2 delete V-node-red');
        await executeCommand('pm2 delete Vanusa-monitor');
        await executeCommand('pm2 save --force');
    }
    catch (error) {
        console.error('error' + error);
    }
}
export async function stopPm2() {
    try {
        if (await isProcessRunning('V-node-red')) {
            await executeCommand('pm2 stop V-node-red');
        }
        if (await isProcessRunning('Vanusa-monitor')) {
            await executeCommand('pm2 stop Vanusa-monitor');
        }
        if (await isProcessRunning('Vanusa-main')) {
            await executeCommand('pm2 stop Vanusa-main');
        }
    }
    catch (error) {
        console.error(error);
    }
}
//# sourceMappingURL=PM2-task-menager.js.map