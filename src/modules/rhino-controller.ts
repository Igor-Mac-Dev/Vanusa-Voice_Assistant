import { CustomError } from '../utils/error.js';
import { readConfigFile } from '../configuration/conf.js';
import * as interfaces from '../interfaces/config-json.js';
import * as path from 'path';
import * as fs from 'fs';
import OAIcompletion from '../OpenAI/completion.js';
import { command, record } from '../interfaces/types.js';
import SttControl from './stt-controller.js';
import openRed from '../lib/open-red.js';
import { homedir } from 'os';
import { rhinoTts } from './tts-controller.js';

export default class rhinoHandler {
   private config: interfaces.config = readConfigFile();
   private nativeCmds: string[] = [
      'Transcreve',
      'Transcribe',
      'Criar_áudio',
      'Create_audio',
      'Conf',
      'Vermelho',
      'Red',
      'Dorme',
      'Turn_off',
   ];
   private rhinoExecuter: rhinoExecuter;
   private rhinoInfo: rhinoInfo = new rhinoInfo();
   private completion: OAIcompletion;

   constructor(sendToRED: (msg: command) => Promise<string>) {
      this.rhinoExecuter = new rhinoExecuter(sendToRED);
      this.completion = new OAIcompletion();
   }

   // public async parseTranscript(cmd: command, rec: record): Promise<command> {
   //    try {
   //       if (typeof rec !== 'string') {
   //          const transcript: string = await stt(rec.recL, rec.recC);
   //          if (!cmd.slots) cmd.slots = {};
   //          cmd.slots.transcript = transcript;
   //       }
   //       return cmd;
   //    } catch (error) {
   //       throw new CustomError(
   //          '*Rhino Handler parseTranscript failed: ',
   //          error,
   //       );
   //    }
   // }

   public async jsonizeTranscript(cmd: command): Promise<command> {
      try {
         if (!cmd.slots) cmd.slots = {};
         if (
            fs.existsSync(
               path.resolve(
                  './assets/templates/' +
                     cmd.intent +
                     `_${this.config.LANGUAGE}.txt`,
               ),
            )
         ) {
            const jsonTranscript: { [key: string]: any } | null =
               await this.completion.compositeCompletion(
                  cmd.slots.transcirpt,
                  cmd.intent,
               );
            if (jsonTranscript) {
               delete cmd.slots.transcript;
               Object.assign(cmd.slots, jsonTranscript);
            }
         }
         return cmd;
      } catch (error) {
         throw new CustomError(
            '*Rhino Handler jsonizeTranscript failed: ',
            error,
         );
      }
   }

   public async RhinoHandler(cmd: command): Promise<command | string> {
      try {
         const finalCmd: command | string = cmd;
         if (this.nativeCmds.includes(finalCmd.intent)) {
            cmd = await this.nativeCmdsHandler(finalCmd);
            return cmd;
         }
         return cmd;
      } catch (error) {
         throw new CustomError('*Record Handler failed: ', error);
      }
   }

   public async nativeCmdsHandler(cmd: command): Promise<command> {
      try {
         switch (cmd.intent) {
            case 'Criar_áudio':
               cmd.intent = 'Create_audio';
               return cmd;
            case 'Vermelho':
               cmd.intent = 'Red';
               return cmd;
            case 'Dorme':
               cmd.intent = 'Turn_off';
               return cmd;
            case 'Transcreve':
               cmd.intent = 'Transcribe';
               return cmd;
            default:
               return cmd;
         }
      } catch (error) {
         throw new CustomError('*Native Command Handler failed: ', error);
      }
   }

   public async killRhino() {
      //Parar o gpt e o q + precisar
   }
}

class rhinoInfo {
   private processFilePath: string = path.resolve('./dist/process-files/');
   private documentsPath: string = path.resolve(
      path.join(homedir(), 'Documents'),
      'Vanusa',
   );

   constructor() {}

   public getDocumentsPath(): string {
      return this.documentsPath;
   }
   public getProcessFileTxt(): string {
      return this.processFilePath;
   }

   public getCurrentTimestamp(): string {
      const now = new Date();
      return now.toISOString().replace(/[:]/g, '-');
   }
}

class rhinoExecuter {
   private sendToRED: (msg: command) => Promise<string>;

   constructor(sendToRED: (msg: command) => Promise<string>) {
      this.sendToRED = sendToRED;
   }
}
// {
//   intent: "orderBeverage",
//   slots: {
//     bebida: "café"
//     tamanho: "grande"
//     dose: "duplo"
//   }
// }

//[ { intent: 'Explica', slots: '{}' }, false ]

// Função para gerar o timestamp atual

// Função para processar a resposta e salvar os arquivos

// function processResponse(response: string) {
//    const codeSections = response.match(/---\s(.*?)\n```([\s\S]*?)```/g); // Pega todas as seções de código
//    const explanation = response.match(/\*\*\*\n([\s\S]*)/); // Pega a explicação final

//    if (codeSections) {
//       codeSections.forEach(section => {
//          const titleMatch = section.match(/---\s(.*?)\n/); // Pega o título
//          const codeMatch = section.match(/```(?:[a-zA-Z]*)\n([\s\S]*?)```/); // Pega o código

//          if (titleMatch && codeMatch) {
//             const title = titleMatch[1].trim();
//             const code = codeMatch[1].trim();
//             const timestamp = getCurrentTimestamp();
//             const fileName = `${timestamp}_${title}.txt`;

//             // Salva o código em um arquivo txt
//             fs.writeFileSync(fileName, code, 'utf-8');
//             console.log(`Saved code as: ${fileName}`);
//          }
//       });
//    }

//    let userMessage = '';
//    if (explanation) {
//       userMessage = explanation[1].trim(); // Armazena a explicação que será falada
//    }

//    return userMessage;
// }

// // Exemplo de resposta vinda do ChatGPT
// const response = `
// --- Remove First Line from TXT
// \`\`\`typescript
// import * as fs from 'fs';

// function removeFirstLine(filePath: string) {
//   const data = fs.readFileSync(filePath, 'utf-8').split('\\n');
//   data.shift();
//   fs.writeFileSync(filePath, data.join('\\n'));
// }
// \`\`\`
// ***
// To remove the first line of a text file in TypeScript, read the file, split its contents by lines, remove the first one, and save it back. This will modify the original file.
// `;

// // Processa a resposta e pega a mensagem para o usuário
// const userMessage = processResponse(response);
// console.log(`Message for user: ${userMessage}`);

// }

// {
//    intent: "orderBeverage",
//    slots: {
//      numberOfShots: "double shot"
//      size: "small"
//      beverage: "espresso"
//    }
//  }
