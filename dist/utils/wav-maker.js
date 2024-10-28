import * as fs from 'fs';
import * as path from 'path';
import WaveFile from 'wavefile';
import { CustomError } from './error.js';
export default function makeWav(int16Array, sampleRate = 16000, usecase = 0) {
    const wav = new WaveFile.WaveFile();
    let pathToFile;
    switch (usecase) {
        case 0:
            pathToFile = path.join(path.resolve('dist/process-files'), 'input.wav');
            break;
        case 1:
            pathToFile = path.join(path.resolve('dist/process-files'), 'output.wav');
            const rename = path.join(path.resolve('dist/process-files'), 'output_last.wav');
            if (fs.existsSync(rename)) {
                fs.rmSync(rename);
            }
            if (fs.existsSync(pathToFile)) {
                fs.renameSync(pathToFile, rename);
            }
            break;
        case 2:
            pathToFile = path.join(path.resolve('dist/process-files'), 'input_cmd.wav');
            break;
        default:
            console.log("Something called makeWav (the process-files' wav file creator) with an invalid usecase");
            throw new CustomError('wav-maker: invalid usecase');
    }
    wav.fromScratch(1, sampleRate, '16', int16Array);
    fs.writeFileSync(pathToFile, wav.toBuffer());
}
//# sourceMappingURL=wav-maker.js.map