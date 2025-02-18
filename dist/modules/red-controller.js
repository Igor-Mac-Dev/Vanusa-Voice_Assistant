import { WebSocketServer } from 'ws';
import * as portfinder from 'portfinder';
import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import errorLog from '../utils/error.js';
import { readConfigFile } from '../configuration/conf.js';
import { CustomError } from '../utils/error.js';
export default class RedController extends EventEmitter {
    constructor(restart) {
        super();
        this.redServer = null;
        this.connectedClient = null;
        this.processingCMD = false;
        this.messages = [];
        this.redPort = 21105;
        this.failed = false;
        try {
            this.setRedPort();
            this.config = readConfigFile();
            this.restart = restart;
        }
        catch (err) {
            errorLog(new CustomError('°RedController failed to init:', err, true));
        }
    }
    async startServer() {
        try {
            return new Promise((resolve, reject) => {
                if (!this.redServer) {
                    portfinder
                        .getPortPromise()
                        .then(fport => {
                        this.setFlow(fport);
                        this.redServer = new WebSocketServer({ port: fport });
                        this.redServer.once('connection', ws => {
                            this.connectedClient = ws;
                            const messageHandler = (message) => {
                                if (!this.processingCMD) {
                                    //this is to receive and reproduce red messages not activated by the user with Vanusa
                                    const msgObj = this.parseHexToObject(message);
                                    if (msgObj)
                                        this.emit('REDmessage', message);
                                }
                            };
                            ws.once('message', () => {
                                ws.on('message', messageHandler);
                                this.redPort = this.setRedPort();
                                resolve('started');
                            });
                            ws.once('close', () => {
                                ws.off('message', messageHandler);
                                this.connectedClient = null;
                                console.log('Voice assistant Client disconnected');
                            });
                            ws.send('*ping*');
                        });
                    })
                        .catch(err => {
                        console.error(err);
                    });
                }
                else {
                    reject('Server is already running.');
                }
            });
        }
        catch (error) {
            throw new CustomError('*Red Controller startServer failed: ', error);
        }
    }
    async stopServer() {
        try {
            if (this.redServer) {
                this.redServer.close(() => {
                    console.log('Red server closed.');
                    this.redServer = null;
                    this.removeAllListeners('REDmessage');
                });
            }
            else {
                console.log('Cannot stop Red: Server is not running.');
            }
        }
        catch (error) {
            throw new CustomError('*Red Controller stopServer failed: ', error);
        }
    }
    sendRedMessage(message) {
        try {
            this.processingCMD = true;
            return new Promise((resolve, reject) => {
                if (this.connectedClient &&
                    this.connectedClient.readyState === this.connectedClient.OPEN) {
                    this.connectedClient.send(typeof message === 'string'
                        ? JSON.stringify({ payload: message })
                        : JSON.stringify(message));
                    this.connectedClient.once('message', (response) => {
                        console.log('Response received from Red client:', response);
                        const parsedResponse = this.parseHexToObject(response);
                        this.processingCMD = false;
                        if (parsedResponse?.error) {
                            errorLog(new CustomError('*Red response msg obj reported an error: ' +
                                parsedResponse.error));
                        }
                        if (parsedResponse?.cmd_response) {
                            if (parsedResponse?.error) {
                                resolve(parsedResponse.cmd_response +
                                    this.config.LANGUAGE ===
                                    'en'
                                    ? ' but there was an error, check the log'
                                    : ' mas houve um erro, cheque o log');
                            }
                            resolve(parsedResponse.cmd_response);
                        }
                        else {
                            resolve(parsedResponse?.error ? 'RED_sucess' : 'RED_error');
                        }
                    });
                    this.connectedClient.once('error', (err) => {
                        this.processingCMD = false;
                        reject('Error occurred while waiting for Red response: ' +
                            err.message);
                    });
                }
                else {
                    this.processingCMD = false;
                    reject('No Red client connected or client is not ready.');
                }
            });
        }
        catch (error) {
            this.processingCMD = false;
            throw new CustomError('Error occurred while sending message to Red: ' + error);
        }
    }
    parseHexToObject(bufferMsg) {
        try {
            const jsonString = bufferMsg.toString('utf-8');
            const sanitizedString = jsonString.trim();
            return JSON.parse(sanitizedString);
        }
        catch (error) {
            console.error('Error parsing Red buffer message:', error);
            return null;
        }
    }
    setFlow(port) {
        let docsPath = path.resolve(path.join(homedir(), 'Documents'), 'Vanusa');
        docsPath = docsPath.replace(/\\/g, '\\\\');
        const filePath = path.resolve('./.node-red/VoiceAssist.json');
        try {
            const flowData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            flowData.forEach((node) => {
                if (node.type === 'websocket-listener' &&
                    node.id === '9dca3b73347bd783' &&
                    node.path.startsWith('ws://localhost:')) {
                    node.path = `ws://localhost:${port}`;
                }
                if (node.type === 'function' &&
                    node.name === 'ENV_VARS' &&
                    node.id === '3ad208dd7ae27c61') {
                    node.func = `flow.set('CANCEL', false)\nflow.set('DOCS', '${docsPath}')\nmsg.payload=\"Flow variables set.\"\nreturn msg;\n\n//You can set your vars here if u want`;
                }
            });
            fs.writeFileSync(filePath, JSON.stringify(flowData, null, 2), 'utf-8');
        }
        catch (error) {
            throw new Error('Error updating flow file: ' + error);
        }
    }
    saveMessage(message) {
        this.messages.push(message);
    }
    isThereMessages() {
        return this.messages.length > 0;
    }
    messageFlush() {
        const messages = this.messages;
        this.messages = [];
        return messages;
    }
    getRedPort() {
        return this.redPort;
    }
    setRedPort() {
        try {
            const fileContent = readFileSync(path.resolve('./ecosystem.config.cjs'), 'utf-8');
            const portMatch = fileContent.match(/-p\s(\d+)/);
            if (portMatch && portMatch[1]) {
                return parseInt(portMatch[1], 10);
            }
            throw new Error('Port number not found in configuration file');
        }
        catch (error) {
            console.error('Error reading configuration file:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=red-controller.js.map