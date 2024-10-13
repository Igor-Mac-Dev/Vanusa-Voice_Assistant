import * as interfaces from '../interfaces/config-json';
declare function readConfigFile(): interfaces.config;
declare const createConfigFile: (confJson: any) => void;
export { readConfigFile, createConfigFile };
