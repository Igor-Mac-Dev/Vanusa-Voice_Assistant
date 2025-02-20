//  * Licensed under the  GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  * https://www.gnu.org/licenses/agpl-3.0.en.html
import DependencyContainer from './modules/dependency-container.js';
import successLog from './utils/sucess.js';
import errorLog, { CustomError } from './utils/error.js';
import process from 'node:process';
import RedController from './modules/red-controller.js';
const restart = () => {
    process.exit(666);
};
const red = new RedController(restart);
await red.startServer();
const sendToRED = async (msg) => {
    try {
        if (red) {
            const response = await red.sendRedMessage(msg);
            return response;
        }
        else {
            throw new CustomError('Tryed to send message with Red unstarted ' + msg);
        }
    }
    catch (err) {
        throw new CustomError('Failed to send message to red: ', err);
    }
};
const container = new DependencyContainer(restart, sendToRED);
const terminate = async () => {
    try {
        if (red.isThereMessages()) {
            const messages = red.messageFlush();
            for (const message of messages) {
                await errorLog('Program stopped without delivering red message: ' + message);
            }
        }
        await red.stopServer();
        await container.stopDependencies();
        restart();
    }
    catch (err) {
        await errorLog('Error terminating dependencies: ' + err);
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function main() {
    try {
        await container.startDependencies();
        container.phaseMenager.setPhase('start', 'start');
        red.on('REDmessage', message => {
            successLog('Receiveid form Red:' + message);
            if (container.phaseMenager.getPhase() === 'idle') {
                reproduceRedMessages(message);
            }
            else {
                red.saveMessage(message);
            }
        });
        process.on('unhandledRejection', async (reason, promise) => {
            container.player.stopAudio();
            container.player.play_err();
            await errorLog(`Promise rejected without catch:
             ${reason instanceof Error ? reason.stack || reason.message : JSON.stringify(reason, null, 2)}`);
            container.player.once('Audio_Queue_End', async () => {
                terminate();
            });
        });
        process.on('uncaughtException', async (err) => {
            container.player.stopAudio();
            container.player.play_err();
            await errorLog(`Uncaught exception: ${err.stack || err.message}`);
            container.player.once('Audio_Queue_End', async () => {
                if (err && typeof err === 'object' && 'fatal' in err) {
                    terminate();
                }
                else {
                    goIdle();
                }
            });
        });
        async function pause() {
            if (container.phaseMenager.getPhase() === 'idle') {
                container.phaseMenager.setPhase('pause', 'power menager');
                await container.control.abortInfinityRecord();
            }
            else {
                throw new CustomError("User tryed to suspend in a momment I don't want to program ", 'a pause system to: ', true);
            }
        }
        function resume() {
            goIdle();
        }
        container.setListeners(pause, resume);
        goIdle();
    }
    catch (e) {
        throw new CustomError('^ Vanusa error: ', e);
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const goIdle = async () => {
    try {
        console.log('idle');
        if (red.isThereMessages()) {
            reproduceRedMessages();
        }
        if (container.phaseMenager.getPhase() === 'wait') {
            const stopWait = await container.control.abortInfinityRecord();
            if (stopWait !== 'remote-stop') {
                errorLog('stopWait failed: ' + stopWait);
            }
        }
        container.phaseMenager.setPhase('idle', 'idle');
        const wakeWord = await container.control.idle();
        setTimeout(() => {
            wwHandler(wakeWord);
        }, 10);
    }
    catch (error) {
        throw new CustomError('goIdle failed: ', error);
    }
};
const wwHandler = async (ww) => {
    try {
        console.log('wwHandler', ww);
        switch (ww) {
            case 'record':
                await container.player.play_sucess();
                container.phaseMenager.setPhase('record', 'wwHandler');
                const input = await container.control.record();
                console.log('   input: ' + input);
                if (input === 'cancel' || input === '') {
                    await container.player.play_err();
                    container.player.once('Audio_Queue_End', () => {
                        goIdle();
                    });
                }
                else {
                    goWait();
                    goInputHandle(input);
                }
                break;
            case 'repeat':
                goWait();
                container.player.play_output();
                container.player.once('Audio_Queue_End', async () => {
                    goIdle();
                });
                break;
            case 'repeat_last':
                container.player.play_last();
                container.player.once('Audio_Queue_End', () => {
                    goIdle();
                });
                goWait();
                break;
            case 'cancel':
                goIdle();
                break;
            case 'loop':
                goIdle();
                break;
            case 'remote-stop':
                successLog('Vanusa paused, probably due to suspension');
                return;
            default:
                console.log('Unknown wake-word');
                throw new CustomError('Wake Word Handler failed: ');
                break;
        }
    }
    catch (error) {
        throw new CustomError('Wake Word Handler failed: ', error);
    }
};
const goWait = async () => {
    try {
        console.log('waiting');
        container.phaseMenager.setPhase('wait', 'wait');
        const cancel = await container.control.wait();
        switch (cancel) {
            case 'cancel':
                container.phaseMenager.setAbortCurrentPhaseTrue();
                console.log('cancel');
                if (container.phaseMenager.getSubPhase() === 'speaking') {
                    container.player.stopAudio();
                    container.player.play_err();
                    container.player.once('Audio_Queue_End', async () => {
                        container.phaseMenager.setSubPhase(null, 'goWait');
                        goIdle();
                    });
                }
                break;
            case 'loop':
                console.log('cancel loop');
                goWait();
                break;
            case 'remote-stop':
                console.log('canceled' + cancel);
                break;
            default:
                console.log('canceled' + cancel);
                goIdle();
                break;
        }
    }
    catch (e) {
        throw new CustomError('goWait failed: ', e);
    }
};
const goInputHandle = async (input) => {
    try {
        console.log('handling ' + input);
        if (Array.isArray(input)) {
            rhinoRoute(input);
        }
        else {
            container.player.play_sucess();
            container.player.once('Audio_Queue_End', async () => {
                const cancel = () => {
                    container.phaseMenager.setSubPhase(null, 'inputHandle');
                    goIdle();
                    return;
                };
                let asnwer;
                let tts;
                if (input.trim() === 'cancel')
                    cancel();
                if (input && typeof input === 'string')
                    asnwer = await goComplet(input);
                else
                    throw new CustomError('Impossible to process input and generating completion.');
                if (asnwer === 'cancel')
                    cancel();
                if (asnwer)
                    tts = await goTts(asnwer);
                else
                    throw new CustomError('Impossible to sintetize TTS.');
                if (tts === 'cancel')
                    cancel();
                container.phaseMenager.setSubPhase('speaking', 'inputHandle');
                if (tts === 'ok')
                    container.player.play_output();
                container.player.once('Audio_Queue_End', async () => {
                    container.phaseMenager.setSubPhase(null, 'inputHandle');
                    goIdle();
                });
            });
        }
    }
    catch (error) {
        console.log(error);
        await errorLog(new CustomError('*Input Handler failed: ', error));
    }
};
const rhinoRoute = async (input) => {
    try {
        container.phaseMenager.setSubPhase('cmd', 'rhinoRoute');
        let cmd = input[0]; // cmd can be a string if rhino handler return a string
        if (input[1]) {
            container.player.play_cmd();
            container.player.once('Audio_Queue_End', async () => {
                const compositeRecord = await container.control.compositeCmd();
                if (compositeRecord === 'cancel') {
                    container.phaseMenager.setSubPhase(null, 'rhinoRoute');
                    goIdle();
                    return;
                }
                if (typeof cmd !== 'string') {
                    if (!cmd.slots)
                        cmd.slots = {};
                    cmd.slots.transcript = compositeRecord;
                    cmd = await container.rhino.jsonizeTranscript(cmd);
                    cmd = await container.rhino.RhinoHandler(cmd);
                }
            });
        }
        else {
            cmd = await container.rhino.RhinoHandler(cmd);
        }
        console.log(cmd);
        container.phaseMenager.setSubPhase(null, 'rhinoRoute');
        goIdle();
    }
    catch (error) {
        container.phaseMenager.setSubPhase(null, 'rhinoRoute');
        throw new CustomError('Rhino Handler failed: ', error);
    }
};
// const goStt = async (recC: Int16Array[], recL: Int16Array): Promise<string> => {
//    try {
//       if (container.phaseMenager.getAbortCurrentPhase()) {
//          return 'cancel';
//       }
//       container.phaseMenager.setSubPhase('stt', 'goStt');
//       const transcirpt: string = await container.sttCtrl.stt(recL, recC);
//       if (transcirpt === 'Picovoice_STT_limit_reached')
//          throw new CustomError('Picovoice_STT_limit_reached');
//       return transcirpt;
//    } catch (error) {
//       container.phaseMenager.setSubPhase(null, 'goStt');
//       throw new CustomError('Stt Handler failed: ', error);
//    }
// };
const goComplet = async (input) => {
    try {
        if (container.phaseMenager.getAbortCurrentPhase())
            return 'cancel';
        const asnwer = await container.OAIComp.completion(input);
        console.log(asnwer);
        if (asnwer)
            return asnwer;
        throw new CustomError('Completion failed: ', 'no asnwer');
    }
    catch (e) {
        throw new CustomError('Completion failed: ', e);
    }
};
const goTts = async (input) => {
    try {
        if (container.phaseMenager.getAbortCurrentPhase())
            return 'cancel';
        container.phaseMenager.setSubPhase('tts', 'goTts');
        const synth = await container.ttsCtrl.tts(input);
        if (synth === 'TTS_done') {
            return 'ok';
        }
        else {
            throw new CustomError('Record Handler failed: ', synth);
        }
    }
    catch (e) {
        throw new CustomError('TTS failed: ', e);
    }
};
const reproduceRedMessages = async (message) => {
    try {
        if (message) {
            console.log('Reproducing RED message:', message);
        }
        const messages = red.messageFlush();
        for (const message of messages) {
            console.log('Reproducing RED message:', message);
        }
    }
    catch (e) {
        throw new CustomError('Reproducing RED messages failed: ', e);
    }
};
const rhinoExecuter = async (intent, cmd) => {
    try {
        switch (intent) {
            case 'Transcribe':
                return 'Transcribe';
            case 'Create_audio':
                return 'Create_audio';
            case 'Red':
                return 'Red';
            case 'Turn_off':
                return 'Turn_off';
            default:
                return 'Unknown command';
        }
    }
    catch (error) {
        throw new CustomError('Rhino executer failed: ', error);
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
(async () => {
    try {
        await main();
    }
    catch (e) {
        await errorLog(e);
        container.player.play_err();
        container.player.once('Audio_Queue_End', async () => {
            if (e && typeof e === 'object' && 'fatal' in e) {
                if (e.fatal) {
                    process.exit(1);
                }
            }
            else {
                goIdle();
            }
        });
    }
})();
//# sourceMappingURL=index.js.map