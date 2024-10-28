import { WebSocketServer } from 'ws';
import * as portfinder from 'portfinder';
import * as http from 'node:http';
import * as fs from 'node:fs';
import path from 'node:path';
import * as conf from '../configuration/conf.js';
import open from 'open';
import * as mic from '../configuration/device-detection.js';
let server = null;
let confServer;
let connectedClient = null;
const confPath = path.resolve('./dist/process-files/conf.json');
let config;
if (fs.existsSync(confPath)) {
    config = conf.readConfigFile();
}
else {
    config = undefined;
}
export async function startConfServer() {
    return new Promise((resolve, reject) => {
        if (!confServer) {
            portfinder
                .getPortPromise()
                .then(port => {
                const confInit = setInitConf();
                const serveHTML = (req, res) => {
                    const filePath = path.join(path.resolve('./GUI/'), req.url === '/' ? '/index.html' : req.url);
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
                            }
                            else {
                                res.writeHead(500);
                                res.end(`Server Error: ${err.code}`);
                            }
                        }
                        else {
                            res.writeHead(200, {
                                'Content-Type': contentType,
                            });
                            if (contentType === 'text/javascript') {
                                const contentModified = content
                                    .toString()
                                    .replace('%%PORT%%', port.toString());
                                res.end(contentModified, 'utf8');
                            }
                            else if (contentType === 'text/html') {
                                const contentModified = content
                                    .toString()
                                    .replace('%%LANG%%', config?.LANGUAGE ? config.LANGUAGE : 'en');
                                res.end(contentModified, 'utf8');
                            }
                            else {
                                res.end(content, 'utf8');
                            }
                        }
                    });
                };
                server = http.createServer(serveHTML);
                confServer = new WebSocketServer({ server });
                process.on('SIGINT', () => {
                    if (connectedClient) {
                        connectedClient.send(JSON.stringify({ action: 'close' }));
                    }
                    setTimeout(() => {
                        process.exit(0);
                    }, 1000);
                });
                confServer.on('connection', async (ws) => {
                    connectedClient = ws;
                    if (confInit) {
                        connectedClient.send(JSON.stringify(confInit));
                    }
                    const availableMics = mic.availableDevices;
                    const selectedDevice = await mic.findSelectedDevice;
                    connectedClient.send(JSON.stringify([availableMics, selectedDevice]));
                    ws.on('message', message => {
                        const ms = message.toString();
                        if (ms == 'cancel') {
                            resolve('cancel');
                        }
                        else if (ms == 'exit') {
                            resolve('exit');
                        }
                        else {
                            const msg = JSON.parse(ms);
                            if (msg[msg.length - 1] === 'exit') {
                                msg.pop();
                                setFinalConf(msg);
                                resolve('exit');
                            }
                            else {
                                setFinalConf(msg);
                                resolve('ok_conf');
                            }
                        }
                    });
                    ws.on('close', () => {
                        console.log('Conf Voice assistant Client disconnected ws');
                    });
                    confServer.on('close', () => {
                        connectedClient = null;
                    });
                });
                server.listen(port, () => {
                    console.log(`Conf Server listening on http://localhost:${port}`);
                    open(`http://localhost:${port}`);
                });
            })
                .catch(err => {
                console.error(err);
            });
        }
        else {
            reject('Conf Server is already running.');
        }
    });
}
export function stopConfServer() {
    if (server) {
        server.close();
    }
    if (confServer) {
        confServer.clients.forEach(client => {
            client.close();
        });
        confServer.close(() => { });
    }
    else {
        console.log('Cannot stop Conf: Server is not running.');
    }
}
function setInitConf() {
    if (config) {
        return [
            config.LANGUAGE,
            config.AUTO_START,
            config.RECORD_TIME,
            config.SELECTED_DEVICE, //usa na volta
            config.SENSITIVITY,
            config.COBRA_LENGHT,
            config.STT_ENGINE,
            config.TTS_ENGINE,
            config.PV_KEY,
            config.OAI_MODEL,
            config.OAI_ASSIST_USER_DEFINITION,
            config.OAI_HISTORY_LENGTH,
            config.OAI_TEMPERATURE,
            config.OAI_MAX_TOKENS,
            config.OAI_KEY,
        ];
    }
    else {
        return undefined;
    }
}
function setFinalConf(base) {
    const lang = () => {
        if (base[0]) {
            return 'pt';
        }
        else {
            return 'en';
        }
    };
    const oaiModel = (base[9] ?? 'gpt-4o');
    const sttEngine = (base[6] ?? 'Picovoice');
    const ttsEngine = (base[7] ??
        'Picovoice');
    const createConfig = {
        LANGUAGE: lang(),
        AUTO_START: base[1] ?? false,
        PPN: conf.pathmkr('porcupine_params_', lang(), '.pv'),
        PPN_WW: [
            conf.pathmkr('wake_word1_', lang()),
            conf.pathmkr('wake_word2_', lang()),
            conf.pathmkr('wake_word3_', lang()),
        ],
        PPN_CANCEL: [conf.pathmkr('cancel_', lang())],
        PPN_REPEAT: [
            conf.pathmkr('repeat_', lang()),
            //conf.pathmkr('repeat_last_', lang()),
        ],
        OAI_KEY: base[14] ?? 'invalid',
        PV_KEY: base[8] ?? 'invalid',
        CHEETAH: path.resolve('assets/models/cheetah_params.pv'),
        CHEETAH_AVAILABLE: config ? config.CHEETAH_AVAILABLE : true,
        LEOPARD: conf.pathmkr('leopard_params_', lang(), '.pv'),
        LEOPARD_AVAILABLE: config ? config.LEOPARD_AVAILABLE : true,
        ORCA_AVAILABLE: config ? config.ORCA_AVAILABLE : true,
        RECORD_TIME: parseInt(base[2]) ?? 300,
        FRAME_LENGHT: 512,
        SAMPLE_RATE: 16000,
        SELECTED_DEVICE: parseInt(base[3]) ?? undefined,
        SENSITIVITY: parseFloat(base[4]) ?? 0.5,
        COBRA_LENGHT: parseInt(base[5]) ?? 5,
        OAI_MODEL: oaiModel,
        OAI_ASSIST_DEFINITION: base[0]
            ? "Você é um assistente de voz. Eu falo no meu computador, e um programa envia isso para você em formato de texto. Você processa e retorna uma resposta que será falada pelo meu dispositivo. Por favor, evite usar a palavra 'cancelar', pois ela pode interromper a reprodução da resposta. Voce também não pode usar formatação de texto nessa resposta, como '\n', '**' etc. Use apenas texto plano. Responda con formatação especial apenas se solicitado posteriormente. Lembre-se de que o mecanismo de reconhecimento de fala não é perfeito: se faltar alguma palavra, presuma que ela deveria estar lá; se alguma palavra parecer fora de contexto, substitua por uma mais adequada, especialmente nomes ou termos incomuns. Algumas vezes o motor de reconhecimento de fala mescla duas palavras em uma e vice-versa. Por favor, responda em portugues. Especificações adicionais, se houver, serão indicadas a seguir: "
            : "You are a voice assistant. I speak on my desktop, and a program sends it to you as text. You process it and return an answer that will be spoken by my device. Please avoid using the word 'cancel,' as it may interrupt the playback of your response. You also can't format the text in this asnwer, unless in especifc requests. Avoid  '\n', '**' etc. Use only plane text. Keep in mind that the Speech to Text engine isn't perfect: if words are missing, assume they were intended; if words seem out of context, replace them with what likely fits, normally uncommon names or terms. Additional specifications, if any, will follow: ",
        OAI_ASSIST_USER_DEFINITION: base[10] ?? '',
        OAI_HISTORY_LENGTH: parseInt(base[11]) ?? 20,
        OAI_TEMPERATURE: parseFloat(base[12]) ?? 0.5,
        OAI_MAX_TOKENS: parseInt(base[13]) ?? 100,
        STT_ENGINE: sttEngine,
        TTS_ENGINE: ttsEngine,
    };
    conf.createConfigFile(createConfig);
}
//# sourceMappingURL=config-server.js.map