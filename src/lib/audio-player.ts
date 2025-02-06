import player from 'node-wav-player-optimized'; // go back to original pkg after win process update/linux ver
import { CustomError } from '../utils/error.js';

export async function audioPlayer(file: string): Promise<void> {
   try {
      await player.play({
         path: file,
         sync: true,
      });
   } catch (err) {
      throw new CustomError('°Audio Player failed: ', err);
   }
}

export function audioPlayerStop(): void {
   player.stop();
}
