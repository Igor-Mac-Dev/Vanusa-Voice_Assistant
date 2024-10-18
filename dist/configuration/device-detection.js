import { PvRecorder } from '@picovoice/pvrecorder-node';
import { CustomError } from '../utils/error.js';
const availableDevices = PvRecorder.getAvailableDevices();
let selectedDevice;
async function testDevices(deviceIndex) {
    const recorder = new PvRecorder(512, deviceIndex);
    try {
        await recorder.start();
        const frame = await recorder.read();
        return true;
    }
    catch (err) {
        throw new CustomError('°Problem with device ' + availableDevices[deviceIndex] + ': ' + err);
    }
    finally {
        await recorder.stop();
        await recorder.release();
    }
}
const findSelectedDevice = (async () => {
    try {
        for (let i = 0; i < availableDevices.length; i++) {
            const isValidDevice = await testDevices(i);
            if (isValidDevice) {
                selectedDevice = i;
                return selectedDevice;
            }
        }
    }
    catch (err) {
        throw new CustomError('°Mic test failed: ' + err);
    }
    return undefined;
})();
export { availableDevices, findSelectedDevice };
//# sourceMappingURL=device-detection.js.map