import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { readConfigFile } from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';
import { CustomError } from '../utils/error.js';

export default async function whisperStt(): Promise<string> {
   try {
      const config: interfaces.config = readConfigFile();
      const openai = new OpenAI({ apiKey: config.OAI_KEY });
      const wavFilePath = path.join(
         path.resolve('dist/process-files'),
         'input.wav',
      );
      const transcription = await openai.audio.transcriptions.create({
         file: fs.createReadStream(wavFilePath),
         model: 'whisper-1',
         language: config.LANGUAGE,
      });

      return transcription.text;
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
         erro ? erro : "°OpenAi's API failed: " + '°Whisper failed: ' + error,
      );
   }
}

function isOpenAIError(
   error: unknown,
): error is { response: { status: number; data: any } } {
   return typeof error === 'object' && error !== null && 'response' in error;
}
