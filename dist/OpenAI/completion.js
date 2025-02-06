import { CustomError } from '../utils/error.js';
import OpenAICompletion from '../OpenAI/OAI-API-AUX.js';
export default class OAIcompletion extends OpenAICompletion {
    constructor() {
        super();
    }
    async completion(input) {
        try {
            const response = await this.openai?.chat.completions.create({
                messages: [
                    JSON.parse(`{"role": "system", "content": "${this.config.OAI_ASSIST_DEFINITION} ${this.config.OAI_ASSIST_USER_DEFINITION}"}`),
                    ...this.getHistory(input),
                ],
                model: this.config.OAI_MODEL,
                max_completion_tokens: this.config.OAI_MAX_TOKENS,
                temperature: this.config.OAI_TEMPERATURE,
            });
            const message = response.choices[0].message;
            if ('refusal' in message) {
                delete message.refusal;
            }
            if (!message || !message.content) {
                throw new Error("OpenAi's API invalid response");
            }
            let messageContent = response.choices[0].message.content;
            messageContent = messageContent.replace(/[{}]/g, '').trim();
            this.appendHistory(messageContent);
            return response.choices[0].message.content;
        }
        catch (error) {
            let erro = null;
            if (this.isOpenAIError(error)) {
                erro = "°OpenAi's API failed:" + error.response.status;
                erro += `\nError details: ${error.response.data}`;
                if (error.response.status === 402) {
                    erro += '\nInsufficient credits. Check your payment details.';
                }
            }
            throw new CustomError(erro ? erro : "°OpenAi's API Completion failed: ", error);
        }
    }
    async compositeCompletion(input, intent) {
        try {
            const response = await this.openai?.chat.completions.create({
                messages: [
                    JSON.parse(`{"role": "system", "content": "${this.config.OAI_ASSIST_DEFINITION} ${this.config.OAI_ASSIST_USER_DEFINITION}"}`),
                    this.config.LANGUAGE === 'en'
                        ? {
                            role: 'system',
                            content: `You MUST TO asnwer this in js readable json format, based on user's input and following this template:\n${this.getTemplate(intent)}\nIf you don't know how to answer, just and only say "ABORT".`,
                        }
                        : {
                            role: 'system',
                            content: `Você DEVE responder isso em um formato JSON legível para JavaScript, baseado na entrada do usuário e seguindo este modelo:\n${this.getTemplate(intent)}\nSe você não souber como responder, apenas e somente diga "ABORT".`,
                        },
                    { role: 'user', content: input },
                ],
                model: this.config.OAI_MODEL,
                max_completion_tokens: this.config.OAI_MAX_TOKENS,
                temperature: this.config.OAI_TEMPERATURE,
            });
            const message = response.choices[0].message;
            if (!message || !message.content) {
                throw new Error("OpenAi's API invalid response");
            }
            const messageContent = JSON.parse(message.content);
            return messageContent;
        }
        catch (error) {
            let erro = null;
            if (this.isOpenAIError(error)) {
                erro = "°OpenAi's API failed:" + error.response.status;
                erro += `\nError details: ${error.response.data}`;
                if (error.response.status === 402) {
                    erro += '\nInsufficient credits. Check your payment details.';
                }
            }
            throw new CustomError(erro ? erro : "°OpenAi's API Completion failed: ", error);
        }
    }
}
//# sourceMappingURL=completion.js.map