import ws, { WebSocketServer } from 'ws';
import * as portfinder from 'portfinder';
import * as http from 'node:http';
import * as fs from 'node:fs';
import path from 'node:path';
import * as interfaces from '../interfaces/config-json.js';
import * as conf from '../configuration/conf.js';
import open from 'open';
import * as mic from '../configuration/device-detection.js';
import { CustomError } from '../utils/error.js';
import sucessLog from '../utils/sucess.js';
import { BaseConf } from '../interfaces/types.js';

export default class ConfServer {
   private server: http.Server<
      typeof http.IncomingMessage,
      typeof http.ServerResponse
   > | null = null;
   private confServer: WebSocketServer | null = null;
   private connectedClient: ws | null = null;
   private readonly confPath: string = path.resolve(
      './dist/process-files/conf.json',
   );
   private config: interfaces.config | undefined;
   private port: number | undefined;

   constructor() {
      this.config = fs.existsSync(this.confPath)
         ? conf.readConfigFile()
         : undefined;
   }

   public async startConfServer(): Promise<string> {
      if (this.confServer) {
         throw new CustomError('Conf Server is already running.');
      }
      try {
         this.port = await portfinder.getPortPromise();
         sucessLog(
            'Conf Voice assistant Client connected on port ' + this.port,
         );
         const confInit = this.setInitConf();
         this.server = http.createServer(this.serveHTML);
         this.confServer = new WebSocketServer({ server: this.server });

         process.on('SIGINT', () => {
            if (this.connectedClient) {
               this.connectedClient.send(JSON.stringify({ action: 'close' }));
            }
            setTimeout(() => {
               process.exit(0);
            }, 1000);
         });

         return new Promise<string>((resolve, reject) => {
            this.confServer?.once('connection', async ws => {
               this.connectedClient = ws;
               if (confInit) {
                  this.connectedClient.send(JSON.stringify(confInit));
               }
               const availableMics: string[] = mic.availableDevices;
               const selectedDevice: number | undefined =
                  await mic.findSelectedDevice;
               this.connectedClient.send(
                  JSON.stringify([availableMics, selectedDevice]),
               );

               this.connectedClient?.on('message', message => {
                  const ms = message.toString();
                  if (ms == 'cancel') {
                     resolve('cancel');
                  } else if (ms == 'exit') {
                     resolve('exit');
                  } else {
                     const msg = JSON.parse(ms);
                     if (msg[msg.length - 1] === 'exit') {
                        msg.pop();
                        this.setFinalConf(msg);
                        resolve('exit');
                     } else {
                        this.setFinalConf(msg);
                        resolve('ok_conf');
                     }
                  }
               });

               this.connectedClient?.on('close', () => {
                  this.connectedClient?.removeAllListeners();
               });
            });

            this.server?.listen(this.port, () => {
               console.log(
                  `Conf Server listening on http://localhost:${this.port}`,
               );
               open(`http://localhost:${this.port}`);
            });

            this.confServer?.on('close', () => {
               this.connectedClient = null;
               this.confServer?.removeAllListeners();
            });
         });
      } catch (err) {
         throw new CustomError('°Conf Server failed: ', err);
      }
   }

   private serveHTML(
      req: http.IncomingMessage,
      res: http.ServerResponse,
   ): void {
      try {
         const filePath = path.join(
            path.resolve('./GUI/'),
            req.url === '/' ? '/index.html' : req.url.toString(),
         );
         const extname = path.extname(filePath);
         let contentType = 'text/html';
         switch (extname) {
            case '.js':
               contentType = 'text/javascript';
               break;
            case '.css':
               contentType = 'text/css';
               break;
            case '.ico':
               contentType = 'image/x-icon';
               break;
            case '.png':
               contentType = 'image/png';
               break;
         }

         fs.readFile(filePath, (err, content) => {
            if (err) {
               if (err.code === 'ENOENT') {
                  res.writeHead(404, {
                     'Content-Type': 'text/html',
                  });
                  res.end('404: File Not Found', 'utf8');
               } else {
                  res.writeHead(500);
                  res.end(`Server Error: ${err.code}`);
               }
            } else {
               res.writeHead(200, {
                  'Content-Type': contentType,
               });
               if (contentType === 'text/javascript') {
                  const contentModified = content
                     .toString()
                     .replace(
                        '%%PORT%%',
                        this.port ? this.port.toString() : '8000',
                     );
                  res.end(contentModified, 'utf8');
               } else if (contentType === 'text/html') {
                  const contentModified = content
                     .toString()
                     .replace(
                        '%%LANG%%',
                        this.config?.LANGUAGE ? this.config.LANGUAGE : 'en',
                     );
                  res.end(contentModified, 'utf8');
               } else {
                  res.end(content, 'utf8');
               }
            }
         });
      } catch (error) {
         throw new CustomError('°Conf HTML Server failed: ', error);
      }
   }

   public stopConfServer() {
      if (this.server) {
         this.server.close();
      }
      if (this.confServer) {
         this.confServer.clients.forEach(client => {
            client.close();
         });

         this.confServer.close();
      } else {
         throw new CustomError(
            '°Cannot stop ConfServer: Server is not running.',
         );
      }
   }

   private setInitConf(): BaseConf | undefined {
      if (this.config) {
         return [
            this.config?.LANGUAGE,
            this.config?.AUTO_START,
            this.config?.BURST_MODE,
            this.config?.RECORD_TIME,
            this.config?.SELECTED_DEVICE,
            this.config?.SENSITIVITYWW,
            this.config?.SENSITIVITYCMD,
            this.config?.COBRA_LENGHT,
            this.config?.STT_ENGINE,
            this.config?.TTS_ENGINE,
            this.config?.PV_KEY,
            this.config?.OAI_MODEL,
            this.config?.OAI_ASSIST_USER_DEFINITION,
            this.config?.OAI_HISTORY_LENGTH,
            this.config?.OAI_TEMPERATURE,
            this.config?.OAI_MAX_TOKENS,
            this.config?.OAI_KEY,
         ];
      } else {
         return undefined;
      }
   }

   private setFinalConf(base: BaseConf): void {
      const lang = base[0] ? 'pt' : 'en';
      const oaiModel:
         | 'gpt-4o'
         | 'gpt-3.5-turbo'
         | 'gpt-4o mini'
         | 'gpt-4-turbo'
         | 'o1-preview'
         | 'o1-mini' = (base[11] ?? 'gpt-4o') as
         | 'gpt-4o'
         | 'gpt-3.5-turbo'
         | 'gpt-4o mini'
         | 'gpt-4-turbo'
         | 'o1-preview'
         | 'o1-mini';
      const sttEngine: 'Picovoice' | 'Whisper' = (base[8] ?? 'Picovoice') as
         | 'Picovoice'
         | 'Whisper';
      const ttsEngine: 'Picovoice' | 'OpenAI' | 'Google' = (base[9] ??
         'Picovoice') as 'Picovoice' | 'OpenAI' | 'Google';

      const createConfig: interfaces.config = {
         LANGUAGE: lang,
         AUTO_START: base[1] ?? false,
         BURST_MODE: base[2] ?? false,
         PPN: conf.pathmkr('porcupine_params_', lang, '.pv'),
         PPN_WW: [
            conf.pathmkr('wake_word1_', lang),
            conf.pathmkr('wake_word2_', lang),
            conf.pathmkr('wake_word3_', lang),
         ],
         PPN_CANCEL: [conf.pathmkr('cancel_', lang)],
         PPN_REPEAT: [
            conf.pathmkr('repeat_', lang),
            conf.pathmkr('repeat_last_', lang),
         ],
         OAI_KEY: base[16].trim() ?? 'invalid',
         PV_KEY: base[10].trim() ?? 'invalid',
         CHEETAH: path.resolve('assets/models/cheetah_params.pv'),
         CHEETAH_AVAILABLE: this.config ? this.config.CHEETAH_AVAILABLE : true,
         LEOPARD: conf.pathmkr('leopard_params_', lang, '.pv'),
         LEOPARD_AVAILABLE: this.config ? this.config.LEOPARD_AVAILABLE : true,
         ORCA_AVAILABLE: this.config ? this.config.ORCA_AVAILABLE : true,
         RECORD_TIME: parseInt(base[3]) ?? 300,
         FRAME_LENGHT: 512,
         SAMPLE_RATE: 16000,
         SELECTED_DEVICE: parseInt(base[4]) ?? undefined,
         SENSITIVITYWW: parseFloat(base[5]) ?? 0.5,
         SENSITIVITYCMD: parseFloat(base[6]) ?? 0.5,
         COBRA_LENGHT: parseInt(base[7]) ?? 5,
         OAI_MODEL: oaiModel,
         OAI_ASSIST_DEFINITION: base[0]
            ? "Você é um assistente de voz. Eu falo no meu computador, e um programa envia isso para você em formato de texto. Você processa e retorna uma resposta que será falada pelo meu dispositivo. Por favor, evite usar a palavra 'cancelar', pois ela pode interromper a reprodução da resposta. Voce também não pode usar formatação de texto nessa resposta, como 'barra + n', '**' etc. Use apenas texto plano. Responda com formatação especial apenas se solicitado posteriormente. Lembre-se de que o mecanismo de reconhecimento de fala não é perfeito: se faltar alguma palavra, presuma que ela deveria estar lá; se alguma palavra parecer fora de contexto, substitua por uma mais adequada, especialmente nomes ou termos incomuns. Algumas vezes o motor de reconhecimento de fala mescla duas palavras em uma e vice-versa. Por favor, responda em portugues. Especificações adicionais, se houver alguma, serão indicadas a seguir: "
            : "You are a voice assistant. I speak on my desktop, and a program sends it to you as text. You process it and return an answer that will be spoken by my device. Please avoid using the word 'cancel,' as it may interrupt the playback of your response. You also can't format the text in this asnwer, unless in especifc requests. Avoid  'slash + n', '**' etc. Use only plane text. Keep in mind that the Speech to Text engine isn't perfect: if words are missing, assume they were intended; if words seem out of context, replace them with what likely fits, normally uncommon names or terms. Additional specifications, if any, will follow: ",
         OAI_ASSIST_USER_DEFINITION: base[12] ?? '',
         OAI_HISTORY_LENGTH: parseInt(base[13]) ?? 20,
         OAI_TEMPERATURE: parseFloat(base[14]) ?? 0.5,
         OAI_MAX_TOKENS: parseInt(base[15]) ?? 100,
         STT_ENGINE: sttEngine,
         TTS_ENGINE: ttsEngine,
      };
      conf.createConfigFile(createConfig);
   }
}
