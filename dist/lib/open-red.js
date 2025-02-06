import open from 'open';
import { CustomError } from '../utils/error.js';
export default function openRed(port) {
    try {
        const url = `http://localhost:${port}`;
        open(url);
    }
    catch (error) {
        throw new CustomError('°Error opening Red: ', error);
    }
}
//# sourceMappingURL=open-red.js.map