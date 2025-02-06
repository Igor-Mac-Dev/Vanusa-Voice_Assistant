import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { readConfigFile } from '../configuration/conf.js';
import { CustomError } from '../utils/error.js';
export default async function whisperStt() {
    try {
        const config = readConfigFile();
        const openai = new OpenAI({ apiKey: config.OAI_KEY });
        const wavFilePath = path.join(path.resolve('dist/process-files'), 'input.wav');
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(wavFilePath),
            model: 'whisper-1',
            language: config.LANGUAGE,
        });
        return transcription.text;
    }
    catch (error) {
        let erro = null;
        if (isOpenAIError(error)) {
            erro = "°OpenAi's API failed:" + error.response.status;
            erro += `\nError details: ${error.response.data}`;
            if (error.response.status === 402) {
                erro += '\nInsufficient credits. Check your payment details.';
            }
        }
        throw new CustomError(erro ? erro : "°OpenAi's API failed: " + '°Whisper failed: ' + error);
    }
}
function isOpenAIError(error) {
    return typeof error === 'object' && error !== null && 'response' in error;
}
//# sourceMappingURL=whisper.js.map