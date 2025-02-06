import { readConfigFile } from '../configuration/conf.js';
import OpenAI from 'openai';
import * as path from 'path';
import * as fs from 'fs';
import { CustomError } from '../utils/error.js';
export default class OpenAICompletion {
    constructor() {
        try {
            this.historyPath = path.join(path.resolve('./dist/process-files/'), 'history.txt');
            this.config = readConfigFile();
            this.openai = new OpenAI({ apiKey: this.config.OAI_KEY });
            if (!fs.existsSync(this.historyPath)) {
                fs.writeFileSync(this.historyPath, '', 'utf-8');
            }
        }
        catch (err) {
            throw new CustomError('°OpenAI failed to init:', err);
        }
    }
    stopOpenAI() {
        this.openai = null;
    }
    getHistory(input) {
        try {
            const history = fs.readFileSync(this.historyPath, 'utf8');
            console.log(1);
            const result = [];
            if (history.length > 0) {
                const lines = history.split(/\r?\n/);
                lines.forEach(line => {
                    if (line.trim()) {
                        try {
                            result.push(JSON.parse(line));
                        }
                        catch (err) {
                            throw new CustomError('°OAI failed to parse history:', err);
                        }
                    }
                });
            }
            result.push({ role: 'user', content: input });
            fs.writeFileSync(this.historyPath, '', 'utf8');
            let i = 1;
            result.forEach(line => {
                if (i > result.length - this.config.OAI_HISTORY_LENGTH) {
                    fs.appendFileSync(this.historyPath, JSON.stringify(line) + '\n', 'utf8');
                }
                i++;
            });
            return result;
        }
        catch (err) {
            throw new CustomError('°OAI failed while reading history: ', err);
        }
    }
    getTemplate(intent) {
        try {
            const template = fs.readFileSync(path.resolve('./assets/templates/' + intent + `_${this.config.LANGUAGE}.json`));
            return template.toString();
        }
        catch (err) {
            throw new CustomError('°OAI failed while geting template for ' + intent + ': ', err);
        }
    }
    isOpenAIError(error) {
        return typeof error === 'object' && error !== null && 'response' in error;
    }
    appendHistory(messageContent) {
        try {
            fs.appendFileSync(this.historyPath, '{"role": "assistant", "content": ' +
                JSON.stringify(messageContent) +
                '}', 'utf8');
        }
        catch (err) {
            throw new CustomError('°OAI failed while appending history: ', err);
        }
    }
}
//# sourceMappingURL=OAI-API-AUX.js.map