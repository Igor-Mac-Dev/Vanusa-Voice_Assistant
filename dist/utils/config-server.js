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
                        setFinalConf(JSON.parse(message.toString()));
                        resolve('ok_conf');
                    });
                    ws.on('close', () => {
                        console.log('Conf Voice assistant Client disconnected ws');
                    });
                    confServer.on('close', () => {
                        console.log('busgranha');
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
function stopConfServer() {
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
    const config = conf.readConfigFile();
    if (fs.existsSync(confPath)) {
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
    console.log(base);
    const createConfig = {
        LANGUAGE: 'en',
        AUTO_START: false,
        PPN: conf.pathmkr('a'),
        PPN_WW: [conf.pathmkr('a'), conf.pathmkr('b')],
        PPN_CANCEL: [conf.pathmkr('c')],
        PPN_REPEAT: ['a', 'b'],
        OAI_KEY: 'a',
        PV_KEY: 'a',
        CHEETAH: 'a',
        CHEETAH_AVAILABLE: true,
        LEOPARD: conf.pathmkr('a', '_en', '.pv'),
        LEOPARD_AVAILABLE: true,
        ORCA_AVAILABLE: true,
        RECORD_TIME: 300,
        FRAME_LENGHT: 512,
        SAMPLE_RATE: 16000,
        SELECTED_DEVICE: undefined,
        SENSITIVITY: 0.5,
        COBRA_LENGHT: 3,
        OAI_MODEL: 'gpt-4o',
        OAI_ASSIST_DEFINITION: "You are a voice assistant. I speak on my desktop, and a program sends it to you as text. You process it and return an answer that will be spoken by my device. Please avoid using the word 'cancel,' as it may interrupt the playback of your response. Keep in mind that the Speech to Text engine isn't perfect: if words are missing, assume they were intended; if words seem out of context, replace them with what likely fits, normally uncommon names or terms. Additional specifications, if any, will follow: ",
        OAI_ASSIST_USER_DEFINITION: '',
        OAI_HISTORY_LENGTH: 10,
        OAI_TEMPERATURE: 0.6,
        OAI_MAX_TOKENS: 100,
        STT_ENGINE: 'Picovoice',
        TTS_ENGINE: 'Picovoice',
    };
}
await startConfServer();
stopConfServer();
//# sourceMappingURL=config-server.js.map