import * as player from 'node-wav-player';

export async function audioPlayer(file: string): Promise<void> {
   try {
      await player.play({
         path: file,
         sync: true,
      });
   } catch (error: unknown) {
      throw error;
   }
}

export function audioPlayerStop(): void {
   player.stop();
}
