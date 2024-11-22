import player from 'node-wav-player-optimized';
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