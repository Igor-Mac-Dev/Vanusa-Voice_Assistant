"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const player = require("node-wav-player");
const audio_player_1 = require("../src/audio-player");
jest.mock('node-wav-player', () => ({
    play: jest.fn(() => Promise.resolve()),
    stop: jest.fn(),
}));
describe('Audio output', () => {
    it('should play a sound file', async () => {
        const sound = '../assets/beeps/err.wav';
        await (0, audio_player_1.audioPlayerStart)(sound);
        expect(player.play).toHaveBeenCalledWith({
            path: sound,
        });
    });
    it('should stop the sound', () => {
        (0, audio_player_1.audioPlayerStop)();
        expect(player.stop).toHaveBeenCalled();
    });
});
