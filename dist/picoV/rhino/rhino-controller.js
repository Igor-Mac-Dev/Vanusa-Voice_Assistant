import { CustomError } from '../../utils/error.js';
import * as fs from 'fs';
export default function rhinoHandler(cmd, composite) {
    try {
    }
    catch (err) {
        throw new CustomError('°Rhino handler: ' + err);
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
//[ { intent: 'Explica', slot: '{}' }, false ]
// Função para gerar o timestamp atual
function getCurrentTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:]/g, '-'); // Troca ":" para evitar problemas em nomes de arquivos
}
// Função para processar a resposta e salvar os arquivos
function processResponse(response) {
    const codeSections = response.match(/---\s(.*?)\n```([\s\S]*?)```/g); // Pega todas as seções de código
    const explanation = response.match(/\*\*\*\n([\s\S]*)/); // Pega a explicação final
    if (codeSections) {
        codeSections.forEach(section => {
            const titleMatch = section.match(/---\s(.*?)\n/); // Pega o título
            const codeMatch = section.match(/```(?:[a-zA-Z]*)\n([\s\S]*?)```/); // Pega o código
            if (titleMatch && codeMatch) {
                const title = titleMatch[1].trim();
                const code = codeMatch[1].trim();
                const timestamp = getCurrentTimestamp();
                const fileName = `${timestamp}_${title}.txt`;
                // Salva o código em um arquivo txt
                fs.writeFileSync(fileName, code, 'utf-8');
                console.log(`Saved code as: ${fileName}`);
            }
        });
    }
    let userMessage = '';
    if (explanation) {
        userMessage = explanation[1].trim(); // Armazena a explicação que será falada
    }
    return userMessage;
}
// Exemplo de resposta vinda do ChatGPT
const response = `
--- Remove First Line from TXT
\`\`\`typescript
import * as fs from 'fs';

function removeFirstLine(filePath: string) {
  const data = fs.readFileSync(filePath, 'utf-8').split('\\n');
  data.shift();
  fs.writeFileSync(filePath, data.join('\\n'));
}
\`\`\`
***
To remove the first line of a text file in TypeScript, read the file, split its contents by lines, remove the first one, and save it back. This will modify the original file.
`;
// Processa a resposta e pega a mensagem para o usuário
const userMessage = processResponse(response);
console.log(`Message for user: ${userMessage}`);
//# sourceMappingURL=rhino-controller.js.map