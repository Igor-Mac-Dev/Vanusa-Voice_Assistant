import { PvRecorder } from '@picovoice/pvrecorder-node';
import { CustomError } from '../utils/error';

const availableDevices: string[] = PvRecorder.getAvailableDevices();
let selectedDevice: number | undefined;

async function testDevices(deviceIndex: number): Promise<boolean> {
   const recorder = new PvRecorder(512, deviceIndex);

   try {
      await recorder.start();
      const frame: Int16Array[] = await recorder.read();
      await recorder.stop();
      await recorder.release();
      return true;
   } catch (err) {
      throw new CustomError(
         '°Problem with device ' + availableDevices[deviceIndex] + ': ' + err,
      );
   } finally {
      await recorder.stop();
      await recorder.release();
   }
}

const findSelectedDevice: Promise<number | undefined> = (async (): Promise<
   number | undefined
> => {
   try {
      for (let i = 0; i < availableDevices.length; i++) {
         const isValidDevice = await testDevices(i);
         if (isValidDevice) {
            selectedDevice = i;
            return selectedDevice;
         }
      }
   } catch (err) {
      throw new CustomError('°Mic test failed: ' + err);
   }
   return undefined;
})();

export { availableDevices, findSelectedDevice };
