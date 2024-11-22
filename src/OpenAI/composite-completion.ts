import OpenAI from 'openai';
import { readConfigFile } from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';
import * as path from 'path';
import * as fs from 'fs';
import { CustomError } from '../utils/error.js';

const config: interfaces.config = readConfigFile();

const compositeTemplate = (intent: string): string => {
   const template = fs.readFileSync(
      path.resolve('assets/templates/', intent + '.txt'),
      'utf8',
   );
   console.log(template);
   return template;
};

export default async function compositeCompletion(
   cmd: [{ intent: string; [slots: string]: string }, composite: string],
): Promise<{ intent: string; [slots: string]: string } | null> {
   try {
      const openai = new OpenAI({ apiKey: config.OAI_KEY });
      const response = await openai.chat.completions.create({
         messages: [
            JSON.parse(
               `{"role": "system", "content": "${config.OAI_ASSIST_DEFINITION}${config.OAI_ASSIST_USER_DEFINITION}"}`,
            ),
            {
               role: 'system',
               content:
                  config.LANGUAGE === 'pt'
                     ? 'Responda essa mensagem com e apenas com um objeto javascript, seguindo o modelo à seguir.'
                     : 'Asnwwer this message with and only with an javascript object, following the model below.',
            },
            { role: 'system', content: compositeTemplate(cmd[0].intent) },
            { role: 'user', content: compositeTemplate(cmd[1]) },
         ],
         model: config.OAI_MODEL,
         max_completion_tokens: config.OAI_MAX_TOKENS,
         temperature: config.OAI_TEMPERATURE,
      });
      const message: { role: string | null; content: string | null } =
         response.choices[0].message;
      if ('refusal' in message) {
         delete message.refusal;
      }
      const messageContent = response.choices[0].message.content;
      if (messageContent) {
         const result = {
            intent: cmd[0].intent,
            slots: {
               ...JSON.parse(cmd[0].slots),
               ...JSON.parse(messageContent),
            },
         };
         return result;
      }
      return null;
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
