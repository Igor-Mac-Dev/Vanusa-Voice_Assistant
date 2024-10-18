import * as fs from 'fs';
import * as interfaces from '../interfaces/config-json.js';
import * as path from 'path';
import { CustomError } from '../utils/error.js';

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

const createConfigFile = (confJson): void => {
   try {
      const filePath = path.resolve('dist/process-files/conf.json');
      fs.writeFileSync(filePath, JSON.stringify(confJson, null, 3), 'utf8');
   } catch (err) {
      throw new CustomError('°Error while creating config : ' + err);
   }
};

export { readConfigFile, createConfigFile, pathmkr };
