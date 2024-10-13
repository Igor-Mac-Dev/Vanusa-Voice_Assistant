import * as fs from 'fs';
import * as interfaces from '../interfaces/config-json';
import * as path from 'path';
import { CustomError } from '../utils/error';

function readConfigFile(): interfaces.config {
   try {
      const jsonData = fs.readFileSync(
         path.resolve('dist/process-files/conf.json'),
         'utf8',
      );
      const config: interfaces.config = JSON.parse(jsonData);
      Object.freeze(config);
      return config;
   } catch (err) {
      throw new CustomError('°Error while reading config file: ' + err);
   }
}

function pathmkr(
   model: string,
   lang: '_pt' | '_en' = '_en',
   ext: '.ppn' | '.pv' = '.ppn',
): string {
   return path.join(path.resolve('/assets/models/'), model + lang + ext);
}

const createConfig: interfaces.config = {
   LANGUAGE: 'en',
   PPN: pathmkr('a'),
   PPN_WW: [pathmkr('a'), pathmkr('b')],
   PPN_CANCEL: [pathmkr('c')],
   PPN_REPEAT: ['a', 'b'],
   OAI_KEY: 'a',
   PV_KEY: 'a',
   CHEETAH: 'a',
   CHEETAH_AVAILABLE: true,
   LEOPARD: pathmkr('a', '_en', '.pv'),
   LEOPARD_AVAILABLE: true,
   ORCA_AVAILABLE: true,
   RECORD_TIME: 300,
   FRAME_LENGHT: 512,
   SAMPLE_RATE: 16000,
   SELECTED_DEVICE: undefined,
   SENSITIVITY: [0.5],
   COBRA_LENGHT: 3,
   COBRA_SENSITIVITY: [0.7],
   OAI_MODEL: 'gpt-4o',
   OAI_ASSIST_DEFINITION:
      "You are a voice assistant. I speak on my desktop, and a program sends it to you as text. You process it and return an answer that will be spoken by my device. Please avoid using the word 'cancel,' as it may interrupt the playback of your response. Keep in mind that the Speech to Text engine isn't perfect: if words are missing, assume they were intended; if words seem out of context, replace them with what likely fits, normally uncommon names or terms. Additional specifications, if any, will follow: ",
   OAI_ASSIST_USER_DEFINITION: '',
   OAI_HISTORY_LENGTH: 10,
   OAI_TEMPERATURE: 0.6,
   OAI_MAX_TOKENS: 100,
   STT_ENGINE: 'Picovoice',
   TTS_ENGINE: 'Picovoice',
};

const createConfigFile = (confJson): void => {
   try {
      const filePath = path.resolve('dist/process-files/conf.json');
      fs.writeFileSync(filePath, JSON.stringify(confJson, null, 3), 'utf8');
   } catch (err) {
      throw new CustomError('°Error while creating config : ' + err);
   }
};

export { readConfigFile, createConfigFile };
