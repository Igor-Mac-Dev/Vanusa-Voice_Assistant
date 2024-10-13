import * as player from 'node-wav-player'
import { audioPlayerStart, audioPlayerStop } from '../src/audio-player'

jest.mock('node-wav-player', () => ({
   play: jest.fn(() => Promise.resolve()),
   stop: jest.fn(),
}))

describe('Audio output', () => {
   it('should play a sound file', async () => {
      const sound = '../assets/beeps/err.wav'
      await audioPlayerStart(sound)
      expect(player.play).toHaveBeenCalledWith({
         path: sound,
      })
   })

   it('should stop the sound', () => {
      audioPlayerStop()
      expect(player.stop).toHaveBeenCalled()
   })
})
