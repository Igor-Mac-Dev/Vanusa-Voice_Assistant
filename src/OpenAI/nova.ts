import OpenAI from 'openai';
import { readConfigFile } from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';
import makeWav from '../utils/wav-maker.js';

export default async function novaTts(text: string): Promise<void> {
   try {
      const config: interfaces.config = readConfigFile();
      const openai: OpenAI = new OpenAI({ apiKey: config.OAI_KEY });
      const output = await openai.audio.speech.create({
         model: 'tts-1',
         voice: 'nova',
         input: text,
         response_format: 'wav',
      });
      const arrayBuffer = await output.arrayBuffer();
      const int16Array = new Int16Array(arrayBuffer);
      await makeWav(int16Array, 24000, 1);
   } catch (error: unknown) {
      if (isOpenAIError(error)) {
         console.error('Erro na resposta da API:', error.response.status);
         console.error('Detalhes do erro:', error.response.data);

         if (error.response.status === 402) {
            console.error(
               'Créditos insuficientes. Verifique seus detalhes de pagamento.',
            );
         }
      } else {
         console.error('Erro inesperado:', error);
      }
      throw error;
   }
}

function isOpenAIError(
   error: unknown,
): error is { response: { status: number; data: any } } {
   return typeof error === 'object' && error !== null && 'response' in error;
}
