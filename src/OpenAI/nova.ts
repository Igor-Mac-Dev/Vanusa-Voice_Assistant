import OpenAI from 'openai';
import { readConfigFile } from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';
import { CustomError } from '../utils/error.js';
import makeWav, { makeGenericWav } from '../lib/wav-maker.js';

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
      let erro: string | null = null;
      if (isOpenAIError(error)) {
         erro = "°OpenAi's API failed:" + error.response.status;
         erro += `\nError details: ${error.response.data}`;

         if (error.response.status === 402) {
            erro += '\nInsufficient credits. Check your payment details.';
         }
      }
      throw new CustomError(
         erro ? erro : "°OpenAi's API failed: " + 'TTS failed: ' + error,
      );
   }
}

export async function rhinovaTts(text: string, path: string): Promise<void> {
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
      await makeGenericWav(int16Array, 24000, path);
   } catch (error: unknown) {
      let erro: string | null = null;
      if (isOpenAIError(error)) {
         erro = "°OpenAi's API failed:" + error.response.status;
         erro += `\nError details: ${error.response.data}`;

         if (error.response.status === 402) {
            erro += '\nInsufficient credits. Check your payment details.';
         }
      }
      throw new CustomError(
         erro ? erro : "°OpenAi's API failed: " + 'TTS failed: ' + error,
      );
   }
}

function isOpenAIError(
   error: unknown,
): error is { response: { status: number; data: any } } {
   return typeof error === 'object' && error !== null && 'response' in error;
}
