import OpenAI from 'openai';
import * as conf from '../configuration/conf.js';
import makeWav from '../utils/wav-maker.js';
export default async function novaTts(text) {
    try {
        const config = conf.readConfigFile();
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
//# sourceMappingURL=nova.js.map