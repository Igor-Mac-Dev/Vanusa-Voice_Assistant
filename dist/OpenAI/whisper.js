import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as conf from '../configuration/conf.js';
export default async function whisperStt() {
    try {
        const config = conf.readConfigFile();
        const openai = new OpenAI({ apiKey: config.OAI_KEY });
        const wavFilePath = path.join(path.resolve('dist/process-files'), 'input.wav');
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(wavFilePath),
            model: 'whisper-1',
        });
        return transcription.text;
    }
    catch (error) {
        if (isOpenAIError(error)) {
            console.error('Erro na resposta da API:', error.response.status);
            console.error('Detalhes do erro:', error.response.data);
            if (error.response.status === 402) {
                console.error('Créditos insuficientes. Verifique seus detalhes de pagamento.');
            }
        }
        else {
            console.error('Erro inesperado:', error);
        }
        throw error;
    }
}
function isOpenAIError(error) {
    return typeof error === 'object' && error !== null && 'response' in error;
}
//# sourceMappingURL=whisper.js.map