import * as fs from 'fs';
import * as path from 'path';
import { CustomError } from '../utils/error.js';
function readConfigFile() {
    try {
        const jsonData = fs.readFileSync(path.resolve('dist/process-files/conf.json'), 'utf8');
        const config = JSON.parse(jsonData);
        Object.freeze(config);
        return config;
    }
    catch (err) {
        throw new CustomError('°Error while reading config file: ' + err);
    }
}
function pathmkr(model, lang = '_en', ext = '.ppn') {
    return path.join(path.resolve('/assets/models/'), model + lang + ext);
}
const createConfigFile = (confJson) => {
    try {
        const filePath = path.resolve('dist/process-files/conf.json');
        fs.writeFileSync(filePath, JSON.stringify(confJson, null, 3), 'utf8');
    }
    catch (err) {
        throw new CustomError('°Error while creating config : ' + err);
    }
};
export { readConfigFile, createConfigFile, pathmkr };
//# sourceMappingURL=conf.js.map