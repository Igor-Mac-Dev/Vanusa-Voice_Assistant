import * as player from 'node-wav-player';
export async function audioPlayer(file) {
    try {
        await player.play({
            path: file,
            sync: true,
        });
    }
    catch (error) {
        throw error;
    }
}
export function audioPlayerStop() {
    player.stop();
}
//# sourceMappingURL=audio-player.js.map