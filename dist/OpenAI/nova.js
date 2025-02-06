import OpenAI from 'openai';
import { readConfigFile } from '../configuration/conf.js';
import { CustomError } from '../utils/error.js';
import makeWav, { makeGenericWav } from '../lib/wav-maker.js';
export default async function novaTts(text) {
    try {
        const config = readConfigFile();
        const openai = new OpenAI({ apiKey: config.OAI_KEY });
        const output = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'nova',
            input: text,
            response_format: 'wav',
        });
        const arrayBuffer = await output.arrayBuffer();
        const int16Array = new Int16Array(arrayBuffer);
        await makeWav(int16Array, 24000, 1);
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
        throw new CustomError(erro ? erro : "°OpenAi's API failed: " + 'TTS failed: ' + error);
    }
}
export async function rhinovaTts(text, path) {
    try {
        const config = readConfigFile();
        const openai = new OpenAI({ apiKey: config.OAI_KEY });
        const output = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'nova',
            input: text,
            response_format: 'wav',
        });
        const arrayBuffer = await output.arrayBuffer();
        const int16Array = new Int16Array(arrayBuffer);
        await makeGenericWav(int16Array, 24000, path);
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
        throw new CustomError(erro ? erro : "°OpenAi's API failed: " + 'TTS failed: ' + error);
    }
}
function isOpenAIError(error) {
    return typeof error === 'object' && error !== null && 'response' in error;
}
//# sourceMappingURL=nova.js.map