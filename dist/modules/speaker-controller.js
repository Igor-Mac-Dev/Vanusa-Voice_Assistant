import { audioPlayer, audioPlayerStop } from '../lib/audio-player.js';
import * as path from 'path';
import EventEmitter from 'events';
import { CustomError } from '../utils/error.js';
import * as fs from 'fs';
export default class AudioScheduler extends EventEmitter {
    constructor() {
        super();
        this.audioQueue = [];
        this.audioPlaying = false;
        this.play_output = async () => {
            try {
                this.addToQueue('play');
            }
            catch (e) {
                throw new CustomError('play_output failed: ', e);
            }
        };
        this.play_last = async () => {
            try {
                this.addToQueue('play_last');
            }
            catch (e) {
                throw new CustomError('play_last failed: ', e);
            }
        };
        this.play_start = async () => {
            try {
                this.addToQueue('play_start');
            }
            catch (e) {
                throw new CustomError('play_start failed: ', e);
            }
        };
        this.play_cmd = async () => {
            try {
                this.addToQueue('play_cmd');
            }
            catch (e) {
                throw new CustomError('play_cmd failed: ', e);
            }
        };
        this.play_sucess = async () => {
            try {
                this.addToQueue('play_sucess');
            }
            catch (e) {
                throw new CustomError('play_sucess failed: ', e);
            }
        };
        this.play_err = async () => {
            try {
                this.addToQueue('play_err');
            }
            catch (e) {
                throw new CustomError('play_err failed: ', e);
            }
        };
        this.play_cursed = async () => {
            try {
                this.addToQueue('play_cursed');
            }
            catch (e) {
                throw new CustomError('play_cursed failed: ', e);
            }
        };
        this.play_msg = async (message) => {
            try {
                this.addToQueue('play_msg', message);
            }
            catch (e) {
                throw new CustomError('play_msg failed: ', e);
            }
        };
    }
    async addToQueue(instruct, message) {
        try {
            switch (instruct) {
                case 'play_start':
                    this.audioQueue.push(path.resolve('assets/beeps/init.wav'));
                    break;
                case 'play':
                    this.audioQueue.push(path.resolve('./dist/process-files/output.wav'));
                    break;
                case 'play_last':
                    this.audioQueue.push(path.resolve('dist/process-files/output_last.wav'));
                    break;
                case 'play_err':
                    this.audioQueue.push(path.resolve('assets/beeps/err.wav'));
                    break;
                case 'play_sucess':
                    this.audioQueue.push(path.resolve('assets/beeps/sucess.wav'));
                    break;
                case 'play_cmd':
                    this.audioQueue.push(path.resolve('assets/beeps/cmd.wav'));
                    break;
                case 'play_cursed':
                    this.audioQueue.push(path.resolve('assets/beeps/cursed.wav'));
                    break;
                case 'play_msg':
                    if (message) {
                        this.audioQueue.push(path.resolve('assets/std-msgs/' + message + '.wav'));
                    }
                    else {
                        this.audioQueue.push(path.resolve('assets/beeps/err.wav'));
                    }
                    break;
            }
            if (!this.audioPlaying) {
                await this.playNextAudio();
            }
        }
        catch (error) {
            throw new CustomError('*Audio Scheduler addToQueue failed: ' + error);
        }
    }
    stopAudio() {
        try {
            audioPlayerStop();
            this.audioQueue = [];
            this.audioPlaying = false;
        }
        catch (error) {
            throw new CustomError('*Audio Scheduler stopAudio failed: ' + error);
        }
    }
    async playNextAudio() {
        try {
            if (this.audioQueue.length > 0) {
                if (fs.existsSync(this.audioQueue[0])) {
                    this.audioPlaying = true;
                    await audioPlayer(this.audioQueue[0]);
                }
                else {
                    throw new CustomError('*Audio Scheduler playNextAudio failed: audio file not found');
                }
                this.audioQueue.shift();
                await this.playNextAudio();
            }
            this.audioPlaying = false;
            this.emit('Audio_Queue_End');
        }
        catch (error) {
            throw new CustomError('*Audio Scheduler playNextAudio failed: ' + error);
        }
    }
}
//# sourceMappingURL=speaker-controller.js.map