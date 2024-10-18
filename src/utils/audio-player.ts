import * as player from 'node-wav-player';

export async function audioPlayer(file: string): Promise<void> {
   await player.play({
      path: file,
      sync: true,
   });
}

export function audioPlayerStop(): void {
   player.stop();
}
