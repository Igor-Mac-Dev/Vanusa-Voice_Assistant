import OpenAI from 'openai';
import * as conf from '../configuration/conf.js';
import * as path from 'path';
import * as fs from 'fs';
import { CustomError } from '../utils/error.js';
const historyPath = path.join(path.resolve('dist/process-files/'), 'history.txt');
const config = conf.readConfigFile();
function getHistory(input) {
    try {
        const history = fs.readFileSync(historyPath, 'utf8');
        const result = [];
        if (history.length > 0) {
            const lines = history.split(/\r?\n/);
            lines.forEach(line => {
                if (line.trim()) {
                    try {
                        result.push(JSON.parse(line));
                    }
                    catch (err) {
                        throw new CustomError('°OAI failed to parse history:' + err);
                    }
                }
            });
        }
        result.push({ role: 'user', content: input });
        fs.writeFileSync(historyPath, '', 'utf8');
        let i = 1;
        result.forEach(line => {
            if (i > result.length - config.OAI_HISTORY_LENGTH) {
                fs.appendFileSync(historyPath, JSON.stringify(line) + '\n', 'utf8');
            }
            i++;
        });
        return result;
    }
    catch (err) {
        throw new CustomError('°OAI failed while reading history:' + err);
    }
}
export default async function completion(input) {
    try {
        const openai = new OpenAI({ apiKey: config.OAI_KEY });
        const response = await openai.chat.completions.create({
            messages: [
                JSON.parse(`{"role": "system", "content": "${config.OAI_ASSIST_DEFINITION}${config.OAI_ASSIST_USER_DEFINITION}"}`),
                ...getHistory(input),
            ],
            model: config.OAI_MODEL,
            max_completion_tokens: config.OAI_MAX_TOKENS,
            temperature: config.OAI_TEMPERATURE,
        });
        const message = response.choices[0].message;
        if ('refusal' in message) {
            delete message.refusal;
        }
        fs.appendFileSync(historyPath, JSON.stringify(response.choices[0].message), 'utf8');
        return response.choices[0].message.content;
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
//# sourceMappingURL=completion.js.map