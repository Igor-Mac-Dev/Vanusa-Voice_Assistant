import pm2 from 'pm2';
import { resolve } from 'path';
async function setupBus() {
    return new Promise((resolve, reject) => {
        pm2.launchBus((err, bus) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(bus);
            }
        });
    });
}
async function monitorProcess() {
    try {
        const bus = await setupBus();
        bus.on('process:exit', packet => {
            if (packet.process.name === 'Vanusa-main' &&
                packet.process.exit_code !== 0) {
                console.log(`app-main crashed. Restarting in safe mode...`);
                pm2.start({
                    name: 'Vanusa-safe',
                    script: resolve('./dist/safe-index.js'),
                    autorestart: true,
                    max_restarts: 3,
                    restart_delay: 4000,
                }, err => {
                    if (err) {
                        console.error('Error starting safe.js:', err);
                    }
                });
            }
        });
    }
    catch (err) {
        console.error('Error launching PM2 bus:', err);
    }
}
monitorProcess();
//# sourceMappingURL=PM2-monitor.js.map