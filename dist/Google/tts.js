import gTTS from 'gtts';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import * as conf from '../configuration/conf.js';
import { CustomError } from '../utils/error.js';
export default class GoogleTts {
    constructor() {
        this.mp3FilePath = path.join(path.resolve('./dist/process-files'), 'output.mp3');
        this.wavFilePath = path.join(path.resolve('./dist/process-files'), 'output.wav');
        this.rename = path.join(path.resolve('./dist/process-files'), 'output_last.wav');
        this.config = conf.readConfigFile();
    }
    async tts(text) {
        try {
            if (fs.existsSync(this.rename)) {
                fs.rmSync(this.rename);
            }
            if (fs.existsSync(this.wavFilePath)) {
                fs.renameSync(this.wavFilePath, this.rename);
            }
            await this.generateMP3(text);
            await this.convertMP3ToWAV();
        }
        catch (error) {
            throw new CustomError('°gTts: Error during TTS processing: ', error);
        }
    }
    async rhinoTts(text, path) {
        try {
            await this.generateMP3(text);
            await this.convertMP3ToWAV(path);
        }
        catch (error) {
            throw new CustomError('°gTts: Error during Rhino TTS processing: ', error);
        }
    }
    generateMP3(text) {
        return new Promise(resolve => {
            try {
                const gtts = new gTTS(text, this.config.LANGUAGE);
                gtts.save(this.mp3FilePath, () => {
                    resolve();
                });
            }
            catch (error) {
                throw new CustomError('°gTts: Error generating MP3 file: ', error);
            }
        });
    }
    async convertMP3ToWAV(path) {
        try {
            await new Promise((resolve, reject) => {
                ffmpeg(this.mp3FilePath)
                    .output(path || this.wavFilePath)
                    .on('end', () => setTimeout(() => resolve(), 20))
                    .on('error', (error) => reject(error))
                    .run();
            });
            if (fs.existsSync(this.mp3FilePath)) {
                fs.rmSync(this.mp3FilePath);
            }
        }
        catch (error) {
            throw new CustomError(`°gTts: Error during wav conversion setup: `, error);
        }
    }
}
//# sourceMappingURL=tts.js.map