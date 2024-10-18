import * as player from 'node-wav-player';
export async function audioPlayer(file) {
    await player.play({
        path: file,
        sync: true,
    });
}
export function audioPlayerStop() {
    player.stop();
}
//# sourceMappingURL=audio-player.js.map